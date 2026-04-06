export const NODE_TABLE_STATEMENTS = [
  `CREATE NODE TABLE DataCenter(
    name STRING,
    location STRING,
    description STRING,
    PRIMARY KEY(name)
  )`,
  `CREATE NODE TABLE Router(
    name STRING,
    zone INT32,
    model STRING,
    firmware STRING,
    is_egress BOOLEAN,
    description STRING,
    PRIMARY KEY(name)
  )`,
  `CREATE NODE TABLE Rack(
    name STRING,
    zone INT32,
    rack_num INT32,
    location STRING,
    description STRING,
    PRIMARY KEY(name)
  )`,
  `CREATE NODE TABLE Switch(
    name STRING,
    ip STRING,
    model STRING,
    serial_number STRING,
    description STRING,
    PRIMARY KEY(name)
  )`,
  `CREATE NODE TABLE Machine(
    id STRING,
    name STRING,
    machine_type STRING,
    cpu INT32,
    ram INT32,
    disk INT32,
    os STRING,
    serial_number STRING,
    description STRING,
    metadata STRING,
    PRIMARY KEY(id)
  )`,
  `CREATE NODE TABLE Network(
    cidr STRING,
    zone INT32,
    size INT32,
    description STRING,
    PRIMARY KEY(cidr)
  )`,
  `CREATE NODE TABLE Interface(
    id STRING,
    ip STRING,
    mac STRING,
    speed STRING,
    status STRING,
    PRIMARY KEY(id)
  )`,
  `CREATE NODE TABLE Port(
    id STRING,
    number INT32,
    protocol STRING,
    service_name STRING,
    PRIMARY KEY(id)
  )`,
  `CREATE NODE TABLE Software(
    name STRING,
    category STRING,
    description STRING,
    PRIMARY KEY(name)
  )`,
  `CREATE NODE TABLE SoftwareVersion(
    id STRING,
    version STRING,
    release_date STRING,
    PRIMARY KEY(id)
  )`,
  `CREATE NODE TABLE Process(
    id STRING,
    name STRING,
    pid INT32,
    status STRING,
    cpu_usage DOUBLE,
    mem_usage DOUBLE,
    start_time STRING,
    description STRING,
    PRIMARY KEY(id)
  )`,
];

export const REL_TABLE_STATEMENTS = [
  `CREATE REL TABLE DC_CONTAINS_ROUTER(FROM DataCenter TO Router)`,
  `CREATE REL TABLE DC_CONTAINS_RACK(FROM DataCenter TO Rack)`,
  `CREATE REL TABLE RACK_HOLDS_SWITCH(FROM Rack TO Switch)`,
  `CREATE REL TABLE RACK_HOLDS_MACHINE(FROM Rack TO Machine)`,
  `CREATE REL TABLE MACHINE_HAS_IFACE(FROM Machine TO Interface)`,
  `CREATE REL TABLE IFACE_IN_NETWORK(FROM Interface TO Network)`,
  `CREATE REL TABLE IFACE_HAS_PORT(FROM Interface TO Port)`,
  `CREATE REL TABLE MACHINE_RUNS_PROCESS(FROM Machine TO Process)`,
  `CREATE REL TABLE PROCESS_LISTENS_PORT(FROM Process TO Port)`,
  `CREATE REL TABLE PROCESS_USES_VERSION(FROM Process TO SoftwareVersion)`,
  `CREATE REL TABLE SOFTWARE_HAS_VERSION(FROM Software TO SoftwareVersion)`,
  `CREATE REL TABLE ROUTER_ROUTES_NETWORK(FROM Router TO Network)`,
];
