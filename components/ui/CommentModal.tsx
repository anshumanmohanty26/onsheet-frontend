"use client";

import { cellRef as makeCellRef } from "@/lib/utils/coordinates";
import { type CellComment, commentService } from "@/services/commentService";
import { useEffect, useRef, useState } from "react";

interface Props {
  sheetId: string;
  row: number;
  col: number;
  onClose: () => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CommentModal({ sheetId, row, col, onClose }: Props) {
  const [comments, setComments] = useState<CellComment[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const cellLabel = makeCellRef(row, col);

  useEffect(() => {
    setLoading(true);
    commentService
      .list(sheetId)
      .then((all) => setComments(all.filter((c) => c.row === row && c.col === col)))
      .catch(() => setError("Failed to load comments."))
      .finally(() => setLoading(false));
  }, [sheetId, row, col]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleAdd() {
    const text = input.trim();
    if (!text || saving) return;
    setSaving(true);
    setError(null);
    try {
      const comment = await commentService.add(sheetId, row, col, text);
      setComments((prev) => [...prev, comment]);
      setInput("");
      textareaRef.current?.focus();
    } catch {
      setError("Failed to post comment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await commentService.delete(sheetId, id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Failed to delete comment.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[420px] max-h-[70vh] flex flex-col border border-gray-200 animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Comments — <span className="font-normal text-gray-500">{cellLabel}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {loading ? (
            <p className="text-xs text-gray-400 text-center py-4">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="group flex gap-3">
                <div className="size-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                  {c.user.displayName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-gray-800">{c.user.displayName}</span>
                    <span className="text-[10px] text-gray-400">{formatDate(c.createdAt)}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="ml-auto text-[10px] text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 mt-0.5 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="px-5 pb-4 pt-3 border-t border-gray-100 space-y-2">
          {error && <p className="text-xs text-red-500">{error}</p>}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add a comment…"
            rows={2}
            className="w-full text-xs text-gray-800 border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!input.trim() || saving}
              className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
