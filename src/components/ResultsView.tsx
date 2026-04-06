interface Props {
  columns: string[];
  rows: Record<string, unknown>[];
  queryTime: string | null;
  error: string | null;
}

export default function ResultsView({ columns, rows, queryTime, error }: Props) {
  if (error) {
    return (
      <div className="rounded-lg bg-red-900/30 border border-red-700 p-4 text-sm text-red-300 font-mono whitespace-pre-wrap">
        {error}
      </div>
    );
  }

  if (columns.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Run a query to see results here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{rows.length.toLocaleString()} row(s)</span>
        {queryTime && <span>in {queryTime}</span>}
      </div>

      <div className="overflow-auto max-h-[60vh] rounded-lg border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium text-gray-300 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-800/50">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-1.5 text-gray-300 whitespace-nowrap font-mono"
                  >
                    {formatCell(row[col])}
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

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object") {
    return JSON.stringify(value, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
  }
  return String(value);
}
