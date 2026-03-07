"use client";

interface SheetTabProps {
  id: string;
  title: string;
  active: boolean;
  canDelete: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function SheetTab({ title, active, canDelete, onClick, onDelete }: SheetTabProps) {
  return (
    <div
      role="tab"
      aria-selected={active}
      className={`group/tab relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-t-2 transition-colors whitespace-nowrap cursor-pointer
        ${
          active
            ? "border-emerald-500 text-emerald-700 bg-white"
            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        }`}
      onClick={onClick}
    >
      <span>{title}</span>
      {canDelete && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label={`Delete ${title}`}
          className={`ml-0.5 rounded p-0.5 transition-all ${
            active
              ? "opacity-0 group-hover/tab:opacity-100 text-emerald-400 hover:text-red-500 hover:bg-red-50"
              : "opacity-0 group-hover/tab:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <svg className="size-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 3L3 9M3 3l6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
