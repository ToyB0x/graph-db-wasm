// GraphDB Schema Definitions (Cypher DDL for LadybugDB)
// Modeled after: https://github.com/ToyB0x/network-management

export const NODE_TABLES = [
  `CREATE NODE TABLE IF NOT EXISTS DataCenter (
    id INT64, name STRING, location STRING,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS Router (
    id INT64, name STRING, zone INT64, isEgress BOOLEAN, ip STRING,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS NetworkZone (
    id INT64, ip STRING, size INT64, zone INT64,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS Rack (
    id INT64, name STRING, zone INT64, rackNum INT64,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS Switch (
    id INT64, ip STRING, rackId INT64,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS MachineType (
    id INT64, name STRING, cpu INT64, ram INT64, disk INT64, typeName STRING,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS Machine (
    id INT64, name STRING, ip STRING, typeId INT64,
    cpu INT64, ram INT64, disk INT64,
    os STRING, firmware STRING, serialNumber STRING, metadata STRING,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS Software (
    id INT64, name STRING, version STRING, category STRING,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS Process (
    id INT64, name STRING, pid INT64, startTime INT64, metadata STRING,
    PRIMARY KEY (id)
  )`,
  `CREATE NODE TABLE IF NOT EXISTS Port (
    id INT64, port INT64,
    PRIMARY KEY (id)
  )`,
];

export const REL_TABLES = [
  `CREATE REL TABLE IF NOT EXISTS DC_CONTAINS_ROUTER (FROM DataCenter TO Router)`,
  `CREATE REL TABLE IF NOT EXISTS DC_CONTAINS_RACK  (FROM DataCenter TO Rack)`,
  `CREATE REL TABLE IF NOT EXISTS ZONE_HAS_RACK     (FROM NetworkZone TO Rack)`,
  `CREATE REL TABLE IF NOT EXISTS ROUTER_ROUTES     (FROM Router TO NetworkZone)`,
  `CREATE REL TABLE IF NOT EXISTS RACK_HOLDS_SWITCH (FROM Rack TO Switch)`,
  `CREATE REL TABLE IF NOT EXISTS RACK_HOLDS_MACHINE(FROM Rack TO Machine)`,
  `CREATE REL TABLE IF NOT EXISTS MACHINE_TYPE      (FROM Machine TO MachineType)`,
  `CREATE REL TABLE IF NOT EXISTS MACHINE_RUNS      (FROM Machine TO Process)`,
  `CREATE REL TABLE IF NOT EXISTS PROCESS_INSTANCE  (FROM Process TO Software)`,
  `CREATE REL TABLE IF NOT EXISTS PROCESS_DEPENDS   (FROM Process TO Process)`,
  `CREATE REL TABLE IF NOT EXISTS PROCESS_LISTENS   (FROM Process TO Port)`,
];
