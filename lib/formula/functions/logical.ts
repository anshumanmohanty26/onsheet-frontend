import type { FormulaFn, FormulaValue } from "../types";

function toBool(v: FormulaValue): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  return v !== "" && v !== "FALSE";
}

export const IF: FormulaFn = (args) => {
  const condition = toBool(args[0]);
  return condition ? (args[1] ?? true) : (args[2] ?? false);
};

export const AND: FormulaFn = (args) => args.every(toBool);
export const OR: FormulaFn = (args) => args.some(toBool);
export const NOT: FormulaFn = (args) => !toBool(args[0]);
export const XOR: FormulaFn = (args) => args.filter(toBool).length % 2 === 1;

export const IFERROR: FormulaFn = (args) => {
  const val = args[0];
  if (typeof val === "string" && val.startsWith("#")) return args[1] ?? "";
  return val;
};

export const IFNA: FormulaFn = (args) => {
  const val = args[0];
  if (val === "#N/A") return args[1] ?? "";
  return val;
};

export const TRUE: FormulaFn = () => true;
export const FALSE: FormulaFn = () => false;

export const SWITCH: FormulaFn = (args) => {
  const expr = args[0];
  for (let i = 1; i < args.length - 1; i += 2) {
    if (args[i] === expr) return args[i + 1];
  }
  // Default value (odd number of remaining args)
  return args.length % 2 === 0 ? args[args.length - 1] : "#N/A";
};
