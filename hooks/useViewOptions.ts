import { useState } from "react";

/** Manages the visual display options for the sheet (gridlines, headers, zoom, frozen rows). */
export function useViewOptions() {
  const [showGridlines, setShowGridlines] = useState(true);
  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [showHeaders, setShowHeaders] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [frozenRows, setFrozenRows] = useState(0);

  return {
    showGridlines,
    toggleGridlines: () => setShowGridlines((v) => !v),
    showFormulaBar,
    toggleFormulaBar: () => setShowFormulaBar((v) => !v),
    showHeaders,
    toggleHeaders: () => setShowHeaders((v) => !v),
    zoom,
    zoomIn: () => setZoom((z) => Math.min(200, z + 10)),
    zoomOut: () => setZoom((z) => Math.max(50, z - 10)),
    zoomReset: () => setZoom(100),
    frozenRows,
    freezeFirstRow: () => setFrozenRows(1),
    unfreeze: () => setFrozenRows(0),
  };
}
