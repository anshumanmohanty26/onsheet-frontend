"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ShareButton } from "./ShareButton";
import { useAuth } from "@/lib/auth/AuthContext";

interface HeaderProps {
  title: string;
  workbookId?: string | null;
  onRename: (title: string) => void;
  onAiToggle?: () => void;
  aiOpen?: boolean;
}

export function Header({ title, workbookId, onRename, onAiToggle, aiOpen }: HeaderProps) {
  const { user, logout } = useAuth();
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
        className="text-lg font-bold text-emerald-600 tracking-tight shrink-0"
        title="Back to dashboard"
      >
        T
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
            if (e.key === "Escape") { setDraft(title); setEditing(false); }
          }}
          autoFocus
        />
      ) : (
        <button
          className="text-sm font-medium text-gray-800 hover:bg-gray-100 rounded px-2 py-0.5 max-w-[260px] truncate"
          onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 10); }}
          title="Click to rename"
        >
          {title}
        </button>
      )}

      <div className="flex-1" />

      <ShareButton workbookId={workbookId} />

      {/* AI Agent button */}
      {onAiToggle && (
        <button
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

      {/* User avatar */}
      <button
        onClick={logout}
        title={`Sign out (${user?.email})`}
        className="size-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center uppercase hover:bg-emerald-200 transition-colors"
      >
        {user?.displayName?.[0] ?? "?"}
      </button>
    </header>
  );
}
