// Override FS type since the package d.ts marks methods as static+sync
// but the actual implementation is instance+async.
import type { Database, Connection, QueryResult, PreparedStatement } from "@ladybugdb/wasm-core";

export interface LbugFS {
  writeFile(path: string, data: string | ArrayBuffer): Promise<void>;
  readFile(path: string): Promise<Uint8Array>;
  mkdir(path: string): Promise<void>;
  unlink(path: string): Promise<void>;
  rmdir(path: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  stat(path: string): Promise<Record<string, unknown>>;
  rename(oldPath: string, newPath: string): Promise<void>;
  mountIdbfs(path: string): Promise<void>;
  unmount(path: string): Promise<void>;
  syncfs(populate: boolean): Promise<void>;
}

export interface LbugModule {
  init(): Promise<void>;
  getVersion(): Promise<string>;
  getStorageVersion(): Promise<bigint>;
  setWorkerPath(workerPath: string): void;
  close(): Promise<void>;
  Database: typeof Database;
  Connection: typeof Connection;
  PreparedStatement: typeof PreparedStatement;
  QueryResult: typeof QueryResult;
  FS: new () => LbugFS;
}

export type { Database, Connection, QueryResult, PreparedStatement };
