export interface PresetQuery {
  label: string;
  description: string;
  query: string;
  graph?: boolean;
}

const TABLE_PRESETS: PresetQuery[] = [
  {
    label: "All DataCenters",
    description: "List all data centers with locations",
    query:
      "MATCH (dc:DataCenter) RETURN dc.name AS name, dc.location AS location",
  },
  {
    label: "Routers per DC",
    description: "Routers in each data center with IPs",
    query:
      "MATCH (dc:DataCenter)-[:DC_CONTAINS_ROUTER]->(r:Router) RETURN dc.name AS dc, r.name AS router, r.ip AS ip ORDER BY dc.name, r.name",
  },
  {
    label: "Machines in Rack (first 20)",
    description: "Machines in zone 1, rack 1",
    query:
      "MATCH (k:Rack)-[:RACK_HOLDS_MACHINE]->(m:Machine) WHERE k.rackNum = 1 AND k.zone = 1 RETURN k.name AS rack, m.name AS machine, m.ip AS ip, m.os AS os LIMIT 20",
  },
  {
    label: "Machine count by OS",
    description: "Count machines by operating system",
    query:
      "MATCH (m:Machine) RETURN m.os AS os, COUNT(*) AS count ORDER BY count DESC",
  },
  {
    label: "Processes on a machine",
    description: "Processes running on machines ending with M-1",
    query:
      "MATCH (m:Machine)-[:MACHINE_RUNS]->(p:Process) WHERE m.name ENDS WITH 'M-1' RETURN m.name AS machine, p.name AS process, p.pid AS pid LIMIT 30",
  },
  {
    label: "Software dependency chain",
    description: "Software versions and running process count",
    query:
      "MATCH (p:Process)-[:PROCESS_INSTANCE]->(sw:Software) RETURN sw.name AS software, sw.version AS version, sw.category AS category, COUNT(p) AS running_count ORDER BY running_count DESC",
  },
  {
    label: "DC \u2192 Router \u2192 Zone \u2192 Rack path",
    description: "Full infrastructure path traversal",
    query:
      "MATCH (dc:DataCenter)-[:DC_CONTAINS_ROUTER]->(r:Router)-[:ROUTER_ROUTES]->(nz:NetworkZone)-[:ZONE_HAS_RACK]->(k:Rack) RETURN dc.name AS dc, r.name AS router, nz.ip AS network, k.name AS rack LIMIT 30",
  },
  {
    label: "Total node counts",
    description: "Count of all major node types",
    query: `MATCH (n:DataCenter) WITH COUNT(n) AS dcs
MATCH (n:Router) WITH dcs, COUNT(n) AS routers
MATCH (n:Rack) WITH dcs, routers, COUNT(n) AS racks
MATCH (n:Machine) WITH dcs, routers, racks, COUNT(n) AS machines
MATCH (n:Process) WITH dcs, routers, racks, machines, COUNT(n) AS processes
RETURN dcs, routers, racks, machines, processes`,
  },
];

const GRAPH_PRESETS: PresetQuery[] = [
  {
    label: "DC Infrastructure",
    description: "DC1's routers and network zones",
    graph: true,
    query:
      "MATCH (dc:DataCenter)-[r1:DC_CONTAINS_ROUTER]->(rt:Router)-[r2:ROUTER_ROUTES]->(nz:NetworkZone) WHERE dc.name = 'DC1' RETURN dc, r1, rt, r2, nz",
  },
  {
    label: "Rack \u2192 Machines",
    description: "Rack star topology (zone 1, rack 1)",
    graph: true,
    query:
      "MATCH (k:Rack)-[r:RACK_HOLDS_MACHINE]->(m:Machine) WHERE k.rackNum = 1 AND k.zone = 1 RETURN k, r, m LIMIT 15",
  },
  {
    label: "Machine Software Stack",
    description: "Machine \u2192 Process \u2192 Software chain",
    graph: true,
    query:
      "MATCH (m:Machine)-[r1:MACHINE_RUNS]->(p:Process)-[r2:PROCESS_INSTANCE]->(sw:Software) WHERE m.name ENDS WITH 'M-1' RETURN m, r1, p, r2, sw LIMIT 30",
  },
  {
    label: "Process Dependencies",
    description: "Inter-process dependency graph",
    graph: true,
    query:
      "MATCH (p1:Process)-[d:PROCESS_DEPENDS]->(p2:Process) RETURN p1, d, p2 LIMIT 30",
  },
  {
    label: "DC \u2192 Rack \u2192 Machine \u2192 Process",
    description: "Full hierarchical path from DC1",
    graph: true,
    query:
      "MATCH (dc:DataCenter)-[r1:DC_CONTAINS_RACK]->(k:Rack)-[r2:RACK_HOLDS_MACHINE]->(m:Machine)-[r3:MACHINE_RUNS]->(p:Process) WHERE dc.name = 'DC1' AND k.rackNum = 1 AND k.zone = 1 RETURN dc, r1, k, r2, m, r3, p LIMIT 30",
  },
];

interface Props {
  onSelect: (preset: PresetQuery) => void;
  disabled: boolean;
}

export default function PresetQueries({ onSelect, disabled }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Table Queries
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TABLE_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onSelect(p)}
              disabled={disabled}
              className="rounded-lg border border-gray-700 bg-gray-800 p-2.5 text-left transition-colors hover:border-indigo-500 hover:bg-gray-800/80 disabled:opacity-40 cursor-pointer"
            >
              <p className="text-xs font-medium text-gray-200">{p.label}</p>
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-emerald-500 uppercase tracking-wide">
          Graph Queries
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {GRAPH_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => onSelect(p)}
              disabled={disabled}
              className="rounded-lg border border-emerald-800/50 bg-gray-800 p-2.5 text-left transition-colors hover:border-emerald-500 hover:bg-gray-800/80 disabled:opacity-40 cursor-pointer"
            >
              <p className="text-xs font-medium text-gray-200">{p.label}</p>
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                {p.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
