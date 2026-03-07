/**
 * Operation-based undo/redo history.
 * Each operation stores the cell ref, old value, and new value
 * so it can be reversed without full-document snapshots.
 */

import type { CellStyle } from "@/types/cell";

export interface CellOperation {
  ref: string;
  oldRaw: string;
  oldStyle?: CellStyle;
  newRaw: string;
  newStyle?: CellStyle;
}

export class HistoryManager {
  private undoStack: CellOperation[][] = [];
  private redoStack: CellOperation[][] = [];
  private maxSize: number;

  constructor(maxSize = 200) {
    this.maxSize = maxSize;
  }

  /** Push a batch of operations (batch = single user action) */
  push(ops: CellOperation[]): void {
    if (ops.length === 0) return;
    this.undoStack.push(ops);
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    // New edit clears the redo stack
    this.redoStack.length = 0;
  }

  /** Pop the last batch for undo; returns ops to reverse (or null) */
  undo(): CellOperation[] | null {
    const batch = this.undoStack.pop();
    if (!batch) return null;
    this.redoStack.push(batch);
    return batch;
  }

  /** Re-apply the last undone batch */
  redo(): CellOperation[] | null {
    const batch = this.redoStack.pop();
    if (!batch) return null;
    this.undoStack.push(batch);
    return batch;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
