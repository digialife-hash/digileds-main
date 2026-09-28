import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
  ChevronDown,
  GraduationCap,
  Building2,
  Banknote,
  Code2,
  MessageCircle,
} from "lucide-react";
import { SITE_API } from "../utils.js";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUSES = ["new", "reviewing", "shortlisted", "rejected", "hired"];

const STATUS_CONFIG = {
  new: {
    label: "New",
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20",
  },
  reviewing: {
    label: "Reviewing",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20",
  },
  shortlisted: {
    label: "Shortlisted",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20",
  },
  hired: {
    label: "Hired",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20",
  },
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeUrl(value) {
  if (!value) return "";

  const stringValue = String(value).trim();

  if (!stringValue) return "";

  if (
    stringValue.startsWith("http://") ||
    stringValue.startsWith("https://") ||
    stringValue.startsWith("blob:")
  ) {
    return stringValue;
  }

  if (stringValue.startsWith("//")) {
    return `https:${stringValue}`;
  }

  if (stringValue.startsWith("/")) {
    return `${SITE_API}${stringValue}`;
  }

  return `${SITE_API}/${stringValue.replace(/^\/+/, "")}`;
}

function getResumeUrl(item) {
  /*
    Backend me commonly inme se koi field aa sakti hai:
    resumeUrl
    resumePath
    resume
    fileUrl
    filePath

    Jo milega usko use kiya jayega.
  */

  const possibleValues = [
    item?.resumeUrl,
    item?.resumePath,
    item?.resume,
    item?.fileUrl,
    item?.filePath,
  ];

  const found = possibleValues.find(
    (value) => value && typeof value === "string" && value.trim(),
  );

  if (!found && !item?.id) return "";

  if (item?.id) {
    return `${SITE_API}/api/career-applications/${encodeURIComponent(item.id)}/resume`;
  }

  return normalizeUrl(found);
}

function getResumeName(item) {
  return (
    item?.resumeName ||
    item?.resumeOriginalName ||
    item?.fileName ||
    item?.resume_file_name ||
    "Resume"
  );
}

function getResumeType(name = "") {
  const extension = String(name).split(".").pop()?.toLowerCase();

  if (extension === "pdf") return "PDF";
  if (extension === "doc") return "DOC";
  if (extension === "docx") return "DOCX";

  return "FILE";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatShortDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      className:
        "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    }
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  accent = "emerald",
}) {
  const accentClasses = {
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400",
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400",
  };

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">
            {title} 
          </p>

          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {value}
          </p>

          {description && (
            <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClasses[accent]}`}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({ label, value, icon: Icon, children, full = false }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="shrink-0 text-emerald-500" />}

        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>

      {children || (
        <p className="mt-2 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   RESUME CARD
========================================================= */

function ResumeCard({ item }) {
  const resumeUrl = getResumeUrl(item);
  const resumeName = getResumeName(item);
  const resumeType = getResumeType(resumeName);

  const handleDownload = async () => {
    if (!resumeUrl) {
      return;
    }

    try {
      const response = await fetch(resumeUrl, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Resume could not be downloaded.");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = resumeName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Resume download error:", error);

      /*
        Fallback:
        Open direct URL when fetch/blob download is
        blocked by server CORS or file headers.
      */
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-400/[0.06]">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400">
            <FileText size={21} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900 dark:text-white">
              {resumeName}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {resumeType} Resume
            </p>
          </div>
        </div>

        {resumeUrl ? (
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-black text-white transition hover:bg-emerald-600 sm:flex-none"
            >
              <Download size={15} />
              Download
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            Resume file URL is not available
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function CareerSubmissionsPage() {
  const [items, setItems] = useState([]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  async function load(options = {}) {
    const isRefresh = options.refresh === true;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${SITE_API}/api/career-applications`, {
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Career applications could not be loaded.",
        );
      }

      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (loadError) {
      setError(loadError.message || "Career applications could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  useEffect(() => {
    if (!message && !error) {
      return;
    }

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, error]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const stats = useMemo(() => {
    return {
      total: items.length,
      new: items.filter((item) => item.status === "new").length,
      reviewing: items.filter((item) => item.status === "reviewing").length,
      shortlisted: items.filter((item) => item.status === "shortlisted").length,
      hired: items.filter((item) => item.status === "hired").length,
    };
  }, [items]);

  /* =======================================================
     FILTERED
  ======================================================= */

  const filtered = useMemo(() => {
    const searchValue = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return [
        item.firstName,
        item.lastName,
        item.email,
        item.phone,
        item.opening,
        item.status,
        item.city,
        item.state,
        item.skills,
        item.currentCompany,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
    });
  }, [items, query, statusFilter]);

  /* =======================================================
     SAVE STATUS
  ======================================================= */

  async function save(event) {
    event.preventDefault();

    if (!editing?.id) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${SITE_API}/api/career-applications/${editing.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status: editing.status,
            adminNote: editing.adminNote,
          }),
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Career application could not be updated.",
        );
      }

      setItems((current) =>
        current.map((item) => (item.id === editing.id ? result.data : item)),
      );

      setViewing(result.data);
      setEditing(null);

      setMessage("Career application updated successfully.");
    } catch (saveError) {
      setError(saveError.message || "Career application could not be updated.");
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function remove(id) {
    const candidate = items.find((item) => item.id === id);

    const name = candidate
      ? `${candidate.firstName || ""} ${candidate.lastName || ""}`.trim()
      : "this candidate";

    if (!window.confirm(`Delete ${name || "this candidate"} permanently?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${SITE_API}/api/career-applications/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Career application could not be deleted.",
        );
      }

      setItems((current) => current.filter((item) => item.id !== id));

      if (viewing?.id === id) {
        setViewing(null);
      }

      if (editing?.id === id) {
        setEditing(null);
      }

      setMessage("Career application deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError.message || "Career application could not be deleted.",
      );
    }
  }

  /* =======================================================
     DELETE ALL
  ======================================================= */

  async function removeAll() {
    if (!items.length) {
      return;
    }

    const confirmed = window.confirm(
      `Delete all ${items.length} career applications permanently? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      /*
        Sequential delete:
        Safer for backend than firing all requests at once.
      */

      const failed = [];

      for (const item of items) {
        try {
          const response = await fetch(
            `${SITE_API}/api/career-applications/${item.id}`,
            {
              method: "DELETE",
              credentials: "include",
            },
          );

          const result = await response.json().catch(() => ({}));

          if (!response.ok || !result.success) {
            failed.push(item.id);
          }
        } catch {
          failed.push(item.id);
        }
      }

      if (failed.length) {
        await load({ refresh: true });

        throw new Error(
          `${failed.length} application(s) could not be deleted.`,
        );
      }

      setItems([]);
      setViewing(null);
      setEditing(null);

      setMessage("All career applications deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError.message || "Some career applications could not be deleted.",
      );
    }
  }

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeViewing = () => {
    if (editing) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Close anyway?",
      );

      if (!confirmClose) {
        return;
      }
    }

    setEditing(null);
    setViewing(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="min-w-0 space-y-5 pb-10">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">

            <h1 className="mt-3 break-words text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Career Applications
            </h1>

            <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review candidate applications, manage recruitment status, and
              download submitted resumes.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => load({ refresh: true })}
              disabled={refreshing}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={removeAll}
              disabled={!items.length || loading}
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400"
            >
              <Trash2 size={15} />
              Delete all
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          ALERTS
      =================================================== */}

      {(error || message) && (
        <div
          className={`flex min-w-0 items-start gap-3 rounded-2xl border px-4 py-3 ${
            error
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-400/10 dark:text-rose-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-400/10 dark:text-emerald-300"
          }`}
        >
          {error ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          )}

          <p className="min-w-0 break-words text-sm font-semibold leading-6">
            {error || message}
          </p>
        </div>
      )}

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-5">
        <StatCard
          title="Total Applications"
          value={stats.total}
          description="All submissions"
          icon={Users}
          accent="emerald"
        />

        <StatCard
          title="New"
          value={stats.new}
          description="Needs review"
          icon={Send}
          accent="sky"
        />

        <StatCard
          title="Reviewing"
          value={stats.reviewing}
          description="Under review"
          icon={Clock3}
          accent="amber"
        />

        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          description="Next stage"
          icon={CheckCircle2}
          accent="emerald"
        />

        <StatCard
          title="Hired"
          value={stats.hired}
          description="Selected candidates"
          icon={BriefcaseBusiness}
          accent="violet"
        />
      </div>

      {/* ===================================================
          FILTER BAR
      =================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-xl">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, phone, position, skills..."
              className="box-border h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-900"
            />
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:min-w-[170px]"
              >
                <option value="all">All Statuses</option>

                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getStatusConfig(status).label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <div className="hidden shrink-0 rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400 sm:block">
              {filtered.length} result
              {filtered.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        {(query || statusFilter !== "all") && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              Active filters:
            </span>

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Search: {query}
                <X size={11} />
              </button>
            )}

            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Status: {getStatusConfig(statusFilter).label}
                <X size={11} />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
              className="text-[10px] font-black text-emerald-600 hover:text-emerald-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="flex animate-pulse items-center gap-4 rounded-2xl border border-slate-100 p-4 dark:border-slate-900"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800" />

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-64 max-w-full rounded bg-slate-100 dark:bg-slate-900" />
                </div>

                <div className="h-7 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
              <Users size={28} />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
              No applications found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try changing your search or status filter.
            </p>

            {(query || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                }}
                className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/70">
                <tr>
                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Candidate
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Position
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Experience
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Applied
                  </th>

                  <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => {
                  const candidateName =
                    `${item.firstName || ""} ${item.lastName || ""}`.trim() ||
                    "Unnamed Candidate";

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-900 dark:hover:bg-slate-900/60"
                    >
                      {/* Candidate */}
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                            <User size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate font-black text-slate-900 dark:text-white">
                              {candidateName}
                            </p>

                            <p className="mt-1 max-w-[250px] truncate text-xs text-slate-500">
                              {item.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Position */}
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-2">
                          <BriefcaseBusiness
                            size={15}
                            className="shrink-0 text-emerald-500"
                          />

                          <span className="max-w-[240px] truncate font-semibold text-slate-700 dark:text-slate-200">
                            {item.opening || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-5 py-4">
                        <span className="text-slate-600 dark:text-slate-300">
                          {item.experience || "—"}
                        </span>
                      </td>

                      {/* Applied */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <CalendarDays size={14} className="shrink-0" />

                          <span>
                            {formatShortDate(
                              item.createdAt ||
                                item.created_at ||
                                item.submittedAt,
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status || "new"} />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewing(item)}
                            title="View application"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            <Eye size={16} />
                          </button>

                          {getResumeUrl(item) && (
                            <a
                              href={getResumeUrl(item)}
                              target="_blank"
                              rel="noreferrer"
                              title="View resume"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-400/10"
                            >
                              <FileText size={16} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            title="Delete application"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-400/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================
          APPLICATION DETAIL MODAL
      =================================================== */}

      {viewing && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeViewing();
            }
          }}
        >
          <div className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-slate-950 sm:max-h-[92vh] sm:rounded-[28px]">
            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div className="relative shrink-0 overflow-hidden border-b border-emerald-900/20 bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] px-5 py-5 text-white sm:px-7 sm:py-6">
              <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl" />

              <div className="relative flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-100">
                      <ShieldCheck size={12} />
                      Candidate Profile
                    </span>

                    <StatusBadge status={viewing.status || "new"} />
                  </div>

                  <h2 className="mt-3 break-words text-xl font-black sm:text-2xl">
                    {viewing.firstName || ""} {viewing.lastName || ""}
                  </h2>

                  <div className="mt-2 flex max-w-full flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-white/70">
                    {viewing.email && (
                      <a
                        href={`mailto:${viewing.email}`}
                        className="inline-flex items-center gap-1.5 transition hover:text-white"
                      >
                        <Mail size={13} />
                        {viewing.email}
                      </a>
                    )}

                    {viewing.phone && (
                      <a
                        href={`tel:${viewing.phone}`}
                        className="inline-flex items-center gap-1.5 transition hover:text-white"
                      >
                        <Phone size={13} />
                        {viewing.phone}
                      </a>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeViewing}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                  aria-label="Close candidate details"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* =============================================
                MODAL BODY
            ============================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
                {/* Main */}
                <div className="min-w-0 space-y-6 p-5 sm:p-7">
                  {/* Position */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <BriefcaseBusiness
                        size={18}
                        className="text-emerald-500"
                      />

                      <h3 className="font-black text-slate-900 dark:text-white">
                        Application Details
                      </h3>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem
                        label="Applied Position"
                        value={viewing.opening}
                        icon={BriefcaseBusiness}
                      />

                      <DetailItem
                        label="Experience"
                        value={viewing.experience}
                        icon={Clock3}
                      />

                      <DetailItem
                        label="Qualification"
                        value={viewing.qualification}
                        icon={GraduationCapIcon}
                      />

                      <DetailItem
                        label="Location"
                        value={`${viewing.city || ""}${
                          viewing.city && viewing.state ? ", " : ""
                        }${viewing.state || ""}`}
                        icon={MapPin}
                      />

                      <DetailItem
                        label="Current Company"
                        value={viewing.currentCompany}
                        icon={BuildingIcon}
                      />

                      <DetailItem
                        label="Current CTC"
                        value={viewing.currentCtc}
                        icon={BanknoteIcon}
                      />

                      <DetailItem
                        label="Expected CTC"
                        value={viewing.expectedCtc}
                        icon={BanknoteIcon}
                      />

                      <DetailItem
                        label="Notice Period"
                        value={viewing.noticePeriod}
                        icon={Clock3}
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <User size={18} className="text-emerald-500" />

                      <h3 className="font-black text-slate-900 dark:text-white">
                        Contact Information
                      </h3>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                      <DetailItem label="Email Address" icon={Mail}>
                        {viewing.email ? (
                          <a
                            href={`mailto:${viewing.email}`}
                            className="mt-2 block break-all text-sm font-semibold text-emerald-600 hover:underline"
                          >
                            {viewing.email}
                          </a>
                        ) : (
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            —
                          </p>
                        )}
                      </DetailItem>

                      <DetailItem label="Phone Number" icon={Phone}>
                        {viewing.phone ? (
                          <a
                            href={`tel:${viewing.phone}`}
                            className="mt-2 block text-sm font-semibold text-emerald-600 hover:underline"
                          >
                            {viewing.phone}
                          </a>
                        ) : (
                          <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            —
                          </p>
                        )}
                      </DetailItem>
                    </div>
                  </div>

                  {/* Professional profiles */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Globe size={18} className="text-emerald-500" />

                      <h3 className="font-black text-slate-900 dark:text-white">
                        Professional Profiles
                      </h3>
                    </div>

                    <div className="grid min-w-0 grid-cols-1 gap-3">
                      {viewing.linkedin && (
                        <a
                          href={normalizeUrl(viewing.linkedin)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              LinkedIn
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {viewing.linkedin}
                            </p>
                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-emerald-500"
                          />
                        </a>
                      )}

                      {viewing.github && (
                        <a
                          href={normalizeUrl(viewing.github)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              GitHub
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {viewing.github}
                            </p>
                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-emerald-500"
                          />
                        </a>
                      )}

                      {viewing.portfolio && (
                        <a
                          href={normalizeUrl(viewing.portfolio)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900"
                        >
                          <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Portfolio
                            </p>

                            <p className="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {viewing.portfolio}
                            </p>
                          </div>

                          <ExternalLink
                            size={16}
                            className="shrink-0 text-emerald-500"
                          />
                        </a>
                      )}

                      {!viewing.linkedin &&
                        !viewing.github &&
                        !viewing.portfolio && (
                          <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                            No professional profile links provided.
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <CodeIcon />
                      <h3 className="font-black text-slate-900 dark:text-white">
                        Skills
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                        {viewing.skills || "No skills provided."}
                      </p>
                    </div>
                  </div>

                  {/* Motivation */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <MessageIcon />
                      <h3 className="font-black text-slate-900 dark:text-white">
                        Motivation
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                        {viewing.motivation ||
                          "No motivation message provided."}
                      </p>
                    </div>
                  </div>

                  {/* Cover letter */}
                  {viewing.coverLetter && (
                    <div>
                      <div className="mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-emerald-500" />

                        <h3 className="font-black text-slate-900 dark:text-white">
                          Cover Letter
                        </h3>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                          {viewing.coverLetter}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-emerald-500" />

                      <h3 className="font-black text-slate-900 dark:text-white">
                        Resume
                      </h3>
                    </div>

                    <ResumeCard item={viewing} />
                  </div>
                </div>

                {/* =========================================
                    SIDEBAR
                ========================================= */}

                <aside className="min-w-0 border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="lg:sticky lg:top-0">
                    <div className="mb-4 flex items-center gap-2">
                      <ShieldCheck size={17} className="text-emerald-500" />

                      <h3 className="font-black text-slate-900 dark:text-white">
                        Application Management
                      </h3>
                    </div>

                    {/* Current status */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Current Status
                      </p>

                      <div className="mt-3">
                        <StatusBadge status={viewing.status || "new"} />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-start gap-3">
                        <CalendarDays
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />

                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Applied On
                          </p>

                          <p className="mt-1 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {formatDate(
                              viewing.createdAt ||
                                viewing.created_at ||
                                viewing.submittedAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Admin note */}
                    {editing ? (
                      <form
                        onSubmit={save}
                        className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 dark:border-emerald-900 dark:bg-slate-900"
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Update Application
                        </p>

                        <label className="mt-4 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Status
                        </label>

                        <select
                          value={editing.status}
                          onChange={(event) =>
                            setEditing({
                              ...editing,
                              status: event.target.value,
                            })
                          }
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {getStatusConfig(status).label}
                            </option>
                          ))}
                        </select>

                        <label className="mt-4 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Admin Note
                        </label>

                        <textarea
                          value={editing.adminNote}
                          onChange={(event) =>
                            setEditing({
                              ...editing,
                              adminNote: event.target.value,
                            })
                          }
                          rows={5}
                          placeholder="Internal recruitment note..."
                          className="mt-2 box-border w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />

                        <div className="mt-3 flex gap-2">
                          <button
                            type="submit"
                            className="inline-flex min-h-[43px] flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-black text-white hover:bg-emerald-600"
                          >
                            <CheckCircle2 size={15} />
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="inline-flex min-h-[43px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-black text-slate-600 dark:border-slate-700 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {viewing.adminNote && (
                          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-400/[0.06]">
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                              Admin Note
                            </p>

                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-amber-800 dark:text-amber-300">
                              {viewing.adminNote}
                            </p>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              id: viewing.id,
                              status: viewing.status || "new",
                              adminNote: viewing.adminNote || "",
                            })
                          }
                          className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Edit Status & Note
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => remove(viewing.id)}
                      className="mt-3 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-400"
                    >
                      <Trash2 size={16} />
                      Delete Application
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   SAFE ICON WRAPPERS
   Avoid depending on potentially unavailable exports.
========================================================= */

function GraduationCapIcon({ size = 18, className = "" }) {
  return <GraduationCap size={size} className={className} />;
}

function BuildingIcon({ size = 18, className = "" }) {
  return <Building2 size={size} className={className} />;
}

function BanknoteIcon({ size = 18, className = "" }) {
  return <Banknote size={size} className={className} />;
}

function CodeIcon() {
  return <Code2 size={18} className="text-emerald-500" />;
}

function MessageIcon() {
  return <MessageCircle size={18} className="text-emerald-500" />;
}
