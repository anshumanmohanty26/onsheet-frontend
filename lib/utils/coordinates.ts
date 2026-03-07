/** Convert 0-based column index to letter(s): 0 → "A", 25 → "Z", 26 → "AA" */
export function colIndexToLabel(index: number): string {
  let label = "";
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode((i % 26) + 65) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
}

/** Convert column letter(s) to 0-based index: "A" → 0, "AA" → 26 */
export function colLabelToIndex(label: string): number {
  let index = 0;
  for (let i = 0; i < label.length; i++) {
    index = index * 26 + label.charCodeAt(i) - 64;
  }
  return index - 1;
}

/** Build A1-style cell reference from 0-based row/col: (0,0) → "A1" */
export function cellRef(row: number, col: number): string {
  return `${colIndexToLabel(col)}${row + 1}`;
}

/** Parse A1-style reference to 0-based { row, col } */
export function parseCellRef(ref: string): { row: number; col: number } | null {
  const match = /^([A-Za-z]+)(\d+)$/.exec(ref.trim());
  if (!match) return null;
  return {
    col: colLabelToIndex(match[1].toUpperCase()),
    row: parseInt(match[2], 10) - 1,
  };
}
