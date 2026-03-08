import type { FormulaToken } from "@/types/formula";
import { tokenize } from "./tokenizer";
import type { ASTNode } from "./types";

/**
 * Recursive-descent parser that produces an ASTNode from a formula string.
 * Handles: numbers, strings, booleans, cell refs, range refs, function calls,
 * binary operators (+, -, *, /, ^, comparison), and unary minus.
 */
export function parse(formula: string): ASTNode {
  const tokens = tokenize(formula);
  let pos = 0;

  function peek(): FormulaToken | undefined {
    return tokens[pos];
  }

  function consume(expected?: string): FormulaToken {
    const t = tokens[pos];
    if (expected && t?.value !== expected) {
      return { type: "ERROR", value: expected };
    }
    pos++;
    return t;
  }

  function parseExpression(): ASTNode {
    return parseComparison();
  }

  function parseComparison(): ASTNode {
    let left = parseAddSub();
    while (
      peek()?.type === "OPERATOR" &&
      ["=", "<", ">", "<=", ">=", "<>", "!="].includes(peek()?.value)
    ) {
      const op = consume().value;
      const right = parseAddSub();
      left = { type: "binary_op", op, left, right };
    }
    return left;
  }

  function parseAddSub(): ASTNode {
    let left = parseMulDiv();
    while (peek()?.type === "OPERATOR" && (peek()?.value === "+" || peek()?.value === "-")) {
      const op = consume().value;
      const right = parseMulDiv();
      left = { type: "binary_op", op, left, right };
    }
    return left;
  }

  function parseMulDiv(): ASTNode {
    let left = parsePower();
    while (
      peek()?.type === "OPERATOR" &&
      (peek()?.value === "*" || peek()?.value === "/" || peek()?.value === "%")
    ) {
      const op = consume().value;
      const right = parsePower();
      left = { type: "binary_op", op, left, right };
    }
    return left;
  }

  function parsePower(): ASTNode {
    let left = parseUnary();
    while (peek()?.type === "OPERATOR" && peek()?.value === "^") {
      consume();
      const right = parseUnary();
      left = { type: "binary_op", op: "^", left, right };
    }
    return left;
  }

  function parseUnary(): ASTNode {
    if (peek()?.type === "OPERATOR" && peek()?.value === "-") {
      consume();
      const operand = parseUnary();
      return { type: "unary_op", op: "-", operand };
    }
    return parsePrimary();
  }

  function parsePrimary(): ASTNode {
    const t = peek();
    if (!t) return { type: "error", value: "#PARSE!" };

    // Parenthesised expression
    if (t.type === "PAREN" && t.value === "(") {
      consume("(");
      const expr = parseExpression();
      consume(")");
      return expr;
    }

    // Function call
    if (t.type === "FUNCTION") {
      const name = consume().value;
      consume("(");
      const args: ASTNode[] = [];
      if (peek()?.value !== ")") {
        args.push(parseExpression());
        while (peek()?.type === "COMMA") {
          consume();
          args.push(parseExpression());
        }
      }
      consume(")");
      return { type: "function_call", name, args };
    }

    // Number
    if (t.type === "NUMBER") {
      const val = consume().value;
      return { type: "number", value: Number(val) };
    }

    // String
    if (t.type === "STRING") {
      return { type: "string", value: consume().value };
    }

    // Boolean
    if (t.type === "BOOLEAN") {
      return { type: "boolean", value: consume().value === "TRUE" };
    }

    // Range ref
    if (t.type === "RANGE_REF") {
      const val = consume().value;
      const [start, end] = val.split(":");
      return { type: "range_ref", start, end };
    }

    // Cell ref
    if (t.type === "CELL_REF") {
      return { type: "cell_ref", ref: consume().value };
    }

    // Error / unknown
    consume();
    return { type: "error", value: "#PARSE!" };
  }

  const ast = parseExpression();
  return ast;
}
