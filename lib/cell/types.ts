/** Resolved value types after parsing raw cell input. */
export type CellValueType = "string" | "number" | "boolean" | "error" | "empty";

export interface ParsedCellValue {
  type: CellValueType;
  /** The coerced value: number for numbers, boolean for booleans, string otherwise. */
  value: string | number | boolean;
}

/** Error sentinel strings (Google Sheets convention). */
export const CELL_ERRORS = {
  REF: "#REF!",
  VALUE: "#VALUE!",
  DIV0: "#DIV/0!",
  NAME: "#NAME?",
  NULL: "#NULL!",
  NA: "#N/A",
  NUM: "#NUM!",
} as const;
