import { cellRef, parseCellRef } from "@/lib/utils/coordinates";
import type { ApiCell } from "@/services/cellService";
import type { SheetMeta, SpreadsheetState } from "@/types";
import type { CellData, CellStyle } from "@/types/cell";

export type SpreadsheetAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "INIT_SHEET"; workbookId: string; workbookName: string; sheets: SheetMeta[]; activeSheetId: string }
  | { type: "SET_ACTIVE_SHEET"; sheetId: string }
  | { type: "LOAD_CELLS"; cells: ApiCell[] }
  | { type: "SET_CELL"; ref: string; data: CellData }
  | { type: "SET_WORKBOOK_NAME"; name: string }
  | { type: "SET_COLUMN_WIDTH"; col: number; width: number }
  | { type: "SET_ROW_HEIGHT"; row: number; height: number }
  | { type: "ADD_SHEET"; sheet: SheetMeta }
  | { type: "REMOVE_SHEET"; sheetId: string }
  | { type: "RENAME_SHEET"; sheetId: string; name: string }
  /** Insert a blank row at `row`, shifting all rows at or below it down by one. */
  | { type: "INSERT_ROW"; row: number }
  /** Insert a blank column at `col`, shifting all columns at or to its right by one. */
  | { type: "INSERT_COL"; col: number }
  /** Delete the row at `row`, shifting all rows below it up by one. */
  | { type: "DELETE_ROW"; row: number }
  /** Delete the column at `col`, shifting all columns to its right left by one. */
  | { type: "DELETE_COL"; col: number }
  /** Sort all rows by the value in `col`, ascending or descending. */
  | { type: "SORT_COLUMN"; col: number; ascending: boolean }
  /** Remove rows with duplicate values in `col`, keeping first occurrence. */
  | { type: "REMOVE_DUPLICATES"; col: number }
  /** Bulk-replace all cells — used when importing a file. */
  | { type: "IMPORT_CELLS"; cells: Record<string, CellData> };

export const DEFAULT_COL_WIDTH = 100;
export const DEFAULT_ROW_HEIGHT = 25;

export const initialSpreadsheetState: SpreadsheetState = {
  workbookId: null,
  workbookTitle: "Untitled spreadsheet",
  activeSheetId: null,
  sheets: [],
  cells: {},
  columnWidths: {},
  rowHeights: {},
  loading: true,
  error: null,
};

export function spreadsheetReducer(
  state: SpreadsheetState,
  action: SpreadsheetAction,
): SpreadsheetState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "INIT_SHEET":
      return {
        ...state,
        workbookId: action.workbookId,
        workbookTitle: action.workbookName,
        sheets: action.sheets,
        activeSheetId: action.activeSheetId,
        cells: {},
        loading: true, // keep spinner on until LOAD_CELLS fires
        error: null,
      };
    case "SET_ACTIVE_SHEET":
      return { ...state, activeSheetId: action.sheetId, cells: {} };
    case "LOAD_CELLS": {
      const cells: SpreadsheetState["cells"] = {};
      for (const c of action.cells) {
        const key = cellRef(c.row, c.col);
        cells[key] = {
          raw: c.rawValue ?? "",
          computed: c.computed ?? c.rawValue ?? "",
          style: c.style,
        };
      }
      return { ...state, cells };
    }
    case "SET_CELL":
      return {
        ...state,
        cells: { ...state.cells, [action.ref]: action.data },
      };
    case "IMPORT_CELLS":
      return { ...state, cells: action.cells };
    case "SET_WORKBOOK_NAME":
      return { ...state, workbookTitle: action.name };
    case "SET_COLUMN_WIDTH":
      return {
        ...state,
        columnWidths: { ...state.columnWidths, [action.col]: action.width },
      };
    case "SET_ROW_HEIGHT":
      return {
        ...state,
        rowHeights: { ...state.rowHeights, [action.row]: action.height },
      };
    case "ADD_SHEET":
      return { ...state, sheets: [...state.sheets, action.sheet] };
    case "REMOVE_SHEET":
      return { ...state, sheets: state.sheets.filter((s) => s.id !== action.sheetId) };
    case "RENAME_SHEET":
      return {
        ...state,
        sheets: state.sheets.map((s) =>
          s.id === action.sheetId ? { ...s, name: action.name } : s,
        ),
      };
    case "INSERT_ROW": {
      const { row } = action;
      const newCells: SpreadsheetState["cells"] = {};
      for (const [ref, data] of Object.entries(state.cells)) {
        const parsed = parseCellRef(ref);
        if (!parsed) { newCells[ref] = data; continue; }
        const newRow = parsed.row >= row ? parsed.row + 1 : parsed.row;
        newCells[cellRef(newRow, parsed.col)] = data;
      }
      const newRowHeights: Record<number, number> = {};
      for (const [r, h] of Object.entries(state.rowHeights)) {
        const ri = Number(r);
        newRowHeights[ri >= row ? ri + 1 : ri] = h;
      }
      return { ...state, cells: newCells, rowHeights: newRowHeights };
    }
    case "INSERT_COL": {
      const { col } = action;
      const newCells: SpreadsheetState["cells"] = {};
      for (const [ref, data] of Object.entries(state.cells)) {
        const parsed = parseCellRef(ref);
        if (!parsed) { newCells[ref] = data; continue; }
        const newCol = parsed.col >= col ? parsed.col + 1 : parsed.col;
        newCells[cellRef(parsed.row, newCol)] = data;
      }
      const newColWidths: Record<number, number> = {};
      for (const [c, w] of Object.entries(state.columnWidths)) {
        const ci = Number(c);
        newColWidths[ci >= col ? ci + 1 : ci] = w;
      }
      return { ...state, cells: newCells, columnWidths: newColWidths };
    }
    case "DELETE_ROW": {
      const { row } = action;
      const newCells: SpreadsheetState["cells"] = {};
      for (const [ref, data] of Object.entries(state.cells)) {
        const parsed = parseCellRef(ref);
        if (!parsed) { newCells[ref] = data; continue; }
        if (parsed.row === row) continue;
        const nr = parsed.row > row ? parsed.row - 1 : parsed.row;
        newCells[cellRef(nr, parsed.col)] = data;
      }
      const newRowHeights: Record<number, number> = {};
      for (const [r, h] of Object.entries(state.rowHeights)) {
        const ri = Number(r);
        if (ri === row) continue;
        newRowHeights[ri > row ? ri - 1 : ri] = h;
      }
      return { ...state, cells: newCells, rowHeights: newRowHeights };
    }
    case "DELETE_COL": {
      const { col } = action;
      const newCells: SpreadsheetState["cells"] = {};
      for (const [ref, data] of Object.entries(state.cells)) {
        const parsed = parseCellRef(ref);
        if (!parsed) { newCells[ref] = data; continue; }
        if (parsed.col === col) continue;
        const nc = parsed.col > col ? parsed.col - 1 : parsed.col;
        newCells[cellRef(parsed.row, nc)] = data;
      }
      const newColWidths: Record<number, number> = {};
      for (const [c, w] of Object.entries(state.columnWidths)) {
        const ci = Number(c);
        if (ci === col) continue;
        newColWidths[ci > col ? ci - 1 : ci] = w;
      }
      return { ...state, cells: newCells, columnWidths: newColWidths };
    }
    case "SORT_COLUMN": {
      const { col, ascending } = action;
      // Group all cells by row
      const rowMap = new Map<number, Record<number, typeof state.cells[string]>>();
      for (const [ref, data] of Object.entries(state.cells)) {
        const parsed = parseCellRef(ref);
        if (!parsed) continue;
        if (!rowMap.has(parsed.row)) rowMap.set(parsed.row, {});
        rowMap.get(parsed.row)![parsed.col] = data;
      }
      if (rowMap.size === 0) return state;
      // Build a sorted array of [originalRow, rowCells]
      const rows = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
      rows.sort(([, aCells], [, bCells]) => {
        const va = String(aCells[col]?.computed ?? aCells[col]?.raw ?? "");
        const vb = String(bCells[col]?.computed ?? bCells[col]?.raw ?? "");
        const na = parseFloat(va), nb = parseFloat(vb);
        if (!isNaN(na) && !isNaN(nb)) return ascending ? na - nb : nb - na;
        return ascending ? va.localeCompare(vb) : vb.localeCompare(va);
      });
      const newCells: SpreadsheetState["cells"] = {};
      const newRowHeights: Record<number, number> = {};
      rows.forEach(([origRow, rowCells], ri) => {
        for (const [c, data] of Object.entries(rowCells)) {
          newCells[cellRef(ri, Number(c))] = data;
        }
        const h = state.rowHeights[origRow];
        if (h !== undefined) newRowHeights[ri] = h;
      });
      return { ...state, cells: newCells, rowHeights: newRowHeights };
    }
    case "REMOVE_DUPLICATES": {
      const { col } = action;
      const rowMap = new Map<number, Record<number, typeof state.cells[string]>>();
      for (const [ref, data] of Object.entries(state.cells)) {
        const parsed = parseCellRef(ref);
        if (!parsed) continue;
        if (!rowMap.has(parsed.row)) rowMap.set(parsed.row, {});
        rowMap.get(parsed.row)![parsed.col] = data;
      }
      if (rowMap.size === 0) return state;
      const sortedRows = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
      const seen = new Set<string>();
      const newCells: SpreadsheetState["cells"] = {};
      const newRowHeights: Record<number, number> = {};
      let ri = 0;
      for (const [origRow, rowCells] of sortedRows) {
        const val = String(rowCells[col]?.computed ?? rowCells[col]?.raw ?? "");
        if (seen.has(val)) continue;
        seen.add(val);
        for (const [c, data] of Object.entries(rowCells)) {
          newCells[cellRef(ri, Number(c))] = data;
        }
        const h = state.rowHeights[origRow];
        if (h !== undefined) newRowHeights[ri] = h;
        ri++;
      }
      return { ...state, cells: newCells, rowHeights: newRowHeights };
    }
    default:
      return state;
  }
}

/** Return display value of a cell (computed > raw, empty string if missing) */
export function getCellDisplay(
  cells: SpreadsheetState["cells"],
  ref: string,
): string {
  const cell = cells[ref];
  if (!cell) return "";
  return cell.computed ?? cell.raw;
}

export function getCellStyle(
  cells: SpreadsheetState["cells"],
  ref: string,
): CellStyle | undefined {
  return cells[ref]?.style;
}
