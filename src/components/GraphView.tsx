import { useRef, useEffect, useState, useCallback } from "react";
import cytoscape from "cytoscape";
import type { GraphData, GraphNode } from "../db/graphExtractor";

const NODE_COLORS: Record<string, string> = {
  DataCenter: "#6366f1",
  Router: "#f59e0b",
  NetworkZone: "#10b981",
  Rack: "#8b5cf6",
  Switch: "#ec4899",
  Machine: "#3b82f6",
  MachineType: "#14b8a6",
  Software: "#f97316",
  Process: "#22c55e",
  Port: "#ef4444",
};

const LAYOUTS = ["cose", "breadthfirst", "circle", "grid"] as const;
type LayoutName = (typeof LAYOUTS)[number];

interface Props {
  graphData: GraphData;
  queryTime: string | null;
}

export default function GraphView({ graphData, queryTime }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [layout, setLayout] = useState<LayoutName>("cose");
  const [selected, setSelected] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: cytoscape.ElementDefinition[] = [
      ...graphData.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.displayName,
          nodeType: n.label,
        },
      })),
      ...graphData.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
        },
      })),
    ];

    const nodeTypeStyles = Object.entries(NODE_COLORS).map(
      ([type, color]) => ({
        selector: `node[nodeType="${type}"]`,
        style: { "background-color": color } as cytoscape.Css.Node,
      }),
    );

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            color: "#e5e7eb",
            "text-valign": "bottom",
            "text-margin-y": 5,
            "font-size": 11,
            width: 30,
            height: 30,
            "background-color": "#6b7280",
          } as cytoscape.Css.Node,
        },
        ...nodeTypeStyles,
        {
          selector: "edge",
          style: {
            label: "data(label)",
            "line-color": "#4b5563",
            "target-arrow-color": "#4b5563",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "font-size": 9,
            color: "#9ca3af",
            "text-rotation": "autorotate",
            width: 2,
          } as cytoscape.Css.Edge,
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 3,
            "border-color": "#fbbf24",
          } as cytoscape.Css.Node,
        },
      ],
      layout: { name: layout, animate: false },
      minZoom: 0.2,
      maxZoom: 5,
    });

    cy.on("tap", "node", (evt) => {
      const nodeId = evt.target.id();
      const node = graphData.nodes.find((n) => n.id === nodeId);
      if (node) setSelected(node);
    });

    cy.on("tap", (evt) => {
      if (evt.target === cy) setSelected(null);
    });

    cyRef.current = cy;
    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [graphData, layout]);

  const handleLayout = useCallback((name: LayoutName) => {
    setLayout(name);
  }, []);

  const usedTypes = [...new Set(graphData.nodes.map((n) => n.label))];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>
            {graphData.nodes.length} node(s), {graphData.edges.length} edge(s)
          </span>
          {queryTime && <span>in {queryTime}</span>}
          {graphData.truncated && (
            <span className="text-yellow-500">
              (truncated — add LIMIT to query)
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 mr-1">Layout:</span>
          {LAYOUTS.map((l) => (
            <button
              key={l}
              onClick={() => handleLayout(l)}
              className={`rounded px-2 py-0.5 text-xs transition-colors cursor-pointer ${
                layout === l
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <div
            ref={containerRef}
            className="h-[500px] rounded-lg border border-gray-700 bg-gray-900"
          />
        </div>

        {selected && (
          <div className="w-64 rounded-lg border border-gray-700 bg-gray-900 p-3 overflow-auto max-h-[500px]">
            <div className="flex items-center justify-between mb-2">
              <span
                className="inline-block rounded px-1.5 py-0.5 text-xs font-medium text-white"
                style={{
                  backgroundColor:
                    NODE_COLORS[selected.label] || "#6b7280",
                }}
              >
                {selected.label}
              </span>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-300 text-xs cursor-pointer"
              >
                close
              </button>
            </div>
            <p className="text-sm font-medium text-gray-200 mb-2">
              {selected.displayName}
            </p>
            <dl className="space-y-1">
              {Object.entries(selected.properties).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-gray-500">{k}</dt>
                  <dd className="text-xs text-gray-300 font-mono break-all">
                    {typeof v === "bigint"
                      ? v.toString()
                      : typeof v === "object"
                        ? JSON.stringify(v, (_k, val) =>
                            typeof val === "bigint" ? val.toString() : val,
                          )
                        : String(v ?? "NULL")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {usedTypes.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {usedTypes.map((t) => (
            <span key={t} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: NODE_COLORS[t] || "#6b7280" }}
              />
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
