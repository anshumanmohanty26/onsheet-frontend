import { GRID } from "@/constants/defaults";
import { cellRef, colIndexToLabel } from "@/lib/utils/coordinates";
import type { CellMap } from "@/types/cell";
import { useCallback, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "xlsx" | "pdf" | "tsv" | "json" | "ods";

interface Options {
  cells: CellMap;
  workbookTitle: string;
  totalRows: number;
  activeSheetId: string | null;
  /** Called when an Excel/CSV file is imported to load cells into the sheet */
  onImportCells?: (cells: CellMap) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Find the bounding box of non-empty cells */
function getUsedRange(cells: CellMap, totalRows: number) {
  let maxRow = 0;
  let maxCol = 0;
  for (const key in cells) {
    const cell = cells[key];
    if (!cell || (!cell.raw && !cell.computed)) continue;
    const match = /^([A-Z]+)(\d+)$/.exec(key);
    if (!match) continue;
    const row = Number.parseInt(match[2], 10) - 1;
    let col = 0;
    for (const ch of match[1]) col = col * 26 + ch.charCodeAt(0) - 64;
    col -= 1;
    maxRow = Math.max(maxRow, row);
    maxCol = Math.max(maxCol, col);
  }
  return { rows: Math.min(maxRow + 1, totalRows), cols: Math.min(maxCol + 1, GRID.COLS) };
}

/** Build a 2D array of display values */
function buildGrid(cells: CellMap, rows: number, cols: number): string[][] {
  const grid: string[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      const cell = cells[cellRef(r, c)];
      row.push(cell?.computed ?? cell?.raw ?? "");
    }
    grid.push(row);
  }
  return grid;
}

/** Escape a value for CSV/TSV */
function escapeDelimited(val: string, sep: string): string {
  if (val.includes(sep) || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/** Trigger a file download from a Blob */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Generate delimited text (CSV or TSV) */
function toDelimited(cells: CellMap, totalRows: number, sep: string): string {
  const { rows, cols } = getUsedRange(cells, totalRows);
  const grid = buildGrid(cells, rows, cols);
  return grid.map((row) => row.map((v) => escapeDelimited(v, sep)).join(sep)).join("\n");
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/** Handles file-level actions: multi-format import/export and share-link copy. */
export function useFileActions({
  cells,
  workbookTitle,
  totalRows,
  activeSheetId,
  onImportCells,
}: Options) {
  const [shareToast, setShareToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const title = workbookTitle || "spreadsheet";

  // ── Export: CSV ───────────────────────────────────────────────────────────
  const handleDownloadCsv = useCallback(() => {
    const text = toDelimited(cells, totalRows, ",");
    downloadBlob(new Blob([text], { type: "text/csv;charset=utf-8" }), `${title}.csv`);
  }, [cells, totalRows, title]);

  // ── Export: TSV ───────────────────────────────────────────────────────────
  const handleDownloadTsv = useCallback(() => {
    const text = toDelimited(cells, totalRows, "\t");
    downloadBlob(
      new Blob([text], { type: "text/tab-separated-values;charset=utf-8" }),
      `${title}.tsv`,
    );
  }, [cells, totalRows, title]);

  // ── Export: Excel (.xlsx) ─────────────────────────────────────────────────
  const handleDownloadXlsx = useCallback(async () => {
    const XLSX = await import("xlsx");
    const { rows, cols } = getUsedRange(cells, totalRows);
    const wb = XLSX.utils.book_new();

    const header = Array.from({ length: cols }, (_, i) => colIndexToLabel(i));
    const ws = XLSX.utils.aoa_to_sheet([header, ...buildGrid(cells, rows, cols)]);
    ws["!cols"] = header.map(() => ({ wch: 14 }));

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    downloadBlob(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `${title}.xlsx`,
    );
  }, [cells, totalRows, title]);

  // ── Export: ODS (OpenDocument Spreadsheet) ────────────────────────────────
  const handleDownloadOds = useCallback(async () => {
    const XLSX = await import("xlsx");
    const { rows, cols } = getUsedRange(cells, totalRows);
    const wb = XLSX.utils.book_new();
    const header = Array.from({ length: cols }, (_, i) => colIndexToLabel(i));
    const ws = XLSX.utils.aoa_to_sheet([header, ...buildGrid(cells, rows, cols)]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { bookType: "ods", type: "array" });
    downloadBlob(
      new Blob([buf], { type: "application/vnd.oasis.opendocument.spreadsheet" }),
      `${title}.ods`,
    );
  }, [cells, totalRows, title]);

  // ── Export: PDF ───────────────────────────────────────────────────────────
  const handleDownloadPdf = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const { rows, cols } = getUsedRange(cells, totalRows);
    const grid = buildGrid(cells, rows, cols);
    const header = Array.from({ length: cols }, (_, i) => colIndexToLabel(i));

    const doc = new jsPDF({
      orientation: cols > 8 ? "landscape" : "portrait",
      unit: "pt",
      format: "a4",
    });

    doc.setFontSize(14);
    doc.text(title, 40, 30);

    autoTable(doc, {
      startY: 45,
      head: [header],
      body: grid,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
    });

    doc.save(`${title}.pdf`);
  }, [cells, totalRows, title]);

  // ── Export: JSON ──────────────────────────────────────────────────────────
  const handleDownloadJson = useCallback(() => {
    const { rows, cols } = getUsedRange(cells, totalRows);
    const data: Record<string, string>[] = [];
    const headers = Array.from({ length: cols }, (_, i) => colIndexToLabel(i));
    for (let r = 0; r < rows; r++) {
      const row: Record<string, string> = {};
      for (let c = 0; c < cols; c++) {
        const cell = cells[cellRef(r, c)];
        row[headers[c]] = cell?.computed ?? cell?.raw ?? "";
      }
      data.push(row);
    }
    const json = JSON.stringify(data, null, 2);
    downloadBlob(new Blob([json], { type: "application/json" }), `${title}.json`);
  }, [cells, totalRows, title]);

  // ── Unified export ────────────────────────────────────────────────────────
  const handleExport = useCallback(
    (format: string) => {
      switch (format) {
        case "csv":
          return handleDownloadCsv();
        case "tsv":
          return handleDownloadTsv();
        case "xlsx":
          return handleDownloadXlsx();
        case "ods":
          return handleDownloadOds();
        case "pdf":
          return handleDownloadPdf();
        case "json":
          return handleDownloadJson();
      }
    },
    [
      handleDownloadCsv,
      handleDownloadTsv,
      handleDownloadXlsx,
      handleDownloadOds,
      handleDownloadPdf,
      handleDownloadJson,
    ],
  );

  // ── Import: Excel / CSV / TSV / ODS ───────────────────────────────────────
  const handleImport = useCallback(
    async (file: File) => {
      if (!onImportCells) return;
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) return;

      const jsonRows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });
      const imported: CellMap = {};
      for (let r = 0; r < jsonRows.length; r++) {
        const row = jsonRows[r];
        if (!Array.isArray(row)) continue;
        for (let c = 0; c < row.length; c++) {
          const val = row[c];
          if (val === null || val === undefined || val === "") continue;
          const raw = String(val);
          imported[cellRef(r, c)] = { raw, computed: raw };
        }
      }
      onImportCells(imported);
    },
    [onImportCells],
  );

  /** Open native file picker, then import the selected file */
  const triggerImport = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.remove();
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv,.tsv,.ods,.json";
    input.style.display = "none";
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) handleImport(f);
      input.remove();
    };
    fileInputRef.current = input;
    document.body.appendChild(input);
    input.click();
  }, [handleImport]);

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    if (!activeSheetId) return;
    const url = `${window.location.origin}/share/${activeSheetId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this share link:", url);
      return;
    }
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  }, [activeSheetId]);

  return {
    handleDownloadCsv,
    handleExport,
    triggerImport,
    handleShare,
    shareToast,
  };
}
