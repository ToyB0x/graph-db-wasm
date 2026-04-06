// Factory functions for infrastructure nodes:
// DataCenter, Router, NetworkZone, Rack, Switch, Machine, MachineType

import { SEED_CONFIG } from "../config";

const { MACHINE_METADATA_PAD } = SEED_CONFIG;

// ---------- helpers ----------

let _idCounter = 0;
function nextId() {
  return ++_idCounter;
}

function padMetadata(prefix: string, len: number): string {
  const base = `${prefix}|cfg:auto-generated-metadata|`;
  return base.padEnd(len, "abcdefghijklmnopqrstuvwxyz0123456789_");
}

function escCsv(s: string): string {
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ---------- Machine Types ----------

const MACHINE_TYPES = ["xs", "s", "m", "l", "xl", "xxl"] as const;

export interface MachineTypeRow {
  id: number;
  name: string;
  cpu: number;
  ram: number;
  disk: number;
  typeName: string;
}

export function generateMachineTypes(): MachineTypeRow[] {
  return MACHINE_TYPES.map((t, idx) => ({
    id: nextId(),
    name: `${t}-${2 ** idx}/${4 ** idx}/${5 ** idx}`,
    cpu: 2 ** idx,
    ram: 4 ** idx,
    disk: 5 ** idx,
    typeName: t,
  }));
}

// ---------- DataCenters ----------

const DC_LOCATIONS = [
  "Iceland, Reykjavik",
  "Finland, Helsinki",
  "Singapore, Jurong",
  "US, Virginia",
  "Japan, Tokyo",
];

export interface DataCenterRow {
  id: number;
  name: string;
  location: string;
}
export function generateDataCenters(count: number): DataCenterRow[] {
  return Array.from({ length: count }, (_, i) => ({
    id: nextId(),
    name: `DC${i + 1}`,
    location: DC_LOCATIONS[i % DC_LOCATIONS.length],
  }));
}

// ---------- Routers (1 egress + 1 per zone per DC) ----------

export interface RouterRow {
  id: number;
  name: string;
  zone: number;
  isEgress: boolean;
  ip: string;
  dcId: number;
}

export function generateRouters(
  dcs: DataCenterRow[],
  zonesPerDc: number,
): RouterRow[] {
  const routers: RouterRow[] = [];
  for (const dc of dcs) {
    // egress router
    routers.push({
      id: nextId(),
      name: `${dc.name}-RE`,
      zone: 0,
      isEgress: true,
      ip: "10.0.0.254",
      dcId: dc.id,
    });
    for (let z = 1; z <= zonesPerDc; z++) {
      routers.push({
        id: nextId(),
        name: `${dc.name}-R-${z}`,
        zone: z,
        isEgress: false,
        ip: `10.${z}.0.254`,
        dcId: dc.id,
      });
    }
  }
  return routers;
}

// ---------- NetworkZones ----------

export interface NetworkZoneRow {
  id: number;
  ip: string;
  size: number;
  zone: number;
  dcId: number;
}

export function generateNetworkZones(
  dcs: DataCenterRow[],
  zonesPerDc: number,
): NetworkZoneRow[] {
  const zones: NetworkZoneRow[] = [];
  for (const dc of dcs) {
    for (let z = 1; z <= zonesPerDc; z++) {
      zones.push({
        id: nextId(),
        ip: `10.${z}`,
        size: 16,
        zone: z,
        dcId: dc.id,
      });
    }
  }
  return zones;
}

// ---------- Racks ----------

export interface RackRow {
  id: number;
  name: string;
  zone: number;
  rackNum: number;
  dcId: number;
  zoneId: number;
}

export function generateRacks(
  dcs: DataCenterRow[],
  zones: NetworkZoneRow[],
  racksPerZone: number,
): RackRow[] {
  const racks: RackRow[] = [];
  for (const dc of dcs) {
    const dcZones = zones.filter((z) => z.dcId === dc.id);
    for (const nz of dcZones) {
      for (let r = 1; r <= racksPerZone; r++) {
        racks.push({
          id: nextId(),
          name: `${dc.name}-RCK-${nz.zone}-${r}`,
          zone: nz.zone,
          rackNum: r,
          dcId: dc.id,
          zoneId: nz.id,
        });
      }
    }
  }
  return racks;
}

// ---------- Switches (1 per rack) ----------

export interface SwitchRow {
  id: number;
  ip: string;
  rackId: number;
}

export function generateSwitches(racks: RackRow[]): SwitchRow[] {
  return racks.map((rack) => ({
    id: nextId(),
    ip: `10.${rack.zone}.${rack.rackNum}.254`,
    rackId: rack.id,
  }));
}

// ---------- Machines ----------

export interface MachineRow {
  id: number;
  name: string;
  ip: string;
  typeId: number;
  cpu: number;
  ram: number;
  disk: number;
  os: string;
  firmware: string;
  serialNumber: string;
  metadata: string;
}

const OS_LIST = ["RHEL-7.3", "Ubuntu-22.04", "Debian-12", "Rocky-9.3"];
const FW_LIST = ["fw-1.0.0", "fw-1.2.3", "fw-2.0.0", "fw-2.1.1", "fw-3.0.0"];

/**
 * Generates a CSV string for machines in a given rack.
 * Returns the CSV rows (no header) and the array of machine IDs for relationship building.
 */
export function generateMachinesCsvForRack(
  rack: RackRow,
  machinesPerRack: number,
  machineTypes: MachineTypeRow[],
): { csv: string; machineIds: number[] } {
  const lines: string[] = [];
  const machineIds: number[] = [];

  for (let m = 1; m <= machinesPerRack; m++) {
    const id = nextId();
    machineIds.push(id);
    const typeIdx = Math.min(
      machineTypes.length - 1,
      Math.floor(Math.log2(machinesPerRack - m + 1)),
    );
    const mt = machineTypes[typeIdx];
    const name = `${rack.name}-M-${m}`;
    const ip = `10.${rack.zone}.${rack.rackNum}.${m}`;
    const os = OS_LIST[m % OS_LIST.length];
    const fw = FW_LIST[m % FW_LIST.length];
    const serial = `SN-${rack.dcId}-${rack.id}-${m}`.padEnd(20, "0");
    const meta = padMetadata(`m:${id}`, MACHINE_METADATA_PAD);

    lines.push(
      `${id},${escCsv(name)},${ip},${mt.id},${mt.cpu},${mt.ram},${mt.disk},${os},${fw},${serial},${escCsv(meta)}`,
    );
  }
  return { csv: lines.join("\n"), machineIds };
}

// CSV header for machines
export const MACHINE_CSV_HEADER =
  "id,name,ip,typeId,cpu,ram,disk,os,firmware,serialNumber,metadata";

// ---------- CSV helpers for relationship tables ----------

export function rackMachineRelCsv(
  rackId: number,
  machineIds: number[],
): string {
  return machineIds.map((mid) => `${rackId},${mid}`).join("\n");
}

export function machineTypeRelCsv(
  machineIds: number[],
  machinesPerRack: number,
  machineTypes: MachineTypeRow[],
): string {
  return machineIds
    .map((mid, i) => {
      const typeIdx = Math.min(
        machineTypes.length - 1,
        Math.floor(Math.log2(machinesPerRack - i)),
      );
      return `${mid},${machineTypes[typeIdx].id}`;
    })
    .join("\n");
}
