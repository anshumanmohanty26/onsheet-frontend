import type { CellMap } from "@/types/cell";

/** AST node types produced by the parser. */
export type ASTNode =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "boolean"; value: boolean }
  | { type: "cell_ref"; ref: string }
  | { type: "range_ref"; start: string; end: string }
  | { type: "function_call"; name: string; args: ASTNode[] }
  | { type: "binary_op"; op: string; left: ASTNode; right: ASTNode }
  | { type: "unary_op"; op: string; operand: ASTNode }
  | { type: "error"; value: string };

/** Formula function signature: (args resolved values, context) => result. */
export type FormulaFn = (args: FormulaValue[], ctx: EvalContext) => FormulaValue;

/** Values that flow through the formula evaluator. */
export type FormulaValue = number | string | boolean;

/** Context passed into formula evaluation for cell lookups. */
export interface EvalContext {
  cells: CellMap;
  /** Resolves a cell ref like "A1" to its computed number/string value. */
  resolve: (ref: string) => FormulaValue;
  /** Expands a range "A1:B3" into a flat row-major array of resolved values. */
  resolveRange: (start: string, end: string) => FormulaValue[];
  /** Expands a range "A1:B3" into a 2D array (rows × cols) of resolved values. */
  resolveRange2D: (start: string, end: string) => FormulaValue[][];
}
