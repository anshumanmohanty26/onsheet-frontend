import type { FormulaFn } from "../types";

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
 * The evaluator handles VLOOKUP directly when the second arg is a range_ref,
 * passing 2D data via ctx.resolveRange2D. This fallback handles the rare case
 * where the table arg is already a flat pre-evaluated array.
 */
export const VLOOKUP: FormulaFn = (args, _ctx) => {
  const search = args[0];
  const colIndex = Number(args[args.length - 2]) - 1;
  // Try 2D lookup via context if available (non-range arg path)
  const flat = args.slice(1, args.length - 2);
  for (let i = 0; i < flat.length; i++) {
    if (flat[i] === search || String(flat[i]) === String(search)) {
      return colIndex >= 0 && i + colIndex < flat.length
        ? (flat[i + colIndex] ?? "#REF!")
        : "#REF!";
    }
  }
  return "#N/A";
};

/** HLOOKUP — same fallback path. Primary path handled by evaluator. */
export const HLOOKUP: FormulaFn = VLOOKUP;

export const CHOOSE: FormulaFn = (args) => {
  const idx = Number(args[0]);
  return idx >= 1 && idx < args.length ? args[idx] : "#VALUE!";
};

/** ROW(cell_ref) — the evaluator resolves cell_ref to its value; we just return arg as-is placeholder. */
export const ROW: FormulaFn = (args) => (typeof args[0] === "number" ? args[0] : 0);
export const COLUMN: FormulaFn = (args) => (typeof args[0] === "number" ? args[0] : 0);
