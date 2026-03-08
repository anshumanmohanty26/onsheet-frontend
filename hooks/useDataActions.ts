import type { SpreadsheetAction } from "@/store/spreadsheetStore";
import type { CellCoord } from "@/types/selection";
import { useCallback } from "react";

interface Options {
  active: CellCoord | null;
  dispatch: (action: SpreadsheetAction) => void;
}

/** Grid-structure operations: insert/delete rows & columns, sort, remove duplicates. */
export function useDataActions({ active, dispatch }: Options) {
  const handleInsertRowAbove = useCallback(() => {
    if (!active) return;
    dispatch({ type: "INSERT_ROW", row: active.row });
  }, [active, dispatch]);

  const handleInsertRowBelow = useCallback(() => {
    if (!active) return;
    dispatch({ type: "INSERT_ROW", row: active.row + 1 });
  }, [active, dispatch]);

  const handleInsertColLeft = useCallback(() => {
    if (!active) return;
    dispatch({ type: "INSERT_COL", col: active.col });
  }, [active, dispatch]);

  const handleInsertColRight = useCallback(() => {
    if (!active) return;
    dispatch({ type: "INSERT_COL", col: active.col + 1 });
  }, [active, dispatch]);

  const handleSortAsc = useCallback(() => {
    if (!active) return;
    dispatch({ type: "SORT_COLUMN", col: active.col, ascending: true });
  }, [active, dispatch]);

  const handleSortDesc = useCallback(() => {
    if (!active) return;
    dispatch({ type: "SORT_COLUMN", col: active.col, ascending: false });
  }, [active, dispatch]);

  const handleDeleteRow = useCallback(() => {
    if (!active) return;
    dispatch({ type: "DELETE_ROW", row: active.row });
  }, [active, dispatch]);

  const handleDeleteCol = useCallback(() => {
    if (!active) return;
    dispatch({ type: "DELETE_COL", col: active.col });
  }, [active, dispatch]);

  const handleRemoveDuplicates = useCallback(() => {
    if (!active) return;
    dispatch({ type: "REMOVE_DUPLICATES", col: active.col });
  }, [active, dispatch]);

  return {
    handleInsertRowAbove,
    handleInsertRowBelow,
    handleInsertColLeft,
    handleInsertColRight,
    handleSortAsc,
    handleSortDesc,
    handleDeleteRow,
    handleDeleteCol,
    handleRemoveDuplicates,
  };
}
