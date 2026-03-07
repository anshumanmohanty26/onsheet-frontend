"use client";

import { useState, type ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: "top" | "bottom";
}

/** Lightweight hover tooltip using CSS positioning. */
export function Tooltip({ content, children, side = "bottom" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute z-50 px-2 py-1 text-[11px] text-white bg-gray-800 rounded shadow whitespace-nowrap pointer-events-none ${
            side === "top"
              ? "bottom-full left-1/2 -translate-x-1/2 mb-1"
              : "top-full left-1/2 -translate-x-1/2 mt-1"
          }`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  );
}
