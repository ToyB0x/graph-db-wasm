import { useState, useCallback } from "react";
import SeedProgress from "./components/SeedProgress";
import QueryEditor from "./components/QueryEditor";
import PresetQueries from "./components/PresetQueries";
import ResultsView from "./components/ResultsView";
import { initDatabase, queryAsObjects } from "./db";
import { seedDatabase, type SeedProgress as SeedProgressType } from "./db/seed";
import { ESTIMATED_SIZE_MB, TOTAL_MACHINES } from "./db/config";

export default function App() {
  const [seedProgress, setSeedProgress] = useState<SeedProgressType | null>(
    null,
  );
  const [isSeeding, setIsSeeding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [queryText, setQueryText] = useState(
    "MATCH (dc:DataCenter) RETURN dc.name, dc.location",
  );
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [queryTime, setQueryTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = useCallback(async () => {
    setIsSeeding(true);
    setError(null);
    try {
      await initDatabase();
      await seedDatabase((p) => setSeedProgress({ ...p }));
      setIsReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsSeeding(false);
    }
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
    } catch (e) {
      setColumns([]);
      setRows([]);
      setQueryTime(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRunning(false);
    }
  }, []);

  const handlePreset = useCallback(
    (q: string) => {
      setQueryText(q);
      handleRunQuery(q);
    },
    [handleRunQuery],
  );

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-100">
          GraphDB WASM Preview
        </h1>
        <p className="text-sm text-gray-500">
          LadybugDB running in-browser via WebAssembly &middot;{" "}
          {TOTAL_MACHINES.toLocaleString()} machines &middot; ~
          {ESTIMATED_SIZE_MB} MB
        </p>
      </header>

      <SeedProgress
        progress={seedProgress}
        isSeeding={isSeeding}
        onSeed={handleSeed}
        isReady={isReady}
      />

      {isReady && (
        <div className="space-y-4">
          <PresetQueries onSelect={handlePreset} disabled={isRunning} />
          <QueryEditor
            value={queryText}
            onChange={setQueryText}
            onRun={handleRunQuery}
            disabled={!isReady}
            isRunning={isRunning}
          />
        </div>
      )}

      <ResultsView
        columns={columns}
        rows={rows}
        queryTime={queryTime}
        error={error}
      />
    </div>
  );
}
