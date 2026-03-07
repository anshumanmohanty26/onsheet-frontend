import type { FormulaFn, FormulaValue } from "../types";

/**
 * INDEX(array, row_num, [col_num])
 * Simplified: treats args as a flat array, returns the (row_num)th element.
 */
export const INDEX: FormulaFn = (args) => {
  const idx = Number(args[1]) - 1;
  // If the first arg is part of a range that was expanded, the evaluator
  // passes all values as individual args. We just pick by numeric index.
  return idx >= 0 && idx < args.length ? args[idx] : "#REF!";
};

/**
 * MATCH(search, range_values, [match_type])
 * Simplified: exact match (match_type 0).
 */
export const MATCH: FormulaFn = (args) => {
  const search = args[0];
  for (let i = 1; i < args.length; i++) {
    if (args[i] === search) return i;
  }
  return "#N/A";
};

/**
 * VLOOKUP(search, table_range_values, col_index, [is_sorted])
 * Simplified for flat arrays: searches column 1 of a conceptual 2D range.
 * The evaluator flattens ranges row-major; `col_index` picks within the row.
 * Because the evaluator doesn't pass 2D structure, this is a best-effort stub.
 */
export const VLOOKUP: FormulaFn = (args) => {
  const search = args[0];
  const colIndex = Number(args[2]) - 1;
  // remaining args are range values — try to find a match
  for (let i = 3; i < args.length; i++) {
    if (args[i] === search && i + colIndex < args.length) {
      return args[i + colIndex];
    }
  }
  return "#N/A";
};

/** HLOOKUP — same logic transposed (rows <-> cols). */
export const HLOOKUP: FormulaFn = VLOOKUP;

export const CHOOSE: FormulaFn = (args) => {
  const idx = Number(args[0]);
  return idx >= 1 && idx < args.length ? args[idx] : "#VALUE!";
};

/** ROW(cell_ref) — the evaluator resolves cell_ref to its value; we just return arg as-is placeholder. */
export const ROW: FormulaFn = (args) => (typeof args[0] === "number" ? args[0] : 0);
export const COLUMN: FormulaFn = (args) => (typeof args[0] === "number" ? args[0] : 0);
