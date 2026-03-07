import type { CellStyle } from "@/types/cell";

/** Grid dimension defaults. */
export const GRID = {
  /** Default number of visible columns (A–Z). */
  COLS: 26,
  /** Initial number of rows (more loaded via infinite scroll). */
  ROWS: 1000,
  /** Width of the row-number header column (px). */
  ROW_HEADER_WIDTH: 50,
  /** Default column width (px). */
  DEFAULT_COL_WIDTH: 100,
  /** Minimum column width (px). */
  MIN_COL_WIDTH: 30,
  /** Maximum column width (px). */
  MAX_COL_WIDTH: 500,
  /** Default row height (px). */
  DEFAULT_ROW_HEIGHT: 25,
  /** Minimum row height (px). */
  MIN_ROW_HEIGHT: 18,
  /** Maximum row height (px). */
  MAX_ROW_HEIGHT: 400,
} as const;

/** Default cell style applied to every new cell. */
export const DEFAULT_CELL_STYLE: CellStyle = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  fontSize: 13,
  fontFamily: "Arial",
  color: "#000000",
  backgroundColor: "#ffffff",
  horizontalAlign: "left",
  verticalAlign: "middle",
  wrapText: false,
  numberFormat: "auto",
};

/** Debounce delay for persisting cell edits (ms). */
export const CELL_SAVE_DEBOUNCE = 800;

/** Maximum number of undo steps. */
export const MAX_UNDO_STEPS = 100;

/** Available font families in the font selector. */
export const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Trebuchet MS",
  "Comic Sans MS",
  "Impact",
] as const;

/** Available font sizes in the font size selector. */
export const FONT_SIZES = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 36, 48, 72] as const;
