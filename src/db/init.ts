import type { Database, Connection } from "lbug-wasm";
import type { FS } from "lbug-wasm";
import { createSchema, seedData, type SeedProgress } from "./seed";

export type DbState =
  | { status: "idle" }
  | { status: "initializing"; progress: SeedProgress }
  | { status: "ready"; conn: Connection; db: Database; version: string }
  | { status: "error"; error: string };

// Guard against double-initialization (React StrictMode calls useEffect twice)
let initPromise: Promise<{ conn: Connection; db: Database }> | null = null;

export async function initializeDatabase(
  onStateChange: (state: DbState) => void
): Promise<{ conn: Connection; db: Database }> {
  if (initPromise) return initPromise;
  initPromise = doInit(onStateChange);
  return initPromise;
}

async function doInit(
  onStateChange: (state: DbState) => void
): Promise<{ conn: Connection; db: Database }> {
  try {
    onStateChange({
      status: "initializing",
      progress: { phase: "Loading", detail: "Loading WASM module...", percent: 0 },
    });

    const lbug = (await import("lbug-wasm")).default;

    onStateChange({
      status: "initializing",
      progress: { phase: "Loading", detail: "Initializing database...", percent: 5 },
    });

    // Set worker path — the worker file is served from public/
    lbug.setWorkerPath("/kuzu_wasm_worker.js");

    const db = new lbug.Database(":memory:", 1 << 28 /* 256 MB */);
    await db.init();
    const conn = new lbug.Connection(db);
    await conn.init();

    let version: string;
    try {
      version = await lbug.getVersion();
    } catch {
      version = "unknown";
    }

    // Create schema
    onStateChange({
      status: "initializing",
      progress: { phase: "Schema", detail: "Creating tables...", percent: 10 },
    });
    await createSchema(conn, (progress) => {
      onStateChange({
        status: "initializing",
        progress: { ...progress, percent: 10 + progress.percent * 0.05 },
      });
    });

    // Seed data
    const fs = lbug.FS as FS;
    await seedData(conn, fs, (progress) => {
      onStateChange({
        status: "initializing",
        progress: {
          ...progress,
          percent: 15 + progress.percent * 0.85,
        },
      });
    });

    onStateChange({ status: "ready", conn, db, version });
    return { conn, db };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    onStateChange({ status: "error", error: msg });
    throw e;
  }
}
