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
      progress: { phase: "loading", detail: "Loading WASM module…", pct: 0 },
    });

    const { initDatabase } = await import("./index");
    await initDatabase();

    onStateChange({
      status: "initializing",
      progress: { phase: "schema", detail: "Creating schema…", pct: 5 },
    });

    const { seedDatabase } = await import("./seed");
    await seedDatabase((progress) => {
      onStateChange({ status: "initializing", progress });
    });

    let version = "unknown";
    try {
      const lbug = (await import("lbug-wasm")).default;
      version = await lbug.getVersion();
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
