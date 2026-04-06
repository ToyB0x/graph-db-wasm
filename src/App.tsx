import { useState, useCallback, useEffect } from "react";
import { initializeDatabase, type DbState } from "./db/init";
import { queryAsObjects } from "./db";
import { extractGraphData, hasGraphData, type GraphData } from "./db/graphExtractor";
import type { PresetQuery } from "./components/PresetQueries";
import SeedProgress from "./components/SeedProgress";
import QueryEditor from "./components/QueryEditor";
import PresetQueries from "./components/PresetQueries";
import ResultsView from "./components/ResultsView";
import GraphView from "./components/GraphView";
import { getTotalCounts } from "./db/factories";

const { totalNodes } = getTotalCounts();

type ViewMode = "table" | "graph";

export default function App() {
  const [dbState, setDbState] = useState<DbState>({ status: "idle" });
  const [isRunning, setIsRunning] = useState(false);

  const [queryText, setQueryText] = useState(
    "MATCH (dc:DataCenter) RETURN dc.name, dc.location",
  );
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [queryTime, setQueryTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
    truncated: false,
  });

  useEffect(() => {
    initializeDatabase(setDbState);
  }, []);

  const handleRunQuery = useCallback(async (cypher: string) => {
    setIsRunning(true);
    setError(null);
    try {
      const t0 = performance.now();
      const result = await queryAsObjects(cypher);
      const elapsed = performance.now() - t0;
      setColumns(result.columns);
      setRows(result.rows);
      setQueryTime(`${elapsed.toFixed(1)} ms`);

      const gd = extractGraphData(result.rows);
      setGraphData(gd);
      setViewMode(hasGraphData(gd) ? "graph" : "table");
    } catch (e) {
      setColumns([]);
      setRows([]);
      setQueryTime(null);
      setGraphData({ nodes: [], edges: [], truncated: false });
      setViewMode("table");
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRunning(false);
    }
  }, []);

  const handlePreset = useCallback(
    (preset: PresetQuery) => {
      setQueryText(preset.query);
      handleRunQuery(preset.query);
    },
    [handleRunQuery],
  );

  const isReady = dbState.status === "ready";
  const hasGraph = hasGraphData(graphData);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">GraphDB WASM Preview</h1>
            <p className="text-xs text-gray-500">
              LadybugDB running in-browser via WebAssembly &middot;{" "}
              ~{totalNodes.toLocaleString()} nodes
            </p>
          </div>
          {isReady && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span>
                LadybugDB v{(dbState as { version: string }).version}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {dbState.status === "idle" && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
          </div>
        )}

        {dbState.status === "initializing" && (
          <SeedProgress progress={dbState.progress} />
        )}

        {dbState.status === "error" && (
          <div className="rounded-lg border border-red-800 bg-red-950 p-6 text-center">
            <p className="text-lg font-semibold text-red-400">
              Initialization Failed
            </p>
            <p className="mt-2 text-sm text-red-300">{dbState.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 cursor-pointer"
            >
              Reload
            </button>
          </div>
        )}

        {isReady && (
          <div className="flex flex-col gap-6">
            <PresetQueries onSelect={handlePreset} disabled={isRunning} />
            <QueryEditor
              value={queryText}
              onChange={setQueryText}
              onRun={handleRunQuery}
              disabled={!isReady}
              isRunning={isRunning}
            />

            {(columns.length > 0 || error) && (
              <div className="space-y-2">
                <div className="flex gap-1 border-b border-gray-700">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === "table"
                        ? "text-indigo-400 border-b-2 border-indigo-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("graph")}
                    disabled={!hasGraph}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      viewMode === "graph"
                        ? "text-emerald-400 border-b-2 border-emerald-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Graph
                  </button>
                </div>

                {viewMode === "table" ? (
                  <ResultsView
                    columns={columns}
                    rows={rows}
                    queryTime={queryTime}
                    error={error}
                  />
                ) : (
                  <GraphView graphData={graphData} queryTime={queryTime} />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
