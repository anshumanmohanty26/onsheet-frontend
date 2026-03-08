"use client";

import { useEffect, useRef } from "react";

interface CellEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string, move?: { dr: number; dc: number }) => void;
  onCancel: () => void;
}

/** Inline cell editor input that appears when double-clicking a cell. */
export function CellEditor({ value, onChange, onCommit, onCancel }: CellEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only focus — value.length intentionally excluded to avoid re-focusing on every keystroke
  useEffect(() => {
    inputRef.current?.focus();
    // Place cursor at end
    const len = value.length;
    inputRef.current?.setSelectionRange(len, len);
  }, []);

  return (
    <input
      ref={inputRef}
      data-cell-editor="true"
      className="absolute inset-0 w-full h-full px-1 text-sm outline-none bg-white z-20 border-2 border-emerald-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onCommit(value, { dr: 1, dc: 0 });
        } else if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();
          onCommit(value, { dr: -1, dc: 0 });
        } else if (e.key === "Tab") {
          e.preventDefault();
          onCommit(value, { dr: 0, dc: e.shiftKey ? -1 : 1 });
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          onCommit(value, { dr: -1, dc: 0 });
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          onCommit(value, { dr: 1, dc: 0 });
        }
      }}
      onBlur={() => onCommit(value)}
      spellCheck={false}
      autoComplete="off"
    />
  );
}
