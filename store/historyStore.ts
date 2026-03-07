export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
}

export type HistoryAction =
  | { type: "SET_CAN_UNDO"; value: boolean }
  | { type: "SET_CAN_REDO"; value: boolean };

export const initialHistoryState: HistoryState = {
  canUndo: false,
  canRedo: false,
};

export function historyReducer(
  state: HistoryState,
  action: HistoryAction,
): HistoryState {
  switch (action.type) {
    case "SET_CAN_UNDO":
      return { ...state, canUndo: action.value };
    case "SET_CAN_REDO":
      return { ...state, canRedo: action.value };
    default:
      return state;
  }
}
