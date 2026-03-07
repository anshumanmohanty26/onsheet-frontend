const COLUMNS = ["", "A", "B", "C", "D", "E", "F", "G"];

const ROWS: Array<Array<{ value: string; style?: string }>> = [
  [
    { value: "1" },
    { value: "Product", style: "font-semibold text-gray-700 dark:text-gray-300" },
    { value: "Q1 Sales", style: "font-semibold text-gray-700 dark:text-gray-300" },
    { value: "Q2 Sales", style: "font-semibold text-gray-700 dark:text-gray-300" },
    { value: "Q3 Sales", style: "font-semibold text-gray-700 dark:text-gray-300" },
    { value: "Q4 Sales", style: "font-semibold text-gray-700 dark:text-gray-300" },
    { value: "Total", style: "font-semibold text-gray-700 dark:text-gray-300" },
    { value: "Growth %", style: "font-semibold text-gray-700 dark:text-gray-300" },
  ],
  [
    { value: "2" },
    { value: "OnSheet Pro" },
    { value: "$12,400" },
    { value: "$15,200" },
    { value: "$18,900" },
    { value: "$24,100" },
    { value: "$70,600", style: "text-emerald-600 dark:text-emerald-400 font-medium" },
    { value: "+94.4%", style: "text-emerald-600 dark:text-emerald-400 font-medium" },
  ],
  [
    { value: "3" },
    { value: "OnSheet Team" },
    { value: "$8,300" },
    { value: "$9,700" },
    { value: "$11,200" },
    { value: "$14,800" },
    { value: "$44,000", style: "text-emerald-600 dark:text-emerald-400 font-medium" },
    { value: "+78.3%", style: "text-emerald-600 dark:text-emerald-400 font-medium" },
  ],
  [
    { value: "4" },
    { value: "OnSheet Free" },
    { value: "$0" },
    { value: "$0" },
    { value: "$0" },
    { value: "$0" },
    { value: "$0" },
    { value: "—", style: "text-gray-400" },
  ],
  [
    { value: "5" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
    { value: "" },
  ],
  [
    { value: "6" },
    { value: "Total", style: "font-semibold text-gray-700 dark:text-gray-300" },
    { value: "$20,700" },
    { value: "$24,900" },
    { value: "$30,100" },
    { value: "$38,900" },
    {
      value: "=SUM(B2:B4)",
      style:
        "font-mono text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40",
    },
    { value: "" },
  ],
];

export function SpreadsheetMockup() {
  return (
    <div className="w-full bg-white dark:bg-gray-900 select-none">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 px-4 py-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="ml-3 flex-1 rounded bg-gray-200 dark:bg-gray-800 h-5 max-w-xs text-xs flex items-center px-2 text-gray-500 dark:text-gray-500 truncate">
          onsheet.app/sheet/annual-revenue-2025
        </div>
        {/* Collaboration avatars */}
        <div className="ml-auto flex -space-x-2" aria-label="Active collaborators">
          {["#059669", "#7c3aed", "#ea580c"].map((color, i) => (
            <span
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            >
              {["A", "B", "C"][i]}
            </span>
          ))}
        </div>
      </div>

      {/* Formula bar */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3 py-1.5 gap-2 bg-white dark:bg-gray-900">
        <span className="text-xs font-mono text-gray-500 dark:text-gray-500 w-12 text-center border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5">
          F6
        </span>
        <span className="text-gray-300 dark:text-gray-700">|</span>
        <span className="text-xs font-mono text-violet-600 dark:text-violet-400">
          =SUM(B2:B4)
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse" role="grid" aria-label="Spreadsheet preview">
          {/* Column headers */}
          <thead>
            <tr>
              {COLUMNS.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`border-b border-r border-gray-200 dark:border-gray-700/60 bg-gray-50 dark:bg-gray-800/60 text-center text-gray-500 dark:text-gray-500 font-medium py-1.5 select-none ${
                    i === 0 ? "w-10" : "min-w-[90px]"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {ROWS.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={
                  rowIdx === 0
                    ? "bg-gray-50/80 dark:bg-gray-800/40"
                    : rowIdx % 2 === 0
                    ? "bg-gray-50/30 dark:bg-transparent"
                    : "bg-white dark:bg-gray-900"
                }
              >
                {row.map((cell, cellIdx) => (
                  <td
                    key={cellIdx}
                    className={`border-b border-r border-gray-200 dark:border-gray-700/60 px-2 py-1.5 ${
                      cellIdx === 0
                        ? "text-center text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/60 font-medium w-10 select-none"
                        : "text-gray-700 dark:text-gray-300"
                    } ${
                      // highlight active cell
                      rowIdx === 5 && cellIdx === 6
                        ? "ring-2 ring-inset ring-emerald-500"
                        : ""
                    } ${cell.style ?? ""}`}
                  >
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
