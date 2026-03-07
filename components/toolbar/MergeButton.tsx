"use client";

import { Tooltip } from "@/components/ui/Tooltip";

interface MergeButtonProps {
  merged?: boolean;
  onToggle: () => void;
}

/** Cell merge toggle button. */
export function MergeButton({ merged = false, onToggle }: MergeButtonProps) {
  return (
    <Tooltip content="Merge cells">
      <button
        onClick={onToggle}
        className={`h-7 px-1.5 rounded text-sm transition-colors ${
          merged ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <polyline points="8 10 12 6 16 10" />
          <polyline points="8 14 12 18 16 14" />
        </svg>
      </button>
    </Tooltip>
  );
}
