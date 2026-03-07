import { useCallback, useState } from "react";
import { GRID } from "@/constants/defaults";
import { cellRef } from "@/lib/utils/coordinates";
import type { CellMap } from "@/types/cell";

interface Options {
  cells: CellMap;
  workbookTitle: string;
  totalRows: number;
  activeSheetId: string | null;
}

/** Handles file-level actions: CSV export and share-link copy. */
export function useFileActions({ cells, workbookTitle, totalRows, activeSheetId }: Options) {
  const [shareToast, setShareToast] = useState(false);

  const handleDownloadCsv = useCallback(() => {
    const cols = GRID.COLS;
    const lines: string[] = [];
    for (let r = 0; r < totalRows; r++) {
      const rowCells: string[] = [];
      for (let c = 0; c < cols; c++) {
        const cell = cells[cellRef(r, c)];
        const val = cell?.computed ?? cell?.raw ?? "";
        rowCells.push(
          val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val.replace(/"/g, '""')}"`
            : val,
        );
      }
      lines.push(rowCells.join(","));
    }
    // Trim trailing blank rows
    while (lines.length > 0 && lines[lines.length - 1].replace(/,/g, "") === "") {
      lines.pop();
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workbookTitle || "spreadsheet"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cells, workbookTitle, totalRows]);

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

  return { handleDownloadCsv, handleShare, shareToast };
}
