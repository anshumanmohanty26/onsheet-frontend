"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  type Permission,
  type PermissionRole,
  spreadsheetService,
} from "@/services/spreadsheetService";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Custom role picker ────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: PermissionRole; label: string; desc: string }[] = [
  { value: "viewer", label: "Viewer", desc: "Can read only" },
  { value: "commenter", label: "Commenter", desc: "Can read & comment" },
  { value: "editor", label: "Editor", desc: "Can edit" },
];

function RoleSelect({
  value,
  onChange,
}: {
  value: PermissionRole;
  onChange: (r: PermissionRole) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = ROLE_OPTIONS.find((o) => o.value === value) ?? ROLE_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150 whitespace-nowrap"
      >
        {selected.label}
        <svg
          className={`size-3.5 text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border border-gray-100 bg-white shadow-xl shadow-black/10 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`flex w-full flex-col items-start px-3 py-2.5 text-left transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-gray-50 ${
                opt.value === value ? "bg-emerald-50" : ""
              }`}
            >
              <span
                className={`text-xs font-medium ${opt.value === value ? "text-emerald-700" : "text-gray-800"}`}
              >
                {opt.label}
                {opt.value === value && (
                  <svg
                    className="ml-1.5 inline size-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span className="text-[10px] text-gray-400">{opt.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Share button + modal ──────────────────────────────────────────────────────

interface ShareButtonProps {
  workbookId?: string | null;
  /** Only OWNERs can invite / revoke / toggle public access. */
  canManage?: boolean;
}

export function ShareButton({ workbookId, canManage = false }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<PermissionRole>("viewer");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [shareToken, setShareToken] = useState<string | null>(null);
  const [publicAccess, setPublicAccess] = useState(false);
  const [publicToggling, setPublicToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadPermissions = useCallback(async () => {
    if (!workbookId) return;
    try {
      setPermissions(await spreadsheetService.listPermissions(workbookId));
    } catch {
      /* silently ignore */
    }
  }, [workbookId]);

  const loadShareInfo = useCallback(async () => {
    if (!workbookId) return;
    try {
      const info = await spreadsheetService.getShareInfo(workbookId);
      setShareToken(info.shareToken);
      setPublicAccess(info.publicAccess);
    } catch {
      /* silently ignore */
    }
  }, [workbookId]);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setError("");
    setSuccessMsg("");
    loadPermissions();
    loadShareInfo();
  }, [loadPermissions, loadShareInfo]);

  const handleShare = useCallback(async () => {
    if (!workbookId || !email.trim()) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const newPerm = await spreadsheetService.share(workbookId, { email: email.trim(), role });
      setEmail("");
      // Add / update person in the list optimistically
      setPermissions((prev) => {
        const idx = prev.findIndex((p) => p.userId === newPerm.userId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = newPerm;
          return updated;
        }
        return [...prev, newPerm];
      });
      setSuccessMsg(`${newPerm.name ?? email.trim()} has been given ${newPerm.role} access.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to share");
    } finally {
      setLoading(false);
    }
  }, [workbookId, email, role]);

  const handleRevoke = useCallback(
    async (userId: string) => {
      if (!workbookId) return;
      try {
        await spreadsheetService.revokeAccess(workbookId, userId);
        setPermissions((p) => p.filter((x) => x.userId !== userId));
      } catch {
        /* silently ignore */
      }
    },
    [workbookId],
  );

  const handlePublicToggle = useCallback(async () => {
    if (!workbookId) return;
    setPublicToggling(true);
    setError("");
    try {
      const updated = await spreadsheetService.setPublicAccess(workbookId, !publicAccess);
      setPublicAccess(updated.publicAccess);
      if (updated.shareToken) setShareToken(updated.shareToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update link access");
    } finally {
      setPublicToggling(false);
    }
  }, [workbookId, publicAccess]);

  const shareLink = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${shareToken}`
    : null;

  const handleCopy = useCallback(() => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareLink]);

  return (
    <>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-600 active:scale-95 transition-all duration-150"
        onClick={handleOpen}
      >
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Share spreadsheet">
        <div className="flex flex-col gap-5">
          {/* ── Anyone with the link ── */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm">
                  <svg
                    className="size-4 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">Anyone with the link</div>
                  <div className="text-[11px] text-gray-400">View-only · no sign-in required</div>
                </div>
              </div>
              {/* Toggle — owners only */}
              {canManage ? (
                <button
                  type="button"
                  disabled={publicToggling}
                  onClick={handlePublicToggle}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    publicAccess ? "bg-emerald-500" : "bg-gray-200"
                  } ${publicToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block size-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      publicAccess ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              ) : (
                <span
                  className={`text-[11px] font-medium ${publicAccess ? "text-emerald-600" : "text-gray-400"}`}
                >
                  {publicAccess ? "On" : "Off"}
                </span>
              )}
            </div>

            {publicAccess && shareLink && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[11px] text-gray-500 font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-150 ${
                    copied
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            )}
          </div>

          {/* ── Invite by email — owners only ── */}
          {canManage && (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Invite people
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleShare();
                    }}
                  />
                </div>
                <RoleSelect value={role} onChange={setRole} />
                <Button size="sm" onClick={handleShare} loading={loading}>
                  Invite
                </Button>
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-500 animate-in fade-in duration-150">{error}</p>
              )}
              {successMsg && (
                <p className="mt-2 text-xs text-emerald-600 animate-in fade-in duration-150">
                  ✓ {successMsg}
                </p>
              )}
            </div>
          )}

          {/* ── People with access ── */}
          {permissions.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                People with access
              </p>
              {permissions.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors duration-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[10px] font-bold uppercase">
                      {p.name?.charAt(0) ?? p.email.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">{p.name}</div>
                      <div className="text-[11px] text-gray-400">{p.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">
                      {ROLE_OPTIONS.find((o) => o.value === p.role)?.label ?? p.role}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(p.userId)}
                        className="rounded px-1.5 py-0.5 text-[11px] text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
