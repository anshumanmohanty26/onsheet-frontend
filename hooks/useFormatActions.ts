import { useCallback } from "react";
import { cellRef } from "@/lib/utils/coordinates";
import type { CellMap, CellStyle } from "@/types/cell";
import type { CellCoord } from "@/types/selection";

interface Options {
  active: CellCoord | null;
  cells: CellMap;
  activeStyle: CellStyle | undefined;
  handleStyleChange: (change: Partial<CellStyle>) => void;
  setCellCrdt: (ref: string, value: string, style: CellStyle | undefined) => void;
}

/** Format handlers that wrap handleStyleChange and direct cell writes. */
export function useFormatActions({
  active,
  cells,
  activeStyle,
  handleStyleChange,
  setCellCrdt,
}: Options) {
  const handleStrikethrough = useCallback(
    () => handleStyleChange({ strikethrough: !activeStyle?.strikethrough }),
    [handleStyleChange, activeStyle],
  );

  const handleAlignLeft = useCallback(
    () => handleStyleChange({ horizontalAlign: "left" }),
    [handleStyleChange],
  );

  const handleAlignCenter = useCallback(
    () => handleStyleChange({ horizontalAlign: "center" }),
    [handleStyleChange],
  );

  const handleAlignRight = useCallback(
    () => handleStyleChange({ horizontalAlign: "right" }),
    [handleStyleChange],
  );

  const handleClearFormatting = useCallback(() => {
    if (!active) return;
    const ref = cellRef(active.row, active.col);
    setCellCrdt(ref, cells[ref]?.raw ?? "", undefined);
  }, [active, cells, setCellCrdt]);

  const handleFormatNumber = useCallback(
    (fmt: string) => handleStyleChange({ numberFormat: fmt }),
    [handleStyleChange],
  );

  return {
    handleStrikethrough,
    handleAlignLeft,
    handleAlignCenter,
    handleAlignRight,
    handleClearFormatting,
    handleFormatNumber,
  };
}
