// Seed orchestrator – creates schema, generates CSV data, bulk-loads via COPY FROM.

import { query, getFS } from "./index";
import { NODE_TABLES, REL_TABLES } from "./schema";
import { SEED_CONFIG, TOTAL_RACKS, TOTAL_MACHINES } from "./config";
import {
  generateDataCenters,
  generateRouters,
  generateNetworkZones,
  generateRacks,
  generateSwitches,
  generateMachineTypes,
  generateMachinesCsvForRack,
  rackMachineRelCsv,
  machineTypeRelCsv,
  MACHINE_CSV_HEADER,
} from "./factories/infrastructure";
import {
  generateSoftware,
  generateSoftwareCsv,
  generatePorts,
} from "./factories/software";
import {
  generateProcessesForMachines,
  PROCESS_CSV_HEADER,
} from "./factories/operations";

export type SeedProgress = {
  phase: string;
  detail: string;
  pct: number;
};

type ProgressCb = (p: SeedProgress) => void;

// Helper to write a string to the WASM virtual filesystem
async function writeVFS(path: string, data: string) {
  const fs = getFS();
  await fs.writeFile(path, data);
}

// Ensure a directory exists in the WASM virtual filesystem
async function mkdirVFS(path: string) {
  const fs = getFS();
  try {
    await fs.mkdir(path);
  } catch {
    // directory may already exist
  }
}

export async function seedDatabase(onProgress: ProgressCb): Promise<void> {
  const {
    NUM_DATACENTERS,
    ZONES_PER_DC,
    RACKS_PER_ZONE,
    MACHINES_PER_RACK,
  } = SEED_CONFIG;

  // ---- Phase 1: Schema ----
  onProgress({ phase: "schema", detail: "Creating node tables…", pct: 0 });
  for (const ddl of NODE_TABLES) await query(ddl);
  for (const ddl of REL_TABLES) await query(ddl);
  onProgress({ phase: "schema", detail: "Schema created", pct: 5 });

  // ---- Phase 2: Small reference data (direct INSERT) ----
  onProgress({ phase: "reference", detail: "Inserting reference data…", pct: 5 });

  const machineTypes = generateMachineTypes();
  for (const mt of machineTypes) {
    await query(
      `CREATE (t:MachineType {id:${mt.id}, name:'${mt.name}', cpu:${mt.cpu}, ram:${mt.ram}, disk:${mt.disk}, typeName:'${mt.typeName}'})`,
    );
  }

  const dcs = generateDataCenters(NUM_DATACENTERS);
  for (const dc of dcs) {
    await query(
      `CREATE (d:DataCenter {id:${dc.id}, name:'${dc.name}', location:'${dc.location}'})`,
    );
  }

  const routers = generateRouters(dcs, ZONES_PER_DC);
  for (const r of routers) {
    await query(
      `CREATE (r:Router {id:${r.id}, name:'${r.name}', zone:${r.zone}, isEgress:${r.isEgress}, ip:'${r.ip}'})`,
    );
    await query(
      `MATCH (d:DataCenter), (r:Router) WHERE d.id = ${r.dcId} AND r.id = ${r.id} CREATE (d)-[:DC_CONTAINS_ROUTER]->(r)`,
    );
  }

  const zones = generateNetworkZones(dcs, ZONES_PER_DC);
  for (const nz of zones) {
    await query(
      `CREATE (n:NetworkZone {id:${nz.id}, ip:'${nz.ip}', size:${nz.size}, zone:${nz.zone}})`,
    );
    // connect zone router to network zone
    const zoneRouter = routers.find(
      (r) => r.dcId === nz.dcId && r.zone === nz.zone,
    );
    if (zoneRouter) {
      await query(
        `MATCH (r:Router), (n:NetworkZone) WHERE r.id = ${zoneRouter.id} AND n.id = ${nz.id} CREATE (r)-[:ROUTER_ROUTES]->(n)`,
      );
    }
  }

  const racks = generateRacks(dcs, zones, RACKS_PER_ZONE);
  for (const rack of racks) {
    await query(
      `CREATE (k:Rack {id:${rack.id}, name:'${rack.name}', zone:${rack.zone}, rackNum:${rack.rackNum}})`,
    );
    await query(
      `MATCH (d:DataCenter), (k:Rack) WHERE d.id = ${rack.dcId} AND k.id = ${rack.id} CREATE (d)-[:DC_CONTAINS_RACK]->(k)`,
    );
    await query(
      `MATCH (n:NetworkZone), (k:Rack) WHERE n.id = ${rack.zoneId} AND k.id = ${rack.id} CREATE (n)-[:ZONE_HAS_RACK]->(k)`,
    );
  }

  const switches = generateSwitches(racks);
  for (const sw of switches) {
    await query(
      `CREATE (s:Switch {id:${sw.id}, ip:'${sw.ip}', rackId:${sw.rackId}})`,
    );
    await query(
      `MATCH (k:Rack), (s:Switch) WHERE k.id = ${sw.rackId} AND s.id = ${sw.id} CREATE (k)-[:RACK_HOLDS_SWITCH]->(s)`,
    );
  }

  const software = generateSoftware();
  const swCsv = generateSoftwareCsv(software);
  await writeVFS("/data/software.csv", swCsv);
  await query(`COPY Software FROM '/data/software.csv' (HEADER=true)`);

  const ports = generatePorts(software);
  for (const p of ports) {
    await query(`CREATE (p:Port {id:${p.id}, port:${p.port}})`);
  }

  onProgress({ phase: "reference", detail: "Reference data loaded", pct: 10 });

  // ---- Phase 3: Bulk machine data (CSV + COPY) ----
  onProgress({
    phase: "machines",
    detail: `Generating ${TOTAL_MACHINES.toLocaleString()} machines…`,
    pct: 10,
  });

  await mkdirVFS("/data");

  // We process rack by rack and accumulate CSV chunks to write in batches
  const BATCH_SIZE = 10; // racks per batch write
  let machinesCsvChunks: string[] = [MACHINE_CSV_HEADER];
  let rackMachineRelChunks: string[] = [];
  let machineTypeRelChunks: string[] = [];
  let allMachineIds: number[] = [];
  let racksProcessed = 0;

  for (let i = 0; i < racks.length; i++) {
    const rack = racks[i];
    const { csv, machineIds } = generateMachinesCsvForRack(
      rack,
      MACHINES_PER_RACK,
      machineTypes,
    );
    machinesCsvChunks.push(csv);
    rackMachineRelChunks.push(rackMachineRelCsv(rack.id, machineIds));
    machineTypeRelChunks.push(
      machineTypeRelCsv(machineIds, MACHINES_PER_RACK, machineTypes),
    );
    allMachineIds.push(...machineIds);
    racksProcessed++;

    if (racksProcessed % BATCH_SIZE === 0 || i === racks.length - 1) {
      const pct = 10 + Math.round((racksProcessed / TOTAL_RACKS) * 30);
      onProgress({
        phase: "machines",
        detail: `Racks ${racksProcessed}/${TOTAL_RACKS}`,
        pct,
      });
    }
  }

  // Write machine CSV and COPY
  onProgress({ phase: "machines", detail: "Loading machines into DB…", pct: 40 });
  await writeVFS("/data/machines.csv", machinesCsvChunks.join("\n"));
  await query(`COPY Machine FROM '/data/machines.csv' (HEADER=true)`);

  // Machine relationships
  onProgress({ phase: "machines", detail: "Loading machine relationships…", pct: 45 });
  await writeVFS(
    "/data/rack_machine.csv",
    rackMachineRelChunks.join("\n"),
  );
  await query(`COPY RACK_HOLDS_MACHINE FROM '/data/rack_machine.csv'`);

  await writeVFS(
    "/data/machine_type.csv",
    machineTypeRelChunks.join("\n"),
  );
  await query(`COPY MACHINE_TYPE FROM '/data/machine_type.csv'`);

  onProgress({ phase: "machines", detail: "Machines loaded", pct: 50 });

  // ---- Phase 4: Processes ----
  onProgress({
    phase: "processes",
    detail: "Generating processes…",
    pct: 50,
  });

  // Process in chunks to avoid memory spikes
  const PROC_CHUNK = 5000;
  const procCsvParts: string[] = [PROCESS_CSV_HEADER];
  const machRunsParts: string[] = [];
  const procInstParts: string[] = [];
  const procDepParts: string[] = [];
  const procListenParts: string[] = [];

  for (let start = 0; start < allMachineIds.length; start += PROC_CHUNK) {
    const chunk = allMachineIds.slice(start, start + PROC_CHUNK);
    const result = generateProcessesForMachines(chunk, software, ports);
    procCsvParts.push(result.processCsv);
    machRunsParts.push(result.machineRunsRelCsv);
    procInstParts.push(result.processInstanceRelCsv);
    procDepParts.push(result.processDependsRelCsv);
    procListenParts.push(result.processListensRelCsv);

    const pct = 50 + Math.round(((start + chunk.length) / allMachineIds.length) * 30);
    onProgress({
      phase: "processes",
      detail: `Processes ${Math.min(start + PROC_CHUNK, allMachineIds.length).toLocaleString()}/${allMachineIds.length.toLocaleString()}`,
      pct,
    });
  }

  onProgress({ phase: "processes", detail: "Loading processes into DB…", pct: 80 });
  await writeVFS("/data/processes.csv", procCsvParts.join("\n"));
  await query(`COPY Process FROM '/data/processes.csv' (HEADER=true)`);

  await writeVFS("/data/machine_runs.csv", machRunsParts.join("\n"));
  await query(`COPY MACHINE_RUNS FROM '/data/machine_runs.csv'`);

  await writeVFS("/data/proc_instance.csv", procInstParts.join("\n"));
  await query(`COPY PROCESS_INSTANCE FROM '/data/proc_instance.csv'`);

  await writeVFS("/data/proc_depends.csv", procDepParts.join("\n"));
  await query(`COPY PROCESS_DEPENDS FROM '/data/proc_depends.csv'`);

  await writeVFS("/data/proc_listens.csv", procListenParts.join("\n"));
  await query(`COPY PROCESS_LISTENS FROM '/data/proc_listens.csv'`);

  onProgress({ phase: "done", detail: "Seeding complete!", pct: 100 });
}
