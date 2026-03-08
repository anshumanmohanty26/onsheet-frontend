"use client";

import { Tooltip } from "@/components/ui/Tooltip";
import type { CellStyle } from "@/types/cell";

interface FormatBarProps {
  style: CellStyle;
  onStyleChange: (change: Partial<CellStyle>) => void;
}

/** Text formatting bar — bold, italic, underline, strikethrough toggles. */
export function FormatBar({ style, onStyleChange }: FormatBarProps) {
  const buttons: {
    key: keyof CellStyle;
    label: string;
    shortcut: string;
    render: React.ReactNode;
  }[] = [
    {
      key: "bold",
      label: "Bold",
      shortcut: "Ctrl+B",
      render: <span className="font-bold text-xs">B</span>,
    },
    {
      key: "italic",
      label: "Italic",
      shortcut: "Ctrl+I",
      render: <span className="italic text-xs">I</span>,
    },
    {
      key: "underline",
      label: "Underline",
      shortcut: "Ctrl+U",
      render: <span className="underline text-xs">U</span>,
    },
    {
      key: "strikethrough",
      label: "Strikethrough",
      shortcut: "Alt+Shift+5",
      render: <span className="line-through text-xs">S</span>,
    },
  ];

  return (
    <div className="flex items-center">
      {buttons.map((b) => (
        <Tooltip key={b.key} content={`${b.label} (${b.shortcut})`}>
          <button
            type="button"
            onClick={() => onStyleChange({ [b.key]: !style[b.key] })}
            className={`h-7 px-1.5 rounded text-sm transition-colors ${
              style[b.key] ? "bg-gray-200 text-gray-900" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {b.render}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
