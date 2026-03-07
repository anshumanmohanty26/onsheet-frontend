export type FormulaTokenType =
  | "NUMBER"
  | "STRING"
  | "BOOLEAN"
  | "CELL_REF"
  | "RANGE_REF"
  | "FUNCTION"
  | "OPERATOR"
  | "PAREN"
  | "COMMA"
  | "ERROR";

export interface FormulaToken {
  type: FormulaTokenType;
  value: string;
}
