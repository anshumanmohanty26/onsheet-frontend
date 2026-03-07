export interface CellCoord {
  row: number; // 0-based
  col: number; // 0-based
}

export interface SelectionRange {
  start: CellCoord;
  end: CellCoord;
}

export interface SelectionState {
  active: CellCoord | null;
  range: SelectionRange | null;
  /** Whether the user is currently dragging a selection */
  isDragging: boolean;
}
