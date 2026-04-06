import type { SeedProgress as SeedProgressType } from "../db/seed";

type Props = {
  progress: SeedProgressType;
};

export default function SeedProgress({ progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20">
      <div className="flex flex-col items-center gap-2">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500" />
        <h2 className="text-lg font-semibold text-gray-200">{progress.phase}</h2>
        <p className="text-sm text-gray-400">{progress.detail}</p>
      </div>
      <div className="w-80">
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${Math.min(100, progress.percent)}%` }}
          />
        </div>
        <p className="mt-1 text-center text-xs text-gray-500">
          {Math.round(progress.percent)}%
        </p>
      </div>
    </div>
  );
}
