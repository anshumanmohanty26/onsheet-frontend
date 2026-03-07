import type { FormulaFn, FormulaValue } from "../types";

function toNum(v: FormulaValue): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function flatNums(args: FormulaValue[]): number[] {
  return args.map(toNum);
}

export const SUM: FormulaFn = (args) => flatNums(args).reduce((a, b) => a + b, 0);

export const AVERAGE: FormulaFn = (args) => {
  const nums = flatNums(args);
  return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
};

export const MIN: FormulaFn = (args) => {
  const nums = flatNums(args);
  return nums.length === 0 ? 0 : Math.min(...nums);
};

export const MAX: FormulaFn = (args) => {
  const nums = flatNums(args);
  return nums.length === 0 ? 0 : Math.max(...nums);
};

export const COUNT: FormulaFn = (args) =>
  args.filter((v) => typeof v === "number" || (typeof v === "string" && !Number.isNaN(Number(v)) && v !== "")).length;

export const COUNTA: FormulaFn = (args) =>
  args.filter((v) => v !== "" && v !== undefined && v !== null).length;

export const ABS: FormulaFn = (args) => Math.abs(toNum(args[0]));

export const ROUND: FormulaFn = (args) => {
  const num = toNum(args[0]);
  const digits = args.length > 1 ? toNum(args[1]) : 0;
  const factor = 10 ** digits;
  return Math.round(num * factor) / factor;
};

export const FLOOR: FormulaFn = (args) => Math.floor(toNum(args[0]));
export const CEILING: FormulaFn = (args) => Math.ceil(toNum(args[0]));
export const SQRT: FormulaFn = (args) => Math.sqrt(toNum(args[0]));
export const POWER: FormulaFn = (args) => toNum(args[0]) ** toNum(args[1]);
export const MOD: FormulaFn = (args) => toNum(args[0]) % toNum(args[1]);
export const INT: FormulaFn = (args) => Math.trunc(toNum(args[0]));
export const PI: FormulaFn = () => Math.PI;
export const RAND: FormulaFn = () => Math.random();

export const SUMPRODUCT: FormulaFn = (args) => {
  // expects pairs of range values flattened
  if (args.length === 0) return 0;
  return flatNums(args).reduce((a, b) => a + b, 0);
};
