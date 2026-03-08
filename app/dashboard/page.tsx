"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { WorkbookCard } from "@/components/dashboard/WorkbookCard";
import { SharedWorkbookCard } from "@/components/dashboard/SharedWorkbookCard";
import { NewWorkbookModal } from "@/components/dashboard/NewWorkbookModal";
import { ImportModal } from "@/components/dashboard/ImportModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { workbookService, type Workbook, type SharedWorkbook } from "@/services/workbookService";
import { useAuth } from "@/lib/auth/AuthContext";
import { setPendingImport } from "@/lib/import/pendingImport";
import { cellRef } from "@/lib/utils/coordinates";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [workbooks, setWorkbooks] = useState<Workbook[]>([]);
  const [sharedWorkbooks, setSharedWorkbooks] = useState<SharedWorkbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);


  const loadWorkbooks = useCallback(async () => {
    try {
      const [owned, shared] = await Promise.all([
        workbookService.list(),
        workbookService.sharedWithMe(),
      ]);
      setWorkbooks(owned ?? []);
      setSharedWorkbooks(shared ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spreadsheets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkbooks();
  }, [loadWorkbooks]);

  async function handleCreate(title: string) {
    const workbook = await workbookService.create({ name: title });
    // Backend auto-creates a default "Sheet1" — navigate by workbook ID
    if (workbook.sheets?.[0]) {
      router.push(`/sheet/${workbook.id}`);
    } else {
      // Fallback: create sheet if backend didn't auto-create
      await workbookService.createSheet(workbook.id, { name: "Sheet1" });
      router.push(`/sheet/${workbook.id}`);
    }
  }

  async function handleDelete(id: string) {
    setDeleteTargetId(id);
  }

  async function handleImport(name: string, rows: string[][]) {
    const workbook = await workbookService.create({ name });
    let sheetId = workbook.sheets?.[0]?.id;

    if (!sheetId) {
      const sheet = await workbookService.createSheet(workbook.id, { name: "Sheet1" });
      sheetId = sheet.id;
    }

    // Build frontend store cells + backend API DTOs from parsed rows
    const cellsForStore: Record<string, { raw: string; computed: string }> = {};
    const cellsForApi: { row: number; col: number; rawValue: string }[] = [];
    for (let ri = 0; ri < rows.length; ri++) {
      for (let ci = 0; ci < rows[ri].length; ci++) {
        const val = rows[ri][ci];
        if (!val) continue;
        cellsForStore[cellRef(ri, ci)] = { raw: val, computed: val };
        cellsForApi.push({ row: ri, col: ci, rawValue: val });
      }
    }

    // Stash import data for the sheet page to pick up instantly
    setPendingImport({
      workbookId: workbook.id,
      sheetId,
      cellsForStore,
      cellsForApi,
    });

    // Navigate immediately — sheet renders the data optimistically
    router.push(`/sheet/${workbook.id}`);
  }

  const filtered = workbooks.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredShared = sharedWorkbooks.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <NewWorkbookModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImport={handleImport}
      />
      <ConfirmModal
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={async () => {
          if (!deleteTargetId) return;
          await workbookService.delete(deleteTargetId);
          setWorkbooks((prev) => prev.filter((w) => w.id !== deleteTargetId));
        }}
        title="Delete spreadsheet?"
        description="This spreadsheet and all its data will be permanently deleted. This cannot be undone."
        confirmLabel="Delete spreadsheet"
      />

      {/* Page header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user ? `Hello, ${user.displayName.split(" ")[0]} 👋` : "My spreadsheets"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            All your spreadsheets in one place
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowImport(true)} variant="secondary" size="md">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </Button>
          <Button onClick={() => setShowModal(true)} size="md">
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New spreadsheet
          </Button>
        </div>
      </div>

      {/* Search */}
      {workbooks.length > 0 && (
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search spreadsheets…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
          <span className="size-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          Loading…
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl bg-red-50 text-red-600 text-sm px-5 py-4 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && search && (
        <p className="text-sm text-gray-500 text-center py-16">
          No spreadsheets match &ldquo;{search}&rdquo;.
        </p>
      )}

      {!loading && !error && workbooks.length === 0 && sharedWorkbooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
            <svg
              className="size-8 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            No spreadsheets yet
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Create your first spreadsheet and start collaborating with your team.
          </p>
          <Button onClick={() => setShowModal(true)}>
            Create spreadsheet
          </Button>
        </div>
      )}

      {/* My spreadsheets grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((wb) => (
            <WorkbookCard key={wb.id} workbook={wb} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Shared with you section */}
      {!loading && filteredShared.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <svg className="size-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Shared with you
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredShared.map((wb) => (
              <SharedWorkbookCard key={wb.id} workbook={wb} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
