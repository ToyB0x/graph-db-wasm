import type { SeedProgress } from "./seed";

export type DbState =
  | { status: "idle" }
  | { status: "initializing"; progress: SeedProgress }
  | { status: "ready"; version: string }
  | { status: "error"; error: string };

let initPromise: Promise<void> | null = null;

export async function initializeDatabase(
  onStateChange: (state: DbState) => void,
): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = doInit(onStateChange);
  return initPromise;
}

async function doInit(
  onStateChange: (state: DbState) => void,
): Promise<void> {
  try {
    onStateChange({
      status: "initializing",
      progress: { phase: "loading", detail: "Loading WASM module…", percent: 0 },
    });

    const { initDatabase, getConnection, getFS } = await import("./index");
    await initDatabase();

    const conn = getConnection();
    const fs = getFS();

    onStateChange({
      status: "initializing",
      progress: { phase: "schema", detail: "Creating schema…", percent: 5 },
    });

    const { createSchema, seedData } = await import("./seed");
    await createSchema(conn, (progress) => {
      onStateChange({ status: "initializing", progress });
    });

    await seedData(conn, fs, (progress) => {
      onStateChange({ status: "initializing", progress });
    });

    let version = "unknown";
    try {
      const kuzu = (await import("kuzu-wasm")).default;
      version = await kuzu.getVersion();
    } catch {
      // version not critical
    }

    onStateChange({ status: "ready", version });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    onStateChange({ status: "error", error: msg });
    throw e;
  }
}
