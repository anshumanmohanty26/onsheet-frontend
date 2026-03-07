"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";

export function DashboardNav() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center border-b border-gray-200 bg-white px-6 gap-4">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="text-xl font-bold text-emerald-600 tracking-tight shrink-0"
      >
        OnSheet
      </Link>

      <div className="flex-1" />

      {/* User menu */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[160px]">
          {user?.displayName}
        </span>

        {/* Avatar */}
        <button
          onClick={() => router.push("/settings")}
          className="size-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold flex items-center justify-center uppercase hover:bg-emerald-200 transition-colors"
          aria-label="Settings"
        >
          {user?.displayName?.[0] ?? "?"}
        </button>

        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
