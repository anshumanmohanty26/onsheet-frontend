"use client";

import { colIndexToLabel } from "@/lib/utils/coordinates";
import { memo, useCallback, useRef } from "react";

interface ColumnHeaderProps {
  col: number;
  width: number;
  onResizeStart: (col: number, startX: number, currentWidth: number) => void;
  onColumnSelect: (col: number, shiftKey: boolean) => void;
}

/** Column header cell (A, B, C…) with a resize handle on the right edge. */
export const ColumnHeader = memo(function ColumnHeader({
  col,
  width,
  onResizeStart,
  onColumnSelect,
}: ColumnHeaderProps) {
  const handleRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onResizeStart(col, e.clientX, width);
    },
    [col, width, onResizeStart],
  );

  return (
    <th
      className="sticky top-0 z-10 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-600 select-none relative"
      style={{ width, minWidth: width }}
      onClick={(e) => onColumnSelect(col, e.shiftKey)}
    >
      {colIndexToLabel(col)}
      <div
        ref={handleRef}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-emerald-400 transition-colors"
        onPointerDown={handlePointerDown}
      />
    </th>
  );
});
