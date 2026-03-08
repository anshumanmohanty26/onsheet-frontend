"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cellRef } from "@/lib/utils/coordinates";
import { cellInRange } from "@/lib/utils/range";
import { useVirtualization } from "@/hooks/useVirtualization";
import { useResize } from "@/hooks/useResize";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";
import { GRID } from "@/constants/defaults";
import type { CellMap, CellStyle } from "@/types/cell";
import type { CellCoord, SelectionRange } from "@/types/selection";
import type { SpreadsheetState } from "@/types";

interface GridProps {
  cells: CellMap;
  /** Total number of rows in the grid (grows as user scrolls). */
  totalRows?: number;
  /** Total number of columns (default 26). */
  totalCols?: number;
  columnWidths: SpreadsheetState["columnWidths"];
  rowHeights: SpreadsheetState["rowHeights"];
  active: CellCoord | null;
  selection: SelectionRange | null;
  editingRef: string | null;
  editValue: string;
  onCellClick: (coord: CellCoord) => void;
  onCellDoubleClick: (coord: CellCoord) => void;
  onEditChange: (value: string) => void;
  onEditCommit: (value: string, move?: { dr: number; dc: number }) => void;
  onEditCancel: () => void;
  onSelectionDrag: (coord: CellCoord) => void;
  /** Called when user resizes a column. */
  onColumnResize?: (col: number, width: number) => void;
  /** Called when user resizes a row. */
  onRowResize?: (row: number, height: number) => void;
  /** Called with the right-clicked cell coordinate. */
  onContextMenu?: (e: React.MouseEvent, coord: CellCoord) => void;
  /** Called when the user scrolls near the bottom — lets parent extend totalRows. */
  onLoadMore?: () => void;
  /** Show cell borders (default true). */
  showGridlines?: boolean;
  /** Show row/column headers (default true). */
  showHeaders?: boolean;
  /** Zoom percentage 50–200, applied via CSS zoom (default 100). */
  zoom?: number;
  /** Number of leading rows to freeze as sticky (default 0). */
  frozenRows?: number;
  /** Set of cellRef keys (e.g. "A1") that have at least one comment. */
  commentedCells?: Set<string>;
  /** Fired when the user clicks the comment indicator triangle. */
  onCommentClick?: (coord: CellCoord) => void;
}

function applyCellStyle(style?: CellStyle): React.CSSProperties {
  if (!style) return {};
  const hAlign = style.horizontalAlign;
  return {
    fontWeight: style.bold ? "bold" : undefined,
    fontStyle: style.italic ? "italic" : undefined,
    textDecoration:
      [style.underline && "underline", style.strikethrough && "line-through"]
        .filter(Boolean)
        .join(" ") || undefined,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
    // textAlign handles wrapped-text line alignment; justifyContent drives
    // the flex-container positioning so alignment is visually correct.
    textAlign: hAlign,
    justifyContent:
      hAlign === "center" ? "center" : hAlign === "right" ? "flex-end" : "flex-start",
  };
}

function formatDisplay(value: string, numberFormat?: string): string {
  if (!numberFormat || numberFormat === "auto" || numberFormat === "plain") return value;
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  switch (numberFormat) {
    case "number":
      return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    case "currency":
      return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(num);
    case "percent":
      return new Intl.NumberFormat(undefined, { style: "percent", minimumFractionDigits: 0 }).format(
        num / 100,
      );
    default:
      return value;
  }
}

export function Grid({
  cells,
  totalRows = GRID.ROWS,
  totalCols = GRID.COLS,
  columnWidths,
  rowHeights,
  active,
  selection,
  editingRef,
  editValue,
  onCellClick,
  onCellDoubleClick,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onSelectionDrag,
  onColumnResize,
  onRowResize,
  onContextMenu,
  onLoadMore,
  showGridlines = true,
  showHeaders = true,
  zoom = 100,
  frozenRows = 0,
  commentedCells,
  onCommentClick,
}: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // ── Viewport measurement ──────────────────────────────────────────────────
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 500 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setViewportSize({ width: e.contentRect.width, height: e.contentRect.height });
    });
    ro.observe(el);
    setViewportSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // ── Virtualization ────────────────────────────────────────────────────────
  const {
    visibleRange,
    totalContentHeight,
    totalContentWidth,
    onScroll,
    scrollTop,
  } = useVirtualization({
    totalRows,
    totalCols,
    columnWidths,
    rowHeights,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
  });

  const { startRow, endRow, startCol, endCol, offsetTop, offsetLeft } = visibleRange;

  // ── Load-more trigger ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!onLoadMore) return;
    const nearBottom =
      scrollTop + viewportSize.height >= totalContentHeight - GRID.DEFAULT_ROW_HEIGHT * 20;
    if (nearBottom) onLoadMore();
  }, [scrollTop, viewportSize.height, totalContentHeight, onLoadMore]);

  // ── Resize hook ───────────────────────────────────────────────────────────
  const { resizing, startColumnResize, startRowResize, onPointerMove, onPointerUp } =
    useResize({
      onColumnResize: onColumnResize ?? (() => {}),
      onRowResize: onRowResize ?? (() => {}),
    });

  // Attach document-level pointer listeners while a resize is in progress
  useEffect(() => {
    if (!resizing) return;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    };
  }, [resizing, onPointerMove, onPointerUp]);

  // ── Spacer dimensions ─────────────────────────────────────────────────────
  // When frozenRows > 0 start virtual render after the frozen band
  const effectiveStartRow = Math.max(startRow, frozenRows);

  const renderedColsWidth = Array.from(
    { length: endCol - startCol + 1 },
    (_, i) => columnWidths[startCol + i] ?? GRID.DEFAULT_COL_WIDTH,
  ).reduce((a, w) => a + w, 0);

  const rightSpacerWidth = Math.max(0, totalContentWidth - offsetLeft - renderedColsWidth);

  const renderedRowsHeight = Array.from(
    { length: endRow - effectiveStartRow + 1 },
    (_, i) => rowHeights[effectiveStartRow + i] ?? GRID.DEFAULT_ROW_HEIGHT,
  ).reduce((a, h) => a + h, 0);

  // Top spacer must exclude frozen row heights
  const frozenHeight = Array.from({ length: frozenRows }, (_, i) => rowHeights[i] ?? GRID.DEFAULT_ROW_HEIGHT).reduce((a, h) => a + h, 0);
  const effectiveOffsetTop = Math.max(0, offsetTop - frozenHeight);

  const bottomSpacerHeight = Math.max(0, totalContentHeight - frozenHeight - effectiveOffsetTop - renderedRowsHeight);

  // ── Selection helpers ─────────────────────────────────────────────────────
  const isSelected = useCallback(
    (row: number, col: number) => (selection ? cellInRange({ row, col }, selection) : false),
    [selection],
  );

  // ── Empty handlers for header selects (future: select full col/row) ───────
  const noop = useCallback(() => {}, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto relative select-none"
      onScroll={onScroll}
      onMouseLeave={() => { isDragging.current = false; }}
      style={zoom !== 100 ? { zoom: zoom / 100 } : undefined}
    >
      <table
        className="border-collapse table-fixed"
        style={{ userSelect: "none" }}
      >
        {/* column headers */}
        {showHeaders && (
        <thead>
          <tr>
            <th
              className="sticky top-0 left-0 z-20 bg-gray-100 border border-gray-300"
              style={{ width: GRID.ROW_HEADER_WIDTH, minWidth: GRID.ROW_HEADER_WIDTH }}
            />
            {offsetLeft > 0 && (
              <th aria-hidden style={{ width: offsetLeft, minWidth: offsetLeft, padding: 0, border: "none" }} />
            )}
            {Array.from({ length: endCol - startCol + 1 }, (_, i) => {
              const ci = startCol + i;
              return (
                <ColumnHeader key={ci} col={ci} width={columnWidths[ci] ?? GRID.DEFAULT_COL_WIDTH} onResizeStart={startColumnResize} onColumnSelect={noop} />
              );
            })}
            {rightSpacerWidth > 0 && (
              <th aria-hidden style={{ width: rightSpacerWidth, padding: 0, border: "none" }} />
            )}
          </tr>
        </thead>
        )}

        <tbody>
          {/* Frozen rows */}
          {frozenRows > 0 && Array.from({ length: frozenRows }, (_, ri) => {
            const row = ri;
            const rowH = rowHeights[row] ?? GRID.DEFAULT_ROW_HEIGHT;
            const stickyTop = showHeaders ? GRID.DEFAULT_ROW_HEIGHT : 0;
            return (
              <tr key={`frozen-${row}`} style={{ height: rowH, position: "sticky", top: stickyTop, zIndex: 7 }}>
                {showHeaders && <RowHeader row={row} height={rowH} onResizeStart={startRowResize} onRowSelect={noop} />}
                {offsetLeft > 0 && <td aria-hidden style={{ width: offsetLeft, minWidth: offsetLeft, padding: 0, border: "none" }} />}
                {Array.from({ length: endCol - startCol + 1 }, (_, ci) => {
                  const col = startCol + ci;
                  const w = columnWidths[col] ?? GRID.DEFAULT_COL_WIDTH;
                  const ref = cellRef(row, col);
                  const cell = cells[ref];
                  const isActiveCell = active?.row === row && active?.col === col;
                  const isEdit = editingRef === ref;
                  const activeAndEditing = isActiveCell && editingRef !== null;
                  const selected = isSelected(row, col);
                  const display = activeAndEditing ? editValue : formatDisplay(cell?.computed ?? cell?.raw ?? "", cell?.style?.numberFormat);
                  return (
                    <td key={col}
                      className={[showGridlines ? "border border-gray-200" : "border border-transparent", "p-0 overflow-hidden relative bg-amber-50/60", isActiveCell ? "outline outline-2 outline-emerald-500 outline-offset-[-1px] z-10" : "", selected && !isActiveCell ? "bg-emerald-50" : ""].filter(Boolean).join(" ")}
                      style={{ width: w, maxWidth: w, cursor: "cell", backgroundColor: cell?.style?.backgroundColor }}
                      onMouseDown={(e) => { if (e.button !== 0) return; isDragging.current = true; onCellClick({ row, col }); }}
                      onMouseEnter={() => { if (isDragging.current) onSelectionDrag({ row, col }); }}
                      onMouseUp={() => { isDragging.current = false; }}
                      onDoubleClick={() => onCellDoubleClick({ row, col })}
                      onContextMenu={onContextMenu ? (e) => onContextMenu(e, { row, col }) : undefined}
                    >
                      {isEdit ? (
                        <input className="absolute inset-0 w-full h-full px-1 text-sm text-gray-900 outline-none bg-white z-20" value={editValue} onChange={(e) => onEditChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEditCommit(editValue, { dr: 1, dc: 0 }); } else if (e.key === "Tab") { e.preventDefault(); onEditCommit(editValue, { dr: 0, dc: e.shiftKey ? -1 : 1 }); } else if (e.key === "Escape") { onEditCancel(); } }} onBlur={() => onEditCommit(editValue)} autoFocus spellCheck={false} />
                      ) : (
                        <div
                          className={`px-1 text-sm text-gray-800 h-full flex ${
                            cell?.style?.wrapText
                              ? "items-start whitespace-pre-wrap break-words overflow-auto"
                              : "items-center truncate"
                          }`}
                          style={applyCellStyle(cell?.style)}
                        >{display}</div>
                      )}
                      {commentedCells?.has(ref) && (
                        <button
                          className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-t-orange-400 border-l-[8px] border-l-transparent cursor-pointer z-[5] hover:border-t-orange-500"
                          title="View comments"
                          onClick={(e) => { e.stopPropagation(); onCommentClick?.({ row, col }); }}
                        />
                      )}
                    </td>
                  );
                })}
                {rightSpacerWidth > 0 && <td aria-hidden style={{ width: rightSpacerWidth, padding: 0, border: "none" }} />}
              </tr>
            );
          })}

          {/* Top spacer */}
          {effectiveOffsetTop > 0 && (
            <tr style={{ height: effectiveOffsetTop }}>
              <td aria-hidden colSpan={endCol - startCol + 4} style={{ padding: 0, border: "none" }} />
            </tr>
          )}

          {/* Visible rows */}
          {Array.from({ length: endRow - effectiveStartRow + 1 }, (_, ri) => {
            const row = effectiveStartRow + ri;
            const rowH = rowHeights[row] ?? GRID.DEFAULT_ROW_HEIGHT;
            return (
              <tr key={row} style={{ height: rowH }}>
                {showHeaders && (
                  <RowHeader row={row} height={rowH} onResizeStart={startRowResize} onRowSelect={noop} />
                )}

                {/* Left col spacer */}
                {offsetLeft > 0 && (
                  <td
                    aria-hidden
                    style={{ width: offsetLeft, minWidth: offsetLeft, padding: 0, border: "none" }}
                  />
                )}

                {/* Visible cells */}
                {Array.from({ length: endCol - startCol + 1 }, (_, ci) => {
                  const col = startCol + ci;
                  const w = columnWidths[col] ?? GRID.DEFAULT_COL_WIDTH;
                  const ref = cellRef(row, col);
                  const isEdit = editingRef === ref;
                  const isActiveCell = active?.row === row && active?.col === col;
                  const activeAndEditing = isActiveCell && editingRef !== null;
                  const selected = isSelected(row, col);
                  const cell = cells[ref];
                  const display = activeAndEditing
                    ? editValue
                    : formatDisplay(cell?.computed ?? cell?.raw ?? "", cell?.style?.numberFormat);

                  return (
                    <td
                      key={col}
                      className={[
                        showGridlines ? "border border-gray-200" : "border border-transparent",
                        "p-0 overflow-hidden relative",
                        isActiveCell
                          ? "outline outline-2 outline-emerald-500 outline-offset-[-1px] z-10"
                          : "",
                        selected && !isActiveCell ? "bg-emerald-50" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ width: w, maxWidth: w, cursor: "cell", backgroundColor: cell?.style?.backgroundColor }}
                      onMouseDown={(e) => {
                        if (e.button !== 0) return;
                        isDragging.current = true;
                        onCellClick({ row, col });
                      }}
                      onMouseEnter={() => {
                        if (isDragging.current) onSelectionDrag({ row, col });
                      }}
                      onMouseUp={() => { isDragging.current = false; }}
                      onDoubleClick={() => onCellDoubleClick({ row, col })}
                      onContextMenu={
                        onContextMenu ? (e) => onContextMenu(e, { row, col }) : undefined
                      }
                    >
                      {isEdit ? (
                        <input
                          className="absolute inset-0 w-full h-full px-1 text-sm text-gray-900 outline-none bg-white z-20"
                          value={editValue}
                          onChange={(e) => onEditChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              onEditCommit(editValue, { dr: 1, dc: 0 });
                            } else if (e.key === "Tab") {
                              e.preventDefault();
                              onEditCommit(editValue, { dr: 0, dc: e.shiftKey ? -1 : 1 });
                            } else if (e.key === "Escape") {
                              onEditCancel();
                            }
                          }}
                          onBlur={() => onEditCommit(editValue)}
                          autoFocus
                          spellCheck={false}
                        />
                      ) : (
                        <div
                          className={`px-1 text-sm text-gray-800 h-full flex ${
                            cell?.style?.wrapText
                              ? "items-start whitespace-pre-wrap break-words overflow-auto"
                              : "items-center truncate"
                          }`}
                          style={applyCellStyle(cell?.style)}
                        >
                          {display}
                        </div>
                      )}
                      {commentedCells?.has(ref) && (
                        <button
                          className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-t-orange-400 border-l-[8px] border-l-transparent cursor-pointer z-[5] hover:border-t-orange-500"
                          title="View comments"
                          onClick={(e) => { e.stopPropagation(); onCommentClick?.({ row, col }); }}
                        />
                      )}
                    </td>
                  );
                })}

                {/* Right col spacer */}
                {rightSpacerWidth > 0 && (
                  <td
                    aria-hidden
                    style={{ width: rightSpacerWidth, padding: 0, border: "none" }}
                  />
                )}
              </tr>
            );
          })}

          {/* Bottom spacer */}
          {bottomSpacerHeight > 0 && (
            <tr style={{ height: bottomSpacerHeight }}>
              <td
                aria-hidden
                colSpan={endCol - startCol + 4}
                style={{ padding: 0, border: "none" }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
