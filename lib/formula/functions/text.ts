import type { FormulaFn } from "../types";

function str(v: unknown): string {
  return String(v ?? "");
}

export const CONCATENATE: FormulaFn = (args) => args.map(str).join("");
export const CONCAT: FormulaFn = CONCATENATE;

export const LEFT: FormulaFn = (args) => {
  const s = str(args[0]);
  const n = args.length > 1 ? Number(args[1]) : 1;
  return s.slice(0, n);
};

export const RIGHT: FormulaFn = (args) => {
  const s = str(args[0]);
  const n = args.length > 1 ? Number(args[1]) : 1;
  return s.slice(-n);
};

export const MID: FormulaFn = (args) => {
  const s = str(args[0]);
  const start = Number(args[1]) - 1; // 1-indexed
  const length = Number(args[2]);
  return s.slice(start, start + length);
};

export const LEN: FormulaFn = (args) => str(args[0]).length;
export const TRIM: FormulaFn = (args) => str(args[0]).trim();
export const UPPER: FormulaFn = (args) => str(args[0]).toUpperCase();
export const LOWER: FormulaFn = (args) => str(args[0]).toLowerCase();

export const PROPER: FormulaFn = (args) => str(args[0]).replace(/\b\w/g, (c) => c.toUpperCase());

export const SUBSTITUTE: FormulaFn = (args) => {
  const text = str(args[0]);
  const oldText = str(args[1]);
  const newText = str(args[2]);
  return text.split(oldText).join(newText);
};

export const REPT: FormulaFn = (args) => str(args[0]).repeat(Number(args[1]) || 0);

export const FIND: FormulaFn = (args) => {
  const pos = str(args[1]).indexOf(str(args[0]));
  return pos === -1 ? "#VALUE!" : pos + 1;
};

export const TEXT: FormulaFn = (args) => {
  // Simplified: just toString
  return String(args[0]);
};
