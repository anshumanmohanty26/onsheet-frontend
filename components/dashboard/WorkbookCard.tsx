"use client";

import { useRouter } from "next/navigation";
import type { Workbook } from "@/services/workbookService";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface WorkbookCardProps {
  workbook: Workbook;
  onDelete: (id: string) => void;
}

export function WorkbookCard({ workbook, onDelete }: WorkbookCardProps) {
  const router = useRouter();

  function handleOpen() {
    router.push(`/sheet/${workbook.id}`);
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer">
      {/* Thumbnail area */}
      <button
        onClick={handleOpen}
        className="h-36 rounded-t-xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center focus:outline-none"
        aria-label={`Open ${workbook.name}`}
      >
        {/* Grid icon */}
        <svg
          className="size-12 text-emerald-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <p
            className="text-sm font-medium text-gray-800 truncate"
            title={workbook.name}
          >
            {workbook.name}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(workbook.updatedAt)}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(workbook.id);
          }}
          className="ml-2 p-1.5 rounded-md text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
          aria-label="Delete workbook"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
