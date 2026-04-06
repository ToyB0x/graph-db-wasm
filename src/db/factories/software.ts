// Factory for Software catalog nodes

let _swIdCounter = 900_000;
function nextSwId() {
  return ++_swIdCounter;
}

export interface SoftwareRow {
  id: number;
  name: string;
  version: string;
  category: "os" | "service" | "application";
  ports: number[];
  dependencies: string[];
}

const SOFTWARE_CATALOG: Omit<SoftwareRow, "id">[] = [
  // Operating Systems
  { name: "RHEL", version: "7.3", category: "os", ports: [], dependencies: [] },
  { name: "Ubuntu", version: "22.04", category: "os", ports: [], dependencies: [] },
  { name: "Debian", version: "12", category: "os", ports: [], dependencies: [] },
  { name: "Rocky", version: "9.3", category: "os", ports: [], dependencies: [] },
  // Services
  { name: "java", version: "21", category: "service", ports: [], dependencies: [] },
  { name: "neo4j", version: "5.18", category: "service", ports: [7474, 7687], dependencies: ["java"] },
  { name: "postgres", version: "16.2", category: "service", ports: [5432], dependencies: [] },
  { name: "couchbase", version: "7.6", category: "service", ports: [8091, 11210], dependencies: [] },
  { name: "elasticsearch", version: "8.13", category: "service", ports: [9200, 9300], dependencies: ["java"] },
  { name: "redis", version: "7.2", category: "service", ports: [6379], dependencies: [] },
  // Applications
  { name: "webserver", version: "2.4", category: "application", ports: [80, 443], dependencies: ["postgres"] },
  { name: "crm", version: "3.1", category: "application", ports: [8080], dependencies: ["java", "neo4j"] },
  { name: "cms", version: "5.0", category: "application", ports: [8081], dependencies: ["couchbase"] },
  { name: "webapp", version: "1.0", category: "application", ports: [3000], dependencies: ["java", "redis"] },
  { name: "logstash", version: "8.13", category: "application", ports: [5000], dependencies: ["elasticsearch"] },
];

export function generateSoftware(): SoftwareRow[] {
  return SOFTWARE_CATALOG.map((sw) => ({ ...sw, id: nextSwId() }));
}

export function generateSoftwareCsv(rows: SoftwareRow[]): string {
  const header = "id,name,version,category";
  const lines = rows.map(
    (r) => `${r.id},${r.name},${r.version},${r.category}`,
  );
  return [header, ...lines].join("\n");
}

// ---------- Ports (unique across all software) ----------

export interface PortRow {
  id: number;
  port: number;
}

export function generatePorts(software: SoftwareRow[]): PortRow[] {
  const seen = new Set<number>();
  const rows: PortRow[] = [];
  let portIdCounter = 800_000;
  for (const sw of software) {
    for (const p of sw.ports) {
      if (!seen.has(p)) {
        seen.add(p);
        rows.push({ id: ++portIdCounter, port: p });
      }
    }
  }
  return rows;
}
