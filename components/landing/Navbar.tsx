import Link from "next/link";
import { NavbarMobileMenu } from "./NavbarMobileMenu";

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Templates", href: "/templates" },
  { label: "Docs", href: "/docs" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-xl text-gray-900">
          <LogoIcon />
          OnSheet
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Get started free
          </Link>
        </div>

        <NavbarMobileMenu links={navLinks} />
      </nav>
    </header>
  );
}

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#059669" />
      <rect x="5" y="5" width="7" height="7" rx="1" fill="white" fillOpacity="0.95" />
      <rect x="16" y="5" width="7" height="7" rx="1" fill="white" fillOpacity="0.55" />
      <rect x="5" y="16" width="7" height="7" rx="1" fill="white" fillOpacity="0.55" />
      <rect x="16" y="16" width="7" height="7" rx="1" fill="white" fillOpacity="0.95" />
    </svg>
  );
}
