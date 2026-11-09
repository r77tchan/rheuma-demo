import { useEffect, useSyncExternalStore } from "react";

// 本文の画像とPDFの保存。保存先はブラウザの IndexedDB（記事は localStorage。lib/newsStore.ts）。
// 本文のHTMLにはファイルのIDだけを残し、表示するときに blob URL に差し替える（lib/bodyHtml.ts）。
// 中身は Blob ではなく ArrayBuffer で保存する。Safari では Blob の保存に失敗した報告があり、
// 選んだ File は元のファイルを指すだけなので、あとで元のファイルが変わると読めなくなるため。

const DB_NAME = "rheuma-demo:files";
const DB_VERSION = 1;
const STORE = "files";
const CREATED_AT_INDEX = "createdAt";

/** ファイルのID。32桁の16進。本文のHTMLの data-file-id に入る。 */
export const FILE_ID_PATTERN = /^[0-9a-f]{32}$/;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const PDF_TYPE = "application/pdf";

/**
 * 取り込んでからこの時間がたつまでは、どの記事も使っていなくても消さない。
 * 保存前の入力画面は、戻るボタンで離れても隠れて残る（Activity）ので、その間に別の記事を保存しても、入力中の画像が消えないようにする。
 */
const KEEP_UNUSED_MS = 24 * 60 * 60 * 1000;

/** IndexedDB が応答しないときに待つ長さ。初期状態に戻すときに、止まったままにしないため。 */
const OPEN_TIMEOUT_MS = 5000;
const CLEAR_TIMEOUT_MS = 3000;

type StoredFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  bytes: ArrayBuffer;
  createdAt: number;
};

export function fileKind(type: string): "image" | "pdf" | null {
  if (IMAGE_TYPES.includes(type)) return "image";
  if (type === PDF_TYPE) return "pdf";
  return null;
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// 開いた接続は使い回す。閉じられたら（別のタブがバージョンを上げた、ブラウザが切った）、次に使うときに開き直す。
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb() {
  if (dbPromise) return dbPromise;
  const promise = withTimeout(
    new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" }).createIndex(CREATED_AT_INDEX, "createdAt");
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          forgetDb(promise);
        };
        db.onclose = () => forgetDb(promise);
        resolve(db);
      };
      request.onerror = () => reject(request.error);
    }),
    OPEN_TIMEOUT_MS,
  );
  dbPromise = promise;
  // 失敗した接続は覚えない（次に使うときに開き直す）
  promise.catch(() => forgetDb(promise));
  return promise;
}

function forgetDb(promise: Promise<IDBDatabase>) {
  if (dbPromise === promise) dbPromise = null;
}

/**
 * トランザクションを1つ実行し、完了したら getResult の値を返す。
 * run の中では IndexedDB の操作だけをする（ほかの処理を await すると、トランザクションが途中で完了してしまう）。
 * 成功は oncomplete で判断する（容量の超過などは、あとから中止として届くことがあるため）。
 */
async function runTransaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => () => T): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    // indexedDB がない環境の例外も、ここで Promise の失敗になる
    const promise = openDb();
    const db = await promise;
    let transaction: IDBTransaction;
    try {
      transaction = db.transaction(STORE, mode);
    } catch (error) {
      // 接続が切れていたら、1回だけ開き直す
      if (attempt === 0 && error instanceof DOMException && error.name === "InvalidStateError") {
        forgetDb(promise);
        continue;
      }
      throw error;
    }
    return new Promise<T>((resolve, reject) => {
      const getResult = run(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(getResult());
      transaction.onabort = () => reject(transaction.error ?? new Error("aborted"));
    });
  }
}

function createFileId() {
  // randomUUID は https と localhost でしか使えない（LAN の http で実機から開くと存在しない）ので使わない
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** 画像の縦横。EXIF の回転を反映した値になる。読めない画像は null。 */
async function readImageSize(blob: Blob): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(blob);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size.width > 0 && size.height > 0 ? size : null;
  } catch {
    return null;
  }
}

export type SavedFile = { id: string; name: string; kind: "image" | "pdf"; width?: number; height?: number };

export type SaveFileResult =
  | { ok: true; file: SavedFile }
  /** type: 受け付けない形式 / size: 大きすぎる / read: 読み込めない / storage: 保存に失敗した */
  | { ok: false; reason: "type" | "size" | "read" | "storage" };

/** ファイルを取り込んで保存する。記事の保存を待たずに保存するので、プレビューの iframe からもすぐ読める。 */
export async function saveFile(file: File): Promise<SaveFileResult> {
  const kind = fileKind(file.type);
  if (!kind) return { ok: false, reason: "type" };
  if (file.size > MAX_FILE_SIZE) return { ok: false, reason: "size" };

  // トランザクションを開く前に読み切る
  let bytes: ArrayBuffer;
  try {
    bytes = await file.arrayBuffer();
  } catch {
    return { ok: false, reason: "read" };
  }
  const blob = new Blob([bytes], { type: file.type });
  const size = kind === "image" ? await readImageSize(blob) : null;
  if (kind === "image" && !size) return { ok: false, reason: "read" };

  const record: StoredFile = {
    id: createFileId(),
    name: file.name,
    type: file.type,
    size: bytes.byteLength,
    bytes,
    createdAt: Date.now(),
  };
  try {
    await runTransaction("readwrite", (store) => {
      store.add(record);
      return () => undefined;
    });
  } catch {
    return { ok: false, reason: "storage" };
  }

  // このページですぐ表示できるよう、URL も作っておく
  urls.set(record.id, URL.createObjectURL(blob));
  changed();
  return { ok: true, file: { id: record.id, name: file.name, kind, ...size } };
}

function isStoredFile(value: unknown): value is StoredFile {
  if (typeof value !== "object" || value === null) return false;
  const { type, bytes } = value as Partial<StoredFile>;
  return typeof type === "string" && fileKind(type) !== null && bytes instanceof ArrayBuffer;
}

// ファイルの URL。作った文書（ページ、プレビューの iframe）が閉じるまで使い回し、revoke しない。
// PDF のリンクを押したあとも、開いた新しいタブが読めるようにするため。数MBのファイルが数件なので、メモリは問題にならない。
// null は見つからない。読み込みの失敗（DBを開けないなど）は覚えず、次に表示するときに読み直す。
const urls = new Map<string, string | null>();
const loading = new Map<string, Promise<string | null>>();
const failed = new Set<string>();

// useSyncExternalStore は値が変わると再描画するので、スナップショットは番号にする（URL が増えるたびに +1）
let version = 1;
const listeners = new Set<() => void>();

function changed() {
  version += 1;
  listeners.forEach((listener) => listener());
}

/** ファイルの URL を読む。読み込み中のファイルは、同じ Promise を返す（二重に読まない）。 */
export function loadFileUrl(id: string): Promise<string | null> {
  const known = urls.get(id);
  if (known !== undefined) return Promise.resolve(known);
  const pending = loading.get(id);
  if (pending) return pending;
  if (!FILE_ID_PATTERN.test(id)) return Promise.resolve(null);

  failed.delete(id);
  const promise = runTransaction("readonly", (store) => {
    const request = store.get(id);
    return () => request.result as unknown;
  }).then(
    (record) => {
      const url = isStoredFile(record) ? URL.createObjectURL(new Blob([record.bytes], { type: record.type })) : null;
      urls.set(id, url);
      return url;
    },
    () => {
      failed.add(id);
      return null;
    },
  );
  loading.set(id, promise);
  void promise.finally(() => {
    loading.delete(id);
    changed();
  });
  return promise;
}

/**
 * 読み込み済みの URL を返す。読み込み中か、まだ読んでいなければ undefined。
 * 見つからないときと読み込みに失敗したときは null。
 */
export function lookupFileUrl(id: string): string | null | undefined {
  const known = urls.get(id);
  if (known !== undefined) return known;
  return failed.has(id) ? null : undefined;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getVersion() {
  return version;
}

function getServerVersion() {
  return 0;
}

/**
 * 本文で使っているファイルの URL を読み、読めたら再描画する。URL は lookupFileUrl で引く。
 * 返す番号は、サーバーでの描画とハイドレーションのあいだは 0（URL はまだない）。
 */
export function useFileUrls(ids: readonly string[]) {
  const current = useSyncExternalStore(subscribe, getVersion, getServerVersion);
  const key = ids.join(",");
  useEffect(() => {
    if (!key) return;
    // 前に読み込みに失敗したファイルは、ここで読み直す（loadFileUrl は失敗を覚えない）
    for (const id of key.split(",")) void loadFileUrl(id);
  }, [key]);
  return current;
}

/**
 * どの記事も使っていないファイルを消す。取り込んでから KEEP_UNUSED_MS がたっていないものは残す。
 * 失敗しても何もしない（次に保存したときに、また消す）。
 */
export async function deleteUnusedFiles(usedIds: ReadonlySet<string>) {
  try {
    await runTransaction("readwrite", (store) => {
      // 中身（ArrayBuffer）は読まず、古いファイルのIDだけを取る
      const request = store.index(CREATED_AT_INDEX).getAllKeys(IDBKeyRange.upperBound(Date.now() - KEEP_UNUSED_MS));
      request.onsuccess = () => {
        for (const id of request.result) {
          if (typeof id === "string" && !usedIds.has(id)) store.delete(id);
        }
      };
      return () => undefined;
    });
  } catch {}
}

/** すべてのファイルを消す。応答がないときは、待つのをやめて false を返す。 */
export async function clearFiles() {
  try {
    await withTimeout(
      runTransaction("readwrite", (store) => {
        store.clear();
        return () => undefined;
      }),
      CLEAR_TIMEOUT_MS,
    );
    return true;
  } catch {
    return false;
  }
}
