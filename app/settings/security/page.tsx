"use client";

import { ApiError } from "@/services/api";
import { userService } from "@/services/userService";
import { FormEvent, useState } from "react";

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative max-w-sm">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border px-3.5 py-2 pr-10 text-sm shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
            error ? "border-red-400" : "border-gray-200"
          }`}
          disabled={disabled}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex={-1}
        >
          {show ? (
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function SecuritySettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!current) e.current = "Required.";
    if (!next) e.next = "Required.";
    else if (next.length < 8) e.next = "At least 8 characters.";
    if (!confirm) e.confirm = "Required.";
    else if (next !== confirm) e.confirm = "Passwords don't match.";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setErrors({});
    setSuccess("");
    try {
      await userService.changePassword({ currentPassword: current, newPassword: next });
      setSuccess("Password changed successfully.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setErrors({ current: "Current password is incorrect." });
      } else {
        setErrors({
          general: err instanceof ApiError ? err.message : "Failed to change password.",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Security</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your password and account security.</p>
      </div>

      {/* Change password */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-5"
      >
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Change password
        </h2>

        <PasswordField
          id="current"
          label="Current password"
          value={current}
          onChange={(v) => {
            setCurrent(v);
            setErrors((p) => ({ ...p, current: "" }));
          }}
          disabled={saving}
          error={errors.current}
        />
        <PasswordField
          id="next"
          label="New password"
          value={next}
          onChange={(v) => {
            setNext(v);
            setErrors((p) => ({ ...p, next: "" }));
          }}
          disabled={saving}
          error={errors.next}
        />
        <PasswordField
          id="confirm"
          label="Confirm new password"
          value={confirm}
          onChange={(v) => {
            setConfirm(v);
            setErrors((p) => ({ ...p, confirm: "" }));
          }}
          disabled={saving}
          error={errors.confirm}
        />

        {errors.general && <p className="text-sm text-red-500">{errors.general}</p>}
        {success && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors"
          >
            {saving ? "Saving…" : "Update password"}
          </button>
        </div>
      </form>

      {/* Security info */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Session</h2>
        <p className="text-sm text-gray-500">
          You are authenticated via an httpOnly JWT cookie. Your access token expires automatically.
          Sign out to invalidate your session immediately.
        </p>
      </div>
    </div>
  );
}
