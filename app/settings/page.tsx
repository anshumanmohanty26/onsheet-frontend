"use client";

import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApiError } from "@/services/api";
import { userService } from "@/services/userService";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    if (trimmed === user?.displayName) return;

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await userService.updateProfile({ displayName: trimmed });
      await refresh();
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your personal information.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="size-16 rounded-full bg-emerald-100 text-emerald-700 text-2xl font-semibold flex items-center justify-center uppercase select-none">
          {user.displayName[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">{user.displayName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-5"
      >
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic info</h2>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setError("");
              setSuccess("");
            }}
            className="w-full max-w-sm rounded-lg border border-gray-200 px-3.5 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            disabled={saving}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="settings-email"
            type="email"
            value={user.email}
            disabled
            className="w-full max-w-sm rounded-lg border border-gray-100 bg-gray-50 px-3.5 py-2 text-sm text-gray-400 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <div>
          <button
            type="submit"
            disabled={saving || displayName.trim() === user.displayName}
            className="h-10 px-5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-white p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide">Danger zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Delete account</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Permanently delete your account and all your data.
            </p>
          </div>
          <button
            type="button"
            className="h-9 px-4 rounded-lg border border-red-300 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await userService.deleteAccount();
          await userService.logout();
          router.push("/login");
        }}
        title="Delete your account?"
        description="This will permanently delete your account and all your spreadsheets. This action cannot be undone."
        confirmLabel="Delete my account"
      />
    </div>
  );
}
