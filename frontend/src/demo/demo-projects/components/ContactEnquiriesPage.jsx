import { useEffect, useMemo, useState } from "react";

import {
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileText,
  LoaderCircle,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { SITE_API } from "../utils.js";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  service: "",
  message: "",
  status: "new",
  adminNote: "",
};

const STATUS_CONFIG = {
  new: {
    label: "New",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20",
  },

  contacted: {
    label: "Contacted",
    dot: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20",
  },

  closed: {
    label: "Closed",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/20",
  },
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-300",
      bg: "bg-slate-100 dark:bg-slate-800",
      border: "border-slate-200 dark:border-slate-700",
    }
  );
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "text-[10px] font-black uppercase tracking-wide",
        config.bg,
        config.text,
        config.border,
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />

      {config.label}
    </span>
  );
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-200"
    >
      {children}
    </label>
  );
}

function StatCard({ title, value, caption, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-1.5 truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-400">{caption}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
        {Icon && <Icon size={12} />}
        {label}
      </div>

      <p className="mt-1.5 break-words text-sm font-semibold leading-5 text-slate-800 dark:text-slate-200">
        {value || "—"}
      </p>
    </div>
  );
}

export default function ContactEnquiriesPage() {
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  /* =====================================================
     LOAD ENQUIRIES
  ====================================================== */

  async function load(manual = false) {
    try {
      setError("");

      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${SITE_API}/api/contact-enquiries`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Contact enquiries could not be loaded.",
        );
      }

      setItems(Array.isArray(result.data) ? result.data : []);
    } catch (loadError) {
      setError(loadError?.message || "Contact enquiries could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* =====================================================
     SAVE
  ====================================================== */

  async function save(event) {
    event.preventDefault();

    if (!editing?.id) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${SITE_API}/api/contact-enquiries/${editing.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(editing),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Enquiry could not be updated.");
      }

      setItems((current) =>
        current.map((item) => (item.id === editing.id ? result.data : item)),
      );

      setEditing(null);

      if (viewing?.id === editing.id) {
        setViewing(result.data);
      }

      setMessage("Contact enquiry updated successfully.");
    } catch (saveError) {
      setError(saveError?.message || "Enquiry could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     DELETE
  ====================================================== */

  async function remove(id) {
    if (!id) return;

    const confirmed = window.confirm(
      "Delete this contact enquiry permanently?",
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${SITE_API}/api/contact-enquiries/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Enquiry could not be deleted.");
      }

      setItems((current) => current.filter((item) => item.id !== id));

      if (viewing?.id === id) {
        setViewing(null);
      }

      if (editing?.id === id) {
        setEditing(null);
      }

      setMessage("Contact enquiry deleted successfully.");
    } catch (deleteError) {
      setError(deleteError?.message || "Enquiry could not be deleted.");
    } finally {
      setDeletingId("");
    }
  }

  /* =====================================================
     COUNTS
  ====================================================== */

  const counts = useMemo(() => {
    return {
      total: items.length,

      new: items.filter((item) => item.status === "new").length,

      contacted: items.filter((item) => item.status === "contacted").length,

      closed: items.filter((item) => item.status === "closed").length,
    };
  }, [items]);

  /* =====================================================
     FILTER
  ====================================================== */

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const searchable = [
        item.name,
        item.email,
        item.phone,
        item.service,
        item.message,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const matchesFilter = filter === "all" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [items, search, filter]);

  return (
    <section className="min-w-0 space-y-6 pb-10">
      {/* =================================================
          HEADER
      ================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Contact enquiries
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Review messages submitted from your public contact page, update
              their status and keep internal notes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading || refreshing}
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 sm:w-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* =================================================
          ALERT
      ================================================== */}

      {(error || message) && (
        <div
          className={[
            "flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm",
            error
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
          ].join(" ")}
        >
          {error ? (
            <X size={17} className="mt-0.5 shrink-0" />
          ) : (
            <Check size={17} className="mt-0.5 shrink-0" />
          )}

          <span className="min-w-0 flex-1 break-words leading-6">
            {error || message}
          </span>

          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
            }}
            className="rounded-lg p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
            aria-label="Close alert"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* =================================================
          STATS
      ================================================== */}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total enquiries"
          value={counts.total}
          caption="All submitted messages"
          icon={MessageSquare}
        />

        <StatCard
          title="New"
          value={counts.new}
          caption="Need attention"
          icon={Clock3}
        />

        <StatCard
          title="Contacted"
          value={counts.contacted}
          caption="Already followed up"
          icon={Phone}
        />

        <StatCard
          title="Closed"
          value={counts.closed}
          caption="Completed enquiries"
          icon={Check}
        />
      </div>

      {/* =================================================
          TOOLBAR
      ================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-black text-slate-900 dark:text-white">
              Enquiry inbox
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search by name, phone, email, service or message.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <div className="relative min-w-0 sm:w-[280px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search enquiries..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            >
              <option value="all">All enquiries</option>

              <option value="new">New</option>

              <option value="contacted">Contacted</option>

              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {!loading && (
          <p className="mt-3 text-[11px] font-semibold text-slate-400">
            Showing {filteredItems.length} of {items.length} enquiries
          </p>
        )}
      </div>

      {/* =================================================
          LIST
      ================================================== */}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex gap-4">
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-64 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length ? (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* AVATAR */}

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <UserRound size={18} />
                  </div>

                  {/* MAIN */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-black text-slate-900 dark:text-white sm:text-base">
                            {item.name || "Unknown person"}
                          </h3>

                          <StatusBadge status={item.status} />
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail size={12} />
                              {item.email}
                            </span>
                          )}

                          {item.phone && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">
                                •
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <Phone size={12} />
                                {item.phone}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <p className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                        {item.service || "General enquiry"}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.message || "No message provided."}
                    </p>

                    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-[11px] text-slate-400">
                        {item.adminNote ? "Admin note added" : "No admin note"}
                      </div>

                      <div className="flex w-full gap-2 sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setViewing(item)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 sm:flex-none"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditing({
                              ...EMPTY,
                              ...item,
                            })
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-emerald-500/10 sm:flex-none"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10 sm:flex-none"
                        >
                          {deletingId === item.id ? (
                            <LoaderCircle size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Delete
                        </button>

                        <ChevronRight
                          size={15}
                          className="my-auto hidden text-slate-300 sm:block dark:text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center dark:border-slate-700 dark:bg-slate-950">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
            <Search size={23} />
          </div>

          <h3 className="mt-4 text-base font-black text-slate-900 dark:text-white">
            {search || filter !== "all"
              ? "No matching enquiries"
              : "No contact enquiries yet"}
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
            {search || filter !== "all"
              ? "Try another search term or change the selected status filter."
              : "Messages submitted through your public contact page will appear here."}
          </p>
        </div>
      )}

      {/* =================================================
          VIEW MODAL
      ================================================== */}

      {viewing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => setViewing(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  Contact enquiry
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-black text-slate-900 dark:text-white">
                    {viewing.name || "Unknown person"}
                  </h2>

                  <StatusBadge status={viewing.status} />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewing(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem label="Name" value={viewing.name} icon={UserRound} />

                <InfoItem label="Email" value={viewing.email} icon={Mail} />

                <InfoItem label="Phone" value={viewing.phone} icon={Phone} />

                <InfoItem
                  label="Service"
                  value={viewing.service || "General enquiry"}
                  icon={FileText}
                />

                <InfoItem
                  label="Status"
                  value={getStatusConfig(viewing.status).label}
                  icon={Check}
                />

                <InfoItem
                  label="Received"
                  value={formatDate(viewing.createdAt)}
                  icon={Clock3}
                />
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Message
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                  {viewing.message || "No message provided."}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Admin note
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                  {viewing.adminNote || "No internal note has been added."}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setViewing(null);

                    setEditing({
                      ...EMPTY,
                      ...viewing,
                    });
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <Edit3 size={15} />
                  Edit enquiry
                </button>

                <button
                  type="button"
                  onClick={() => remove(viewing.id)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          EDIT MODAL
      ================================================== */}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onClick={() => !saving && setEditing(null)}
        >
          <form
            onSubmit={save}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            {/* HEADER */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  Manage enquiry
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                  Edit enquiry
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update contact details, status and internal notes.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FieldLabel htmlFor="edit-name">Name</FieldLabel>

                  <div className="relative">
                    <UserRound
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="edit-name"
                      required
                      value={editing.name || ""}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="edit-phone">Phone</FieldLabel>

                  <div className="relative">
                    <Phone
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="edit-phone"
                      required
                      value={editing.phone || ""}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="edit-email">Email</FieldLabel>

                  <div className="relative">
                    <Mail
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="edit-email"
                      required
                      type="email"
                      value={editing.email || ""}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="edit-service">Service</FieldLabel>

                  <div className="relative">
                    <FileText
                      size={15}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="edit-service"
                      value={editing.service || ""}
                      onChange={(event) =>
                        setEditing((current) => ({
                          ...current,
                          service: event.target.value,
                        }))
                      }
                      placeholder="General enquiry"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel htmlFor="edit-status">Status</FieldLabel>

                  <select
                    id="edit-status"
                    value={editing.status || "new"}
                    onChange={(event) =>
                      setEditing((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="new">New</option>

                    <option value="contacted">Contacted</option>

                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel htmlFor="edit-message">Message</FieldLabel>

                  <textarea
                    id="edit-message"
                    rows={6}
                    value={editing.message || ""}
                    onChange={(event) =>
                      setEditing((current) => ({
                        ...current,
                        message: event.target.value,
                      }))
                    }
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <FieldLabel htmlFor="edit-note">Admin Note</FieldLabel>

                  <textarea
                    id="edit-note"
                    rows={4}
                    value={editing.adminNote || ""}
                    onChange={(event) =>
                      setEditing((current) => ({
                        ...current,
                        adminNote: event.target.value,
                      }))
                    }
                    placeholder="Add an internal note for your team..."
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex flex-col gap-2 border-t border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                <X size={15} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}

                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
