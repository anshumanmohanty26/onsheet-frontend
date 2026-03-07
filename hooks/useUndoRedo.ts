import { useCallback, useMemo, useReducer } from "react";
import { HistoryManager, type CellOperation } from "@/lib/history/history";
import { historyReducer, initialHistoryState } from "@/store/historyStore";

/** Hook for undo/redo history backed by HistoryManager. */
export function useUndoRedo() {
  const history = useMemo(() => new HistoryManager(), []);
  const [state, dispatch] = useReducer(historyReducer, initialHistoryState);

  const push = useCallback(
    (ops: CellOperation[]) => {
      history.push(ops);
      dispatch({ type: "SET_CAN_UNDO", value: history.canUndo });
      dispatch({ type: "SET_CAN_REDO", value: history.canRedo });
    },
    [history],
  );

  const undo = useCallback(() => {
    const ops = history.undo();
    dispatch({ type: "SET_CAN_UNDO", value: history.canUndo });
    dispatch({ type: "SET_CAN_REDO", value: history.canRedo });
    return ops;
  }, [history]);

  const redo = useCallback(() => {
    const ops = history.redo();
    dispatch({ type: "SET_CAN_UNDO", value: history.canUndo });
    dispatch({ type: "SET_CAN_REDO", value: history.canRedo });
    return ops;
  }, [history]);

  const clear = useCallback(() => {
    history.clear();
    dispatch({ type: "SET_CAN_UNDO", value: false });
    dispatch({ type: "SET_CAN_REDO", value: false });
  }, [history]);

  return { canUndo: state.canUndo, canRedo: state.canRedo, push, undo, redo, clear };
}
