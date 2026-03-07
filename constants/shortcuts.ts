/** Keyboard shortcut definitions used by useKeyboard hook. */
export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

/** Platform-aware modifier key label. */
export const MOD =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "\u2318"
    : "Ctrl";

export const SHORTCUTS = {
  // Formatting
  BOLD: { key: "b", ctrl: true, description: `${MOD}+B — Bold` },
  ITALIC: { key: "i", ctrl: true, description: `${MOD}+I — Italic` },
  UNDERLINE: { key: "u", ctrl: true, description: `${MOD}+U — Underline` },
  STRIKETHROUGH: { key: "5", ctrl: true, alt: true, description: `${MOD}+Alt+5 — Strikethrough` },

  // Edit
  UNDO: { key: "z", ctrl: true, description: `${MOD}+Z — Undo` },
  REDO_Z: { key: "z", ctrl: true, shift: true, description: `${MOD}+Shift+Z — Redo` },
  REDO_Y: { key: "y", ctrl: true, description: `${MOD}+Y — Redo` },
  CUT: { key: "x", ctrl: true, description: `${MOD}+X — Cut` },
  COPY: { key: "c", ctrl: true, description: `${MOD}+C — Copy` },
  PASTE: { key: "v", ctrl: true, description: `${MOD}+V — Paste` },
  SELECT_ALL: { key: "a", ctrl: true, description: `${MOD}+A — Select all` },
  FIND: { key: "f", ctrl: true, description: `${MOD}+F — Find` },
  DELETE: { key: "Delete", description: "Delete — Clear cell" },
  BACKSPACE: { key: "Backspace", description: "Backspace — Clear and edit" },

  // Navigation
  ENTER: { key: "Enter", description: "Enter — Commit & move down" },
  TAB: { key: "Tab", description: "Tab — Commit & move right" },
  SHIFT_TAB: { key: "Tab", shift: true, description: "Shift+Tab — Move left" },
  SHIFT_ENTER: { key: "Enter", shift: true, description: "Shift+Enter — Move up" },
  ESCAPE: { key: "Escape", description: "Escape — Cancel edit" },
  ARROW_UP: { key: "ArrowUp", description: "Arrow Up — Move up" },
  ARROW_DOWN: { key: "ArrowDown", description: "Arrow Down — Move down" },
  ARROW_LEFT: { key: "ArrowLeft", description: "Arrow Left — Move left" },
  ARROW_RIGHT: { key: "ArrowRight", description: "Arrow Right — Move right" },
} as const satisfies Record<string, Shortcut>;
