import type { CellMap } from "./cell";

export interface SheetMeta {
  id: string;
  workbookId: string;
  name: string;
  index: number;
}

export interface SpreadsheetState {
  workbookId: string | null;
  workbookTitle: string;
  activeSheetId: string | null;
  sheets: SheetMeta[];
  cells: CellMap;
  columnWidths: Record<number, number>; // colIndex → px
  rowHeights: Record<number, number>; // rowIndex → px
  loading: boolean;
  error: string | null;
}
