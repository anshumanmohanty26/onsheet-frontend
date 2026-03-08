import type { CellData } from "@/types/cell";
import type { UpsertCellDto } from "@/services/cellService";

interface PendingImport {
  workbookId: string;
  sheetId: string;
  cellsForStore: Record<string, CellData>;
  cellsForApi: UpsertCellDto[];
}

let pending: PendingImport | null = null;

export function setPendingImport(data: PendingImport) {
  pending = data;
}

/**
 * Consume pending import data for a given workbook.
 * Returns the data once and clears it — subsequent calls return null.
 */
export function consumePendingImport(workbookId: string): PendingImport | null {
  if (pending && pending.workbookId === workbookId) {
    const data = pending;
    pending = null;
    return data;
  }
  return null;
}
