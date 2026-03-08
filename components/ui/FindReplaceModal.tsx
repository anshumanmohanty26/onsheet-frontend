"use client";

import { parseCellRef } from "@/lib/utils/coordinates";
import type { CellMap } from "@/types/cell";
import type { CellCoord } from "@/types/selection";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface FindReplaceModalProps {
  cells: CellMap;
  onClose: () => void;
  /** Navigate to (highlight) a cell. */
  onNavigate: (coord: CellCoord) => void;
  /** Replace the value of a single cell. */
  onReplace: (ref: string, newValue: string) => void;
  /** Replace the value of all matched cells at once. */
  onReplaceAll: (pairs: Array<{ ref: string; newValue: string }>) => void;
}

export function FindReplaceModal({
  cells,
  onClose,
  onNavigate,
  onReplace,
  onReplaceAll,
}: FindReplaceModalProps) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeCell, setWholeCell] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [replaceCount, setReplaceCount] = useState<number | null>(null);
  const findRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Compute matches whenever find text or options change
  const matches = useMemo<string[]>(() => {
    if (!find) return [];
    const needle = matchCase ? find : find.toLowerCase();
    const results: string[] = [];
    for (const [ref, cell] of Object.entries(cells)) {
      const val = cell.raw ?? cell.computed ?? "";
      const haystack = matchCase ? val : val.toLowerCase();
      const matched = wholeCell ? haystack === needle : haystack.includes(needle);
      if (matched) results.push(ref);
    }
    // Sort by row then col so we navigate in reading order
    results.sort((a, b) => {
      const pa = parseCellRef(a);
      const pb = parseCellRef(b);
      if (!pa || !pb) return 0;
      return pa.row !== pb.row ? pa.row - pb.row : pa.col - pb.col;
    });
    return results;
  }, [find, cells, matchCase, wholeCell]);

  // Reset index when matches change
  // biome-ignore lint/correctness/useExhaustiveDependencies: matches.length (not matches) is intentional to avoid resets on content changes; find resets on new search term
  useEffect(() => {
    setCurrentIdx(0);
    setReplaceCount(null);
  }, [matches.length, find]);

  const navigateTo = useCallback(
    (ref: string) => {
      const coord = parseCellRef(ref);
      if (coord) onNavigate(coord);
    },
    [onNavigate],
  );

  const handleFindNext = useCallback(() => {
    if (matches.length === 0) return;
    const idx = (currentIdx + 1) % matches.length;
    setCurrentIdx(idx);
    navigateTo(matches[idx]);
  }, [matches, currentIdx, navigateTo]);

  const handleFindPrev = useCallback(() => {
    if (matches.length === 0) return;
    const idx = (currentIdx - 1 + matches.length) % matches.length;
    setCurrentIdx(idx);
    navigateTo(matches[idx]);
  }, [matches, currentIdx, navigateTo]);

  const handleReplace = useCallback(() => {
    if (matches.length === 0) return;
    const ref = matches[currentIdx];
    const cell = cells[ref];
    const raw = cell?.raw ?? "";
    const needle = matchCase ? find : find.toLowerCase();
    const haystack = matchCase ? raw : raw.toLowerCase();
    let newValue: string;
    if (wholeCell && haystack === needle) {
      newValue = replace;
    } else {
      const regex = new RegExp(escapeRegex(find), matchCase ? "g" : "gi");
      newValue = raw.replace(regex, replace);
    }
    onReplace(ref, newValue);
    handleFindNext();
    setReplaceCount(null);
  }, [matches, currentIdx, cells, find, replace, matchCase, wholeCell, onReplace, handleFindNext]);

  const handleReplaceAll = useCallback(() => {
    if (matches.length === 0) return;
    const pairs: Array<{ ref: string; newValue: string }> = [];
    for (const ref of matches) {
      const raw = cells[ref]?.raw ?? "";
      let newValue: string;
      if (wholeCell) {
        newValue = replace;
      } else {
        const regex = new RegExp(escapeRegex(find), matchCase ? "g" : "gi");
        newValue = raw.replace(regex, replace);
      }
      pairs.push({ ref, newValue });
    }
    onReplaceAll(pairs);
    setReplaceCount(pairs.length);
  }, [matches, cells, find, replace, matchCase, wholeCell, onReplaceAll]);

  const statusText = (() => {
    if (replaceCount !== null)
      return `Replaced ${replaceCount} cell${replaceCount !== 1 ? "s" : ""}.`;
    if (!find) return "";
    if (matches.length === 0) return "No matches found";
    return `${currentIdx + 1} of ${matches.length} matches`;
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[440px] border border-gray-200 animate-fade-in-scale">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Find & Replace</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div>
            <label htmlFor="find-input" className="block text-xs font-medium text-gray-500 mb-1">
              Find
            </label>
            <input
              id="find-input"
              ref={findRef}
              type="text"
              value={find}
              onChange={(e) => setFind(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFindNext();
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Search…"
            />
          </div>

          <div>
            <label htmlFor="replace-input" className="block text-xs font-medium text-gray-500 mb-1">
              Replace with
            </label>
            <input
              id="replace-input"
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleReplace();
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Replacement…"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded"
              />
              Match case
            </label>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wholeCell}
                onChange={(e) => setWholeCell(e.target.checked)}
                className="rounded"
              />
              Entire cell contents
            </label>
          </div>

          {statusText && (
            <p
              className={`text-xs ${matches.length === 0 && !replaceCount ? "text-red-500" : "text-emerald-600"}`}
            >
              {statusText}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFindPrev}
              disabled={matches.length === 0}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={handleFindNext}
              disabled={matches.length === 0}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next →
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReplace}
              disabled={matches.length === 0}
              className="px-3 py-1.5 text-xs bg-white border border-emerald-500 text-emerald-600 rounded-md hover:bg-emerald-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={matches.length === 0}
              className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Replace all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
