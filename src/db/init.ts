import type { Database, Connection } from "@ladybugdb/wasm-core";
import type { LbugModule, LbugFS } from "./lbug.d";
import { createSchema, seedData, type SeedProgress } from "./seed";

export type DbState =
  | { status: "idle" }
  | { status: "initializing"; progress: SeedProgress }
  | { status: "ready"; conn: Connection; db: Database; version: string }
  | { status: "error"; error: string };

export async function initializeDatabase(
  onStateChange: (state: DbState) => void
): Promise<{ conn: Connection; db: Database }> {
  try {
    onStateChange({
      status: "initializing",
      progress: { phase: "Loading", detail: "Loading WASM module...", percent: 0 },
    });

    // Dynamic import to handle WASM loading
    const lbug = (await import("@ladybugdb/wasm-core")).default as unknown as LbugModule;

    onStateChange({
      status: "initializing",
      progress: { phase: "Loading", detail: "Initializing database...", percent: 5 },
    });

    await lbug.init();
    const version = await lbug.getVersion();

    // 256MB buffer pool for ~100MB dataset
    const db = new lbug.Database(":memory:", 256 * 1024 * 1024);
    const conn = new lbug.Connection(db);
    await conn.init();

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
    const fs: LbugFS = new (lbug.FS as unknown as new () => LbugFS)();
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
