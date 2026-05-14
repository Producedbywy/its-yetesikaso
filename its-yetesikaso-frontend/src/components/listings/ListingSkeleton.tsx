export default function ListingSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border overflow-hidden">
      <div className="h-40 bg-gray-200" />

      <div className="p-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-200 rounded w-1/2" />

        <div className="flex justify-between mt-3">
          <div className="h-3 bg-gray-200 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}