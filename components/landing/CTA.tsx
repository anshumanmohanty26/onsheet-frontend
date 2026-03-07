import Link from "next/link";

export function CTA() {
  return (
    <section
      className="bg-white border-t border-gray-100 py-24 sm:py-32"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="cta-heading"
          className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl"
        >
          Your team is ready.
          <br />
          <span className="text-emerald-600">
            Your spreadsheet should be too.
          </span>
        </h2>
        <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
          Get started in seconds &mdash; no templates to configure, no plugins to
          install. Just open OnSheet and start working.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Start for free
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto rounded-full border border-gray-300 px-8 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Sign in to your account &#8594;
          </Link>
        </div>

        <p className="mt-5 text-sm text-gray-400">
          No credit card required &middot; Up to 5 users free &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}
