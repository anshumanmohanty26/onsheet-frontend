import Link from "next/link";
import { SpreadsheetMockup } from "./SpreadsheetMockup";

export function Hero() {
  return (
    <section className="bg-white pt-16" aria-labelledby="hero-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 py-16 lg:py-20">
          {/* Left: text */}
          <div className="lg:w-[44%] flex-shrink-0">
            <h1
              id="hero-heading"
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl leading-tight"
            >
              Online, collaborative
              <br />
              spreadsheets
            </h1>
            <p className="mt-5 text-lg leading-8 text-gray-600 max-w-md">
              AI-powered spreadsheets help you and your team manage, visualise and analyse data —
              from any device, together.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-3 text-sm font-medium text-white hover:bg-emerald-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
              >
                Get started &mdash; it&apos;s free
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-7 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign in to OnSheet
              </Link>
            </div>
          </div>

          {/* Right: product mockup */}
          <div className="lg:flex-1 min-w-0">
            <div className="rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/80 overflow-hidden">
              <SpreadsheetMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
