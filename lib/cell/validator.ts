import type { CellValueType, ParsedCellValue } from "./types";

/** Parse raw cell input string into a typed value. */
export function parseCellInput(raw: string): ParsedCellValue {
  const trimmed = raw.trim();

  if (trimmed === "") {
    return { type: "empty", value: "" };
  }

  // Boolean
  if (trimmed.toUpperCase() === "TRUE") return { type: "boolean", value: true };
  if (trimmed.toUpperCase() === "FALSE") return { type: "boolean", value: false };

  // Number (comma thousands separator allowed)
  const numStr = trimmed.replace(/,/g, "");
  if (numStr !== "" && !Number.isNaN(Number(numStr))) {
    return { type: "number", value: Number(numStr) };
  }

  // Percentage shorthand: "50%" => 0.5
  if (/^-?\d+(\.\d+)?%$/.test(trimmed)) {
    const n = Number.parseFloat(trimmed) / 100;
    return { type: "number", value: n };
  }

  return { type: "string", value: trimmed };
}

/** Check whether a raw value looks like a formula (starts with =). */
export function isFormula(raw: string): boolean {
  return raw.startsWith("=");
}
