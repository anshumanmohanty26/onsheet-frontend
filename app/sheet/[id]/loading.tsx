/** Loading skeleton for the spreadsheet view (shown during route transition). */
export default function SheetLoading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center h-12 px-3 gap-3 border-b border-gray-200">
        <div className="w-6 h-6 bg-gray-200 rounded" />
        <div className="w-40 h-5 bg-gray-200 rounded" />
        <div className="flex-1" />
        <div className="w-16 h-7 bg-gray-200 rounded-full" />
        <div className="size-7 bg-gray-200 rounded-full" />
      </div>

      {/* Menu bar skeleton */}
      <div className="flex items-center gap-2 px-2 py-1 border-b border-gray-200">
        {Array.from({ length: 8 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton, order never changes
          <div key={i} className="w-10 h-4 bg-gray-100 rounded" />
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center gap-1 px-2 h-9 border-b border-gray-200">
        {Array.from({ length: 12 }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton, order never changes
          <div key={i} className="w-7 h-7 bg-gray-100 rounded" />
        ))}
      </div>

      {/* Formula bar skeleton */}
      <div className="flex h-8 items-center border-b border-gray-200">
        <div className="w-20 h-full bg-gray-50 border-r border-gray-200" />
        <div className="w-8 h-4 mx-2 bg-gray-100 rounded" />
        <div className="flex-1 h-4 bg-gray-100 rounded mr-2" />
      </div>

      {/* Grid skeleton */}
      <div className="flex-1 p-0">
        <div className="grid grid-cols-8 gap-px bg-gray-200 h-full">
          {Array.from({ length: 64 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton, order never changes
            <div key={i} className="bg-white" />
          ))}
        </div>
      </div>

      {/* Sheet tabs skeleton */}
      <div className="flex items-end border-t border-gray-200 bg-gray-50 h-8 px-2 gap-2">
        <div className="w-16 h-5 bg-gray-200 rounded" />
        <div className="w-16 h-5 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
