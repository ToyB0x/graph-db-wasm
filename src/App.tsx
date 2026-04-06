import { useState, useCallback, useRef, useEffect } from "react";
import { initializeDatabase, type DbState } from "./db/init";
import type { Connection } from "@ladybugdb/wasm-core";
import type { SampleQuery } from "./db/queries";
import QueryEditor from "./components/QueryEditor";
import ResultsTable from "./components/ResultsTable";
import SeedProgress from "./components/SeedProgress";
import SampleQueries from "./components/SampleQueries";
import { getTotalCounts } from "./db/factories";

type QueryResultState = {
  columns: string[];
  rows: Record<string, unknown>[];
  executionTime?: number;
  compilingTime?: number;
  error?: string;
};

export default function App() {
  const [dbState, setDbState] = useState<DbState>({ status: "idle" });
  const [result, setResult] = useState<QueryResultState>({ columns: [], rows: [] });
  const [isQuerying, setIsQuerying] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState("");
  const connRef = useRef<Connection | null>(null);

  useEffect(() => {
    initializeDatabase(setDbState).then(({ conn }) => {
      connRef.current = conn;
    });
  }, []);

  const executeQuery = useCallback(async (queryStr: string) => {
    const conn = connRef.current;
    if (!conn) return;

    setIsQuerying(true);
    setResult({ columns: [], rows: [] });

    try {
      const qr = await conn.query(queryStr);
      if (!qr.isSuccess()) {
        const err = await qr.getErrorMessage();
        setResult({ columns: [], rows: [], error: err });
        return;
      }

      const summary = await qr.getQuerySummary();
      const columns = await qr.getColumnNames();
      const rows = await qr.getAllObjects();

      setResult({
        columns,
        rows,
        executionTime: summary.executionTime,
        compilingTime: summary.compilingTime,
      });
    } catch (e) {
      setResult({
        columns: [],
        rows: [],
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setIsQuerying(false);
    }
  }, []);

  const handleSelectSample = useCallback((sq: SampleQuery) => {
    setSelectedQuery(sq.query);
  }, []);

  const counts = getTotalCounts();

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">GraphDB WASM Preview</h1>
            <p className="text-xs text-gray-500">
              Real-time Cypher query execution in the browser via WebAssembly
            </p>
          </div>
          {dbState.status === "ready" && (
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                LadybugDB v{dbState.version}
              </span>
              <span>{counts.totalNodes.toLocaleString()} nodes</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {dbState.status === "idle" && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
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
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              Reload
            </button>
          </div>
        )}

        {dbState.status === "ready" && (
          <div className="flex flex-col gap-6">
            <SampleQueries onSelect={handleSelectSample} />
            <QueryEditor
              onExecute={executeQuery}
              isLoading={isQuerying}
              initialQuery={selectedQuery}
            />
            <ResultsTable {...result} />
          </div>
        )}
      </main>
    </div>
  );
}
