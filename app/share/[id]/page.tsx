"use client";

import { use, useCallback, useEffect, useReducer, useState } from "react";
import { Grid } from "@/components/grid/Grid";
import {
  initialSelectionState,
  selectionReducer,
} from "@/store";
import { GRID } from "@/constants/defaults";
import { env } from "@/config/env";
import { cellRef } from "@/lib/utils/coordinates";
import type { CellCoord } from "@/types/selection";
import type { CellMap } from "@/types/cell";

interface PublicSheet {
  id: string;
  name: string;
  index: number;
}

interface PublicWorkbook {
  id: string;
  name: string;
  sheets: PublicSheet[];
}

interface ApiCellRaw {
  row: number;
  col: number;
  rawValue: string | null;
  computed: string | null;
  style?: Record<string, unknown>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchPublicWorkbook(shareToken: string): Promise<PublicWorkbook> {
  const res = await fetch(`${env.apiUrl}/workbooks/public/${shareToken}`, {
    credentials: "omit",
  });
  if (!res.ok) throw new Error("Spreadsheet not found or not publicly shared");
  const body = await res.json();
  return (body.data ?? body) as PublicWorkbook;
}

async function fetchPublicCells(
  shareToken: string,
  sheetId: string,
): Promise<CellMap> {
  const res = await fetch(
    `${env.apiUrl}/public/sheets/${shareToken}/${sheetId}/cells`,
    { credentials: "omit" },
  );
  if (!res.ok) throw new Error("Failed to load sheet cells");
  const body = await res.json();
  const apiCells = (body.data ?? body) as ApiCellRaw[];
  const map: CellMap = {};
  for (const c of apiCells) {
    map[cellRef(c.row, c.col)] = {
      raw: c.rawValue ?? "",
      computed: c.computed ?? c.rawValue ?? "",
      style: c.style as never,
    };
  }
  return map;
}

export default function SharePage({ params }: PageProps) {
  const { id: shareToken } = use(params);

  const [workbook, setWorkbook] = useState<PublicWorkbook | null>(null);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [cells, setCells] = useState<CellMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sel, selDispatch] = useReducer(selectionReducer, initialSelectionState);

  // Load workbook on mount
  useEffect(() => {
    setLoading(true);
    fetchPublicWorkbook(shareToken)
      .then((wb) => {
        setWorkbook(wb);
        const firstSheet = wb.sheets[0];
        if (firstSheet) setActiveSheetId(firstSheet.id);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load spreadsheet"),
      )
      .finally(() => setLoading(false));
  }, [shareToken]);

  // Load cells whenever active sheet changes
  useEffect(() => {
    if (!activeSheetId) return;
    fetchPublicCells(shareToken, activeSheetId)
      .then(setCells)
      .catch(() => setCells({}));
  }, [shareToken, activeSheetId]);

  const handleCellClick = useCallback((coord: CellCoord) => {
    selDispatch({ type: "SET_ACTIVE", coord });
  }, []);

  const noop = useCallback(() => {}, []);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <a href="/dashboard" className="text-xs text-emerald-600 hover:underline">
          Open OnSheet
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* View-only banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-amber-50 border-b border-amber-200 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">
            {workbook?.name ?? "Loading…"}
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-300">
            View only
          </span>
        </div>
        <a
          href="/dashboard"
          className="text-xs text-emerald-600 hover:underline font-medium"
        >
          Open OnSheet
        </a>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm gap-2">
          <span className="size-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Loading sheet…
        </div>
      ) : (
        <>
          <Grid
            cells={cells}
            totalRows={GRID.ROWS}
            totalCols={GRID.COLS}
            columnWidths={{}}
            rowHeights={{}}
            active={sel.active}
            selection={null}
            editingRef={null}
            editValue=""
            onCellClick={handleCellClick}
            onCellDoubleClick={noop}
            onEditChange={noop}
            onEditCommit={noop}
            onEditCancel={noop}
            onSelectionDrag={noop}
          />

          {/* Sheet tabs */}
          {workbook && workbook.sheets.length > 1 && (
            <div className="flex items-center gap-1 px-3 py-1.5 border-t border-gray-200 bg-gray-50 shrink-0 overflow-x-auto">
              {workbook.sheets.map((sheet) => (
                <button
                  key={sheet.id}
                  onClick={() => setActiveSheetId(sheet.id)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                    sheet.id === activeSheetId
                      ? "bg-white border border-gray-300 text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-white"
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

