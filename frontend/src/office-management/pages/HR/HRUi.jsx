/* eslint-disable react-refresh/only-export-components */
import {
  AlertCircle,
  Inbox,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const PageHeader = ({ eyebrow = "HR Workspace", title, description, action }) => (
  <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

export const Panel = ({ title, description, action, children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
    {(title || description || action) && (
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h2 className="text-base font-black text-slate-950">{title}</h2>}
          {description && <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const StatCard = ({ label, value, icon: Icon, tone = "blue", detail }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  };
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
          {detail && <p className="mt-1 text-xs font-semibold text-slate-400">{detail}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone] || tones.blue}`}>
          <Icon size={20} />
        </div>
      </div>
    </article>
  );
};

export const StatusBadge = ({ value }) => (
  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700 ring-1 ring-slate-200">
    {String(value || "unknown").replaceAll("_", " ")}
  </span>
);

export const LoadingState = ({ label = "Loading..." }) => (
  <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white">
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
      <LoaderCircle className="animate-spin" size={18} />
      {label}
    </div>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 shrink-0" size={18} />
      <div>
        <p className="font-bold">Unable to load this section</p>
        <p className="mt-1 font-medium">{message}</p>
      </div>
    </div>
    {onRetry && (
      <button type="button" onClick={onRetry} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200">
        <RefreshCcw size={14} /> Retry
      </button>
    )}
  </div>
);

export const EmptyState = ({ label = "No records found." }) => (
  <div className="flex min-h-40 flex-col items-center justify-center rounded-xl bg-slate-50 px-5 text-center">
    <Inbox size={24} className="text-slate-400" />
    <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
  </div>
);

export const Table = ({ headers, children }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
      <thead className="bg-slate-50">
        <tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">{header}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
    </table>
  </div>
);

export const Cell = ({ children, className = "" }) => (
  <td className={`whitespace-nowrap px-4 py-3.5 font-medium text-slate-700 ${className}`}>{children}</td>
);
