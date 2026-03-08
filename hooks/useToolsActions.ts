import type { CellMap, CellStyle } from "@/types/cell";
import type { CellCoord } from "@/types/selection";
import { useCallback, useState } from "react";

interface Options {
  cells: CellMap;
  setCellCrdt: (ref: string, value: string, style: CellStyle | undefined) => void;
  onNavigate: (coord: CellCoord) => void;
}

import { isFormula } from "@/lib/cell/validator";

/** Find & Replace modal state and cell statistics toast. */
export function useToolsActions({ cells, setCellCrdt, onNavigate }: Options) {
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [statsToast, setStatsToast] = useState<string | null>(null);

  const handleCellStats = useCallback(() => {
    const filled = Object.values(cells).filter((c) => c.raw && c.raw !== "").length;
    const formulaCount = Object.values(cells).filter((c) => c.raw && isFormula(c.raw)).length;
    setStatsToast(`${filled} cells with data · ${formulaCount} formula cells`);
    setTimeout(() => setStatsToast(null), 3500);
  }, [cells]);

  const handleFindReplaceNavigate = useCallback(
    (coord: CellCoord) => onNavigate(coord),
    [onNavigate],
  );

  const handleFindReplaceReplace = useCallback(
    (ref: string, newValue: string) => {
      setCellCrdt(ref, newValue, cells[ref]?.style);
    },
    [cells, setCellCrdt],
  );

  const handleFindReplaceAll = useCallback(
    (pairs: Array<{ ref: string; newValue: string }>) => {
      for (const { ref, newValue } of pairs) {
        setCellCrdt(ref, newValue, cells[ref]?.style);
      }
    },
    [cells, setCellCrdt],
  );

  return {
    showFindReplace,
    openFindReplace: () => setShowFindReplace(true),
    closeFindReplace: () => setShowFindReplace(false),
    statsToast,
    handleCellStats,
    handleFindReplaceNavigate,
    handleFindReplaceReplace,
    handleFindReplaceAll,
  };
}
