"use client";

import { GRID } from "@/constants/defaults";
import { normalizeRange } from "@/lib/utils/range";
import type { SelectionRange } from "@/types/selection";

interface SelectionOverlayProps {
  selection: SelectionRange | null;
  columnWidths: Record<number, number>;
  rowHeights: Record<number, number>;
}

/** Blue overlay rectangle indicating the current multi-cell selection. */
export function SelectionOverlay({ selection, columnWidths, rowHeights }: SelectionOverlayProps) {
  if (!selection) return null;

  const range = normalizeRange(selection);

  // Calculate position
  let left = GRID.ROW_HEADER_WIDTH;
  for (let c = 0; c < range.start.col; c++) left += columnWidths[c] ?? GRID.DEFAULT_COL_WIDTH;
  let top = GRID.DEFAULT_ROW_HEIGHT; // header row
  for (let r = 0; r < range.start.row; r++) top += rowHeights[r] ?? GRID.DEFAULT_ROW_HEIGHT;

  let width = 0;
  for (let c = range.start.col; c <= range.end.col; c++) width += columnWidths[c] ?? GRID.DEFAULT_COL_WIDTH;
  let height = 0;
  for (let r = range.start.row; r <= range.end.row; r++) height += rowHeights[r] ?? GRID.DEFAULT_ROW_HEIGHT;

  return (
    <div
      className="absolute border-2 border-emerald-500 bg-emerald-500/5 pointer-events-none z-20"
      style={{ left, top, width, height }}
    />
  );
}
