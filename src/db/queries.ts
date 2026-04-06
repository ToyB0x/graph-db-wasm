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
    name: "Machines per Rack (DC1-Z1)",
    description: "Count machines in each rack of zone 1 in DC1",
    query: `MATCH (r:Rack)-[:RACK_HOLDS_MACHINE]->(m:Machine)
WHERE r.name STARTS WITH 'DC1-Z1'
RETURN r.name AS rack, COUNT(m) AS machine_count
ORDER BY r.name
LIMIT 20`,
  },
  {
    name: "OS Distribution",
    description: "Count machines by operating system",
    query: `MATCH (m:Machine)
RETURN m.os AS operating_system, COUNT(*) AS count
ORDER BY count DESC`,
  },
  {
    name: "Machine Type Distribution",
    description: "Distribution of machine types across all data centers",
    query: `MATCH (m:Machine)
RETURN m.machine_type AS type, COUNT(*) AS count,
       AVG(m.cpu) AS avg_cpu, AVG(m.ram) AS avg_ram_mb
ORDER BY count DESC`,
  },
  {
    name: "Down Interfaces",
    description: "Find all interfaces that are currently down",
    query: `MATCH (m:Machine)-[:MACHINE_HAS_IFACE]->(i:Interface)
WHERE i.status = 'down'
RETURN m.name AS machine, i.ip AS interface_ip, i.speed
ORDER BY m.name
LIMIT 50`,
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
    name: "Network Topology (Zone 1 DC1)",
    description: "Show router-to-network routing in zone 1 of DC1",
    query: `MATCH (r:Router)-[:ROUTER_ROUTES_NETWORK]->(n:Network)
WHERE r.name STARTS WITH 'DC1-R-1'
RETURN r.name AS router, n.cidr AS network, n.size AS prefix_len
ORDER BY n.cidr`,
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
    name: "Stopped Processes",
    description: "Find all stopped processes and their machines",
    query: `MATCH (m:Machine)-[:MACHINE_RUNS_PROCESS]->(p:Process)
WHERE p.status = 'stopped'
RETURN m.name AS machine, p.name AS process_name, p.pid, p.start_time
ORDER BY m.name
LIMIT 30`,
  },
  {
    name: "Impact Analysis: Rack Failure",
    description: "Show impact of rack DC1-Z1-RCK-1 going down",
    query: `MATCH (r:Rack {name: 'DC1-Z1-RCK-1'})-[:RACK_HOLDS_MACHINE]->(m:Machine)-[:MACHINE_RUNS_PROCESS]->(p:Process)-[:PROCESS_USES_VERSION]->(v:SoftwareVersion)<-[:SOFTWARE_HAS_VERSION]-(s:Software)
RETURN s.name AS affected_software, COUNT(DISTINCT m) AS affected_machines,
       COUNT(p) AS affected_processes
ORDER BY affected_machines DESC`,
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
