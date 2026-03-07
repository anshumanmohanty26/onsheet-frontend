import type { FormulaFn, FormulaValue } from "../types";

function toNum(v: FormulaValue): number {
  return typeof v === "number" ? v : Number(v) || 0;
}

export const TODAY: FormulaFn = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export const NOW: FormulaFn = () => Date.now();

export const DATE: FormulaFn = (args) => {
  const y = toNum(args[0]);
  const m = toNum(args[1]) - 1;
  const d = toNum(args[2]);
  return new Date(y, m, d).getTime();
};

export const YEAR: FormulaFn = (args) => new Date(toNum(args[0])).getFullYear();
export const MONTH: FormulaFn = (args) => new Date(toNum(args[0])).getMonth() + 1;
export const DAY: FormulaFn = (args) => new Date(toNum(args[0])).getDate();
export const HOUR: FormulaFn = (args) => new Date(toNum(args[0])).getHours();
export const MINUTE: FormulaFn = (args) => new Date(toNum(args[0])).getMinutes();
export const SECOND: FormulaFn = (args) => new Date(toNum(args[0])).getSeconds();

export const DATEDIF: FormulaFn = (args) => {
  const start = new Date(toNum(args[0]));
  const end = new Date(toNum(args[1]));
  const unit = String(args[2]).toUpperCase();
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  switch (unit) {
    case "D":
      return diffDays;
    case "M": {
      return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    }
    case "Y":
      return end.getFullYear() - start.getFullYear();
    default:
      return "#VALUE!";
  }
};

export const WEEKDAY: FormulaFn = (args) => new Date(toNum(args[0])).getDay() + 1;

export const EDATE: FormulaFn = (args) => {
  const d = new Date(toNum(args[0]));
  d.setMonth(d.getMonth() + toNum(args[1]));
  return d.getTime();
};
