import type { CellCoord, SelectionRange, SelectionState } from "@/types/selection";

export type SelectionAction =
  | { type: "SET_ACTIVE"; coord: CellCoord }
  | { type: "SET_RANGE"; range: SelectionRange }
  | { type: "START_DRAG" }
  | { type: "END_DRAG" }
  | { type: "CLEAR" };

export const initialSelectionState: SelectionState = {
  active: null,
  range: null,
  isDragging: false,
};

export function selectionReducer(
  state: SelectionState,
  action: SelectionAction,
): SelectionState {
  switch (action.type) {
    case "SET_ACTIVE":
      return {
        ...state,
        active: action.coord,
        range: { start: action.coord, end: action.coord },
      };
    case "SET_RANGE":
      return { ...state, range: action.range };
    case "START_DRAG":
      return { ...state, isDragging: true };
    case "END_DRAG":
      return { ...state, isDragging: false };
    case "CLEAR":
      return initialSelectionState;
    default:
      return state;
  }
}
