"use client";

import { Button } from "@/components/ui/Button";
import { FormEvent, useCallback, useRef, useState } from "react";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (name: string, rows: string[][]) => Promise<void>;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        row.push(current);
        current = "";
        rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }

  // Last field/row
  if (current || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}

function parseTSV(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.split("\t"));
}

/** Parse any supported file format into a 2D string array */
async function parseFile(file: File, ext: string): Promise<string[][]> {
  if (ext === "csv") return parseCSV(await file.text());
  if (ext === "tsv") return parseTSV(await file.text());

  // Excel / ODS / JSON → use SheetJS
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: "" });
  return rows.map((r) => (Array.isArray(r) ? r.map(String) : []));
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string[][] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setName("");
    setError("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ext = f.name.split(".").pop()?.toLowerCase();
    const SUPPORTED = ["csv", "tsv", "xlsx", "xls", "ods", "json"];
    if (!ext || !SUPPORTED.includes(ext)) {
      setError("Supported formats: .xlsx, .xls, .csv, .tsv, .ods, .json");
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setError("File too large (max 10 MB).");
      return;
    }

    setFile(f);
    setError("");
    setName(f.name.replace(/\.(csv|tsv|xlsx|xls|ods|json)$/i, ""));

    try {
      const rows = await parseFile(f, ext);
      setPreview(rows.slice(0, 5));
    } catch {
      setError("Could not parse file.");
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Select a file to import.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "csv";
      const rows = await parseFile(file, ext);
      await onImport(name.trim(), rows);
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      reset();
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Import spreadsheet</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* File drop zone */}
          <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-emerald-400 bg-gray-50 hover:bg-emerald-50/50 cursor-pointer transition-colors">
            <svg
              className="size-8 text-gray-400 mb-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? (
              <span className="text-sm text-emerald-600 font-medium">{file.name}</span>
            ) : (
              <>
                <span className="text-sm text-gray-500">Click to select a file</span>
                <span className="text-xs text-gray-400 mt-1">
                  .xlsx, .xls, .csv, .tsv, .ods, .json (max 10 MB)
                </span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv,.tsv,.ods,.json"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>

          {/* Name input */}
          {file && (
            <div>
              <label htmlFor="import-name" className="block text-sm font-medium text-gray-700 mb-1">
                Spreadsheet name
              </label>
              <input
                id="import-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={loading}
                autoComplete="off"
              />
            </div>
          )}

          {/* Preview */}
          {preview && preview.length > 0 && (
            <div className="overflow-auto max-h-36 rounded-lg border border-gray-200">
              <table className="w-full text-xs text-gray-600">
                <tbody>
                  {preview.map((row, ri) => (
                    <tr key={ri} className={ri === 0 ? "bg-gray-50 font-medium" : ""}>
                      {row.slice(0, 8).map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-2 py-1 border-r border-b border-gray-100 truncate max-w-[120px]"
                        >
                          {cell}
                        </td>
                      ))}
                      {row.length > 8 && <td className="px-2 py-1 text-gray-400">…</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length === 5 && (
                <div className="text-xs text-gray-400 text-center py-1">Showing first 5 rows</div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 justify-end pt-1">
            <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!file}>
              Import
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
