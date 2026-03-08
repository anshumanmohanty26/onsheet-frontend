"use client";

import type { SharedWorkbook } from "@/services/workbookService";
import { useRouter } from "next/navigation";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ROLE_LABEL: Record<string, string> = {
  viewer: "Viewer",
  editor: "Editor",
  commenter: "Commenter",
};

const ROLE_COLORS: Record<string, string> = {
  viewer: "bg-blue-50 text-blue-600",
  editor: "bg-emerald-50 text-emerald-700",
  commenter: "bg-amber-50 text-amber-700",
};

interface SharedWorkbookCardProps {
  workbook: SharedWorkbook;
}

export function SharedWorkbookCard({ workbook }: SharedWorkbookCardProps) {
  const router = useRouter();
  const ownerName = workbook.owner.displayName ?? workbook.owner.email;
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const roleClass = ROLE_COLORS[workbook.myRole] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
      {/* Thumbnail */}
      <button
        type="button"
        onClick={() => router.push(`/sheet/${workbook.id}`)}
        className="h-36 rounded-t-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center focus:outline-none"
        aria-label={`Open ${workbook.name}`}
      >
        <svg
          className="size-12 text-blue-200"
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
      </button>

      {/* Role badge */}
      <span
        className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleClass}`}
      >
        {ROLE_LABEL[workbook.myRole] ?? workbook.myRole}
      </span>

      {/* Footer */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800 truncate" title={workbook.name}>
          {workbook.name}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-white text-[8px] font-bold">
            {ownerInitial}
          </div>
          <p className="text-[11px] text-gray-400 truncate" title={ownerName}>
            {ownerName}
          </p>
          <span className="text-gray-200">·</span>
          <p className="text-[11px] text-gray-400 shrink-0">{formatDate(workbook.updatedAt)}</p>
        </div>
      </div>
    </div>
  );
}
