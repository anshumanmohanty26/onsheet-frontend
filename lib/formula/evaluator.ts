import type { CellMap } from "@/types/cell";
import type { ASTNode, EvalContext, FormulaValue } from "./types";
import { parse } from "./parser";
import { FUNCTIONS } from "./functions";
import { cellRef, colLabelToIndex, parseCellRef } from "@/lib/utils/coordinates";
import { isFormula } from "@/lib/cell/validator";

/**
 * Evaluate a formula string (without leading '=') against a cell map.
 * Returns the computed value or an error string like "#REF!".
 */
export function evaluate(formula: string, cells: CellMap): FormulaValue {
  const visiting = new Set<string>(); // circular ref guard
  const ctx = buildContext(cells, visiting);
  const ast = parse(formula);
  return evalNode(ast, ctx);
}

function buildContext(cells: CellMap, visiting: Set<string>): EvalContext {
  const resolve = (ref: string): FormulaValue => {
    if (visiting.has(ref)) return "#REF!"; // circular
    const cell = cells[ref];
    if (!cell) return "";
    // If the cell itself is a formula, recursively evaluate it
    if (isFormula(cell.raw)) {
      visiting.add(ref);
      const result = evaluate(cell.raw.slice(1), cells);
      visiting.delete(ref);
      return result;
    }
    // Try to coerce to number
    const n = Number(cell.raw);
    return cell.raw === "" ? "" : Number.isNaN(n) ? cell.raw : n;
  };

  const resolveRange = (startRef: string, endRef: string): FormulaValue[] => {
    const s = parseCellRef(startRef);
    const e = parseCellRef(endRef);
    if (!s || !e) return [];
    const vals: FormulaValue[] = [];
    const rMin = Math.min(s.row, e.row);
    const rMax = Math.max(s.row, e.row);
    const cMin = Math.min(s.col, e.col);
    const cMax = Math.max(s.col, e.col);
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        vals.push(resolve(cellRef(r, c)));
      }
    }
    return vals;
  };

  return { cells, resolve, resolveRange };
}

function evalNode(node: ASTNode, ctx: EvalContext): FormulaValue {
  switch (node.type) {
    case "number":
      return node.value;
    case "string":
      return node.value;
    case "boolean":
      return node.value;
    case "error":
      return node.value;

    case "cell_ref":
      return ctx.resolve(node.ref);

    case "range_ref":
      // Should only appear inside function args — flatten to first value if used standalone
      return ctx.resolveRange(node.start, node.end)[0] ?? "";

    case "unary_op": {
      const val = evalNode(node.operand, ctx);
      if (node.op === "-") return -(typeof val === "number" ? val : Number(val) || 0);
      return val;
    }

    case "binary_op":
      return evalBinaryOp(node.op, evalNode(node.left, ctx), evalNode(node.right, ctx));

    case "function_call": {
      const fn = FUNCTIONS[node.name];
      if (!fn) return "#NAME?";
      // Expand range args into flat value arrays
      const args: FormulaValue[] = [];
      for (const arg of node.args) {
        if (arg.type === "range_ref") {
          args.push(...ctx.resolveRange(arg.start, arg.end));
        } else {
          args.push(evalNode(arg, ctx));
        }
      }
      return fn(args, ctx);
    }

    default:
      return "#ERROR!";
  }
}

function evalBinaryOp(op: string, l: FormulaValue, r: FormulaValue): FormulaValue {
  const ln = typeof l === "number" ? l : Number(l);
  const rn = typeof r === "number" ? r : Number(r);

  switch (op) {
    case "+":
      return (Number.isNaN(ln) ? 0 : ln) + (Number.isNaN(rn) ? 0 : rn);
    case "-":
      return (Number.isNaN(ln) ? 0 : ln) - (Number.isNaN(rn) ? 0 : rn);
    case "*":
      return (Number.isNaN(ln) ? 0 : ln) * (Number.isNaN(rn) ? 0 : rn);
    case "/":
      if (rn === 0) return "#DIV/0!";
      return ln / rn;
    case "^":
      return ln ** rn;
    case "%":
      if (rn === 0) return "#DIV/0!";
      return ln % rn;
    case "&":
      return String(l) + String(r);
    case "=":
      return l === r;
    case "<>":
    case "!=":
      return l !== r;
    case "<":
      return ln < rn;
    case ">":
      return ln > rn;
    case "<=":
      return ln <= rn;
    case ">=":
      return ln >= rn;
    default:
      return "#ERROR!";
  }
}
