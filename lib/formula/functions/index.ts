import type { FormulaFn } from "../types";

import * as math from "./math";
import * as text from "./text";
import * as logical from "./logical";
import * as date from "./date";
import * as lookup from "./lookup";

/** Registry of all built-in formula functions keyed by uppercase name. */
export const FUNCTIONS: Record<string, FormulaFn> = {
  // Math
  SUM: math.SUM,
  AVERAGE: math.AVERAGE,
  MIN: math.MIN,
  MAX: math.MAX,
  COUNT: math.COUNT,
  COUNTA: math.COUNTA,
  ABS: math.ABS,
  ROUND: math.ROUND,
  FLOOR: math.FLOOR,
  CEILING: math.CEILING,
  SQRT: math.SQRT,
  POWER: math.POWER,
  MOD: math.MOD,
  INT: math.INT,
  PI: math.PI,
  RAND: math.RAND,
  SUMPRODUCT: math.SUMPRODUCT,

  // Text
  CONCATENATE: text.CONCATENATE,
  CONCAT: text.CONCAT,
  LEFT: text.LEFT,
  RIGHT: text.RIGHT,
  MID: text.MID,
  LEN: text.LEN,
  TRIM: text.TRIM,
  UPPER: text.UPPER,
  LOWER: text.LOWER,
  PROPER: text.PROPER,
  SUBSTITUTE: text.SUBSTITUTE,
  REPT: text.REPT,
  FIND: text.FIND,
  TEXT: text.TEXT,

  // Logical
  IF: logical.IF,
  AND: logical.AND,
  OR: logical.OR,
  NOT: logical.NOT,
  XOR: logical.XOR,
  IFERROR: logical.IFERROR,
  IFNA: logical.IFNA,
  TRUE: logical.TRUE,
  FALSE: logical.FALSE,
  SWITCH: logical.SWITCH,

  // Date
  TODAY: date.TODAY,
  NOW: date.NOW,
  DATE: date.DATE,
  YEAR: date.YEAR,
  MONTH: date.MONTH,
  DAY: date.DAY,
  HOUR: date.HOUR,
  MINUTE: date.MINUTE,
  SECOND: date.SECOND,
  DATEDIF: date.DATEDIF,
  WEEKDAY: date.WEEKDAY,
  EDATE: date.EDATE,

  // Lookup
  INDEX: lookup.INDEX,
  MATCH: lookup.MATCH,
  VLOOKUP: lookup.VLOOKUP,
  HLOOKUP: lookup.HLOOKUP,
  CHOOSE: lookup.CHOOSE,
  ROW: lookup.ROW,
  COLUMN: lookup.COLUMN,
};
