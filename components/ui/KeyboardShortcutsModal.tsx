"use client";

import { useEffect } from "react";

interface Props {
  onClose: () => void;
}

const SECTIONS: { heading: string; rows: [string, string][] }[] = [
  {
    heading: "Navigation",
    rows: [
      ["Arrow keys", "Move active cell"],
      ["Tab / Shift+Tab", "Move right / left"],
      ["Enter / Shift+Enter", "Move down / up"],
      ["Ctrl+Home", "Go to A1"],
      ["Ctrl+End", "Go to last used cell"],
    ],
  },
  {
    heading: "Editing",
    rows: [
      ["F2 or double-click", "Enter edit mode"],
      ["Escape", "Cancel edit"],
      ["Delete / Backspace", "Clear cell contents"],
      ["Start typing", "Replace cell value"],
    ],
  },
  {
    heading: "Clipboard",
    rows: [
      ["⌘C / Ctrl+C", "Copy"],
      ["⌘X / Ctrl+X", "Cut"],
      ["⌘V / Ctrl+V", "Paste"],
    ],
  },
  {
    heading: "Formatting",
    rows: [
      ["⌘B / Ctrl+B", "Bold"],
      ["⌘I / Ctrl+I", "Italic"],
      ["⌘U / Ctrl+U", "Underline"],
    ],
  },
  {
    heading: "History",
    rows: [
      ["⌘Z / Ctrl+Z", "Undo"],
      ["⌘⇧Z / Ctrl+Y", "Redo"],
    ],
  },
];

export function KeyboardShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[520px] max-h-[80vh] overflow-y-auto border border-gray-200 animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-semibold text-gray-900">Keyboard shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Sections */}
        <div className="px-5 py-4 space-y-5">
          {SECTIONS.map(({ heading, rows }) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {heading}
              </h3>
              <table className="w-full text-xs">
                <tbody>
                  {rows.map(([shortcut, description]) => (
                    <tr key={shortcut} className="border-t border-gray-50">
                      <td className="py-1.5 pr-4 font-mono text-gray-700 whitespace-nowrap">
                        {shortcut}
                      </td>
                      <td className="py-1.5 text-gray-500">{description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
