const stats = [
  { value: "10M+", label: "Cells processed daily" },
  { value: "150+", label: "Built-in formulas" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "Avg formula latency" },
];

export function Stats() {
  return (
    <section
      className="border-t border-gray-100 bg-gray-50/60 py-16"
      aria-labelledby="stats-heading"
    >
      <h2 id="stats-heading" className="sr-only">
        OnSheet in numbers
      </h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-4xl font-semibold text-gray-900 mb-1">
                {stat.value}
              </dd>
              <dt className="text-sm text-gray-500">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export { Stats as StatsAndTestimonials };
