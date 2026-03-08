"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navLinks = [
  { href: "/settings", label: "Profile" },
  { href: "/settings/security", label: "Security" },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center border-b border-gray-200 bg-white px-6 gap-4">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-600 tracking-tight">
          OnSheet
        </Link>
        <span className="text-gray-300 text-lg">›</span>
        <span className="text-sm font-medium text-gray-700">Settings</span>
      </header>

      <div className="max-w-4xl mx-auto flex gap-8 px-6 py-10">
        {/* Sidebar nav */}
        <nav className="w-48 shrink-0">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={logout}
            className="mt-6 w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
