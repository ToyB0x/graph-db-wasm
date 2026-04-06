import { useState, useCallback, useRef, useEffect } from "react";

type Props = {
  onExecute: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
};

export default function QueryEditor({ onExecute, isLoading, initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed) onExecute(trimmed);
  }, [query, onExecute]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">
        Cypher Query
      </label>
      <textarea
        ref={textareaRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="MATCH (n) RETURN n LIMIT 10"
        rows={6}
        spellCheck={false}
        className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 font-mono text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Ctrl+Enter to run</span>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !query.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Running..." : "Run Query"}
        </button>
      </div>
    </div>
  );
}
