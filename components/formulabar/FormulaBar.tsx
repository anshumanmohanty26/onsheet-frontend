import { CellReference } from "./CellReference";
import { FormulaInput } from "./FormulaInput";
import { cellRef } from "@/lib/utils/coordinates";
import type { CellCoord } from "@/types/selection";

interface FormulaBarProps {
  active: CellCoord | null;
  value: string;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  onFocus?: () => void;
}

export function FormulaBar({ active, value, onChange, onCommit, onCancel, onFocus }: FormulaBarProps) {
  const ref = active ? cellRef(active.row, active.col) : "";
  return (
    <div className="flex h-8 items-center border-b border-gray-200 bg-white">
      <CellReference value={ref} />
      {/* fx icon */}
      <div className="px-2 text-xs text-emerald-600 font-mono shrink-0 select-none">
        fx
      </div>
      <FormulaInput
        value={value}
        onChange={onChange}
        onCommit={onCommit}
        onCancel={onCancel}
        onFocus={onFocus}
      />
    </div>
  );
}
