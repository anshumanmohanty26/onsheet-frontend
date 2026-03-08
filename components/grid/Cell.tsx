"use client";

import type { CellData, CellStyle } from "@/types/cell";
import { memo } from "react";

interface CellProps {
  cellRef: string;
  data: CellData | undefined;
  width: number;
  isActive: boolean;
  isSelected: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onDoubleClick: () => void;
}

function cellTdCSS(style?: CellStyle): React.CSSProperties {
  if (!style) return {};
  return {
    backgroundColor: style.backgroundColor,
  };
}

function cellSpanCSS(style?: CellStyle): React.CSSProperties {
  if (!style) return {};
  return {
    fontWeight: style.bold ? "bold" : undefined,
    fontStyle: style.italic ? "italic" : undefined,
    textDecoration:
      [style.underline && "underline", style.strikethrough && "line-through"]
        .filter(Boolean)
        .join(" ") || undefined,
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    color: style.color,
    textAlign: style.horizontalAlign ?? "left",
    whiteSpace: style.wrapText ? "pre-wrap" : undefined,
    overflowWrap: style.wrapText ? "break-word" : undefined,
  };
}

/** Individual cell renderer, memoized to avoid unnecessary re-renders. */
export const Cell = memo(function Cell({
  cellRef: _ref,
  data,
  width,
  isActive,
  isSelected,
  onMouseDown,
  onMouseEnter,
  onDoubleClick,
}: CellProps) {
  const display = data?.computed ?? data?.raw ?? "";

  return (
    <td
      className={`border border-gray-200 p-0 overflow-hidden relative cursor-cell
        ${isActive ? "outline outline-2 outline-emerald-500 outline-offset-[-1px] z-10" : ""}
        ${isSelected && !isActive ? "bg-emerald-50" : ""}`}
      style={{ width, maxWidth: width, ...cellTdCSS(data?.style) }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onDoubleClick={onDoubleClick}
    >
      <span
        className={`block px-1 text-sm leading-[23px] ${data?.style?.wrapText ? "break-words whitespace-pre-wrap" : "truncate"}`}
        style={cellSpanCSS(data?.style)}
      >
        {display}
      </span>
    </td>
  );
});
