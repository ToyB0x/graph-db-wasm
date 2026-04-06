import { SAMPLE_QUERIES, type SampleQuery } from "../db/queries";

type Props = {
  onSelect: (query: SampleQuery) => void;
};

export default function SampleQueries({ onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-gray-300">Sample Queries</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_QUERIES.map((sq) => (
          <button
            key={sq.name}
            onClick={() => onSelect(sq)}
            className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-left transition-colors hover:border-blue-600 hover:bg-gray-800"
          >
            <p className="text-sm font-medium text-gray-200">{sq.name}</p>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {sq.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
