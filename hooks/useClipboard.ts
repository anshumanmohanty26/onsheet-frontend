import { type ClipboardData, parseTSV, serializeCells, toTSV } from "@/lib/clipboard/clipboard";
import { cellRef } from "@/lib/utils/coordinates";
import type { CellData, CellMap } from "@/types/cell";
import type { SelectionRange } from "@/types/selection";
import { useCallback, useRef } from "react";

interface UseClipboardOptions {
  cells: CellMap;
  selection: SelectionRange | null;
  onPaste: (ref: string, data: CellData) => void;
  onClear: (ref: string) => void;
}

/** Hook for clipboard operations (copy, cut, paste). */
export function useClipboard({ cells, selection, onPaste, onClear }: UseClipboardOptions) {
  const clipboardRef = useRef<ClipboardData | null>(null);

  const copy = useCallback(async () => {
    if (!selection) return;
    const data = serializeCells(cells, selection, false);
    clipboardRef.current = data;
    try {
      await navigator.clipboard.writeText(toTSV(data));
    } catch {
      // Fallback: internal only
    }
  }, [cells, selection]);

  const cut = useCallback(async () => {
    if (!selection) return;
    const data = serializeCells(cells, selection, true);
    clipboardRef.current = data;
    try {
      await navigator.clipboard.writeText(toTSV(data));
    } catch {
      // Fallback
    }
    // Clear source cells
    for (let ri = 0; ri < data.cells.length; ri++) {
      for (let ci = 0; ci < data.cells[ri].length; ci++) {
        const ref = cellRef(data.origin.row + ri, data.origin.col + ci);
        onClear(ref);
      }
    }
  }, [cells, selection, onClear]);

  const paste = useCallback(
    async (targetRow: number, targetCol: number) => {
      // Try internal clipboard first
      const internal = clipboardRef.current;
      if (internal) {
        for (let ri = 0; ri < internal.cells.length; ri++) {
          for (let ci = 0; ci < internal.cells[ri].length; ci++) {
            const cell = internal.cells[ri][ci];
            const ref = cellRef(targetRow + ri, targetCol + ci);
            onPaste(ref, cell ?? { raw: "" });
          }
        }
        if (internal.isCut) clipboardRef.current = null;
        return;
      }

      // Fallback: system clipboard
      try {
        const text = await navigator.clipboard.readText();
        const rows = parseTSV(text);
        for (let ri = 0; ri < rows.length; ri++) {
          for (let ci = 0; ci < rows[ri].length; ci++) {
            const ref = cellRef(targetRow + ri, targetCol + ci);
            onPaste(ref, { raw: rows[ri][ci] });
          }
        }
      } catch {
        // Clipboard access denied
      }
    },
    [onPaste],
  );

  return { copy, cut, paste };
}
