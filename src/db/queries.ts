export interface SampleQuery {
  name: string;
  description: string;
  query: string;
}

export const SAMPLE_QUERIES: SampleQuery[] = [
  {
    name: "Data Center Overview",
    description: "List all data centers with their locations",
    query: `MATCH (dc:DataCenter)
RETURN dc.name, dc.location, dc.description
ORDER BY dc.name`,
  },
  {
    name: "OS Distribution",
    description: "Count machines by operating system",
    query: `MATCH (m:Machine)
RETURN m.os AS operating_system, COUNT(*) AS count
ORDER BY count DESC`,
  },
  {
    name: "Process Software Versions",
    description: "Top 20 most used software versions across all processes",
    query: `MATCH (p:Process)-[:PROCESS_USES_VERSION]->(v:SoftwareVersion)<-[:SOFTWARE_HAS_VERSION]-(s:Software)
RETURN s.name AS software, v.version, COUNT(p) AS process_count
ORDER BY process_count DESC
LIMIT 20`,
  },
  {
    name: "High CPU Processes",
    description: "Find processes with CPU usage above 90%",
    query: `MATCH (m:Machine)-[:MACHINE_RUNS_PROCESS]->(p:Process)
WHERE p.cpu_usage > 90.0
RETURN m.name AS machine, p.name AS process, p.pid,
       p.cpu_usage, p.mem_usage, p.status
ORDER BY p.cpu_usage DESC
LIMIT 30`,
  },
  {
    name: "Port Services Distribution",
    description: "Distribution of service ports across the infrastructure",
    query: `MATCH (port:Port)
RETURN port.service_name AS service, port.number AS port_number,
       COUNT(*) AS count
ORDER BY count DESC
LIMIT 15`,
  },
  {
    name: "Full Path: DC to Process",
    description: "Trace path from DC1 through rack to a specific machine's processes",
    query: `MATCH (dc:DataCenter {name: 'DC1'})-[:DC_CONTAINS_RACK]->(r:Rack)-[:RACK_HOLDS_MACHINE]->(m:Machine)-[:MACHINE_RUNS_PROCESS]->(p:Process)
WHERE r.name = 'DC1-Z1-RCK-1'
RETURN dc.name AS dc, r.name AS rack, m.name AS machine,
       p.name AS process, p.status
ORDER BY m.name, p.name
LIMIT 30`,
  },
];
