// Scale constants — tune these to reach ~100MB total DB size
const NUM_DCS = 3;
const ZONES_PER_DC = 4;
const RACKS_PER_ZONE = 12;
const MACHINES_PER_RACK = 300;

const MACHINE_TYPES = [
  { type: "xs", cpu: 1, ram: 1024, disk: 20 },
  { type: "s", cpu: 2, ram: 2048, disk: 40 },
  { type: "m", cpu: 4, ram: 8192, disk: 100 },
  { type: "l", cpu: 8, ram: 16384, disk: 250 },
  { type: "xl", cpu: 16, ram: 32768, disk: 500 },
  { type: "xxl", cpu: 32, ram: 65536, disk: 1000 },
];

const OS_LIST = [
  "RHEL 8.9",
  "RHEL 9.3",
  "Ubuntu 22.04",
  "Ubuntu 24.04",
  "Debian 12",
];

const SWITCH_MODELS = [
  "Cisco Nexus 9300",
  "Arista 7050X",
  "Juniper QFX5100",
  "Dell S5248F",
];

const ROUTER_MODELS = [
  "Cisco ASR 9000",
  "Juniper MX480",
  "Nokia 7750 SR",
  "Arista 7280R",
];

const SOFTWARE_LIST = [
  { name: "nginx", category: "Service", desc: "High-performance HTTP server and reverse proxy" },
  { name: "postgresql", category: "Service", desc: "Advanced open-source relational database" },
  { name: "redis", category: "Service", desc: "In-memory data structure store and cache" },
  { name: "elasticsearch", category: "Service", desc: "Distributed search and analytics engine" },
  { name: "prometheus", category: "Service", desc: "Monitoring and alerting toolkit" },
  { name: "grafana", category: "Application", desc: "Analytics and interactive visualization" },
  { name: "node-exporter", category: "Service", desc: "Hardware and OS metrics exporter" },
  { name: "docker", category: "Service", desc: "Container runtime platform" },
  { name: "kubelet", category: "Service", desc: "Kubernetes node agent" },
  { name: "envoy", category: "Service", desc: "High-performance edge/service proxy" },
  { name: "logstash", category: "Application", desc: "Server-side data processing pipeline" },
  { name: "consul", category: "Service", desc: "Service discovery and configuration" },
  { name: "vault", category: "Application", desc: "Secrets management and encryption" },
  { name: "haproxy", category: "Service", desc: "Reliable high-performance TCP/HTTP load balancer" },
  { name: "memcached", category: "Service", desc: "Distributed memory caching system" },
];

const SOFTWARE_VERSIONS: Record<string, string[]> = {
  nginx: ["1.24.0", "1.25.3", "1.25.4"],
  postgresql: ["14.10", "15.5", "16.1"],
  redis: ["7.0.14", "7.2.3", "7.2.4"],
  elasticsearch: ["7.17.16", "8.11.3", "8.12.0"],
  prometheus: ["2.48.1", "2.49.0", "2.50.0"],
  grafana: ["10.2.3", "10.3.0", "10.3.1"],
  "node-exporter": ["1.7.0", "1.8.0", "1.8.1"],
  docker: ["24.0.7", "25.0.0", "25.0.1"],
  kubelet: ["1.28.4", "1.29.0", "1.29.1"],
  envoy: ["1.28.0", "1.29.0", "1.29.1"],
  logstash: ["7.17.16", "8.11.3", "8.12.0"],
  consul: ["1.17.2", "1.18.0", "1.18.1"],
  vault: ["1.15.4", "1.15.5", "1.16.0"],
  haproxy: ["2.8.5", "2.9.2", "2.9.3"],
  memcached: ["1.6.22", "1.6.23", "1.6.24"],
};

const DC_LOCATIONS = [
  "Reykjavik, Iceland",
  "Zurich, Switzerland",
  "Tokyo, Japan",
];

function escapeCSV(s: string): string {
  if (s.includes('"') || s.includes(",") || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function pick<T>(arr: readonly T[], index: number): T {
  return arr[index % arr.length]!;
}

function generateMetadata(
  dcIdx: number,
  zoneIdx: number,
  rackIdx: number,
  machineIdx: number
): string {
  const roles = [
    "web-server",
    "api-server",
    "db-primary",
    "db-replica",
    "cache",
    "worker",
    "scheduler",
    "gateway",
    "monitoring",
    "logging",
    "ci-runner",
    "build-agent",
  ];
  const envs = ["production", "staging", "development", "testing"];
  const teams = [
    "platform",
    "backend",
    "frontend",
    "data",
    "infra",
    "security",
    "sre",
    "devops",
  ];
  const complianceOptions = [
    "SOC2",
    "HIPAA",
    "PCI-DSS",
    "ISO27001",
    "GDPR",
    "FedRAMP",
  ];
  const seed = dcIdx * 100000 + zoneIdx * 10000 + rackIdx * 1000 + machineIdx;
  const role = pick(roles, seed);
  const env = pick(envs, seed + 1);
  const team = pick(teams, seed + 2);
  const comp1 = pick(complianceOptions, seed + 3);
  const comp2 = pick(complianceOptions, seed + 5);
  const powerWatts = 200 + (seed % 800);
  const rackUnit = 1 + (machineIdx % 42);
  return JSON.stringify({
    role,
    environment: env,
    team,
    cost_center: `CC-${1000 + (seed % 9000)}`,
    monitoring: true,
    backup_policy: pick(["daily", "hourly", "weekly"], seed),
    network_segment: pick(["dmz", "internal", "management", "storage"], seed),
    compliance: [comp1, comp2],
    last_audit: `2024-${String(1 + (seed % 12)).padStart(2, "0")}-${String(1 + (seed % 28)).padStart(2, "0")}`,
    maintenance_window: `Sunday ${2 + (seed % 4)}:00-${6 + (seed % 4)}:00 UTC`,
    firmware_version: `${2 + (seed % 3)}.${seed % 10}.${seed % 5}`,
    bios_version: `${1 + (seed % 2)}.${seed % 8}.${seed % 3}`,
    boot_mode: pick(["UEFI", "Legacy"], seed),
    power_supply: pick(["redundant", "single"], seed),
    power_watts: powerWatts,
    cooling: pick(["liquid", "air", "hybrid"], seed),
    rack_unit: rackUnit,
    weight_kg: 15 + (seed % 25),
    warranty_expiry: `20${27 + (seed % 3)}-${String(1 + (seed % 12)).padStart(2, "0")}-30`,
    vendor: pick(["Dell", "HP", "Lenovo", "Supermicro"], seed),
    purchase_date: `2023-${String(1 + (seed % 12)).padStart(2, "0")}-${String(1 + (seed % 28)).padStart(2, "0")}`,
    asset_tag: `ASSET-DC${dcIdx + 1}-${seed}`,
    ip_management: `192.168.${(seed >> 8) & 255}.${seed & 255}`,
    dns_name: `dc${dcIdx + 1}-z${zoneIdx + 1}-r${rackIdx + 1}-m${machineIdx + 1}.internal.corp.net`,
    fqdn: `dc${dcIdx + 1}-z${zoneIdx + 1}-r${rackIdx + 1}-m${machineIdx + 1}.${pick(["us-east", "eu-west", "ap-north"], seed)}.compute.internal`,
    labels: {
      region: pick(["us-east-1", "eu-west-2", "ap-northeast-1"], seed),
      tier: pick(["tier-1", "tier-2", "tier-3"], seed + 7),
      criticality: pick(["critical", "high", "medium", "low"], seed + 9),
    },
    network_interfaces: [
      { name: "eth0", vlan: 100 + (seed % 50), mtu: 9000 },
      { name: "eth1", vlan: 200 + (seed % 50), mtu: 1500 },
    ],
    storage_volumes: [
      { mount: "/", size_gb: 50, fs: "ext4", used_pct: 30 + (seed % 60) },
      { mount: "/data", size_gb: 200 + (seed % 800), fs: pick(["xfs", "ext4", "zfs"], seed), used_pct: 10 + (seed % 80) },
    ],
    notes: `Machine ${machineIdx + 1} in rack ${rackIdx + 1} zone ${zoneIdx + 1} DC${dcIdx + 1}. Allocated for ${role} workloads in ${env} environment. Managed by ${team} team. Power consumption ${powerWatts}W. Last hardware check passed successfully with no issues reported. Scheduled for next maintenance cycle Q${1 + (seed % 4)} 2025.`,
  });
}

export type SeedProgress = {
  phase: string;
  detail: string;
  percent: number;
};

export function generateDataCenterCSV(): string {
  const rows = ["name,location,description"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    const name = `DC${dc + 1}`;
    const loc = DC_LOCATIONS[dc]!;
    const desc = `Primary data center in ${loc} with ${ZONES_PER_DC} availability zones`;
    rows.push(`${name},${escapeCSV(loc)},${escapeCSV(desc)}`);
  }
  return rows.join("\n");
}

export function generateRouterCSV(): string {
  const rows = ["name,zone,model,firmware,is_egress,description"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    // Egress router per DC
    const eName = `DC${dc + 1}-RE`;
    const eModel = pick(ROUTER_MODELS, dc);
    rows.push(
      `${eName},0,${escapeCSV(eModel)},v4.2.1,true,${escapeCSV(`Egress router for DC${dc + 1}`)}`
    );
    // Zone routers
    for (let z = 0; z < ZONES_PER_DC; z++) {
      const name = `DC${dc + 1}-R-${z + 1}`;
      const model = pick(ROUTER_MODELS, dc * 10 + z);
      rows.push(
        `${name},${z + 1},${escapeCSV(model)},v4.1.${z},false,${escapeCSV(`Zone ${z + 1} router in DC${dc + 1}`)}`
      );
    }
  }
  return rows.join("\n");
}

export function generateRackCSV(): string {
  const rows = ["name,zone,rack_num,location,description"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        const name = `DC${dc + 1}-Z${z + 1}-RCK-${r + 1}`;
        const loc = `Row ${Math.floor(r / 4) + 1} Position ${(r % 4) + 1}`;
        rows.push(
          `${name},${z + 1},${r + 1},${escapeCSV(loc)},${escapeCSV(`Rack ${r + 1} in zone ${z + 1} DC${dc + 1}`)}`
        );
      }
    }
  }
  return rows.join("\n");
}

export function generateSwitchCSV(): string {
  const rows = ["name,ip,model,serial_number,description"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        const name = `DC${dc + 1}-Z${z + 1}-SW-${r + 1}`;
        const ip = `10.${dc + 1}.${z * 16 + r}.254`;
        const model = pick(SWITCH_MODELS, dc * 100 + z * 10 + r);
        const serial = `SN-SW-${dc + 1}${z + 1}${String(r + 1).padStart(2, "0")}`;
        rows.push(
          `${name},${ip},${escapeCSV(model)},${serial},${escapeCSV(`Top-of-rack switch for rack ${r + 1}`)}`
        );
      }
    }
  }
  return rows.join("\n");
}

export function generateNetworkCSV(): string {
  const rows = ["cidr,zone,size,description"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    // DC-level network
    rows.push(
      `10.${dc + 1}.0.0/8,0,8,${escapeCSV(`DC${dc + 1} aggregate network`)}`
    );
    for (let z = 0; z < ZONES_PER_DC; z++) {
      // Zone-level
      rows.push(
        `10.${dc + 1}.${z * 16}.0/12,${z + 1},12,${escapeCSV(`Zone ${z + 1} network in DC${dc + 1}`)}`
      );
      // Rack-level
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        rows.push(
          `10.${dc + 1}.${z * 16 + r}.0/24,${z + 1},24,${escapeCSV(`Rack ${r + 1} subnet in zone ${z + 1}`)}`
        );
      }
    }
  }
  return rows.join("\n");
}

export function generateSoftwareCSV(): string {
  const rows = ["name,category,description"];
  for (const sw of SOFTWARE_LIST) {
    rows.push(`${sw.name},${sw.category},${escapeCSV(sw.desc)}`);
  }
  return rows.join("\n");
}

export function generateSoftwareVersionCSV(): string {
  const rows = ["id,version,release_date"];
  for (const sw of SOFTWARE_LIST) {
    const versions = SOFTWARE_VERSIONS[sw.name]!;
    for (let i = 0; i < versions.length; i++) {
      const id = `${sw.name}-${versions[i]}`;
      const month = String(1 + i * 3).padStart(2, "0");
      rows.push(`${id},${versions[i]},2024-${month}-01`);
    }
  }
  return rows.join("\n");
}

// Generate machines in batches to avoid huge strings
export function* generateMachineCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number; total: number }> {
  const total = NUM_DCS * ZONES_PER_DC * RACKS_PER_ZONE * MACHINES_PER_RACK;
  const header = "id,name,machine_type,cpu,ram,disk,os,serial_number,description,metadata";
  let batch: string[] = [header];
  let count = 0;

  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          const mt = pick(MACHINE_TYPES, dc * 1000 + z * 100 + r * 10 + m);
          const id = `M-${dc + 1}-${z + 1}-${r + 1}-${m + 1}`;
          const name = `dc${dc + 1}-z${z + 1}-r${String(r + 1).padStart(2, "0")}-m${String(m + 1).padStart(3, "0")}`;
          const os = pick(OS_LIST, dc * 10000 + z * 1000 + r * 100 + m);
          const serial = `SN-${dc + 1}${z + 1}${String(r + 1).padStart(2, "0")}${String(m + 1).padStart(3, "0")}`;
          const desc = `${mt.type.toUpperCase()} machine in DC${dc + 1} Zone${z + 1} Rack${r + 1}`;
          const metadata = generateMetadata(dc, z, r, m);
          batch.push(
            `${id},${name},${mt.type},${mt.cpu},${mt.ram},${mt.disk},${escapeCSV(os)},${serial},${escapeCSV(desc)},${escapeCSV(metadata)}`
          );
          count++;
          if (count % batchSize === 0) {
            yield { csv: batch.join("\n"), count, total };
            batch = [header];
          }
        }
      }
    }
  }
  if (batch.length > 1) {
    yield { csv: batch.join("\n"), count, total };
  }
}

export function* generateInterfaceCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number; total: number }> {
  const total = NUM_DCS * ZONES_PER_DC * RACKS_PER_ZONE * MACHINES_PER_RACK;
  const header = "id,ip,mac,speed,status";
  let batch: string[] = [header];
  let count = 0;

  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          const id = `IF-${dc + 1}-${z + 1}-${r + 1}-${m + 1}`;
          const ip = `10.${dc + 1}.${z * 16 + r}.${(m % 253) + 1}`;
          const macBase = (dc * 100000 + z * 10000 + r * 100 + m)
            .toString(16)
            .padStart(8, "0");
          const mac = `AA:BB:${macBase.slice(0, 2)}:${macBase.slice(2, 4)}:${macBase.slice(4, 6)}:${macBase.slice(6, 8)}`;
          const speed = pick(["1Gbps", "10Gbps", "25Gbps", "40Gbps"], m);
          const status = m % 20 === 0 ? "down" : "active";
          batch.push(`${id},${ip},${mac},${speed},${status}`);
          count++;
          if (count % batchSize === 0) {
            yield { csv: batch.join("\n"), count, total };
            batch = [header];
          }
        }
      }
    }
  }
  if (batch.length > 1) {
    yield { csv: batch.join("\n"), count, total };
  }
}

export function* generateProcessCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number; total: number }> {
  // Each machine runs 2-3 processes
  const totalMachines = NUM_DCS * ZONES_PER_DC * RACKS_PER_ZONE * MACHINES_PER_RACK;
  const total = totalMachines * 3; // estimate max
  const header = "id,name,pid,status,cpu_usage,mem_usage,start_time,description";
  let batch: string[] = [header];
  let count = 0;

  const processTemplates = [
    { name: "nginx", desc: "HTTP server handling web traffic for the main application cluster with reverse proxy and SSL termination and load balancing across upstream servers" },
    { name: "node-exporter", desc: "Prometheus metrics exporter for hardware and OS metrics including CPU memory disk network and system-level statistics for monitoring dashboards" },
    { name: "docker", desc: "Container runtime daemon managing application containers with resource isolation networking and volume management for microservice deployments" },
    { name: "kubelet", desc: "Kubernetes node agent managing pod lifecycle including health checks resource allocation and container orchestration for the cluster workloads" },
    { name: "postgresql", desc: "Database server processing SQL queries with WAL replication streaming backups and connection pooling for transactional application data storage" },
    { name: "redis", desc: "In-memory data structure store serving as cache message broker and session store with persistence and replication for high-throughput access patterns" },
    { name: "envoy", desc: "Service mesh sidecar proxy routing east-west traffic with circuit breaking rate limiting retries and observability for distributed microservices" },
    { name: "consul", desc: "Service discovery and configuration agent maintaining cluster health with gossip protocol health checks and distributed key-value configuration store" },
    { name: "prometheus", desc: "Monitoring server scraping and storing time-series metrics from instrumented services with alerting rules and recording rules for SRE dashboards" },
    { name: "elasticsearch", desc: "Distributed search and analytics engine indexing application logs audit events and operational data with full-text search and aggregation pipelines" },
  ];

  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          const seed = dc * 100000 + z * 10000 + r * 1000 + m;
          const numProcs = 2 + (seed % 2); // 2 or 3
          for (let p = 0; p < numProcs; p++) {
            const tmpl = pick(processTemplates, seed + p);
            const id = `P-${dc + 1}-${z + 1}-${r + 1}-${m + 1}-${p + 1}`;
            const pid = 1000 + (seed * 3 + p) % 60000;
            const cpuUsage = ((seed * 7 + p * 13) % 10000) / 100;
            const memUsage = ((seed * 11 + p * 17) % 10000) / 10;
            const hour = (seed + p) % 24;
            const day = 1 + ((seed + p) % 28);
            const month = 1 + ((seed + p) % 12);
            const startTime = `2024-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00Z`;
            const status = p === 0 || seed % 10 !== 0 ? "running" : "stopped";
            batch.push(
              `${id},${tmpl.name},${pid},${status},${cpuUsage},${memUsage},${startTime},${escapeCSV(tmpl.desc)}`
            );
            count++;
            if (count % batchSize === 0) {
              yield { csv: batch.join("\n"), count, total };
              batch = [header];
            }
          }
        }
      }
    }
  }
  if (batch.length > 1) {
    yield { csv: batch.join("\n"), count, total };
  }
}

export function* generatePortCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number; total: number }> {
  const totalMachines = NUM_DCS * ZONES_PER_DC * RACKS_PER_ZONE * MACHINES_PER_RACK;
  const total = totalMachines * 2;
  const header = "id,number,protocol,service_name";
  let batch: string[] = [header];
  let count = 0;

  const portDefs = [
    { port: 80, proto: "TCP", svc: "http" },
    { port: 443, proto: "TCP", svc: "https" },
    { port: 5432, proto: "TCP", svc: "postgres" },
    { port: 6379, proto: "TCP", svc: "redis" },
    { port: 9090, proto: "TCP", svc: "prometheus" },
    { port: 9100, proto: "TCP", svc: "node-exporter" },
    { port: 8080, proto: "TCP", svc: "http-alt" },
    { port: 3000, proto: "TCP", svc: "grafana" },
    { port: 9200, proto: "TCP", svc: "elasticsearch" },
    { port: 8500, proto: "TCP", svc: "consul" },
  ];

  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          const seed = dc * 100000 + z * 10000 + r * 1000 + m;
          // Each machine exposes 2 ports
          for (let p = 0; p < 2; p++) {
            const pd = pick(portDefs, seed + p);
            const id = `PORT-${dc + 1}-${z + 1}-${r + 1}-${m + 1}-${p + 1}`;
            batch.push(`${id},${pd.port},${pd.proto},${pd.svc}`);
            count++;
            if (count % batchSize === 0) {
              yield { csv: batch.join("\n"), count, total };
              batch = [header];
            }
          }
        }
      }
    }
  }
  if (batch.length > 1) {
    yield { csv: batch.join("\n"), count, total };
  }
}

// Relationship CSV generators
export function generateDCContainsRouterCSV(): string {
  const rows = ["from,to"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    rows.push(`DC${dc + 1},DC${dc + 1}-RE`);
    for (let z = 0; z < ZONES_PER_DC; z++) {
      rows.push(`DC${dc + 1},DC${dc + 1}-R-${z + 1}`);
    }
  }
  return rows.join("\n");
}

export function generateDCContainsRackCSV(): string {
  const rows = ["from,to"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        rows.push(`DC${dc + 1},DC${dc + 1}-Z${z + 1}-RCK-${r + 1}`);
      }
    }
  }
  return rows.join("\n");
}

export function generateRackHoldsSwitchCSV(): string {
  const rows = ["from,to"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        rows.push(
          `DC${dc + 1}-Z${z + 1}-RCK-${r + 1},DC${dc + 1}-Z${z + 1}-SW-${r + 1}`
        );
      }
    }
  }
  return rows.join("\n");
}

export function* generateRackHoldsMachineCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number }> {
  const header = "from,to";
  let batch: string[] = [header];
  let count = 0;
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          batch.push(
            `DC${dc + 1}-Z${z + 1}-RCK-${r + 1},M-${dc + 1}-${z + 1}-${r + 1}-${m + 1}`
          );
          count++;
          if (count % batchSize === 0) {
            yield { csv: batch.join("\n"), count };
            batch = [header];
          }
        }
      }
    }
  }
  if (batch.length > 1) yield { csv: batch.join("\n"), count };
}

export function* generateMachineHasIfaceCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number }> {
  const header = "from,to";
  let batch: string[] = [header];
  let count = 0;
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          batch.push(
            `M-${dc + 1}-${z + 1}-${r + 1}-${m + 1},IF-${dc + 1}-${z + 1}-${r + 1}-${m + 1}`
          );
          count++;
          if (count % batchSize === 0) {
            yield { csv: batch.join("\n"), count };
            batch = [header];
          }
        }
      }
    }
  }
  if (batch.length > 1) yield { csv: batch.join("\n"), count };
}

export function* generateIfaceInNetworkCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number }> {
  const header = "from,to";
  let batch: string[] = [header];
  let count = 0;
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          batch.push(
            `IF-${dc + 1}-${z + 1}-${r + 1}-${m + 1},10.${dc + 1}.${z * 16 + r}.0/24`
          );
          count++;
          if (count % batchSize === 0) {
            yield { csv: batch.join("\n"), count };
            batch = [header];
          }
        }
      }
    }
  }
  if (batch.length > 1) yield { csv: batch.join("\n"), count };
}

export function* generateIfaceHasPortCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number }> {
  const header = "from,to";
  let batch: string[] = [header];
  let count = 0;
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          for (let p = 0; p < 2; p++) {
            batch.push(
              `IF-${dc + 1}-${z + 1}-${r + 1}-${m + 1},PORT-${dc + 1}-${z + 1}-${r + 1}-${m + 1}-${p + 1}`
            );
            count++;
            if (count % batchSize === 0) {
              yield { csv: batch.join("\n"), count };
              batch = [header];
            }
          }
        }
      }
    }
  }
  if (batch.length > 1) yield { csv: batch.join("\n"), count };
}

export function* generateMachineRunsProcessCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number }> {
  const header = "from,to";
  let batch: string[] = [header];
  let count = 0;
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          const seed = dc * 100000 + z * 10000 + r * 1000 + m;
          const numProcs = 2 + (seed % 2);
          for (let p = 0; p < numProcs; p++) {
            batch.push(
              `M-${dc + 1}-${z + 1}-${r + 1}-${m + 1},P-${dc + 1}-${z + 1}-${r + 1}-${m + 1}-${p + 1}`
            );
            count++;
            if (count % batchSize === 0) {
              yield { csv: batch.join("\n"), count };
              batch = [header];
            }
          }
        }
      }
    }
  }
  if (batch.length > 1) yield { csv: batch.join("\n"), count };
}

export function* generateProcessUsesVersionCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number }> {
  const header = "from,to";
  let batch: string[] = [header];
  let count = 0;
  const allVersionIds: string[] = [];
  for (const sw of SOFTWARE_LIST) {
    for (const ver of SOFTWARE_VERSIONS[sw.name]!) {
      allVersionIds.push(`${sw.name}-${ver}`);
    }
  }

  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          const seed = dc * 100000 + z * 10000 + r * 1000 + m;
          const numProcs = 2 + (seed % 2);
          for (let p = 0; p < numProcs; p++) {
            const verId = pick(allVersionIds, seed + p);
            batch.push(
              `P-${dc + 1}-${z + 1}-${r + 1}-${m + 1}-${p + 1},${verId}`
            );
            count++;
            if (count % batchSize === 0) {
              yield { csv: batch.join("\n"), count };
              batch = [header];
            }
          }
        }
      }
    }
  }
  if (batch.length > 1) yield { csv: batch.join("\n"), count };
}

export function* generateProcessListensPortCSVBatches(
  batchSize: number
): Generator<{ csv: string; count: number }> {
  const header = "from,to";
  let batch: string[] = [header];
  let count = 0;
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        for (let m = 0; m < MACHINES_PER_RACK; m++) {
          // First process listens on first port
          batch.push(
            `P-${dc + 1}-${z + 1}-${r + 1}-${m + 1}-1,PORT-${dc + 1}-${z + 1}-${r + 1}-${m + 1}-1`
          );
          count++;
          if (count % batchSize === 0) {
            yield { csv: batch.join("\n"), count };
            batch = [header];
          }
        }
      }
    }
  }
  if (batch.length > 1) yield { csv: batch.join("\n"), count };
}

export function generateSoftwareHasVersionCSV(): string {
  const rows = ["from,to"];
  for (const sw of SOFTWARE_LIST) {
    for (const ver of SOFTWARE_VERSIONS[sw.name]!) {
      rows.push(`${sw.name},${sw.name}-${ver}`);
    }
  }
  return rows.join("\n");
}

export function generateRouterRoutesNetworkCSV(): string {
  const rows = ["from,to"];
  for (let dc = 0; dc < NUM_DCS; dc++) {
    for (let z = 0; z < ZONES_PER_DC; z++) {
      // Zone router routes zone network
      rows.push(`DC${dc + 1}-R-${z + 1},10.${dc + 1}.${z * 16}.0/12`);
      // And each rack subnet
      for (let r = 0; r < RACKS_PER_ZONE; r++) {
        rows.push(
          `DC${dc + 1}-R-${z + 1},10.${dc + 1}.${z * 16 + r}.0/24`
        );
      }
    }
  }
  return rows.join("\n");
}

export function getTotalCounts() {
  const dataCenters = NUM_DCS;
  const routers = NUM_DCS * (1 + ZONES_PER_DC);
  const racks = NUM_DCS * ZONES_PER_DC * RACKS_PER_ZONE;
  const switches = racks;
  const networks = NUM_DCS * (1 + ZONES_PER_DC * (1 + RACKS_PER_ZONE));
  const machines = NUM_DCS * ZONES_PER_DC * RACKS_PER_ZONE * MACHINES_PER_RACK;
  const interfaces = machines;
  const software = SOFTWARE_LIST.length;
  const softwareVersions = SOFTWARE_LIST.reduce(
    (sum, sw) => sum + SOFTWARE_VERSIONS[sw.name]!.length,
    0,
  );
  const processes = machines * 2.5; // half have 2, half have 3
  const ports = machines * 2;

  const totalNodes = Math.floor(
    dataCenters + routers + racks + switches + networks + machines +
    interfaces + software + softwareVersions + processes + ports,
  );

  // Edge counts
  const dcContainsRouter = routers;
  const dcContainsRack = racks;
  const rackHoldsSwitch = switches;
  const rackHoldsMachine = machines;
  const machineHasIface = machines;
  const ifaceInNetwork = machines;
  const ifaceHasPort = ports;
  const machineRunsProcess = Math.floor(processes);
  const processListensPort = machines; // first process per machine
  const processUsesVersion = Math.floor(processes);
  const softwareHasVersion = softwareVersions;
  const routerRoutesNetwork = NUM_DCS * ZONES_PER_DC * (1 + RACKS_PER_ZONE);

  const totalEdges =
    dcContainsRouter + dcContainsRack + rackHoldsSwitch + rackHoldsMachine +
    machineHasIface + ifaceInNetwork + ifaceHasPort + machineRunsProcess +
    processListensPort + processUsesVersion + softwareHasVersion + routerRoutesNetwork;

  // Rough size estimate
  const estimatedSizeMB = Math.round(
    (machines * 900 + Math.floor(processes) * 300 + interfaces * 50 +
     ports * 40 + totalEdges * 40 + racks * 200) / 1_000_000,
  );

  return { totalNodes, totalEdges, estimatedSizeMB };
}
