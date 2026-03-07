import type { CellData, CellMap } from "@/types/cell";
import type { SelectionRange } from "@/types/selection";
import { cellRef } from "@/lib/utils/coordinates";
import { normalizeRange } from "@/lib/utils/range";

export interface ClipboardData {
  /** 2D array of cells [row][col], null means empty. */
  cells: (CellData | null)[][];
  /** Original top-left coordinate. */
  origin: { row: number; col: number };
  /** Whether this was a cut (should clear source after paste). */
  isCut: boolean;
}

/** Serialize selected cells into a ClipboardData payload. */
export function serializeCells(
  cellMap: CellMap,
  range: SelectionRange,
  isCut: boolean,
): ClipboardData {
  const r = normalizeRange(range);
  const rows = r.end.row - r.start.row + 1;
  const cols = r.end.col - r.start.col + 1;
  const cells: (CellData | null)[][] = [];

  for (let ri = 0; ri < rows; ri++) {
    const row: (CellData | null)[] = [];
    for (let ci = 0; ci < cols; ci++) {
      const ref = cellRef(r.start.row + ri, r.start.col + ci);
      row.push(cellMap[ref] ?? null);
    }
    cells.push(row);
  }

  return { cells, origin: { row: r.start.row, col: r.start.col }, isCut };
}

/** Convert ClipboardData to plain-text TSV for the system clipboard. */
export function toTSV(data: ClipboardData): string {
  return data.cells
    .map((row) =>
      row.map((c) => (c ? c.computed ?? c.raw : "")).join("\t"),
    )
    .join("\n");
}

/** Parse TSV text (from system clipboard) into a 2D string array. */
export function parseTSV(text: string): string[][] {
  return text.split("\n").map((line) => line.split("\t"));
}
