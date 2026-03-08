"use client";

import { ConfirmModal } from "@/components/ui/ConfirmModal";
import type { SheetMeta } from "@/types";
import { useState } from "react";
import { SheetTab } from "./SheetTab";

interface SheetTabsProps {
  sheets: SheetMeta[];
  activeSheetId: string | null;
  onSelect: (sheetId: string) => void;
  onAddSheet: () => void;
  onDeleteSheet?: (sheetId: string) => Promise<void> | void;
  canEdit?: boolean;
}

export function SheetTabs({
  sheets,
  activeSheetId,
  onSelect,
  onAddSheet,
  onDeleteSheet,
  canEdit = true,
}: SheetTabsProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingSheet = sheets.find((s) => s.id === pendingDeleteId);

  return (
    <>
      <div className="flex items-end border-t border-gray-200 bg-gray-50 overflow-x-auto shrink-0 h-10">
        {sheets.map((sheet) => (
          <SheetTab
            key={sheet.id}
            id={sheet.id}
            title={sheet.name}
            active={sheet.id === activeSheetId}
            canDelete={canEdit && sheets.length > 1 && !!onDeleteSheet}
            onClick={() => onSelect(sheet.id)}
            onDelete={() => setPendingDeleteId(sheet.id)}
          />
        ))}
        {canEdit && (
          <button
            type="button"
            onClick={onAddSheet}
            className="px-4 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-xl leading-none transition-colors h-full"
            title="Add sheet"
          >
            +
          </button>
        )}
      </div>

      <ConfirmModal
        open={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (pendingDeleteId && onDeleteSheet) await onDeleteSheet(pendingDeleteId);
        }}
        title="Delete sheet?"
        description={`"${pendingSheet?.name ?? ""}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete sheet"
      />
    </>
  );
}
