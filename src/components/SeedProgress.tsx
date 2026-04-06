import type { SeedProgress as SeedProgressType } from "../db/seed";

interface Props {
  progress: SeedProgressType;
}

export default function SeedProgress({ progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />
      <div className="w-full max-w-md space-y-2">
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
      </div>
    </div>
  );
}
