// Database initialization for LadybugDB WASM (in-memory, browser)

import lbug from "lbug-wasm";

let db: InstanceType<typeof lbug.Database> | null = null;
let conn: InstanceType<typeof lbug.Connection> | null = null;

export async function initDatabase(): Promise<void> {
  if (db) return;
  // Set the worker path before any other calls.
  // The worker file is served from public/.
  lbug.setWorkerPath("/kuzu_wasm_worker.js");
  db = new lbug.Database(":memory:", 1 << 28 /* 256 MB buffer */);
  await db.init();
  conn = new lbug.Connection(db);
  await conn.init();
}

export function getConnection() {
  if (!conn) throw new Error("Database not initialized");
  return conn;
}

export function getFS() {
  return lbug.FS;
}

export async function query(cypher: string) {
  const c = getConnection();
  const result = await c.query(cypher);
  if (!result.isSuccess()) {
    const errorMsg = await result.getErrorMessage();
    throw new Error(errorMsg);
  }
  return result;
}

export async function queryAsObjects(cypher: string) {
  const result = await query(cypher);
  const rows = await result.getAllObjects();
  const columns = await result.getColumnNames();
  const summary = await result.getQuerySummary();
  await result.close();
  return { rows, columns, summary };
}
