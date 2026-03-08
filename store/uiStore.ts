export interface UIState {
  formulaBarValue: string;
  isEditingCell: boolean;
  showContextMenu: boolean;
  contextMenuPos: { x: number; y: number } | null;
}

export type UIAction =
  | { type: "SET_FORMULA_BAR"; value: string }
  | { type: "SET_EDITING"; editing: boolean }
  | { type: "SHOW_CONTEXT_MENU"; pos: { x: number; y: number } }
  | { type: "HIDE_CONTEXT_MENU" };

export const initialUIState: UIState = {
  formulaBarValue: "",
  isEditingCell: false,
  showContextMenu: false,
  contextMenuPos: null,
};

export function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "SET_FORMULA_BAR":
      if (state.formulaBarValue === action.value) return state;
      return { ...state, formulaBarValue: action.value };
    case "SET_EDITING":
      if (state.isEditingCell === action.editing) return state;
      return { ...state, isEditingCell: action.editing };
    case "SHOW_CONTEXT_MENU":
      return { ...state, showContextMenu: true, contextMenuPos: action.pos };
    case "HIDE_CONTEXT_MENU":
      return { ...state, showContextMenu: false, contextMenuPos: null };
    default:
      return state;
  }
}
