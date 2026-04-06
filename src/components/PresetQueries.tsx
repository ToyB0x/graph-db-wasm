import { SAMPLE_QUERIES, type PresetQuery } from "../db/queries";

export type { PresetQuery };

const TABLE_PRESETS: PresetQuery[] = [
  ...SAMPLE_QUERIES,
  {
    label: "Graph Statistics",
    description: "Total counts of all node and edge types",
    query: `MATCH (n:DataCenter) WITH COUNT(n) AS DataCenter
MATCH (n:Router) WITH DataCenter, COUNT(n) AS Router
MATCH (n:Rack) WITH DataCenter, Router, COUNT(n) AS Rack
MATCH (n:Switch) WITH DataCenter, Router, Rack, COUNT(n) AS Switch
MATCH (n:Network) WITH DataCenter, Router, Rack, Switch, COUNT(n) AS Network
MATCH (n:Machine) WITH DataCenter, Router, Rack, Switch, Network, COUNT(n) AS Machine
MATCH (n:Interface) WITH DataCenter, Router, Rack, Switch, Network, Machine, COUNT(n) AS Interface_
MATCH (n:Software) WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, COUNT(n) AS Software
MATCH (n:SoftwareVersion) WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, COUNT(n) AS SoftwareVersion
MATCH (n:Process) WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, COUNT(n) AS Process
MATCH (n:Port) WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, COUNT(n) AS Port
WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port,
     DataCenter + Router + Rack + Switch + Network + Machine + Interface_ + Software + SoftwareVersion + Process + Port AS total_nodes
MATCH ()-[r:DC_CONTAINS_ROUTER]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, COUNT(r) AS DC_CONTAINS_ROUTER
MATCH ()-[r:DC_CONTAINS_RACK]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, COUNT(r) AS DC_CONTAINS_RACK
MATCH ()-[r:RACK_HOLDS_SWITCH]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, COUNT(r) AS RACK_HOLDS_SWITCH
MATCH ()-[r:RACK_HOLDS_MACHINE]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, COUNT(r) AS RACK_HOLDS_MACHINE
MATCH ()-[r:MACHINE_HAS_IFACE]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, COUNT(r) AS MACHINE_HAS_IFACE
MATCH ()-[r:IFACE_IN_NETWORK]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, COUNT(r) AS IFACE_IN_NETWORK
MATCH ()-[r:IFACE_HAS_PORT]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, COUNT(r) AS IFACE_HAS_PORT
MATCH ()-[r:MACHINE_RUNS_PROCESS]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, IFACE_HAS_PORT, COUNT(r) AS MACHINE_RUNS_PROCESS
MATCH ()-[r:PROCESS_LISTENS_PORT]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, IFACE_HAS_PORT, MACHINE_RUNS_PROCESS, COUNT(r) AS PROCESS_LISTENS_PORT
MATCH ()-[r:PROCESS_USES_VERSION]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, IFACE_HAS_PORT, MACHINE_RUNS_PROCESS, PROCESS_LISTENS_PORT, COUNT(r) AS PROCESS_USES_VERSION
MATCH ()-[r:SOFTWARE_HAS_VERSION]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, IFACE_HAS_PORT, MACHINE_RUNS_PROCESS, PROCESS_LISTENS_PORT, PROCESS_USES_VERSION, COUNT(r) AS SOFTWARE_HAS_VERSION
MATCH ()-[r:ROUTER_ROUTES_NETWORK]->() WITH DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, total_nodes, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, IFACE_HAS_PORT, MACHINE_RUNS_PROCESS, PROCESS_LISTENS_PORT, PROCESS_USES_VERSION, SOFTWARE_HAS_VERSION, COUNT(r) AS ROUTER_ROUTES_NETWORK
WITH total_nodes,
     DC_CONTAINS_ROUTER + DC_CONTAINS_RACK + RACK_HOLDS_SWITCH + RACK_HOLDS_MACHINE + MACHINE_HAS_IFACE + IFACE_IN_NETWORK + IFACE_HAS_PORT + MACHINE_RUNS_PROCESS + PROCESS_LISTENS_PORT + PROCESS_USES_VERSION + SOFTWARE_HAS_VERSION + ROUTER_ROUTES_NETWORK AS total_edges,
     DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port,
     DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, IFACE_HAS_PORT, MACHINE_RUNS_PROCESS, PROCESS_LISTENS_PORT, PROCESS_USES_VERSION, SOFTWARE_HAS_VERSION, ROUTER_ROUTES_NETWORK
RETURN total_nodes, total_edges, DataCenter, Router, Rack, Switch, Network, Machine, Interface_, Software, SoftwareVersion, Process, Port, DC_CONTAINS_ROUTER, DC_CONTAINS_RACK, RACK_HOLDS_SWITCH, RACK_HOLDS_MACHINE, MACHINE_HAS_IFACE, IFACE_IN_NETWORK, IFACE_HAS_PORT, MACHINE_RUNS_PROCESS, PROCESS_LISTENS_PORT, PROCESS_USES_VERSION, SOFTWARE_HAS_VERSION, ROUTER_ROUTES_NETWORK`,
  },
];

const GRAPH_PRESETS: PresetQuery[] = [
  {
    label: "DC Infrastructure",
    description: "DC1's routers and network topology",
    graph: true,
    query:
      "MATCH (dc:DataCenter)-[r1:DC_CONTAINS_ROUTER]->(rt:Router)-[r2:ROUTER_ROUTES_NETWORK]->(n:Network) WHERE dc.name = 'DC1' RETURN dc, r1, rt, r2, n",
  },
  {
    label: "Rack \u2192 Machines",
    description: "Rack star topology (zone 1, rack 1)",
    graph: true,
    query:
      "MATCH (k:Rack)-[r:RACK_HOLDS_MACHINE]->(m:Machine) WHERE k.name = 'DC1-Z1-RCK-1' RETURN k, r, m LIMIT 15",
  },
  {
    label: "Machine Software Stack",
    description: "Machine \u2192 Process \u2192 SoftwareVersion chain",
    graph: true,
    query:
      "MATCH (m:Machine)-[r1:MACHINE_RUNS_PROCESS]->(p:Process)-[r2:PROCESS_USES_VERSION]->(v:SoftwareVersion)<-[r3:SOFTWARE_HAS_VERSION]-(sw:Software) WHERE m.id = 'M-1-1-1-1' RETURN m, r1, p, r2, v, r3, sw LIMIT 30",
  },
  {
    label: "Network Path",
    description: "Router \u2192 Network \u2192 Interface \u2192 Machine",
    graph: true,
    query:
      "MATCH (rt:Router)-[r1:ROUTER_ROUTES_NETWORK]->(n:Network)<-[r2:IFACE_IN_NETWORK]-(iface:Interface)<-[r3:MACHINE_HAS_IFACE]-(m:Machine) WHERE rt.name = 'DC1-R-1' RETURN rt, r1, n, r2, iface, r3, m LIMIT 20",
  },
  {
    label: "DC \u2192 Rack \u2192 Machine \u2192 Process",
    description: "Full hierarchical path from DC1",
    graph: true,
    query:
      "MATCH (dc:DataCenter)-[r1:DC_CONTAINS_RACK]->(k:Rack)-[r2:RACK_HOLDS_MACHINE]->(m:Machine)-[r3:MACHINE_RUNS_PROCESS]->(p:Process) WHERE dc.name = 'DC1' AND k.name = 'DC1-Z1-RCK-1' RETURN dc, r1, k, r2, m, r3, p LIMIT 30",
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
