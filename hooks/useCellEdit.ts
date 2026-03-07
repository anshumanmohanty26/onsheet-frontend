import { useCallback, useState } from "react";
import { cellRef } from "@/lib/utils/coordinates";
import type { CellCoord } from "@/types/selection";
import type { CellData, CellMap } from "@/types/cell";

interface UseCellEditOptions {
  cells: CellMap;
  active: CellCoord | null;
  onCommit: (ref: string, value: string) => void;
}

/** Hook for managing the inline cell-editing lifecycle. */
export function useCellEdit({ cells, active, onCommit }: UseCellEditOptions) {
  const [editingRef, setEditingRef] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  /** Start editing the given cell. */
  const startEdit = useCallback(
    (coord: CellCoord) => {
      const ref = cellRef(coord.row, coord.col);
      const cell = cells[ref];
      setEditingRef(ref);
      setEditValue(cell?.raw ?? "");
    },
    [cells],
  );

  /** Commit the current edit and optionally move to a neighbour. */
  const commitEdit = useCallback(
    (move?: { dr: number; dc: number }) => {
      if (editingRef) {
        onCommit(editingRef, editValue);
      }
      setEditingRef(null);
    },
    [editingRef, editValue, onCommit],
  );

  /** Cancel the edit and restore the original value. */
  const cancelEdit = useCallback(() => {
    setEditingRef(null);
    if (active) {
      const ref = cellRef(active.row, active.col);
      setEditValue(cells[ref]?.raw ?? "");
    }
  }, [active, cells]);

  /** Start editing when the user types directly into a cell (replaces content). */
  const startTyping = useCallback(
    (coord: CellCoord, char: string) => {
      const ref = cellRef(coord.row, coord.col);
      setEditingRef(ref);
      setEditValue(char);
    },
    [],
  );

  return {
    editingRef,
    editValue,
    setEditValue,
    startEdit,
    startTyping,
    commitEdit,
    cancelEdit,
    isEditing: editingRef !== null,
  };
}
