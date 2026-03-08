"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface MenuBarProps {
  // Edit
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  // File
  onImport?: () => void;
  onExport?: (format: string) => void;
  onShare?: () => void;
  onVersionHistory?: () => void;
  // Insert
  onInsertRowAbove?: () => void;
  onInsertRowBelow?: () => void;
  onInsertColLeft?: () => void;
  onInsertColRight?: () => void;
  onInsertComment?: () => void;
  // View
  showGridlines?: boolean;
  onToggleGridlines?: () => void;
  showFormulaBar?: boolean;
  onToggleFormulaBar?: () => void;
  showHeaders?: boolean;
  onToggleHeaders?: () => void;
  zoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  frozenRows?: number;
  onFreezeFirstRow?: () => void;
  onUnfreeze?: () => void;
  // Format
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onStrikethrough?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onWrapText?: () => void;
  wrapText?: boolean;
  onClearFormatting?: () => void;
  onFormatNumber?: (fmt: string) => void;
  // Data
  onSortAsc?: () => void;
  onSortDesc?: () => void;
  onDeleteRow?: () => void;
  onDeleteCol?: () => void;
  onRemoveDuplicates?: () => void;
  onTrimWhitespace?: () => void;
  // Tools
  onFindReplace?: () => void;
  onCellStats?: () => void;
  // Help
  onShowShortcuts?: () => void;
}

interface DropdownItem {
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
  checked?: boolean;
}

function Dropdown({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 z-50 min-w-[220px] bg-white rounded-md shadow-lg border border-gray-200 py-1 mt-0.5"
      role="menu"
    >
      {items.map((item, i) =>
        item.divider ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: static menu items, order never changes
          <div key={i} className="h-px bg-gray-100 my-1" role="separator" />
        ) : (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: static menu items, order never changes
            key={i}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => {
              item.onClick?.();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:pointer-events-none transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-3 text-center text-emerald-600">{item.checked ? "✓" : ""}</span>
              {item.label}
            </span>
            {item.shortcut && <span className="text-gray-400 ml-8 shrink-0">{item.shortcut}</span>}
          </button>
        ),
      )}
    </div>
  );
}

export function MenuBar({
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onImport,
  onExport,
  onShare,
  onVersionHistory,
  onInsertRowAbove,
  onInsertRowBelow,
  onInsertColLeft,
  onInsertColRight,
  onInsertComment,
  showGridlines = true,
  onToggleGridlines,
  showFormulaBar = true,
  onToggleFormulaBar,
  showHeaders = true,
  onToggleHeaders,
  zoom = 100,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  frozenRows = 0,
  onFreezeFirstRow,
  onUnfreeze,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onWrapText,
  wrapText = false,
  onClearFormatting,
  onFormatNumber,
  onSortAsc,
  onSortDesc,
  onDeleteRow,
  onDeleteCol,
  onRemoveDuplicates,
  onTrimWhitespace,
  onFindReplace,
  onCellStats,
  onShowShortcuts,
}: MenuBarProps) {
  const [open, setOpen] = useState<string | null>(null);

  const toggle = (label: string) => setOpen((prev) => (prev === label ? null : label));
  const close = useCallback(() => setOpen(null), []);

  const menus: { label: string; items: DropdownItem[] }[] = [
    {
      label: "File",
      items: [
        {
          label: "New spreadsheet",
          shortcut: "⌘N",
          onClick: () => window.open("/dashboard", "_blank"),
        },
        { label: "", divider: true },
        { label: "Import spreadsheet", onClick: onImport, disabled: !onImport },
        { label: "", divider: true },
        { label: "Download as CSV (.csv)", onClick: () => onExport?.("csv"), disabled: !onExport },
        {
          label: "Download as Excel (.xlsx)",
          onClick: () => onExport?.("xlsx"),
          disabled: !onExport,
        },
        { label: "Download as PDF (.pdf)", onClick: () => onExport?.("pdf"), disabled: !onExport },
        { label: "Download as ODS (.ods)", onClick: () => onExport?.("ods"), disabled: !onExport },
        { label: "Download as TSV (.tsv)", onClick: () => onExport?.("tsv"), disabled: !onExport },
        {
          label: "Download as JSON (.json)",
          onClick: () => onExport?.("json"),
          disabled: !onExport,
        },
        { label: "", divider: true },
        { label: "Copy share link", shortcut: "⌘⇧S", onClick: onShare, disabled: !onShare },
        { label: "", divider: true },
        {
          label: "Version history",
          shortcut: "⌘⌥H",
          onClick: onVersionHistory,
          disabled: !onVersionHistory,
        },
        { label: "", divider: true },
        { label: "Print", shortcut: "⌘P", onClick: () => window.print() },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "⌘Z", onClick: onUndo, disabled: !onUndo },
        { label: "Redo", shortcut: "⌘⇧Z", onClick: onRedo, disabled: !onRedo },
        { label: "", divider: true },
        { label: "Cut", shortcut: "⌘X", onClick: onCut },
        { label: "Copy", shortcut: "⌘C", onClick: onCopy },
        { label: "Paste", shortcut: "⌘V", onClick: onPaste },
        { label: "", divider: true },
        {
          label: "Find & replace",
          shortcut: "⌘H",
          onClick: onFindReplace,
          disabled: !onFindReplace,
        },
      ],
    },
    {
      label: "View",
      items: [
        { label: "Show gridlines", onClick: onToggleGridlines, checked: showGridlines },
        { label: "Show row & column headers", onClick: onToggleHeaders, checked: showHeaders },
        { label: "Show formula bar", onClick: onToggleFormulaBar, checked: showFormulaBar },
        { label: "", divider: true },
        {
          label: frozenRows > 0 ? "Unfreeze rows" : "Freeze first row",
          onClick: frozenRows > 0 ? onUnfreeze : onFreezeFirstRow,
          disabled: !onFreezeFirstRow && !onUnfreeze,
        },
        { label: "", divider: true },
        {
          label: `Zoom in  (${Math.min(200, zoom + 10)}%)`,
          shortcut: "⌘+",
          onClick: onZoomIn,
          disabled: zoom >= 200,
        },
        {
          label: `Zoom out (${Math.max(50, zoom - 10)}%)`,
          shortcut: "⌘-",
          onClick: onZoomOut,
          disabled: zoom <= 50,
        },
        { label: "Reset zoom (100%)", onClick: onZoomReset, disabled: zoom === 100 },
      ],
    },
    {
      label: "Insert",
      items: [
        { label: "Insert row above", onClick: onInsertRowAbove, disabled: !onInsertRowAbove },
        { label: "Insert row below", onClick: onInsertRowBelow, disabled: !onInsertRowBelow },
        { label: "", divider: true },
        { label: "Insert column left", onClick: onInsertColLeft, disabled: !onInsertColLeft },
        { label: "Insert column right", onClick: onInsertColRight, disabled: !onInsertColRight },
        { label: "", divider: true },
        {
          label: "Insert comment",
          shortcut: "⌘⇧M",
          onClick: onInsertComment,
          disabled: !onInsertComment,
        },
      ],
    },
    {
      label: "Format",
      items: [
        { label: "Bold", shortcut: "⌘B", onClick: onBold },
        { label: "Italic", shortcut: "⌘I", onClick: onItalic },
        { label: "Underline", shortcut: "⌘U", onClick: onUnderline },
        { label: "Strikethrough", onClick: onStrikethrough },
        { label: "", divider: true },
        { label: "Wrap text", shortcut: "⌘⇧W", onClick: onWrapText, checked: wrapText },
        { label: "", divider: true },
        { label: "Align left", shortcut: "⌘⇧L", onClick: onAlignLeft },
        { label: "Align center", shortcut: "⌘⇧E", onClick: onAlignCenter },
        { label: "Align right", shortcut: "⌘⇧R", onClick: onAlignRight },
        { label: "", divider: true },
        { label: "Number: plain", onClick: () => onFormatNumber?.("plain") },
        { label: "Number: 1,234.56", onClick: () => onFormatNumber?.("number") },
        { label: "Number: $1,234.56", onClick: () => onFormatNumber?.("currency") },
        { label: "Number: 12%", onClick: () => onFormatNumber?.("percent") },
        { label: "", divider: true },
        { label: "Conditional formatting…", disabled: true },
        { label: "", divider: true },
        { label: "Clear formatting", onClick: onClearFormatting, disabled: !onClearFormatting },
      ],
    },
    {
      label: "Data",
      items: [
        { label: "Sort A → Z", onClick: onSortAsc, disabled: !onSortAsc },
        { label: "Sort Z → A", onClick: onSortDesc, disabled: !onSortDesc },
        { label: "", divider: true },
        { label: "Trim whitespace", onClick: onTrimWhitespace, disabled: !onTrimWhitespace },
        { label: "", divider: true },
        { label: "Delete row", onClick: onDeleteRow, disabled: !onDeleteRow },
        { label: "Delete column", onClick: onDeleteCol, disabled: !onDeleteCol },
        { label: "", divider: true },
        {
          label: "Remove duplicates in column",
          onClick: onRemoveDuplicates,
          disabled: !onRemoveDuplicates,
        },
      ],
    },
    {
      label: "Tools",
      items: [
        {
          label: "Find & replace",
          shortcut: "⌘H",
          onClick: onFindReplace,
          disabled: !onFindReplace,
        },
        { label: "", divider: true },
        { label: "Cell statistics", onClick: onCellStats, disabled: !onCellStats },
      ],
    },
    {
      label: "Help",
      items: [
        {
          label: "Keyboard shortcuts",
          shortcut: "⌘/",
          onClick: onShowShortcuts,
          disabled: !onShowShortcuts,
        },
        { label: "", divider: true },
        { label: "About OnSheet", onClick: () => window.open("https://github.com", "_blank") },
      ],
    },
  ];

  return (
    <div className="flex items-center gap-0.5 px-2 py-0.5 border-b border-gray-200 bg-white">
      {menus.map(({ label, items }) => (
        <div key={label} className="relative">
          <button
            type="button"
            className={`px-2.5 py-0.5 text-xs rounded transition-colors ${
              open === label ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => toggle(label)}
          >
            {label}
          </button>
          {open === label && <Dropdown items={items} onClose={close} />}
        </div>
      ))}
    </div>
  );
}
