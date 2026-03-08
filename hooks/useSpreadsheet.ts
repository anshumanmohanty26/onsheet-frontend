import { parseCellRef } from "@/lib/utils/coordinates";
import { debounce } from "@/lib/utils/debounce";
import { cellService } from "@/services/cellService";
import { workbookService } from "@/services/workbookService";
import { initialSpreadsheetState, spreadsheetReducer } from "@/store/spreadsheetStore";
import type { CellData, CellStyle } from "@/types/cell";
import { useCallback, useReducer, useRef } from "react";

export function useSpreadsheet() {
  const [state, dispatch] = useReducer(spreadsheetReducer, initialSpreadsheetState);

  // Stable ref so loadSheet (empty deps) can read current state without stale closure
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Load a workbook by ID — used on initial page load with workbook-based URLs */
  const loadWorkbook = useCallback(async (workbookId: string, tabSheetId?: string | null) => {
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const wb = await workbookService.get(workbookId);
      const sheets = wb.sheets ?? [];
      if (!sheets.length) throw new Error("This workbook has no sheets.");
      const targetId =
        tabSheetId && sheets.find((s) => s.id === tabSheetId) ? tabSheetId : sheets[0].id;
      dispatch({
        type: "INIT_SHEET",
        workbookId: wb.id,
        workbookName: wb.name,
        myRole: wb.myRole,
        sheets: sheets.map((s, i) => ({
          id: s.id,
          workbookId: wb.id,
          name: s.name,
          index: i,
        })),
        activeSheetId: targetId,
      });
      const cells = await cellService.list(targetId);
      dispatch({ type: "LOAD_CELLS", cells });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: err instanceof Error ? err.message : "Failed to load workbook.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  /** Load a sheet by ID — resolves the workbook + all sheets + cells */
  const loadSheet = useCallback(async (sheetId: string) => {
    // Optimistically switch tab so UI responds immediately
    dispatch({ type: "SET_ACTIVE_SHEET", sheetId });
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      // Skip expensive workbook re-fetch if we already have it loaded
      if (stateRef.current.workbookId) {
        const cells = await cellService.list(sheetId);
        dispatch({ type: "LOAD_CELLS", cells });
        return;
      }

      // Full init — first load of the page
      const workbooks = await workbookService.list();
      let ownerWorkbook = workbooks.find((wb) => wb.sheets?.some((s) => s.id === sheetId));

      // If sheets weren't embedded, load them per workbook
      if (!ownerWorkbook) {
        for (const wb of workbooks) {
          const sheets = await workbookService.listSheets(wb.id);
          if (sheets.some((s) => s.id === sheetId)) {
            ownerWorkbook = { ...wb, sheets };
            break;
          }
        }
      }

      if (!ownerWorkbook) throw new Error("Sheet not found.");

      const sheets = ownerWorkbook.sheets ?? [];

      dispatch({
        type: "INIT_SHEET",
        workbookId: ownerWorkbook.id,
        workbookName: ownerWorkbook.name,
        myRole: "OWNER",
        sheets: sheets.map((s, i) => ({
          id: s.id,
          workbookId: ownerWorkbook?.id,
          name: s.name,
          index: i,
        })),
        activeSheetId: sheetId,
      });

      // Load cells
      const cells = await cellService.list(sheetId);
      dispatch({ type: "LOAD_CELLS", cells });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: err instanceof Error ? err.message : "Failed to load sheet.",
      });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  /** Save a single cell to the backend (debounced) */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveCell = useCallback(
    debounce(async (sheetId: string, ref: string, data: CellData) => {
      const parsed = parseCellRef(ref);
      if (!parsed || !sheetId) return;
      await cellService.upsert(sheetId, {
        row: parsed.row,
        col: parsed.col,
        rawValue: data.raw,
        style: data.style,
      });
    }, 800),
    [],
  );

  const setCell = useCallback(
    (ref: string, data: CellData) => {
      dispatch({ type: "SET_CELL", ref, data });
      if (state.activeSheetId) {
        saveCell(state.activeSheetId, ref, data);
      }
    },
    [state.activeSheetId, saveCell],
  );

  const setCellValue = useCallback(
    (ref: string, raw: string, style?: CellStyle) => {
      const existing = state.cells[ref];
      setCell(ref, { ...existing, raw, style: style ?? existing?.style });
    },
    [state.cells, setCell],
  );

  const switchSheet = useCallback(async (sheetId: string) => {
    dispatch({ type: "SET_ACTIVE_SHEET", sheetId });
    dispatch({ type: "SET_LOADING", loading: true });
    try {
      const cells = await cellService.list(sheetId);
      dispatch({ type: "LOAD_CELLS", cells });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Failed to load cells." });
    } finally {
      dispatch({ type: "SET_LOADING", loading: false });
    }
  }, []);

  const addSheet = useCallback(
    async (title: string) => {
      if (!state.workbookId) return;
      const sheet = await workbookService.createSheet(state.workbookId, { name: title });
      dispatch({
        type: "ADD_SHEET",
        sheet: {
          id: sheet.id,
          workbookId: state.workbookId,
          name: sheet.name,
          index: state.sheets.length,
        },
      });
      await switchSheet(sheet.id);
    },
    [state.workbookId, state.sheets.length, switchSheet],
  );

  const renameWorkbook = useCallback(
    async (title: string) => {
      if (!state.workbookId) return;
      await workbookService.update(state.workbookId, { name: title });
      dispatch({ type: "SET_WORKBOOK_NAME", name: title });
    },
    [state.workbookId],
  );

  const deleteSheet = useCallback(
    async (sheetId: string) => {
      const current = stateRef.current;
      if (!current.workbookId || current.sheets.length <= 1) return;
      const wasActive = current.activeSheetId === sheetId;
      const remaining = current.sheets.filter((s) => s.id !== sheetId);
      const nextSheet = wasActive ? remaining[0] : null;
      await workbookService.deleteSheet(current.workbookId, sheetId);
      dispatch({ type: "REMOVE_SHEET", sheetId });
      if (wasActive && nextSheet) {
        await switchSheet(nextSheet.id);
        window.history.replaceState(null, "", `/sheet/${current.workbookId}?tab=${nextSheet.id}`);
      }
    },
    [switchSheet],
  );

  return {
    state,
    dispatch,
    loadSheet,
    loadWorkbook,
    setCell,
    setCellValue,
    switchSheet,
    addSheet,
    deleteSheet,
    renameWorkbook,
  };
}
