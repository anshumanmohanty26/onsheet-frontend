import type { FormulaToken } from "@/types/formula";

/** Tokenise a formula string (without the leading '=') into an array of tokens. */
export function tokenize(formula: string): FormulaToken[] {
  const tokens: FormulaToken[] = [];
  let i = 0;
  const src = formula.trim();

  while (i < src.length) {
    const ch = src[i];

    // Whitespace — skip
    if (ch === " " || ch === "\t") {
      i++;
      continue;
    }

    // String literal
    if (ch === '"') {
      let str = "";
      i++;
      while (i < src.length && src[i] !== '"') {
        str += src[i];
        i++;
      }
      i++; // closing quote
      tokens.push({ type: "STRING", value: str });
      continue;
    }

    // Number (including decimals)
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < src.length && /[0-9.]/.test(src[i])) {
        num += src[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: num });
      continue;
    }

    // Parentheses
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "PAREN", value: ch });
      i++;
      continue;
    }

    // Comma
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: "," });
      i++;
      continue;
    }

    // Operators (multi-char: >=, <=, <>, !=)
    if ("+-*/<>=!&^%".includes(ch)) {
      let op = ch;
      if (i + 1 < src.length) {
        const next = src[i + 1];
        if (
          (ch === "<" && (next === "=" || next === ">")) ||
          (ch === ">" && next === "=") ||
          (ch === "!" && next === "=")
        ) {
          op += next;
          i++;
        }
      }
      tokens.push({ type: "OPERATOR", value: op });
      i++;
      continue;
    }

    // Identifier: could be a function name, cell ref, range ref, or boolean
    if (/[A-Za-z_$]/.test(ch)) {
      let id = "";
      while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) {
        id += src[i];
        i++;
      }

      // Boolean literals
      if (id.toUpperCase() === "TRUE" || id.toUpperCase() === "FALSE") {
        tokens.push({ type: "BOOLEAN", value: id.toUpperCase() });
        continue;
      }

      // Check for range ref: A1:B5
      if (i < src.length && src[i] === ":") {
        i++; // skip ':'
        let end = "";
        while (i < src.length && /[A-Za-z0-9]/.test(src[i])) {
          end += src[i];
          i++;
        }
        tokens.push({ type: "RANGE_REF", value: `${id.toUpperCase()}:${end.toUpperCase()}` });
        continue;
      }

      // Function call if followed by '('
      if (i < src.length && src[i] === "(") {
        tokens.push({ type: "FUNCTION", value: id.toUpperCase() });
        continue;
      }

      // Cell reference (e.g. A1, $B$3 — simplified, no $ handling)
      if (/^[A-Z]+[0-9]+$/i.test(id)) {
        tokens.push({ type: "CELL_REF", value: id.toUpperCase() });
        continue;
      }

      // Unknown identifier — treat as error
      tokens.push({ type: "ERROR", value: id });
      continue;
    }

    // Colon standalone
    if (ch === ":") {
      tokens.push({ type: "OPERATOR", value: ":" });
      i++;
      continue;
    }

    // Unknown char
    tokens.push({ type: "ERROR", value: ch });
    i++;
  }

  return tokens;
}
