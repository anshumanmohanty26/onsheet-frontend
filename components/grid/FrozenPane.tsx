"use client";

import type { ReactNode } from "react";

interface FrozenPaneProps {
  /** Number of frozen rows (0 = none). */
  frozenRows: number;
  /** Number of frozen columns (0 = none). */
  frozenCols: number;
  children: ReactNode;
}

/**
 * Overlay wrapper that applies sticky positioning to freeze
 * leading rows/columns. The actual freezing is handled via
 * CSS sticky on the `<thead>` and left-most `<td>` elements;
 * this component provides a visual separator when frozen panes exist.
 */
export function FrozenPane({ frozenRows, frozenCols, children }: FrozenPaneProps) {
  if (frozenRows === 0 && frozenCols === 0) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      {/* Horizontal freeze line */}
      {frozenRows > 0 && (
        <div
          className="absolute left-0 right-0 h-0.5 bg-gray-400 z-30 pointer-events-none"
          style={{ top: `${frozenRows * 25}px` }}
        />
      )}
      {/* Vertical freeze line */}
      {frozenCols > 0 && (
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-30 pointer-events-none"
          style={{ left: `${50 + frozenCols * 100}px` }}
        />
      )}
    </div>
  );
}
