type Props = {
  columns: string[];
  rows: Record<string, unknown>[];
  executionTime?: number;
  compilingTime?: number;
  error?: string;
};

export default function ResultsTable({
  columns,
  rows,
  executionTime,
  compilingTime,
  error,
}: Props) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950 p-4">
        <p className="text-sm font-medium text-red-400">Query Error</p>
        <p className="mt-1 text-sm text-red-300">{error}</p>
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-6 text-center text-gray-500 text-sm">
        Run a query to see results
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{rows.length} row{rows.length !== 1 ? "s" : ""}</span>
        {executionTime !== undefined && (
          <span>Execution: {executionTime.toFixed(2)}ms</span>
        )}
        {compilingTime !== undefined && (
          <span>Compile: {compilingTime.toFixed(2)}ms</span>
        )}
      </div>
      <div className="overflow-auto rounded-lg border border-gray-700 max-h-[60vh]">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300 sticky top-0">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-500 w-10">#</th>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 font-medium whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-3 py-2 text-gray-600 font-mono text-xs">
                  {i + 1}
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-3 py-2 text-gray-200 whitespace-nowrap max-w-xs truncate font-mono text-xs">
                    {formatValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
