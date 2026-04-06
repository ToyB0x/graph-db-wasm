import type { Connection } from "lbug-wasm";
import type { FS as LbugFS } from "lbug-wasm";
import { NODE_TABLE_STATEMENTS, REL_TABLE_STATEMENTS } from "./schema";
import {
  generateDataCenterCSV,
  generateRouterCSV,
  generateRackCSV,
  generateSwitchCSV,
  generateNetworkCSV,
  generateSoftwareCSV,
  generateSoftwareVersionCSV,
  generateMachineCSVBatches,
  generateInterfaceCSVBatches,
  generateProcessCSVBatches,
  generatePortCSVBatches,
  generateDCContainsRouterCSV,
  generateDCContainsRackCSV,
  generateRackHoldsSwitchCSV,
  generateRackHoldsMachineCSVBatches,
  generateMachineHasIfaceCSVBatches,
  generateIfaceInNetworkCSVBatches,
  generateIfaceHasPortCSVBatches,
  generateMachineRunsProcessCSVBatches,
  generateProcessUsesVersionCSVBatches,
  generateProcessListensPortCSVBatches,
  generateSoftwareHasVersionCSV,
  generateRouterRoutesNetworkCSV,
} from "./factories";

export type SeedProgress = {
  phase: string;
  detail: string;
  percent: number;
};

type ProgressCallback = (progress: SeedProgress) => void;

const BATCH_SIZE = 10000;

async function writeAndCopy(
  conn: Connection,
  fs: LbugFS,
  csvContent: string,
  tableName: string,
  filePath: string,
  isRel: boolean
): Promise<void> {
  await fs.writeFile(filePath, csvContent);
  const copyStmt = isRel
    ? `COPY ${tableName} FROM '${filePath}' (HEADER=true)`
    : `COPY ${tableName} FROM '${filePath}' (HEADER=true)`;
  const result = await conn.query(copyStmt);
  if (!result.isSuccess()) {
    const err = await result.getErrorMessage();
    throw new Error(`COPY ${tableName} failed: ${err}`);
  }
  try {
    await fs.unlink(filePath);
  } catch {
    // ignore cleanup errors
  }
}

async function writeBatchesAndCopy<T extends { csv: string; count: number }>(
  conn: Connection,
  fs: LbugFS,
  generator: Generator<T>,
  tableName: string,
  basePath: string,
  isRel: boolean,
  onProgress?: (count: number) => void
): Promise<void> {
  let batchIdx = 0;
  for (const batch of generator) {
    const filePath = `${basePath}_${batchIdx}.csv`;
    await writeAndCopy(conn, fs, batch.csv, tableName, filePath, isRel);
    onProgress?.(batch.count);
    batchIdx++;
  }
}

export async function createSchema(
  conn: Connection,
  onProgress: ProgressCallback
): Promise<void> {
  const total = NODE_TABLE_STATEMENTS.length + REL_TABLE_STATEMENTS.length;
  let done = 0;

  for (const stmt of NODE_TABLE_STATEMENTS) {
    onProgress({
      phase: "Schema",
      detail: `Creating node table ${done + 1}/${NODE_TABLE_STATEMENTS.length}`,
      percent: (done / total) * 100,
    });
    const result = await conn.query(stmt);
    if (!result.isSuccess()) {
      const err = await result.getErrorMessage();
      throw new Error(`Schema error: ${err}\nStatement: ${stmt}`);
    }
    done++;
  }

  for (const stmt of REL_TABLE_STATEMENTS) {
    onProgress({
      phase: "Schema",
      detail: `Creating rel table ${done - NODE_TABLE_STATEMENTS.length + 1}/${REL_TABLE_STATEMENTS.length}`,
      percent: (done / total) * 100,
    });
    const result = await conn.query(stmt);
    if (!result.isSuccess()) {
      const err = await result.getErrorMessage();
      throw new Error(`Schema error: ${err}\nStatement: ${stmt}`);
    }
    done++;
  }
}

export async function seedData(
  conn: Connection,
  fs: LbugFS,
  onProgress: ProgressCallback
): Promise<void> {
  const phases = [
    "DataCenter",
    "Router",
    "Rack",
    "Switch",
    "Network",
    "Software",
    "SoftwareVersion",
    "Machine",
    "Interface",
    "Process",
    "Port",
    "Relationships",
  ];
  let phaseIdx = 0;
  const totalPhases = phases.length;

  const report = (detail: string) => {
    onProgress({
      phase: `Seeding ${phases[phaseIdx]}`,
      detail,
      percent: (phaseIdx / totalPhases) * 100,
    });
  };

  // Small tables — single CSV
  try {
    await fs.mkdir("/data");
  } catch {
    // Directory may already exist or mkdir may not be available;
    // files can still be written to root paths.
  }

  report("Generating data centers...");
  await writeAndCopy(conn, fs, generateDataCenterCSV(), "DataCenter", "/data/dc.csv", false);
  phaseIdx++;

  report("Generating routers...");
  await writeAndCopy(conn, fs, generateRouterCSV(), "Router", "/data/router.csv", false);
  phaseIdx++;

  report("Generating racks...");
  await writeAndCopy(conn, fs, generateRackCSV(), "Rack", "/data/rack.csv", false);
  phaseIdx++;

  report("Generating switches...");
  await writeAndCopy(conn, fs, generateSwitchCSV(), "Switch", "/data/switch.csv", false);
  phaseIdx++;

  report("Generating networks...");
  await writeAndCopy(conn, fs, generateNetworkCSV(), "Network", "/data/network.csv", false);
  phaseIdx++;

  report("Generating software...");
  await writeAndCopy(conn, fs, generateSoftwareCSV(), "Software", "/data/software.csv", false);
  phaseIdx++;

  report("Generating software versions...");
  await writeAndCopy(conn, fs, generateSoftwareVersionCSV(), "SoftwareVersion", "/data/swver.csv", false);
  phaseIdx++;

  // Large tables — batched
  report("Generating machines (batched)...");
  await writeBatchesAndCopy(
    conn, fs, generateMachineCSVBatches(BATCH_SIZE),
    "Machine", "/data/machine", false,
    (count) => report(`Machines: ${count.toLocaleString()} loaded`)
  );
  phaseIdx++;

  report("Generating interfaces (batched)...");
  await writeBatchesAndCopy(
    conn, fs, generateInterfaceCSVBatches(BATCH_SIZE),
    "Interface", "/data/iface", false,
    (count) => report(`Interfaces: ${count.toLocaleString()} loaded`)
  );
  phaseIdx++;

  report("Generating processes (batched)...");
  await writeBatchesAndCopy(
    conn, fs, generateProcessCSVBatches(BATCH_SIZE),
    "Process", "/data/proc", false,
    (count) => report(`Processes: ${count.toLocaleString()} loaded`)
  );
  phaseIdx++;

  report("Generating ports (batched)...");
  await writeBatchesAndCopy(
    conn, fs, generatePortCSVBatches(BATCH_SIZE),
    "Port", "/data/port", false,
    (count) => report(`Ports: ${count.toLocaleString()} loaded`)
  );
  phaseIdx++;

  // Relationships
  report("Loading relationships...");
  const relSteps = [
    { gen: () => generateDCContainsRouterCSV(), table: "DC_CONTAINS_ROUTER", file: "/data/rel_dc_router.csv", batched: false },
    { gen: () => generateDCContainsRackCSV(), table: "DC_CONTAINS_RACK", file: "/data/rel_dc_rack.csv", batched: false },
    { gen: () => generateRackHoldsSwitchCSV(), table: "RACK_HOLDS_SWITCH", file: "/data/rel_rack_sw.csv", batched: false },
    { gen: () => generateSoftwareHasVersionCSV(), table: "SOFTWARE_HAS_VERSION", file: "/data/rel_sw_ver.csv", batched: false },
    { gen: () => generateRouterRoutesNetworkCSV(), table: "ROUTER_ROUTES_NETWORK", file: "/data/rel_router_net.csv", batched: false },
  ] as const;

  for (const step of relSteps) {
    report(`${step.table}...`);
    await writeAndCopy(conn, fs, (step.gen as () => string)(), step.table, step.file, true);
  }

  // Batched relationships
  const batchedRels = [
    { gen: () => generateRackHoldsMachineCSVBatches(BATCH_SIZE), table: "RACK_HOLDS_MACHINE", base: "/data/rel_rack_m" },
    { gen: () => generateMachineHasIfaceCSVBatches(BATCH_SIZE), table: "MACHINE_HAS_IFACE", base: "/data/rel_m_if" },
    { gen: () => generateIfaceInNetworkCSVBatches(BATCH_SIZE), table: "IFACE_IN_NETWORK", base: "/data/rel_if_net" },
    { gen: () => generateIfaceHasPortCSVBatches(BATCH_SIZE), table: "IFACE_HAS_PORT", base: "/data/rel_if_port" },
    { gen: () => generateMachineRunsProcessCSVBatches(BATCH_SIZE), table: "MACHINE_RUNS_PROCESS", base: "/data/rel_m_proc" },
    { gen: () => generateProcessUsesVersionCSVBatches(BATCH_SIZE), table: "PROCESS_USES_VERSION", base: "/data/rel_proc_ver" },
    { gen: () => generateProcessListensPortCSVBatches(BATCH_SIZE), table: "PROCESS_LISTENS_PORT", base: "/data/rel_proc_port" },
  ] as const;

  for (const step of batchedRels) {
    report(`${step.table}...`);
    await writeBatchesAndCopy(
      conn, fs, (step.gen as () => Generator<{ csv: string; count: number }>)(),
      step.table, step.base, true,
      (count) => report(`${step.table}: ${count.toLocaleString()} loaded`)
    );
  }

  try {
    await fs.rmdir("/data");
  } catch {
    // ignore
  }

  onProgress({ phase: "Done", detail: "Seeding complete", percent: 100 });
}
