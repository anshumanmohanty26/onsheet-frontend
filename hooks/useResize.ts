import { useCallback, useRef, useState } from "react";
import { GRID } from "@/constants/defaults";

interface ResizeState {
  type: "col" | "row";
  index: number;
  startPos: number;
  startSize: number;
}

interface UseResizeOptions {
  onColumnResize: (col: number, width: number) => void;
  onRowResize: (row: number, height: number) => void;
}

/** Hook for column/row resize via pointer drag on headers. */
export function useResize({ onColumnResize, onRowResize }: UseResizeOptions) {
  const resizeRef = useRef<ResizeState | null>(null);
  const [resizing, setResizing] = useState(false);

  const startColumnResize = useCallback(
    (col: number, startX: number, currentWidth: number) => {
      resizeRef.current = { type: "col", index: col, startPos: startX, startSize: currentWidth };
      setResizing(true);
    },
    [],
  );

  const startRowResize = useCallback(
    (row: number, startY: number, currentHeight: number) => {
      resizeRef.current = { type: "row", index: row, startPos: startY, startSize: currentHeight };
      setResizing(true);
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const r = resizeRef.current;
      if (!r) return;
      if (r.type === "col") {
        const delta = e.clientX - r.startPos;
        const newW = Math.max(GRID.MIN_COL_WIDTH, Math.min(GRID.MAX_COL_WIDTH, r.startSize + delta));
        onColumnResize(r.index, newW);
      } else {
        const delta = e.clientY - r.startPos;
        const newH = Math.max(GRID.MIN_ROW_HEIGHT, Math.min(GRID.MAX_ROW_HEIGHT, r.startSize + delta));
        onRowResize(r.index, newH);
      }
    },
    [onColumnResize, onRowResize],
  );

  const onPointerUp = useCallback(() => {
    resizeRef.current = null;
    setResizing(false);
  }, []);

  return {
    resizing,
    startColumnResize,
    startRowResize,
    onPointerMove,
    onPointerUp,
  };
}
