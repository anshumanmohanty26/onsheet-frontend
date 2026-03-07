import { useCallback, useReducer } from "react";
import {
  initialSelectionState,
  selectionReducer,
  type SelectionAction,
} from "@/store/selectionStore";
import type { CellCoord, SelectionRange } from "@/types/selection";

/** Hook for cell/range selection logic. */
export function useSelection() {
  const [selection, dispatch] = useReducer(selectionReducer, initialSelectionState);

  const setActive = useCallback((coord: CellCoord) => {
    dispatch({ type: "SET_ACTIVE", coord });
  }, []);

  const setRange = useCallback((range: SelectionRange) => {
    dispatch({ type: "SET_RANGE", range });
  }, []);

  const startDrag = useCallback(() => {
    dispatch({ type: "START_DRAG" });
  }, []);

  const endDrag = useCallback(() => {
    dispatch({ type: "END_DRAG" });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR" });
  }, []);

  return {
    selection,
    dispatch,
    setActive,
    setRange,
    startDrag,
    endDrag,
    clear,
  };
}
