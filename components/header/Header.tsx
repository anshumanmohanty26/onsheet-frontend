"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import type { CollabUser } from "@/types/collaboration";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShareButton } from "./ShareButton";

interface HeaderProps {
  title: string;
  workbookId?: string | null;
  onRename: (title: string) => void;
  onAiToggle?: () => void;
  aiOpen?: boolean;
  /** Online collaborators to show as avatar circles next to the share button. */
  collaborators?: CollabUser[];
  /** Only OWNERs should be able to invite / remove people. */
  canManage?: boolean;
}

export function Header({
  title,
  workbookId,
  onRename,
  onAiToggle,
  aiOpen,
  collaborators,
  canManage,
}: HeaderProps) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(title), [title]);

  function commitRename() {
    setEditing(false);
    const trimmed = draft.trim() || "Untitled spreadsheet";
    if (trimmed !== title) onRename(trimmed);
    setDraft(trimmed);
  }

  return (
    <header className="flex items-center h-12 px-3 gap-3 border-b border-gray-200 bg-white shrink-0">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 shrink-0"
        title="Back to dashboard"
      >
        <Image src="/onsheet.svg" alt="OnSheet" width={22} height={22} className="rounded" />
      </Link>

      {/* Editable title */}
      {editing ? (
        <input
          ref={inputRef}
          className="text-sm font-medium text-gray-800 border border-emerald-400 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-emerald-400 max-w-[260px]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraft(title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className="text-sm font-medium text-gray-800 hover:bg-gray-100 rounded px-2 py-0.5 max-w-[260px] truncate"
          onClick={() => {
            setEditing(true);
            setTimeout(() => inputRef.current?.select(), 10);
          }}
          title="Click to rename"
        >
          {title}
        </button>
      )}

      <div className="flex-1" />

      {/* Online collaborator avatars */}
      {collaborators && collaborators.length > 0 && (
        <div className="flex items-center -space-x-1.5">
          {collaborators.slice(0, 5).map((user) => (
            <div
              key={user.socketId ?? user.id}
              className="size-7 rounded-full text-white text-xs font-semibold flex items-center justify-center uppercase border-2 border-white shrink-0"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name[0]}
            </div>
          ))}
          {collaborators.length > 5 && (
            <div className="size-7 rounded-full text-gray-600 text-xs font-semibold flex items-center justify-center bg-gray-200 border-2 border-white shrink-0">
              +{collaborators.length - 5}
            </div>
          )}
        </div>
      )}

      {canManage && <ShareButton workbookId={workbookId} canManage={canManage} />}

      {/* AI Agent button */}
      {onAiToggle && (
        <button
          type="button"
          onClick={onAiToggle}
          title="OnSheet AI — ask anything about this sheet"
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            aiOpen
              ? "bg-emerald-600 text-white"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span>✨</span>
          <span>AI</span>
        </button>
      )}

      {/* User avatar → profile settings */}
      <Link
        href="/settings"
        title={`Profile settings (${user?.email})`}
        className="size-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center uppercase hover:bg-emerald-200 transition-colors"
      >
        {user?.displayName?.[0] ?? "?"}
      </Link>
    </header>
  );
}
