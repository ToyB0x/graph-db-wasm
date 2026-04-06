interface Props {
  value: string;
  onChange: (value: string) => void;
  onRun: (cypher: string) => void;
  disabled: boolean;
  isRunning: boolean;
}

export default function QueryEditor({
  value,
  onChange,
  onRun,
  disabled,
  isRunning,
}: Props) {
  const handleRun = () => {
    const trimmed = value.trim();
    if (trimmed) onRun(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-400">
        Cypher Query{" "}
        <span className="text-gray-600 font-normal">(Ctrl+Enter to run)</span>
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={4}
        spellCheck={false}
        className="w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 font-mono text-sm text-gray-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-y"
        placeholder="Enter a Cypher query…"
      />
      <button
        onClick={handleRun}
        disabled={disabled || isRunning}
        className="rounded bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {isRunning ? "Running…" : "Run Query"}
      </button>
    </div>
  );
}
