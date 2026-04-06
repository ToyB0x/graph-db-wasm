import type { SeedProgress as SeedProgressType } from "../db/seed";

interface Props {
  progress: SeedProgressType | null;
  isSeeding: boolean;
  onSeed: () => void;
  isReady: boolean;
}

export default function SeedProgress({
  progress,
  isSeeding,
  onSeed,
  isReady,
}: Props) {
  if (isReady) {
    return (
      <div className="rounded-lg bg-green-900/40 border border-green-700 px-4 py-3 text-sm text-green-300">
        Database seeded and ready for queries.
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-900 border border-gray-700 p-4 space-y-3">
      {!isSeeding && !progress && (
        <button
          onClick={onSeed}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors cursor-pointer"
        >
          Initialize &amp; Seed Database (~100 MB)
        </button>
      )}

      {isSeeding && progress && (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">
              {progress.phase}: {progress.detail}
            </span>
            <span className="text-indigo-400 font-mono">{progress.pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
