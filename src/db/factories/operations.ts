// Factory for Process nodes and their relationships

import type { SoftwareRow, PortRow } from "./software";
import { SEED_CONFIG } from "../config";

const { PROCESS_METADATA_PAD } = SEED_CONFIG;

let _procIdCounter = 500_000_000;
function nextProcId() {
  return ++_procIdCounter;
}

function padMeta(prefix: string, len: number): string {
  const base = `${prefix}|proc-meta|`;
  return base.padEnd(len, "0123456789abcdef_status_running_ok_");
}

function escCsv(s: string): string {
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const PROCESS_CSV_HEADER = "id,name,pid,startTime,metadata";

export interface ProcessGenResult {
  processCsv: string;
  machineRunsRelCsv: string;
  processInstanceRelCsv: string;
  processDependsRelCsv: string;
  processListensRelCsv: string;
}

/**
 * For a batch of machine IDs, generate:
 * - OS process + Application process + dependency Service processes
 * - All related relationship CSVs
 */
export function generateProcessesForMachines(
  machineIds: number[],
  software: SoftwareRow[],
  ports: PortRow[],
): ProcessGenResult {
  const osSoftware = software.filter((s) => s.category === "os");
  const apps = software.filter((s) => s.category === "application");

  const procLines: string[] = [];
  const machineRunsLines: string[] = [];
  const instanceLines: string[] = [];
  const dependsLines: string[] = [];
  const listensLines: string[] = [];

  const portMap = new Map(ports.map((p) => [p.port, p.id]));

  const now = Date.now();

  for (let i = 0; i < machineIds.length; i++) {
    const mid = machineIds[i];
    const os = osSoftware[i % osSoftware.length];
    const app = apps[i % apps.length];

    // OS process
    const osProc = nextProcId();
    const osStart = now - Math.floor((Math.random() * 15 + 5) * 86400000);
    procLines.push(
      `${osProc},${os.name},1,${osStart},${escCsv(padMeta(`os:${osProc}`, PROCESS_METADATA_PAD))}`,
    );
    machineRunsLines.push(`${mid},${osProc}`);
    instanceLines.push(`${osProc},${os.id}`);

    // Application process
    const appProc = nextProcId();
    const appPid = 1000 + (i % 9000);
    const appStart = now - Math.floor(Math.random() * 10 * 86400000);
    procLines.push(
      `${appProc},${app.name},${appPid},${appStart},${escCsv(padMeta(`app:${appProc}`, PROCESS_METADATA_PAD))}`,
    );
    machineRunsLines.push(`${mid},${appProc}`);
    instanceLines.push(`${appProc},${app.id}`);

    // Port listening for the application
    for (const p of app.ports) {
      const portId = portMap.get(p);
      if (portId) listensLines.push(`${appProc},${portId}`);
    }

    // Dependency service processes
    for (const depName of app.dependencies) {
      const depSw = software.find((s) => s.name === depName);
      if (!depSw) continue;

      const depProc = nextProcId();
      const depPid = 2000 + (i % 8000);
      const depStart = now - Math.floor(Math.random() * 10 * 86400000);
      procLines.push(
        `${depProc},${depSw.name},${depPid},${depStart},${escCsv(padMeta(`dep:${depProc}`, PROCESS_METADATA_PAD))}`,
      );
      machineRunsLines.push(`${mid},${depProc}`);
      instanceLines.push(`${depProc},${depSw.id}`);
      dependsLines.push(`${appProc},${depProc}`);

      for (const p of depSw.ports) {
        const portId = portMap.get(p);
        if (portId) listensLines.push(`${depProc},${portId}`);
      }
    }
  }

  return {
    processCsv: procLines.join("\n"),
    machineRunsRelCsv: machineRunsLines.join("\n"),
    processInstanceRelCsv: instanceLines.join("\n"),
    processDependsRelCsv: dependsLines.join("\n"),
    processListensRelCsv: listensLines.join("\n"),
  };
}
