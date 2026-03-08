"use client";

import { type Snapshot, snapshotService } from "@/services/snapshotService";
import { useCallback, useEffect, useState } from "react";

interface Props {
  workbookId: string;
  sheetId: string;
  onClose: () => void;
  onRestored: () => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VersionHistoryModal({ workbookId, sheetId, onClose, onRestored }: Props) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [newName, setNewName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await snapshotService.list(workbookId, sheetId);
      setSnapshots(data);
      if (data.length > 0) setSelected(data[0].id);
    } catch {
      setError("Failed to load version history.");
    } finally {
      setLoading(false);
    }
  }, [workbookId, sheetId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSaveNamed() {
    const name = newName.trim() || "Named version";
    setSaving(true);
    setError(null);
    try {
      await snapshotService.create(workbookId, sheetId, name);
      setNewName("");
      setShowNameInput(false);
      await load();
    } catch {
      setError("Failed to save version.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRestore() {
    if (!selected) return;
    setRestoring(true);
    setError(null);
    try {
      await snapshotService.restore(workbookId, sheetId, selected);
      onRestored();
      onClose();
    } catch {
      setError("Failed to restore version.");
    } finally {
      setRestoring(false);
    }
  }

  const selectedSnapshot = snapshots.find((s) => s.id === selected);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[680px] max-h-[80vh] flex flex-col border border-gray-200 animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Version history</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — version list */}
          <div className="w-56 border-r border-gray-100 flex flex-col overflow-y-auto shrink-0">
            {/* Save named version button */}
            <div className="p-3 border-b border-gray-100">
              {showNameInput ? (
                <div className="flex flex-col gap-1.5">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveNamed();
                      if (e.key === "Escape") setShowNameInput(false);
                    }}
                    placeholder="Version name…"
                    className="text-xs border border-gray-200 rounded px-2 py-1.5 w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={handleSaveNamed}
                      disabled={saving}
                      className="flex-1 text-xs bg-blue-600 text-white rounded px-2 py-1 hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNameInput(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNameInput(true)}
                  className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium text-left"
                >
                  + Save current version
                </button>
              )}
            </div>

            {/* Version list */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                Loading…
              </div>
            ) : snapshots.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400 px-4 text-center">
                No saved versions yet
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto">
                {snapshots.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(s.id)}
                      className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
                        selected === s.id
                          ? "bg-blue-50 border-l-2 border-l-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-800 truncate">{s.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(s.createdAt)}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate">{s.user.displayName}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Main panel — version details */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedSnapshot ? (
              <div className="flex-1 p-5 overflow-y-auto">
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  {selectedSnapshot.name}
                </div>
                <div className="text-xs text-gray-500 mb-0.5">
                  {formatDate(selectedSnapshot.createdAt)}
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  Saved by {selectedSnapshot.user.displayName}
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500 text-center">
                  Restoring this version will replace the current sheet contents.
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                Select a version to see details
              </div>
            )}

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              {error && <p className="text-xs text-red-500">{error}</p>}
              {!error && <span />}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs px-3 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={!selected || restoring}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {restoring ? "Restoring…" : "Restore this version"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
