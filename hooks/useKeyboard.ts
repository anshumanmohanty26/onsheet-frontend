import { useEffect } from "react";
import type { CellCoord } from "@/types/selection";

interface UseKeyboardOptions {
  active: CellCoord | null;
  isEditing: boolean;
  onNavigate: (dr: number, dc: number) => void;
  onStartEdit: (char?: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onFindReplace?: () => void;
}

/** Hook for keyboard shortcuts and navigation on the spreadsheet grid. */
export function useKeyboard(opts: UseKeyboardOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;

      // Ignore if focus is in an input/textarea that's NOT the cell editor
      if (
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        !target.dataset.cellEditor
      ) {
        return;
      }

      // When editing, only intercept Escape and Enter/Tab
      if (opts.isEditing) {
        if (e.key === "Escape") { e.preventDefault(); opts.onCancel(); return; }
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); opts.onCommit(); opts.onNavigate(1, 0); return; }
        if (e.key === "Enter" && e.shiftKey) { e.preventDefault(); opts.onCommit(); opts.onNavigate(-1, 0); return; }
        if (e.key === "Tab") { e.preventDefault(); opts.onCommit(); opts.onNavigate(0, e.shiftKey ? -1 : 1); return; }
        return;
      }

      // Not editing — navigation & commands
      if (!opts.active) return;

      // Arrow keys
      if (e.key === "ArrowUp") { e.preventDefault(); opts.onNavigate(-1, 0); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); opts.onNavigate(1, 0); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); opts.onNavigate(0, -1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); opts.onNavigate(0, 1); return; }
      if (e.key === "Tab") { e.preventDefault(); opts.onNavigate(0, e.shiftKey ? -1 : 1); return; }
      if (e.key === "Enter") { e.preventDefault(); opts.onStartEdit(); return; }

      // Delete/Backspace
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); opts.onDelete(); return; }

      // Mod shortcuts
      if (mod) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); opts.onUndo(); return; }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); opts.onRedo(); return; }
        if (e.key === "y") { e.preventDefault(); opts.onRedo(); return; }
        if (e.key === "c") { e.preventDefault(); opts.onCopy(); return; }
        if (e.key === "x") { e.preventDefault(); opts.onCut(); return; }
        if (e.key === "v") { e.preventDefault(); opts.onPaste(); return; }
        if (e.key === "b") { e.preventDefault(); opts.onBold(); return; }
        if (e.key === "i") { e.preventDefault(); opts.onItalic(); return; }
        if (e.key === "u") { e.preventDefault(); opts.onUnderline(); return; }
        if (e.key === "h") { e.preventDefault(); opts.onFindReplace?.(); return; }
        return;
      }

      // Start editing on printable character.
      // e.preventDefault() is critical: it cancels the subsequent keypress/input
      // events so the character isn't also inserted into the newly-focused cell
      // editor input (autoFocus mounts it during the same keydown cycle), which
      // would otherwise double the character — e.g. typing "2" shows "22".
      if (e.key.length === 1 && !mod && !e.altKey) {
        e.preventDefault();
        opts.onStartEdit(e.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opts]);
}
