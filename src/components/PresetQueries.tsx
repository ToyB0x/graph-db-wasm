export interface PresetQuery {
  label: string;
  description: string;
  query: string;
  graph?: boolean;
  highlight?: boolean;
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
    label: "Graph Statistics",
    description: "Total counts of all node and edge types",
    highlight: true,
    query: `MATCH (n:DataCenter) WITH COUNT(n) AS DataCenter
MATCH (n:Router) WITH DataCenter, COUNT(n) AS Router
MATCH (n:NetworkZone) WITH DataCenter, Router, COUNT(n) AS NetworkZone
MATCH (n:Rack) WITH DataCenter, Router, NetworkZone, COUNT(n) AS Rack
MATCH (n:Switch) WITH DataCenter, Router, NetworkZone, Rack, COUNT(n) AS Switch
MATCH (n:MachineType) WITH DataCenter, Router, NetworkZone, Rack, Switch, COUNT(n) AS MachineType
MATCH (n:Machine) WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, COUNT(n) AS Machine
MATCH (n:Software) WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, COUNT(n) AS Software
MATCH (n:Process) WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, COUNT(n) AS Process
MATCH (n:Port) WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, COUNT(n) AS Port
WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port,
     DataCenter + Router + NetworkZone + Rack + Switch + MachineType + Machine + Software + Process + Port AS total_nodes
MATCH ()-[r:DC_CONTAINS_ROUTER]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, COUNT(r) AS DC_CONTAINS_ROUTER
MATCH ()-[r:DC_CONTAINS_RACK]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, COUNT(r) AS DC_CONTAINS_RACK
MATCH ()-[r:ZONE_HAS_RACK]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, COUNT(r) AS ZONE_HAS_RACK
MATCH ()-[r:ROUTER_ROUTES]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, COUNT(r) AS ROUTER_ROUTES
MATCH ()-[r:RACK_HOLDS_SWITCH]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, COUNT(r) AS RACK_HOLDS_SWITCH
MATCH ()-[r:RACK_HOLDS_MACHINE]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, COUNT(r) AS RACK_HOLDS_MACHINE
MATCH ()-[r:MACHINE_TYPE]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, COUNT(r) AS MACHINE_TYPE
MATCH ()-[r:MACHINE_RUNS]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_TYPE, COUNT(r) AS MACHINE_RUNS
MATCH ()-[r:PROCESS_INSTANCE]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_TYPE, MACHINE_RUNS, COUNT(r) AS PROCESS_INSTANCE
MATCH ()-[r:PROCESS_DEPENDS]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_TYPE, MACHINE_RUNS, PROCESS_INSTANCE, COUNT(r) AS PROCESS_DEPENDS
MATCH ()-[r:PROCESS_LISTENS]->() WITH DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_TYPE, MACHINE_RUNS, PROCESS_INSTANCE, PROCESS_DEPENDS, COUNT(r) AS PROCESS_LISTENS
WITH total_nodes,
     DC_CONTAINS_ROUTER + DC_CONTAINS_RACK + ZONE_HAS_RACK + ROUTER_ROUTES + RACK_HOLDS_SWITCH + RACK_HOLDS_MACHINE + MACHINE_TYPE + MACHINE_RUNS + PROCESS_INSTANCE + PROCESS_DEPENDS + PROCESS_LISTENS AS total_edges,
     DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port,
     DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_TYPE, MACHINE_RUNS, PROCESS_INSTANCE, PROCESS_DEPENDS, PROCESS_LISTENS
RETURN total_nodes, total_edges, DataCenter, Router, NetworkZone, Rack, Switch, MachineType, Machine, Software, Process, Port, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, ZONE_HAS_RACK, ROUTER_ROUTES, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_TYPE, MACHINE_RUNS, PROCESS_INSTANCE, PROCESS_DEPENDS, PROCESS_LISTENS`,
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
              className={`rounded-lg border p-2.5 text-left transition-colors disabled:opacity-40 cursor-pointer ${
                p.highlight
                  ? "border-green-500/50 bg-green-500/10 hover:border-green-500 hover:bg-green-500/20"
                  : "border-gray-700 bg-gray-800 hover:border-indigo-500 hover:bg-gray-800/80"
              }`}
            >
              <p className={`text-xs font-medium ${p.highlight ? "text-green-400" : "text-gray-200"}`}>
                {p.highlight && <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5 align-middle" />}
                {p.label}
              </p>
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
