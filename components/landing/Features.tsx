"use client";

import { useState } from "react";

/* ─── Tabs ─── */
const TABS = [
  { id: "ai", label: "AI Features" },
  { id: "create", label: "Create" },
  { id: "collaborate", label: "Collaborate" },
  { id: "access", label: "Web App" },
  { id: "security", label: "Security" },
];

/* ─── Feature list data ─── */
const createItems = [
  {
    title: "Format and design your spreadsheet quickly",
    description:
      "Apply cell styles, conditional formatting, and custom number formats in seconds. Headers, colours, and borders — your data, beautifully presented.",
  },
  {
    title: "Build spreadsheets with AI assistance",
    description:
      'Describe what you need and OnSheet AI generates the structure, formulas, and layout automatically. Try: "Create a quarterly budget tracker with totals."',
  },
  {
    title: "Review and sort data with flexibility",
    description:
      "Sort, filter, group, and pivot your data without altering the original. Multiple views of a single source of truth.",
  },
  {
    title: "Use 150+ built-in formulas",
    description:
      "XLOOKUP, ARRAYFORMULA, dynamic arrays — the full set, with inline autocomplete and formula documentation as you type.",
  },
];

const collaborateItems = [
  {
    title: "Edit together in real time",
    description:
      "See every change as it happens with colour-coded cursors showing exactly who is working where. No one overwrites anyone else.",
  },
  {
    title: "Comment and assign tasks to your team",
    description:
      "Use @mentions to notify teammates and assign action items directly from a comment thread — no context switching required.",
  },
  {
    title: "Share with granular permissions",
    description:
      "Choose who can view, comment, or edit. Set expiry dates on shared links and revoke access at any time.",
  },
  {
    title: "Full version history",
    description:
      "Every edit is saved automatically. Restore any cell or sheet to any point in time without losing work.",
  },
];

const accessItems = [
  {
    title: "Works in any modern browser",
    description:
      "No plugins or downloads required. Open, edit, and share spreadsheets directly from Chrome, Safari, Firefox, or Edge — just a URL.",
  },
  {
    title: "Real-time cloud sync",
    description:
      "Every keystroke is saved automatically. Open the same sheet on two tabs and watch changes appear instantly across both.",
  },
  {
    title: "Share with a link",
    description:
      "Send a view-only or edit link to anyone. No account required to view. Granular permissions control exactly what each person can do.",
  },
  {
    title: "Import and export any format",
    description:
      "Open .xlsx, .csv, and .ods files instantly. Export with formatting perfectly preserved — ready to share with anyone.",
  },
];

/* ─── Scatter data typed properly ─── */
const scatterPoints: [number, number, string][] = [
  [30, 95, "#34d399"], [55, 70, "#34d399"], [80, 105, "#34d399"],
  [105, 50, "#34d399"], [135, 85, "#a78bfa"], [160, 42, "#a78bfa"],
  [178, 100, "#f87171"], [200, 62, "#f87171"], [220, 80, "#f87171"],
  [242, 45, "#34d399"], [262, 72, "#a78bfa"], [278, 35, "#f87171"],
];

const scatterLegend: [string, string][] = [
  ["#34d399", "Low churn risk"],
  ["#a78bfa", "Medium churn risk"],
  ["#f87171", "High churn risk"],
];

/* ─── Visuals ─── */

function AIVisual() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg shadow-gray-100">
      {/* Mini scatter chart */}
      <div className="bg-gray-50 px-5 pt-5 pb-4 border-b border-gray-100">
        <p className="text-[10px] font-medium text-gray-400 mb-3">
          &#8599; Churn Risk by Total Spend &amp; Monthly Recurring Revenue
        </p>
        <svg viewBox="0 0 300 120" className="w-full" aria-hidden="true">
          {scatterPoints.map(([cx, cy, fill], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="6"
              fill={fill}
              fillOpacity="0.65"
            />
          ))}
        </svg>
        <div className="flex flex-wrap gap-3 mt-2">
          {scatterLegend.map(([c, l]) => (
            <span
              key={l}
              className="flex items-center gap-1.5 text-[9px] text-gray-500"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: c }}
                aria-hidden="true"
              />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* AI chat panel */}
      <div className="p-4">
        <div className="rounded-xl border border-gray-200 bg-white shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-600 text-sm" aria-hidden="true">
              &#10022;
            </span>
            <span className="text-xs font-semibold text-gray-800">
              OnSheet AI
            </span>
          </div>
          <p className="text-sm font-medium text-emerald-600 mb-0.5">
            Hello!
          </p>
          <p className="text-xs text-gray-600 mb-3">
            How can I help with your data today?
          </p>
          <div className="space-y-2">
            {[
              { label: "Generate a chart", icon: "📊" },
              { label: "Analyse for insights", icon: "🔍" },
              { label: "Create a formula", icon: "⚡" },
            ].map((opt) => (
              <div
                key={opt.label}
                className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700"
              >
                <span aria-hidden="true">{opt.icon}</span>
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const createRows = [
  ["Jessica Malora", "ORD-4821", "$249"],
  ["Daniel Fernandez", "ORD-4822", "$189"],
  ["Akiko Nakamura", "ORD-4823", "$329"],
  ["Jennifer Adams", "ORD-4824", "$99"],
  ["Simon Bellings", "ORD-4825", "$449"],
];
const rowDotColors = ["#34d399", "#fb923c", "#a78bfa", "#f87171", "#60a5fa"];

function CreateVisual() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100 overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" aria-hidden="true" />
        <div className="flex items-center gap-1.5 ml-3 text-xs font-medium text-emerald-700">
          <svg width="12" height="12" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="4" fill="#059669" fillOpacity="0.15" />
            <rect x="6" y="6" width="6" height="6" rx="1" fill="#059669" />
            <rect x="16" y="6" width="6" height="6" rx="1" fill="#059669" fillOpacity="0.5" />
            <rect x="6" y="16" width="6" height="6" rx="1" fill="#059669" fillOpacity="0.5" />
            <rect x="16" y="16" width="6" height="6" rx="1" fill="#059669" />
          </svg>
          Summer sale revenue
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-700 border border-gray-200 rounded px-2 py-0.5 bg-white">
            Share
          </span>
          <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[9px] font-bold">
            A
          </span>
        </div>
      </div>

      {/* Grid header */}
      <div className="flex bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
        {["", "Customer", "Order number", "RRP"].map((h, i) => (
          <div
            key={i}
            className={`border-r border-gray-200 px-2.5 py-1.5 ${i === 0 ? "w-7 text-center" : "flex-1"}`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      {createRows.map((row, ri) => (
        <div
          key={ri}
          className={`flex border-b border-gray-100 text-xs ${ri === 1 ? "bg-blue-50/40" : ""}`}
        >
          <div className="w-7 border-r border-gray-100 flex items-center justify-center py-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: rowDotColors[ri] }}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 border-r border-gray-100 px-2.5 py-1.5 text-gray-700">
            {row[0]}
          </div>
          <div
            className={`flex-1 border-r border-gray-100 px-2.5 py-1.5 text-gray-700 ${ri === 1 ? "ring-1 ring-inset ring-blue-400 bg-blue-50" : ""}`}
          >
            {row[1]}
          </div>
          <div className="flex-1 px-2.5 py-1.5 text-gray-700">{row[2]}</div>
        </div>
      ))}

      {/* AI bar */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="text-emerald-600 flex-shrink-0 text-sm" aria-hidden="true">
            &#10022;
          </span>
          <p className="text-xs text-emerald-800">
            <span className="font-semibold">OnSheet AI: </span>
            Create a revenue tracker for the latest summer sale and include ID,
            customer and order number.
          </p>
        </div>
      </div>
    </div>
  );
}

const collabUsers = [
  { c: "#059669", l: "A" },
  { c: "#7c3aed", l: "B" },
  { c: "#ea580c", l: "C" },
];

const collabGrid = [
  ["", "A", "B", "C"],
  ["1", "Department", "Budget", "Spent"],
  ["2", "Engineering", "$120,000", "$98,400"],
  ["3", "Marketing", "$80,000", "$71,200"],
  ["4", "Operations", "$45,000", "$41,800"],
];

const collabComments = [
  {
    name: "Sienna Maynard",
    color: "#a78bfa",
    msg: "@alex.kim Assigned to Alex Kim",
  },
  {
    name: "Alex Kim",
    color: "#059669",
    msg: "@sienna.maynard Assigned to Sienna",
  },
];

function CollabVisual() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100 overflow-hidden p-5">
      {/* Title bar */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" aria-hidden="true" />
        <span className="ml-2 text-xs text-gray-500">Q4 Budget — OnSheet</span>
        <div className="ml-auto flex -space-x-2">
          {collabUsers.map((u) => (
            <span
              key={u.l}
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: u.c }}
              aria-hidden="true"
            >
              {u.l}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-lg border border-gray-200 text-xs mb-3">
        {collabGrid.map((row, ri) => (
          <div key={ri} className="flex border-b border-gray-100 last:border-b-0">
            {row.map((cell, ci) => (
              <div
                key={ci}
                className={`px-2.5 py-1.5 border-r border-gray-100 last:border-r-0 ${
                  ri === 0 || ci === 0
                    ? "bg-gray-50 font-medium text-gray-500 w-10 text-center"
                    : ri === 2 && ci === 3
                    ? "flex-1 bg-purple-50 text-purple-700 font-medium ring-1 ring-inset ring-purple-200"
                    : "flex-1 text-gray-700"
                }`}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
          style={{ backgroundColor: "#7c3aed" }}
          aria-hidden="true"
        >
          B
        </span>
        <span className="text-xs text-gray-400 italic">Beth is editing C3&#8230;</span>
      </div>

      {/* Comments panel */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-800">Comments</span>
          <button
            type="button"
            aria-label="Close comments"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {collabComments.map((c) => (
          <div key={c.name} className="mb-3 last:mb-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                style={{ backgroundColor: c.color }}
                aria-hidden="true"
              >
                {c.name[0]}
              </span>
              <span className="text-xs font-medium text-gray-800">{c.name}</span>
            </div>
            <p className="text-xs text-emerald-700 ml-7">{c.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const accessFiles = [
  { name: "Q4 Revenue Model.onsheet", tag: "Shared", color: "text-emerald-600 bg-emerald-50" },
  { name: "HR Headcount 2026.onsheet", tag: "Private", color: "text-gray-500 bg-gray-100" },
  { name: "Marketing Budget.onsheet", tag: "Shared", color: "text-emerald-600 bg-emerald-50" },
];

function AccessVisual() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100 overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" aria-hidden="true" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" aria-hidden="true" />
        {/* Address bar */}
        <div className="flex-1 mx-3 rounded-md bg-white border border-gray-200 flex items-center gap-2 px-3 py-1">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
          </svg>
          <span className="text-[10px] text-gray-400 select-none">app.onsheet.io/sheets</span>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="ml-auto" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        {/* Tab strip */}
        <div className="flex gap-1">
          {["Q4 Budget", "+ New"].map((tab, i) => (
            <span
              key={tab}
              className={`text-[10px] px-2.5 py-0.5 rounded-t-md border border-b-0 ${
                i === 0
                  ? "bg-white border-gray-200 text-gray-700 font-medium"
                  : "bg-gray-50 border-transparent text-gray-400"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* File list */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-700">My spreadsheets</p>
          <span className="text-[10px] text-emerald-600 font-medium cursor-pointer">+ New</span>
        </div>
        <div className="space-y-2">
          {accessFiles.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <svg width="14" height="14" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <rect width="28" height="28" rx="4" fill="#059669" fillOpacity="0.12" />
                  <rect x="6" y="6" width="6" height="6" rx="1" fill="#059669" />
                  <rect x="16" y="6" width="6" height="6" rx="1" fill="#059669" fillOpacity="0.5" />
                  <rect x="6" y="16" width="6" height="6" rx="1" fill="#059669" fillOpacity="0.5" />
                  <rect x="16" y="16" width="6" height="6" rx="1" fill="#059669" />
                </svg>
                <span className="text-xs text-gray-700 truncate max-w-[170px]">{file.name}</span>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${file.color}`}>
                {file.tag}
              </span>
            </div>
          ))}
        </div>
        {/* Sync indicator */}
        <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-600">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          All changes saved to cloud
        </div>
      </div>
    </div>
  );
}

const securityFeatures = [
  {
    title: "AES-256 encryption, everywhere",
    description:
      "Data is encrypted at rest with AES-256 and in transit with TLS 1.3. Your spreadsheet contents are never readable by OnSheet staff.",
  },
  {
    title: "Granular sharing permissions",
    description:
      "Assign Viewer, Commenter, or Editor roles per sheet or workbook. Set link expiry and revoke access instantly.",
  },
  {
    title: "SSO / SAML 2.0",
    description:
      "Integrate with Okta, Azure AD, Google Workspace, or any SAML‑compliant identity provider with one-click setup.",
  },
  {
    title: "Full audit logs",
    description:
      "Every read, write, and share event is recorded and exportable. Know exactly who accessed what and when.",
  },
];

const securityBadges = [
  { label: "SOC 2 Type II", sub: "Audited annually" },
  { label: "GDPR", sub: "EU data residency" },
  { label: "99.9% SLA", sub: "Multi-region infra" },
  { label: "<50 ms", sub: "Median latency" },
];

function SecurityVisual() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-800">Security centre</p>
          <p className="text-[10px] text-gray-400">All systems operational</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Protected
        </span>
      </div>

      {/* Checklist */}
      <div className="divide-y divide-gray-100">
        {[
          "Encryption at rest &#38; in transit",
          "Role-based access control",
          "SAML 2.0 single sign-on",
          "Audit log retention — 12 months",
          "Automated threat detection",
          "99.9% uptime SLA",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 px-5 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-500 flex-shrink-0" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#d1fae5" />
              <path d="M8 12l3 3 5-5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="text-xs text-gray-700"
              dangerouslySetInnerHTML={{ __html: item }}
            />
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-3">Compliance</p>
        <div className="grid grid-cols-2 gap-2">
          {securityBadges.map((b) => (
            <div key={b.label} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
              <p className="text-xs font-semibold text-gray-800">{b.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Accordion feature list ─── */
function FeatureList({
  items,
}: {
  items: { title: string; description: string }[];
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onClick={() => setActive(i)}
          className={`w-full text-left px-5 py-4 border-l-[3px] transition-all border-b border-gray-100 last:border-b-0 ${
            active === i
              ? "border-l-emerald-500 bg-emerald-50/40"
              : "border-l-transparent hover:bg-gray-50"
          }`}
        >
          <p
            className={`text-sm font-medium leading-snug ${
              active === i ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {item.title}
          </p>
          {active === i && (
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Main export ─── */
export function Features() {
  const [activeTab, setActiveTab] = useState("ai");

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div id="features">

      {/* ── Sticky tab nav ── */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Feature sections" className="flex justify-center">
            <div className="inline-flex gap-1 rounded-full bg-gray-100 p-1 overflow-x-auto max-w-full">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* ── AI section ── */}
      <section
        id="section-ai"
        className="bg-white py-20 sm:py-28 border-t border-gray-100"
        aria-labelledby="ai-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-16">
            <div className="lg:w-1/2">
              <AIVisual />
            </div>
            <div className="lg:w-1/2">
              <p className="text-sm font-medium text-emerald-600 mb-3">
                &#10022; AI Features
              </p>
              <h2
                id="ai-heading"
                className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                Become a data pro
                <br />
                with AI in OnSheet
              </h2>
              <p className="mt-5 text-base text-gray-600 leading-7">
                With OnSheet AI you can quickly create trackers, tables, and
                advanced data visualisations using plain-English prompts. Ask AI
                to create formulas, analyse your data, and surface valuable
                insights — no pivot tables required.
              </p>
              <a
                href="/signup"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Try AI features free &#8594;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Create section ── */}
      <section
        id="section-create"
        className="bg-gray-50/60 py-20 sm:py-28 border-t border-gray-100"
        aria-labelledby="create-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              id="create-heading"
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              Quickly build spreadsheets
            </h2>
            <p className="mt-3 text-base text-gray-500">
              Input accurate, high-quality data with ease and speed.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
            <div className="lg:w-1/2">
              <CreateVisual />
            </div>
            <div className="lg:w-1/2">
              <FeatureList items={createItems} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Collaborate section ── */}
      <section
        id="section-collaborate"
        className="bg-white py-20 sm:py-28 border-t border-gray-100"
        aria-labelledby="collaborate-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              id="collaborate-heading"
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              Work better, together
            </h2>
            <p className="mt-3 text-base text-gray-500">
              Real-time collaboration that keeps every teammate aligned.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
            <div className="lg:w-1/2">
              <FeatureList items={collaborateItems} />
            </div>
            <div className="lg:w-1/2">
              <CollabVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ── Anywhere Access section ── */}
      <section
        id="section-access"
        className="bg-gray-50/60 py-20 sm:py-28 border-t border-gray-100"
        aria-labelledby="access-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2
              id="access-heading"
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            >
              Open in your browser,
              <br className="hidden sm:block" />
              ready in seconds
            </h2>
            <p className="mt-3 text-base text-gray-500">
              No downloads, no installs. OnSheet runs entirely in the browser &mdash; open a link and start working.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
            <div className="lg:w-1/2">
              <AccessVisual />
            </div>
            <div className="lg:w-1/2">
              <FeatureList items={accessItems} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Security section ── */}
      <section
        id="section-security"
        className="bg-gray-50/60 py-20 sm:py-28 border-t border-gray-100"
        aria-labelledby="security-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 lg:items-start">
            <div className="lg:w-1/2">
              <SecurityVisual />
            </div>
            <div className="lg:w-1/2 lg:pt-2">
              <p className="text-sm font-medium text-emerald-600 mb-3">Security</p>
              <h2
                id="security-heading"
                className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-5"
              >
                Enterprise-grade security,
                <br className="hidden sm:block" />
                built in from day one
              </h2>
              <FeatureList items={securityFeatures} />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
