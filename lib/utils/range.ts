import type { CellCoord, SelectionRange } from "@/types/selection";

export function normalizeRange(range: SelectionRange): SelectionRange {
  return {
    start: {
      row: Math.min(range.start.row, range.end.row),
      col: Math.min(range.start.col, range.end.col),
    },
    end: {
      row: Math.max(range.start.row, range.end.row),
      col: Math.max(range.start.col, range.end.col),
    },
  };
}

export function cellInRange(cell: CellCoord, range: SelectionRange): boolean {
  const r = normalizeRange(range);
  return (
    cell.row >= r.start.row &&
    cell.row <= r.end.row &&
    cell.col >= r.start.col &&
    cell.col <= r.end.col
  );
}
