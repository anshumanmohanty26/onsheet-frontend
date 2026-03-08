"use client";

import { useEffect, useRef, type ReactNode } from "react";

export interface ContextMenuItem {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

/** Right-click context menu rendered at absolute screen position. */
export function ContextMenu({ visible, x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-fade-in-scale"
      style={{ left: x, top: y }}
      role="menu"
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="h-px bg-gray-100 my-1" role="separator" />
        ) : (
          <button
            key={i}
            role="menuitem"
            disabled={item.disabled}
            onClick={() => { item.onClick(); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 disabled:text-gray-300 disabled:pointer-events-none transition-colors"
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="text-gray-400 ml-4">{item.shortcut}</span>
            )}
          </button>
        ),
      )}
    </div>
  );
}
