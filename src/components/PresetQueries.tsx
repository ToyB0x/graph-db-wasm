interface Props {
  onSelect: (q: string) => void;
  disabled: boolean;
}

const PRESETS: { label: string; query: string }[] = [
  {
    label: "All DataCenters",
    query: "MATCH (dc:DataCenter) RETURN dc.name AS name, dc.location AS location",
  },
  {
    label: "Routers per DC",
    query:
      "MATCH (dc:DataCenter)-[:DC_CONTAINS_ROUTER]->(r:Router) RETURN dc.name AS dc, r.name AS router, r.ip AS ip ORDER BY dc.name, r.name",
  },
  {
    label: "Machines in Rack (first 20)",
    query:
      "MATCH (k:Rack)-[:RACK_HOLDS_MACHINE]->(m:Machine) WHERE k.rackNum = 1 AND k.zone = 1 RETURN k.name AS rack, m.name AS machine, m.ip AS ip, m.os AS os LIMIT 20",
  },
  {
    label: "Machine count by OS",
    query:
      "MATCH (m:Machine) RETURN m.os AS os, COUNT(*) AS count ORDER BY count DESC",
  },
  {
    label: "Processes on a machine",
    query:
      "MATCH (m:Machine)-[:MACHINE_RUNS]->(p:Process) WHERE m.name ENDS WITH 'M-1' RETURN m.name AS machine, p.name AS process, p.pid AS pid LIMIT 30",
  },
  {
    label: "Software dependency chain",
    query:
      "MATCH (p:Process)-[:PROCESS_INSTANCE]->(sw:Software) RETURN sw.name AS software, sw.version AS version, sw.category AS category, COUNT(p) AS running_count ORDER BY running_count DESC",
  },
  {
    label: "DC → Router → Zone → Rack path",
    query:
      "MATCH (dc:DataCenter)-[:DC_CONTAINS_ROUTER]->(r:Router)-[:ROUTER_ROUTES]->(nz:NetworkZone)-[:ZONE_HAS_RACK]->(k:Rack) RETURN dc.name AS dc, r.name AS router, nz.ip AS network, k.name AS rack LIMIT 30",
  },
  {
    label: "Total node counts",
    query: `MATCH (n:DataCenter) WITH COUNT(n) AS dcs
MATCH (n:Router) WITH dcs, COUNT(n) AS routers
MATCH (n:Rack) WITH dcs, routers, COUNT(n) AS racks
MATCH (n:Machine) WITH dcs, routers, racks, COUNT(n) AS machines
MATCH (n:Process) WITH dcs, routers, racks, machines, COUNT(n) AS processes
RETURN dcs, routers, racks, machines, processes`,
  },
];

export default function PresetQueries({ onSelect, disabled }: Props) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Preset Queries
      </p>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelect(p.query)}
            disabled={disabled}
            className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:border-indigo-500 hover:text-indigo-300 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
