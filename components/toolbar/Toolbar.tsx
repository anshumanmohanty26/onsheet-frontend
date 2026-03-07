"use client";

import { useRef } from "react";
import type { CellStyle } from "@/types/cell";
import type { NumberFormatId } from "@/constants/formats";
import { AlignmentButtons } from "./AlignmentButtons";
import { FormatBar } from "./FormatBar";
import { NumberFormatSelector } from "./NumberFormatSelector";

interface ToolbarProps {
  style?: CellStyle;
  onStyleChange: (change: Partial<CellStyle>) => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const FONT_SIZES = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];
const FONT_FAMILIES = ["Default", "Arial", "Verdana", "Georgia", "Times New Roman", "Courier New", "Trebuchet MS"];

function ToolbarButton({
  active,
  title,
  onClick,
  children,
  disabled,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`h-8 px-2 rounded text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none ${
        active
          ? "bg-gray-200 text-gray-900"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />;
}

export function Toolbar({ style = {}, onStyleChange, onUndo, onRedo }: ToolbarProps) {
  const textColorRef = useRef<HTMLInputElement>(null);
  const fillColorRef = useRef<HTMLInputElement>(null);

  const fontSize = style.fontSize ?? 10;

  const changeFontSize = (delta: number) => {
    const idx = FONT_SIZES.indexOf(fontSize);
    if (delta > 0) {
      const next = idx === -1 ? FONT_SIZES.findIndex((s) => s > fontSize) : idx + 1;
      if (next >= 0 && next < FONT_SIZES.length) onStyleChange({ fontSize: FONT_SIZES[next] });
    } else {
      const prev = idx === -1 ? FONT_SIZES.findLastIndex((s) => s < fontSize) : idx - 1;
      if (prev >= 0) onStyleChange({ fontSize: FONT_SIZES[prev] });
    }
  };

  const setFontSizeFromInput = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1 && n <= 400) onStyleChange({ fontSize: n });
  };

  return (
    <div className="flex items-center gap-0.5 px-2 h-10 border-b border-gray-200 bg-white overflow-x-auto shrink-0">

      {/* Undo / Redo */}
      <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => onUndo?.()} disabled={!onUndo}>
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
        </svg>
      </ToolbarButton>
      <ToolbarButton title="Redo (Ctrl+Y)" onClick={() => onRedo?.()} disabled={!onRedo}>
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Font family */}
      <select
        title="Font family"
        value={style.fontFamily ?? "Default"}
        onChange={(e) => onStyleChange({ fontFamily: e.target.value === "Default" ? undefined : e.target.value })}
        className="h-8 px-1.5 text-xs rounded border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <Divider />

      {/* Font size − / display / + */}
      <ToolbarButton title="Decrease font size" onClick={() => changeFontSize(-1)}>
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </ToolbarButton>

      <input
        type="number"
        title="Font size"
        min={1}
        max={400}
        value={fontSize}
        onChange={(e) => setFontSizeFromInput(e.target.value)}
        className="w-10 h-8 text-center text-xs rounded border border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />

      <ToolbarButton title="Increase font size" onClick={() => changeFontSize(1)}>
        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Bold / Italic / Underline / Strikethrough */}
      <FormatBar style={style} onStyleChange={onStyleChange} />

      <Divider />

      {/* Text color */}
      <div className="relative flex items-center">
        <button
          title="Text color"
          onClick={() => textColorRef.current?.click()}
          className="h-8 px-2 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors flex flex-col items-center gap-0.5"
        >
          <span className="text-sm font-medium leading-none" style={{ color: style.color ?? "#000000" }}>A</span>
          <span
            className="w-4 h-1 rounded-sm"
            style={{ backgroundColor: style.color ?? "#000000" }}
          />
        </button>
        <input
          ref={textColorRef}
          type="color"
          value={style.color ?? "#000000"}
          onChange={(e) => onStyleChange({ color: e.target.value })}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>

      {/* Fill color */}
      <div className="relative flex items-center">
        <button
          title="Fill color"
          onClick={() => fillColorRef.current?.click()}
          className="h-8 px-2 rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors flex flex-col items-center gap-0.5"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15a1.49 1.49 0 000 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/>
            <path d="M0 20h24v4H0z" fill={style.backgroundColor ?? "transparent"} stroke="#ccc" strokeWidth="0.5"/>
          </svg>
          <span
            className="w-4 h-1 rounded-sm border border-gray-300"
            style={{ backgroundColor: style.backgroundColor ?? "transparent" }}
          />
        </button>
        <input
          ref={fillColorRef}
          type="color"
          value={style.backgroundColor ?? "#ffffff"}
          onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>

      <Divider />

      {/* Alignment */}
      <AlignmentButtons
        value={style.horizontalAlign}
        onChange={(align) => onStyleChange({ horizontalAlign: align })}
      />

      <Divider />

      {/* Wrap text */}
      <ToolbarButton
        title="Wrap text"
        active={style.wrapText}
        onClick={() => onStyleChange({ wrapText: !style.wrapText })}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 10h13a3 3 0 010 6h-3" />
          <path d="M10 13l-3 3 3 3" />
        </svg>
      </ToolbarButton>

      <Divider />

      {/* Number format */}
      <NumberFormatSelector
        value={style.numberFormat}
        onChange={(fmt: NumberFormatId) => onStyleChange({ numberFormat: fmt })}
      />

    </div>
  );
}
