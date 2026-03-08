"use client";

import { use, useCallback, useEffect, useReducer, useRef, useState } from "react";

import { FormulaBar } from "@/components/formulabar/FormulaBar";
import { Grid } from "@/components/grid/Grid";
import { AiPanel } from "@/components/header/AiPanel";
import { Header } from "@/components/header/Header";
import { MenuBar } from "@/components/header/MenuBar";
import { SheetTabs } from "@/components/sheet-tabs/SheetTabs";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { CommentModal } from "@/components/ui/CommentModal";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { FindReplaceModal } from "@/components/ui/FindReplaceModal";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { VersionHistoryModal } from "@/components/ui/VersionHistoryModal";
import { GRID } from "@/constants/defaults";
import { useClipboard } from "@/hooks/useClipboard";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useDataActions } from "@/hooks/useDataActions";
import { useFileActions } from "@/hooks/useFileActions";
import { useFormatActions } from "@/hooks/useFormatActions";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useSelection } from "@/hooks/useSelection";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useToolsActions } from "@/hooks/useToolsActions";
import { useViewOptions } from "@/hooks/useViewOptions";
import { isFormula } from "@/lib/cell/validator";
import { evaluate } from "@/lib/formula/evaluator";
import { consumePendingImport } from "@/lib/import/pendingImport";
import { cellRef, parseCellRef } from "@/lib/utils/coordinates";
import type { AgentAction } from "@/services/aiService";
import { cellService } from "@/services/cellService";
import { commentService } from "@/services/commentService";
import { initialUIState, uiReducer } from "@/store";
import type { CellStyle } from "@/types/cell";
import type { CellCoord } from "@/types/selection";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SheetPage({ params }: PageProps) {
  const { id: workbookId } = use(params);
  // Capture the initial ?tab= once at mount — avoids re-renders from useSearchParams
  const initialTabRef = useRef(
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null,
  );

  const {
    state,
    dispatch: spreadsheetDispatch,
    loadWorkbook,
    switchSheet,
    addSheet,
    deleteSheet,
    renameWorkbook,
  } = useSpreadsheet();

  // canEdit: owner and editors can edit; viewers/commenters cannot
  const canEdit = !state.myRole || state.myRole === "OWNER" || state.myRole === "EDITOR";

  const { collab, setCellCrdt, undo, redo, broadcastCursor, loadIntoCrdt } = useCollaboration({
    sheetId: state.activeSheetId,
    workbookId: state.workbookId,
    spreadsheetDispatch,
  });

  const { selection: sel, setActive, setRange } = useSelection();
  const [ui, uiDispatch] = useReducer(uiReducer, initialUIState);
  const [editingRef, setEditingRef] = useState<string | null>(null);
  // Ref-based mirror of editingRef so commitEdit always reads the correct
  // editing cell synchronously, even after React has re-rendered sel.active
  // to a new cell (e.g. when the user clicks another cell while editing).
  const editingCellRef = useRef<string | null>(null);
  // Ref-based mirror of ui.formulaBarValue — always holds the latest typed
  // value synchronously so handlers that dismiss the editor can commit it
  // without relying on onBlur (which doesn't fire reliably on unmount).
  const formulaValueRef = useRef<string>("");
  formulaValueRef.current = ui.formulaBarValue;
  const [totalRows, setTotalRows] = useState<number>(GRID.ROWS);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    loadWorkbook(workbookId, initialTabRef.current);
  }, [workbookId, loadWorkbook]);

  // Optimistic import: if the dashboard stashed parsed data, render it instantly
  // then persist to DB in the background.
  const pendingHandled = useRef(false);
  useEffect(() => {
    if (state.loading || !state.activeSheetId || pendingHandled.current) return;
    const pending = consumePendingImport(workbookId);
    if (!pending) return;
    pendingHandled.current = true;
    // Instantly render the imported cells
    spreadsheetDispatch({ type: "IMPORT_CELLS", cells: pending.cellsForStore });
    // Persist in the background — user already sees the data
    cellService.bulkImport(pending.sheetId, pending.cellsForApi).catch(() => {
      /* persistence failed — cells are visible but not saved; a reload will retry */
    });
  }, [state.loading, state.activeSheetId, workbookId, spreadsheetDispatch]);

  // Once the sheet finishes loading (loading goes false), populate the CRDT doc
  // with the freshly-fetched cells so undo correctly reverts to the prior DB value
  // rather than reverting to an empty string.
  useEffect(() => {
    if (state.loading || !state.activeSheetId) return;
    loadIntoCrdt(
      Object.entries(state.cells).map(([ref, data]) => ({
        ref,
        raw: data.raw,
        style: data.style,
        timestamp: 0,
        peerId: "__initial__",
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.loading, state.activeSheetId, loadIntoCrdt]); // state.cells intentionally omitted

  useEffect(() => {
    // Do not overwrite the formula bar while the user is actively editing —
    // doing so would discard in-progress keystrokes.
    if (editingCellRef.current) return;
    if (!sel.active) {
      uiDispatch({ type: "SET_FORMULA_BAR", value: "" });
      return;
    }
    const cell = state.cells[cellRef(sel.active.row, sel.active.col)];
    uiDispatch({ type: "SET_FORMULA_BAR", value: cell?.raw ?? "" });
  }, [sel.active, state.cells]);

  useEffect(() => {
    if (!sel.active) return;
    broadcastCursor(cellRef(sel.active.row, sel.active.col));
  }, [sel.active, broadcastCursor]);

  // ── Cell interaction ──────────────────────────────────────────────────────

  const startEditAt = useCallback(
    (coord: CellCoord, char?: string) => {
      setActive(coord);
      const ref = cellRef(coord.row, coord.col);
      // If already editing this exact cell (e.g. user double-clicked while
      // in edit mode), do NOT reset formulaBarValue — that would wipe unsaved
      // typing. Just ensure the ref is current so the input stays mounted.
      if (editingCellRef.current === ref) return;
      editingCellRef.current = ref; // sync ref before React state update
      setEditingRef(ref);
      uiDispatch({ type: "SET_EDITING", editing: true });
      uiDispatch({
        type: "SET_FORMULA_BAR",
        value: char !== undefined ? char : (state.cells[ref]?.raw ?? ""),
      });
    },
    [state.cells],
  );

  const commitEdit = useCallback(
    (value: string, move?: { dr: number; dc: number }) => {
      // Use the ref-based editing cell — this is always correct even when
      // sel.active has already moved to a new cell (e.g. fired from onBlur
      // after React re-rendered due to a handleCellClick calling setActive).
      const ref = editingCellRef.current;
      if (!ref) return; // no active edit, or already committed (double-commit guard)
      editingCellRef.current = null; // clear immediately — prevents re-entry from blur
      setEditingRef(null);
      uiDispatch({ type: "SET_EDITING", editing: false });
      const parsed = parseCellRef(ref);
      if (!parsed) return;
      // Only write to the CRDT if the value actually changed. If the user
      // entered edit mode and immediately left (e.g. clicked a toolbar button
      // without typing), skipping the write prevents a spurious CRDT update
      // that would temporarily wipe the cell's style and cause a toolbar flash
      // (e.g. font-size bouncing back to the default before the toolbar action
      // is processed).
      if (value !== (state.cells[ref]?.raw ?? "")) {
        const computed = isFormula(value) ? String(evaluate(value.slice(1), state.cells)) : value;
        setCellCrdt(ref, value, state.cells[ref]?.style, computed);
      }
      uiDispatch({ type: "SET_FORMULA_BAR", value });
      if (move) {
        setActive({
          row: Math.max(0, parsed.row + move.dr),
          col: Math.max(0, parsed.col + move.dc),
        });
      }
    },
    [state.cells, setCellCrdt, setActive],
  );

  const cancelEdit = useCallback(() => {
    editingCellRef.current = null;
    setEditingRef(null);
    uiDispatch({ type: "SET_EDITING", editing: false });
    if (sel.active) {
      const cell = state.cells[cellRef(sel.active.row, sel.active.col)];
      uiDispatch({ type: "SET_FORMULA_BAR", value: cell?.raw ?? "" });
    }
  }, [sel.active, state.cells]);

  const handleCellClick = useCallback(
    (coord: CellCoord, shiftKey: boolean) => {
      if (!shiftKey && sel.active?.row === coord.row && sel.active?.col === coord.col) {
        // Same cell clicked — if already editing, let the browser handle cursor
        // repositioning on the focused input naturally.
        // If selected but NOT editing, do nothing here; use double-click or a
        // printable key to enter edit mode. Entering edit on mousedown races with
        // the upcoming dblclick event and prevents proper word-selection.
        return;
      }
      // Explicitly commit any in-progress edit. We cannot rely on onBlur
      // because React may unmount the input before the blur event fires.
      if (editingCellRef.current) commitEdit(formulaValueRef.current);
      if (shiftKey && sel.active) {
        // Extend selection — keep anchor, move end
        setRange({ start: sel.active, end: coord });
      } else {
        setActive(coord);
        const cell = state.cells[cellRef(coord.row, coord.col)];
        uiDispatch({ type: "SET_FORMULA_BAR", value: cell?.raw ?? "" });
      }
    },
    [sel.active, state.cells, setRange, setActive, commitEdit],
  );

  const handleColumnSelect = useCallback(
    (col: number, shiftKey: boolean) => {
      if (editingCellRef.current) commitEdit(formulaValueRef.current);
      if (shiftKey && sel.active) {
        setRange({ start: { row: 0, col: sel.active.col }, end: { row: totalRows - 1, col } });
      } else {
        setActive({ row: 0, col });
        setRange({ start: { row: 0, col }, end: { row: totalRows - 1, col } });
      }
    },
    [sel.active, totalRows, setActive, setRange, commitEdit],
  );

  const handleRowSelect = useCallback(
    (row: number, shiftKey: boolean) => {
      if (editingCellRef.current) commitEdit(formulaValueRef.current);
      if (shiftKey && sel.active) {
        setRange({ start: { row: sel.active.row, col: 0 }, end: { row, col: GRID.COLS - 1 } });
      } else {
        setActive({ row, col: 0 });
        setRange({ start: { row, col: 0 }, end: { row, col: GRID.COLS - 1 } });
      }
    },
    [sel.active, setActive, setRange, commitEdit],
  );

  const handleSelectionDrag = useCallback(
    (coord: CellCoord) => {
      if (!sel.active) return;
      setRange({ start: sel.active, end: coord });
    },
    [sel.active, setRange],
  );

  const handleStyleChange = useCallback(
    (change: Partial<CellStyle>) => {
      if (!sel.active) return;
      const range = sel.range ?? { start: sel.active, end: sel.active };
      const rowStart = Math.min(range.start.row, range.end.row);
      const rowEnd = Math.max(range.start.row, range.end.row);
      const colStart = Math.min(range.start.col, range.end.col);
      const colEnd = Math.max(range.start.col, range.end.col);
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const ref = cellRef(r, c);
          const cell = state.cells[ref];
          // Preserve the existing computed (formula result) so style changes
          // don't accidentally regress formula cells to showing raw formula text.
          setCellCrdt(ref, cell?.raw ?? "", { ...(cell?.style ?? {}), ...change }, cell?.computed);
        }
      }
    },
    [sel.active, sel.range, state.cells, setCellCrdt],
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeStyle = sel.active
    ? state.cells[cellRef(sel.active.row, sel.active.col)]?.style
    : undefined;

  // ── Feature hooks ─────────────────────────────────────────────────────────

  const view = useViewOptions();

  const file = useFileActions({
    cells: state.cells,
    workbookTitle: state.workbookTitle,
    totalRows,
    activeSheetId: state.activeSheetId,
    onImportCells: (imported) => spreadsheetDispatch({ type: "IMPORT_CELLS", cells: imported }),
  });

  const format = useFormatActions({
    active: sel.active,
    cells: state.cells,
    activeStyle,
    handleStyleChange,
    setCellCrdt,
  });

  const data = useDataActions({ active: sel.active, dispatch: spreadsheetDispatch });

  const navigateToCell = useCallback((coord: CellCoord) => setActive(coord), [setActive]);

  const tools = useToolsActions({
    cells: state.cells,
    setCellCrdt,
    onNavigate: navigateToCell,
  });

  // ── Clipboard ─────────────────────────────────────────────────────────────

  const { copy, cut, paste } = useClipboard({
    cells: state.cells,
    selection: sel.range,
    onPaste: (ref, d) => setCellCrdt(ref, d.raw ?? "", d.style),
    onClear: (ref) => setCellCrdt(ref, "", state.cells[ref]?.style),
  });

  // ── Context menu ──────────────────────────────────────────────────────────

  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, coord: CellCoord) => {
      // If right-clicking the cell currently being edited, just show the menu
      // without calling setActive — that would change sel.active's reference,
      // triggering the formula-bar sync effect and wiping the in-progress value.
      const editingThisCell =
        editingCellRef.current === cellRef(coord.row, coord.col);
      if (!editingThisCell) {
        if (editingCellRef.current) commitEdit(formulaValueRef.current);
        setActive(coord);
      }
      openContextMenu(e);
    },
    [openContextMenu, setActive, commitEdit],
  );

  // ── Resize / load-more ────────────────────────────────────────────────────

  const handleColumnResize = useCallback(
    (col: number, width: number) => spreadsheetDispatch({ type: "SET_COLUMN_WIDTH", col, width }),
    [spreadsheetDispatch],
  );

  const handleRowResize = useCallback(
    (row: number, height: number) => spreadsheetDispatch({ type: "SET_ROW_HEIGHT", row, height }),
    [spreadsheetDispatch],
  );

  const handleLoadMore = useCallback(() => setTotalRows((r) => r + 1000), []);

  // ── Sheet tabs ────────────────────────────────────────────────────────────

  const handleAddSheet = useCallback(async () => {
    await addSheet(`Sheet${state.sheets.length + 1}`);
  }, [state.sheets.length, addSheet]);

  const handleSwitchSheet = useCallback(
    async (id: string) => {
      window.history.replaceState(null, "", `/sheet/${workbookId}?tab=${id}`);
      await switchSheet(id);
    },
    [switchSheet, workbookId],
  );

  // ── Keyboard shortcuts + modal ────────────────────────────────────────────

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [commentCell, setCommentCell] = useState<{ row: number; col: number } | null>(null);
  const [commentedCells, setCommentedCells] = useState<Set<string>>(new Set());

  // Fetch which cells have comments whenever the active sheet changes
  const refreshComments = useCallback(() => {
    if (!state.activeSheetId) return;
    commentService
      .list(state.activeSheetId)
      .then((comments) => {
        const refs = new Set(comments.map((c) => cellRef(c.row, c.col)));
        setCommentedCells(refs);
      })
      .catch(() => {});
  }, [state.activeSheetId]);

  useEffect(() => {
    refreshComments();
  }, [refreshComments]);

  // ── AI action handler ───────────────────────────────────────────────────

  const handleAiActions = useCallback(
    (actions: AgentAction[]) => {
      for (const action of actions) {
        if ((action.type === "SET_CELLS" || action.type === "DELETE_CELLS") && action.cells) {
          for (const [ref, data] of Object.entries(action.cells)) {
            const parsed = parseCellRef(ref);
            if (!parsed) continue;
            const existing = state.cells[ref];
            setCellCrdt(ref, data.raw, existing?.style, data.raw);
          }
        }
        if (action.type === "ADD_COMMENT") {
          refreshComments();
        }
      }
    },
    [state.cells, setCellCrdt, refreshComments],
  );

  useKeyboard({
    active: sel.active,
    isEditing: ui.isEditingCell,
    onNavigate: (dr, dc) => {
      if (!sel.active) return;
      setActive({
        row: Math.max(0, sel.active.row + dr),
        col: Math.max(0, sel.active.col + dc),
      });
    },
    onStartEdit: (char) => {
      if (canEdit && sel.active) startEditAt(sel.active, char);
    },
    onCommit: () => commitEdit(ui.formulaBarValue),
    onCancel: cancelEdit,
    onDelete: () => {
      if (!canEdit || !sel.active) return;
      const range = sel.range ?? { start: sel.active, end: sel.active };
      const rowStart = Math.min(range.start.row, range.end.row);
      const rowEnd = Math.max(range.start.row, range.end.row);
      const colStart = Math.min(range.start.col, range.end.col);
      const colEnd = Math.max(range.start.col, range.end.col);
      for (let r = rowStart; r <= rowEnd; r++) {
        for (let c = colStart; c <= colEnd; c++) {
          const ref = cellRef(r, c);
          setCellCrdt(ref, "", state.cells[ref]?.style);
        }
      }
      uiDispatch({ type: "SET_FORMULA_BAR", value: "" });
    },
    onUndo: undo,
    onRedo: redo,
    onCopy: () => copy(),
    onCut: () => cut(),
    onPaste: () => {
      if (sel.active) paste(sel.active.row, sel.active.col);
    },
    onBold: () => handleStyleChange({ bold: !activeStyle?.bold }),
    onItalic: () => handleStyleChange({ italic: !activeStyle?.italic }),
    onUnderline: () => handleStyleChange({ underline: !activeStyle?.underline }),
    onFindReplace: tools.openFindReplace,
  });

  // ── Render ────────────────────────────────────────────────────────────────

  if (state.error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-red-500 text-sm">
        {state.error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <Header
        title={state.workbookTitle}
        workbookId={state.workbookId}
        onRename={renameWorkbook}
        onAiToggle={() => setShowAiPanel((v) => !v)}
        aiOpen={showAiPanel}
      />

      <MenuBar
        onUndo={undo}
        onRedo={redo}
        onCut={() => cut()}
        onCopy={() => copy()}
        onPaste={() => {
          if (sel.active) paste(sel.active.row, sel.active.col);
        }}
        onImport={file.triggerImport}
        onExport={file.handleExport}
        onShare={file.handleShare}
        onVersionHistory={() => setShowVersionHistory(true)}
        onInsertRowAbove={data.handleInsertRowAbove}
        onInsertRowBelow={data.handleInsertRowBelow}
        onInsertColLeft={data.handleInsertColLeft}
        onInsertColRight={data.handleInsertColRight}
        onInsertComment={() => {
          if (sel.active) setCommentCell({ row: sel.active.row, col: sel.active.col });
        }}
        onSortAsc={data.handleSortAsc}
        onSortDesc={data.handleSortDesc}
        onDeleteRow={data.handleDeleteRow}
        onDeleteCol={data.handleDeleteCol}
        onRemoveDuplicates={data.handleRemoveDuplicates}
        showGridlines={view.showGridlines}
        onToggleGridlines={view.toggleGridlines}
        showFormulaBar={view.showFormulaBar}
        onToggleFormulaBar={view.toggleFormulaBar}
        showHeaders={view.showHeaders}
        onToggleHeaders={view.toggleHeaders}
        zoom={view.zoom}
        onZoomIn={view.zoomIn}
        onZoomOut={view.zoomOut}
        onZoomReset={view.zoomReset}
        frozenRows={view.frozenRows}
        onFreezeFirstRow={view.freezeFirstRow}
        onUnfreeze={view.unfreeze}
        onBold={() => handleStyleChange({ bold: !activeStyle?.bold })}
        onItalic={() => handleStyleChange({ italic: !activeStyle?.italic })}
        onUnderline={() => handleStyleChange({ underline: !activeStyle?.underline })}
        onStrikethrough={format.handleStrikethrough}
        onAlignLeft={format.handleAlignLeft}
        onAlignCenter={format.handleAlignCenter}
        onAlignRight={format.handleAlignRight}
        onWrapText={() => handleStyleChange({ wrapText: !activeStyle?.wrapText })}
        wrapText={!!activeStyle?.wrapText}
        onClearFormatting={format.handleClearFormatting}
        onFormatNumber={format.handleFormatNumber}
        onFindReplace={tools.openFindReplace}
        onCellStats={tools.handleCellStats}
        onTrimWhitespace={() => {
          if (!sel.active) return;
          const range = sel.range ?? { start: sel.active, end: sel.active };
          const rowStart = Math.min(range.start.row, range.end.row);
          const rowEnd = Math.max(range.start.row, range.end.row);
          const colStart = Math.min(range.start.col, range.end.col);
          const colEnd = Math.max(range.start.col, range.end.col);
          for (let r = rowStart; r <= rowEnd; r++) {
            for (let c = colStart; c <= colEnd; c++) {
              const ref = cellRef(r, c);
              const cell = state.cells[ref];
              if (!cell?.raw) continue;
              const trimmed = cell.raw.trim();
              if (trimmed !== cell.raw) setCellCrdt(ref, trimmed, cell.style, cell.computed);
            }
          }
        }}
        onShowShortcuts={() => setShowShortcuts(true)}
      />

      <Toolbar style={activeStyle} onStyleChange={handleStyleChange} onUndo={undo} onRedo={redo} />

      {/* Split layout: sheet area + optional AI panel side-by-side */}
      <div className="flex flex-1 min-h-0">
        {/* Sheet area */}
        <div className="flex flex-col flex-1 min-w-0">
          {view.showFormulaBar && (
            <FormulaBar
              active={sel.active}
              value={ui.formulaBarValue}
              onChange={(v) => uiDispatch({ type: "SET_FORMULA_BAR", value: v })}
              onCommit={(v) => commitEdit(v)}
              onCancel={cancelEdit}
              onFocus={() => {
                if (sel.active && !ui.isEditingCell) {
                  const fbRef = cellRef(sel.active.row, sel.active.col);
                  editingCellRef.current = fbRef;
                  setEditingRef(fbRef);
                  uiDispatch({ type: "SET_EDITING", editing: true });
                }
              }}
            />
          )}

          {state.loading ? (
            <div className="flex flex-1 items-center justify-center text-gray-400 text-sm gap-2">
              <span className="size-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              Loading sheet…
            </div>
          ) : (
            <Grid
              cells={state.cells}
              totalRows={totalRows}
              totalCols={GRID.COLS}
              columnWidths={state.columnWidths}
              rowHeights={state.rowHeights}
              active={sel.active}
              selection={sel.range}
              editingRef={editingRef}
              editValue={ui.formulaBarValue}
              onCellClick={handleCellClick}
              onCellDoubleClick={(coord) => {
                if (!canEdit) return;
                startEditAt(coord);
              }}
              onEditChange={(v) => uiDispatch({ type: "SET_FORMULA_BAR", value: v })}
              onEditCommit={commitEdit}
              onEditCancel={cancelEdit}
              onSelectionDrag={handleSelectionDrag}
              onColumnResize={handleColumnResize}
              onRowResize={handleRowResize}
              onColumnSelect={handleColumnSelect}
              onRowSelect={handleRowSelect}
              onContextMenu={handleContextMenu}
              onLoadMore={handleLoadMore}
              showGridlines={view.showGridlines}
              showHeaders={view.showHeaders}
              zoom={view.zoom}
              frozenRows={view.frozenRows}
              commentedCells={commentedCells}
              onCommentClick={(coord) => setCommentCell({ row: coord.row, col: coord.col })}
            />
          )}

          <SheetTabs
            sheets={state.sheets}
            activeSheetId={state.activeSheetId}
            onSelect={handleSwitchSheet}
            onAddSheet={handleAddSheet}
            onDeleteSheet={deleteSheet}
            canEdit={canEdit}
          />

          {/* Collab connection indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-400 shrink-0">
            <span
              className={`size-1.5 rounded-full ${collab.connected ? "bg-emerald-400" : "bg-red-400"}`}
            />
            {collab.connected ? "Live" : "Offline"}
            {collab.users.length > 0 && (
              <span className="ml-2 text-gray-400">
                · {collab.users.length} other{collab.users.length > 1 ? "s" : ""} editing
              </span>
            )}
          </div>
        </div>

        {/* AI sidebar — inline split, not overlaid */}
        {showAiPanel && (
          <AiPanel
            sheetId={state.activeSheetId}
            onClose={() => setShowAiPanel(false)}
            onActions={handleAiActions}
          />
        )}
      </div>

      <ContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={closeContextMenu}
        items={[
          { label: "Cut", shortcut: "⌘X", onClick: () => cut() },
          { label: "Copy", shortcut: "⌘C", onClick: () => copy() },
          {
            label: "Paste",
            shortcut: "⌘V",
            onClick: () => {
              if (sel.active) paste(sel.active.row, sel.active.col);
            },
          },
          { label: "", divider: true, onClick: () => {} },
          { label: "Insert row above", onClick: data.handleInsertRowAbove, disabled: !sel.active },
          { label: "Insert row below", onClick: data.handleInsertRowBelow, disabled: !sel.active },
          { label: "Delete row", onClick: data.handleDeleteRow, disabled: !sel.active },
          { label: "", divider: true, onClick: () => {} },
          {
            label: "Insert comment",
            onClick: () => {
              if (sel.active) setCommentCell({ row: sel.active.row, col: sel.active.col });
            },
            disabled: !sel.active,
          },
          { label: "", divider: true, onClick: () => {} },
          {
            label: "Clear contents",
            shortcut: "Del",
            onClick: () => {
              if (!canEdit || !sel.active) return;
              const range = sel.range ?? { start: sel.active, end: sel.active };
              const rowStart = Math.min(range.start.row, range.end.row);
              const rowEnd = Math.max(range.start.row, range.end.row);
              const colStart = Math.min(range.start.col, range.end.col);
              const colEnd = Math.max(range.start.col, range.end.col);
              for (let r = rowStart; r <= rowEnd; r++) {
                for (let c = colStart; c <= colEnd; c++) {
                  const ref = cellRef(r, c);
                  setCellCrdt(ref, "", state.cells[ref]?.style);
                }
              }
              uiDispatch({ type: "SET_FORMULA_BAR", value: "" });
            },
          },
        ]}
      />

      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {commentCell && state.activeSheetId && (
        <CommentModal
          sheetId={state.activeSheetId}
          row={commentCell.row}
          col={commentCell.col}
          onClose={() => {
            setCommentCell(null);
            refreshComments();
          }}
        />
      )}

      {showVersionHistory && state.workbookId && state.activeSheetId && (
        <VersionHistoryModal
          workbookId={state.workbookId}
          sheetId={state.activeSheetId}
          onClose={() => setShowVersionHistory(false)}
          onRestored={() => loadWorkbook(workbookId, state.activeSheetId)}
        />
      )}

      {tools.showFindReplace && (
        <FindReplaceModal
          cells={state.cells}
          onClose={tools.closeFindReplace}
          onNavigate={tools.handleFindReplaceNavigate}
          onReplace={tools.handleFindReplaceReplace}
          onReplaceAll={tools.handleFindReplaceAll}
        />
      )}

      {file.shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none animate-slide-up">
          Share link copied to clipboard
        </div>
      )}

      {tools.statsToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg pointer-events-none animate-slide-up">
          {tools.statsToast}
        </div>
      )}
    </div>
  );
}
