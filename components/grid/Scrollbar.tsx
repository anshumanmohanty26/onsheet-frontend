"use client";

import { useCallback, useRef } from "react";

interface ScrollbarProps {
  direction: "vertical" | "horizontal";
  /** Viewport size in px. */
  viewportSize: number;
  /** Total content size in px. */
  contentSize: number;
  /** Current scroll offset. */
  scrollOffset: number;
  onScroll: (offset: number) => void;
}

/** Custom scrollbar thumb rendered over the grid viewport. */
export function Scrollbar({ direction, viewportSize, contentSize, scrollOffset, onScroll }: ScrollbarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const ratio = viewportSize / contentSize;
  if (ratio >= 1) return null; // No scrollbar needed

  const thumbSize = Math.max(24, ratio * viewportSize);
  const maxScroll = contentSize - viewportSize;
  const thumbOffset = maxScroll > 0 ? (scrollOffset / maxScroll) * (viewportSize - thumbSize) : 0;
  const isVertical = direction === "vertical";

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const clickPos = isVertical ? e.clientY - rect.top : e.clientX - rect.left;
      const newOffset = (clickPos / viewportSize) * contentSize;
      onScroll(Math.max(0, Math.min(maxScroll, newOffset)));
    },
    [isVertical, viewportSize, contentSize, maxScroll, onScroll],
  );

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      className={`absolute z-30 ${
        isVertical
          ? "right-0 top-0 w-2 h-full"
          : "bottom-0 left-0 h-2 w-full"
      }`}
    >
      <div
        className="bg-gray-300 hover:bg-gray-400 rounded-full opacity-60 hover:opacity-100 transition-opacity"
        style={
          isVertical
            ? { height: thumbSize, width: "100%", transform: `translateY(${thumbOffset}px)` }
            : { width: thumbSize, height: "100%", transform: `translateX(${thumbOffset}px)` }
        }
      />
    </div>
  );
}
