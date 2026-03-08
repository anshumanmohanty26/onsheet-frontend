"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import type { HorizontalAlign } from "@/types/cell";

interface AlignmentButtonsProps {
  value?: HorizontalAlign;
  onChange: (align: HorizontalAlign) => void;
}

const alignments: { value: HorizontalAlign; icon: React.ReactNode; label: string }[] = [
  {
    value: "left",
    label: "Align left",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="15" y2="12" />
        <line x1="3" y1="18" x2="18" y2="18" />
      </svg>
    ),
  },
  {
    value: "center",
    label: "Align center",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="6" y1="12" x2="18" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
      </svg>
    ),
  },
  {
    value: "right",
    label: "Align right",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="9" y1="12" x2="21" y2="12" />
        <line x1="6" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
];

/** Text alignment button group (left, center, right). */
export function AlignmentButtons({ value = "left", onChange }: AlignmentButtonsProps) {
  return (
    <div className="flex items-center">
      {alignments.map((a) => (
        <Tooltip key={a.value} content={a.label}>
          <button
            type="button"
            onClick={() => onChange(a.value)}
            className={`h-7 px-1.5 rounded text-sm transition-colors ${
              value === a.value ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {a.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
