export interface GraphNode {
  id: string;
  label: string;
  displayName: string;
  properties: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  truncated: boolean;
}

const MAX_NODES = 500;

interface KuzuId {
  offset: number;
  table: number;
}

function isKuzuId(v: unknown): v is KuzuId {
  return (
    typeof v === "object" &&
    v !== null &&
    "offset" in v &&
    "table" in v &&
    (typeof (v as KuzuId).offset === "number" || typeof (v as KuzuId).offset === "bigint")
  );
}

function makeNodeId(label: string, id: KuzuId): string {
  return `${label}:${String(id.table)}:${String(id.offset)}`;
}

function pickDisplayName(props: Record<string, unknown>): string {
  for (const key of ["name", "ip", "typeName", "pid", "port", "id"]) {
    if (key in props && props[key] != null) return String(props[key]);
  }
  return "?";
}

function serializeValue(v: unknown): unknown {
  if (typeof v === "bigint") return v.toString();
  return v;
}

function extractProperties(obj: Record<string, unknown>): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("_")) continue;
    props[k] = serializeValue(v);
  }
  return props;
}

function processValue(
  value: unknown,
  nodes: Map<string, GraphNode>,
  edges: Map<string, GraphEdge>,
): void {
  if (typeof value !== "object" || value === null) return;

  const obj = value as Record<string, unknown>;

  if ("_label" in obj && "_id" in obj && isKuzuId(obj._id)) {
    if ("_src" in obj && "_dst" in obj) {
      // Relationship
      const src = obj._src as KuzuId;
      const dst = obj._dst as KuzuId;
      // We need label info from src/dst — use _label for edge, but node labels unknown here
      // Edge id uses its own _id
      const eid = obj._id as KuzuId;
      const edgeId = `rel:${obj._label}:${String(eid.table)}:${String(eid.offset)}`;
      if (!edges.has(edgeId)) {
        edges.set(edgeId, {
          id: edgeId,
          source: `?:${String(src.table)}:${String(src.offset)}`,
          target: `?:${String(dst.table)}:${String(dst.offset)}`,
          label: String(obj._label),
        });
      }
    } else {
      // Node
      const nodeId = makeNodeId(String(obj._label), obj._id as KuzuId);
      if (!nodes.has(nodeId)) {
        const props = extractProperties(obj);
        nodes.set(nodeId, {
          id: nodeId,
          label: String(obj._label),
          displayName: pickDisplayName(props),
          properties: props,
        });
      }
    }
  }
}

export function extractGraphData(rows: Record<string, unknown>[]): GraphData {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();

  for (const row of rows) {
    for (const value of Object.values(row)) {
      processValue(value, nodes, edges);
    }
    if (nodes.size >= MAX_NODES) break;
  }

  // Resolve edge source/target: match by table:offset suffix
  // Build lookup: "table:offset" -> full node id
  const tableLookup = new Map<string, string>();
  for (const node of nodes.values()) {
    // node.id is "Label:table:offset"
    const parts = node.id.split(":");
    const key = `${parts[1]}:${parts[2]}`;
    tableLookup.set(key, node.id);
  }

  const resolvedEdges: GraphEdge[] = [];
  for (const edge of edges.values()) {
    const srcKey = edge.source.replace("?:", "");
    const dstKey = edge.target.replace("?:", "");
    const srcId = tableLookup.get(srcKey);
    const dstId = tableLookup.get(dstKey);
    if (srcId && dstId) {
      resolvedEdges.push({ ...edge, source: srcId, target: dstId });
    }
  }

  return {
    nodes: Array.from(nodes.values()),
    edges: resolvedEdges,
    truncated: nodes.size >= MAX_NODES,
  };
}

export function hasGraphData(data: GraphData): boolean {
  return data.nodes.length > 0;
}
