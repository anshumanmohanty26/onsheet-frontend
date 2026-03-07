import { useCallback, useMemo, useRef, useState } from "react";
import { GRID } from "@/constants/defaults";

interface VirtualRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  /** Total height in px before the first visible row (for offset). */
  offsetTop: number;
  /** Total width in px before the first visible column. */
  offsetLeft: number;
}

interface UseVirtualizationOptions {
  totalRows: number;
  totalCols: number;
  columnWidths: Record<number, number>;
  rowHeights: Record<number, number>;
  viewportWidth: number;
  viewportHeight: number;
}

/** Hook for virtualized grid rendering — calculates visible row/col ranges. */
export function useVirtualization({
  totalRows,
  totalCols,
  columnWidths,
  rowHeights,
  viewportWidth,
  viewportHeight,
}: UseVirtualizationOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const getRowHeight = useCallback(
    (row: number) => rowHeights[row] ?? GRID.DEFAULT_ROW_HEIGHT,
    [rowHeights],
  );

  const getColWidth = useCallback(
    (col: number) => columnWidths[col] ?? GRID.DEFAULT_COL_WIDTH,
    [columnWidths],
  );

  const visibleRange: VirtualRange = useMemo(() => {
    // Rows
    let accY = 0;
    let startRow = 0;
    for (let r = 0; r < totalRows; r++) {
      const h = getRowHeight(r);
      if (accY + h > scrollTop) { startRow = r; break; }
      accY += h;
    }
    const offsetTop = accY;
    let endRow = startRow;
    let accH = 0;
    for (let r = startRow; r < totalRows; r++) {
      accH += getRowHeight(r);
      endRow = r;
      if (accH >= viewportHeight + GRID.DEFAULT_ROW_HEIGHT * 2) break; // overscan
    }

    // Cols
    let accX = 0;
    let startCol = 0;
    for (let c = 0; c < totalCols; c++) {
      const w = getColWidth(c);
      if (accX + w > scrollLeft) { startCol = c; break; }
      accX += w;
    }
    const offsetLeft = accX;
    let endCol = startCol;
    let accW = 0;
    for (let c = startCol; c < totalCols; c++) {
      accW += getColWidth(c);
      endCol = c;
      if (accW >= viewportWidth + GRID.DEFAULT_COL_WIDTH * 2) break;
    }

    return { startRow, endRow, startCol, endCol, offsetTop, offsetLeft };
  }, [scrollTop, scrollLeft, totalRows, totalCols, viewportWidth, viewportHeight, getRowHeight, getColWidth]);

  const totalContentHeight = useMemo(() => {
    let h = 0;
    for (let r = 0; r < totalRows; r++) h += getRowHeight(r);
    return h;
  }, [totalRows, getRowHeight]);

  const totalContentWidth = useMemo(() => {
    let w = 0;
    for (let c = 0; c < totalCols; c++) w += getColWidth(c);
    return w;
  }, [totalCols, getColWidth]);

  const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
  }, []);

  return {
    visibleRange,
    totalContentHeight,
    totalContentWidth,
    scrollTop,
    scrollLeft,
    onScroll,
  };
}
