"use client";

import { memo, useCallback, useRef } from "react";
import { GRID } from "@/constants/defaults";

interface RowHeaderProps {
  row: number;
  height: number;
  onResizeStart: (row: number, startY: number, currentHeight: number) => void;
  onRowSelect: (row: number) => void;
}

/** Row header cell (1, 2, 3…) with a resize handle on the bottom edge. */
export const RowHeader = memo(function RowHeader({
  row,
  height,
  onResizeStart,
  onRowSelect,
}: RowHeaderProps) {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onResizeStart(row, e.clientY, height);
    },
    [row, height, onResizeStart],
  );

  return (
    <td
      className="sticky left-0 z-10 bg-gray-100 border border-gray-300 text-xs text-center text-gray-500 font-medium relative select-none"
      style={{ width: GRID.ROW_HEADER_WIDTH, height }}
      onClick={() => onRowSelect(row)}
    >
      {row + 1}
      <div
        className="absolute bottom-0 left-0 w-full h-1 cursor-row-resize hover:bg-emerald-400 transition-colors"
        onPointerDown={handlePointerDown}
      />
    </td>
  );
});
