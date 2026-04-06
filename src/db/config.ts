// ============================================================
// Seed Configuration
// Tuned to produce ~100MB of graph data in the WASM database.
// Adjust MACHINES_PER_RACK or METADATA_PAD_LENGTH to fine-tune.
// ============================================================

export const SEED_CONFIG = {
  NUM_DATACENTERS: 3,
  ZONES_PER_DC: 4,
  RACKS_PER_ZONE: 10, // 120 racks total
  MACHINES_PER_RACK: 400, // 48,000 machines total
  MACHINE_METADATA_PAD: 700, // bytes of metadata per machine
  PROCESS_METADATA_PAD: 350, // bytes of metadata per process
} as const;

// Derived counts for progress tracking
export const TOTAL_RACKS =
  SEED_CONFIG.NUM_DATACENTERS *
  SEED_CONFIG.ZONES_PER_DC *
  SEED_CONFIG.RACKS_PER_ZONE;

export const TOTAL_MACHINES = TOTAL_RACKS * SEED_CONFIG.MACHINES_PER_RACK;

// Rough size estimate (bytes)
export const ESTIMATED_SIZE_MB = Math.round(
  (TOTAL_MACHINES * (SEED_CONFIG.MACHINE_METADATA_PAD + 120) +
    TOTAL_MACHINES * 2 * (SEED_CONFIG.PROCESS_METADATA_PAD + 60) +
    TOTAL_RACKS * 200 +
    TOTAL_MACHINES * 3 * 40) / // relationships
    1_000_000,
);
