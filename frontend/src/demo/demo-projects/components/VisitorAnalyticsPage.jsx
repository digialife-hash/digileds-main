import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Clock3,
  Globe2,
  Monitor,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { SectionHeading } from "./DashboardPrimitives.jsx";

const API_URL = import.meta.env.VITE_SITE_API_URL || "";

const EMPTY_DATA = {
  activeVisitors: 0,
  pageViewsToday: 0,
  recentActivity: [],
  browserStats: {},
  pageStats: {},
};

function formatTime(value) {
  if (!value) return "Unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return date.toLocaleString();
}

function formatDuration(seconds = 0) {
  const totalSeconds = Math.max(0, Number(seconds) || 0);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

function getInitials(value = "Visitor") {
  const text = String(value).trim();

  if (!text) return "V";

  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((item) => item.charAt(0).toUpperCase())
    .join("");
}

function Detail({ label, value, wide = false }) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "Unavailable"
      : String(value);

  return (
    <div
      className={[
        "rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5",
        "dark:border-slate-800 dark:bg-slate-900/60",
        wide ? "sm:col-span-2 lg:col-span-3" : "",
      ].join(" ")}
    >
      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>

      <p className="break-words text-sm font-semibold leading-6 text-slate-800 dark:text-slate-200">
        {displayValue}
      </p>
    </div>
  );
}

function StatCard({ title, value, caption, icon: Icon, accent = "emerald" }) {
  const accentClasses = {
    emerald: {
      icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      glow: "bg-emerald-500",
    },
    blue: {
      icon: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      glow: "bg-blue-500",
    },
    violet: {
      icon: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
      glow: "bg-violet-500",
    },
    amber: {
      icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      glow: "bg-amber-500",
    },
    rose: {
      icon: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
      glow: "bg-rose-500",
    },
  };

  const colors = accentClasses[accent] || accentClasses.emerald;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 blur-2xl ${colors.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h3 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>

          <p className="mt-1 text-[11px] font-medium text-slate-400">
            {caption}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${colors.icon}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={[
        "rounded-3xl border border-slate-200 bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950",
        className,
      ].join(" ")}
    >
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>

        {subtitle && (
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function VisitorRow({ item, onOpen }) {
  const isActive = Boolean(item.isActive);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition-all duration-200 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/70 sm:items-center sm:p-5"
    >
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {getInitials(item.ip || "Visitor")}
        </div>

        <span
          className={[
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white",
            "dark:border-slate-950",
            isActive ? "bg-emerald-500" : "bg-slate-400",
          ].join(" ")}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-sm font-black text-slate-900 dark:text-white">
            {item.ip || "Unknown IP"}
          </p>

          <span
            className={[
              "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide",
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
            ].join(" ")}
          >
            {isActive ? "Online" : "Offline"}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span>{item.device || "Unknown device"}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{item.browser || "Unknown browser"}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>{item.operatingSystem || "Unknown OS"}</span>
        </div>

        <p className="mt-1 truncate text-xs text-slate-400">
          {item.path || "/"} · {item.pageViews || 0} views ·{" "}
          {formatTime(item.lastSeen)}
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-2 text-xs font-black text-emerald-700 sm:flex dark:text-emerald-400">
        View
        <ArrowLeft
          className="rotate-180 transition-transform duration-200 group-hover:translate-x-1"
          size={14}
        />
      </div>
    </button>
  );
}

export default function VisitorAnalyticsPage() {
  const [data, setData] = useState(EMPTY_DATA);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (manual = false) => {
    try {
      if (manual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(`${API_URL}/api/analytics/visitors`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Analytics could not be loaded.");
      }

      setData({
        ...EMPTY_DATA,
        ...result.data,
      });
    } catch (loadError) {
      setError(
        loadError?.message || "Something went wrong while loading analytics.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();

    const intervalId = window.setInterval(() => {
      load();
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const deleteVisitor = async (id) => {
    if (!id) return;

    if (!window.confirm("Delete this visitor record?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/api/analytics/visitors/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Visitor record could not be deleted.",
        );
      }

      setSelected(null);
      await load(true);
    } catch (deleteError) {
      setError(deleteError?.message || "Visitor record could not be deleted.");
    }
  };

  const deleteAllVisitors = async () => {
    if (!data.recentActivity?.length) {
      return;
    }

    if (
      !window.confirm(
        "Delete all visitor records permanently? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/api/analytics/visitors`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Visitor records could not be deleted.",
        );
      }

      setSelected(null);
      setData(EMPTY_DATA);
    } catch (deleteError) {
      setError(deleteError?.message || "Visitor records could not be deleted.");
    }
  };

  const filteredVisitors = useMemo(() => {
    const visitors = Array.isArray(data.recentActivity)
      ? data.recentActivity
      : [];

    const query = search.trim().toLowerCase();

    return visitors.filter((item) => {
      const matchesSearch =
        !query ||
        [
          item.ip,
          item.path,
          item.title,
          item.browser,
          item.device,
          item.operatingSystem,
          item.visitorId,
          item.sessionId,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && item.isActive) ||
        (filter === "inactive" && !item.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [data.recentActivity, search, filter]);

  const browserBreakdown = data.browserStats?.breakdown || [];
  const leastViewedPages = data.pageStats?.leastViewed || [];

  return (
    <section className="min-w-0 space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <SectionHeading
          title={selected ? "Visitor details" : "Website activity"}
          description={
            selected
              ? "Complete technical information and browsing activity for this visitor."
              : "Monitor anonymous visitors, page views, browser usage and live website activity."
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          {!selected && (
            <>
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Live monitoring
              </div>

              <button
                type="button"
                onClick={() => load(true)}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {data.recentActivity?.length > 0 && (
                <button
                  type="button"
                  onClick={deleteAllVisitors}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-500/20 dark:bg-slate-950 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete all</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <Activity size={18} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">Analytics error</p>
            <p className="mt-1 break-words text-xs">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-500/10"
            aria-label="Close error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Detail view */}
      {selected ? (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
            >
              <ArrowLeft size={16} />
              Back to visitors
            </button>

            <button
              type="button"
              onClick={() => deleteVisitor(selected.id)}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-sm font-bold text-red-600 shadow-sm hover:bg-red-50 dark:border-red-500/20 dark:bg-slate-950 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 size={16} />
              Delete visitor
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-white p-5 dark:border-slate-800 dark:from-emerald-500/5 dark:via-slate-950 dark:to-slate-950 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white dark:bg-white dark:text-slate-900">
                  {getInitials(selected.ip || "Visitor")}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-all text-xl font-black text-slate-900 dark:text-white">
                      {selected.ip || "Unknown visitor"}
                    </h3>

                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide",
                        selected.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                      ].join(" ")}
                    >
                      {selected.isActive ? "Currently active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
                    {selected.device || "Unknown device"} ·{" "}
                    {selected.browser || "Unknown browser"} ·{" "}
                    {selected.operatingSystem || "Unknown OS"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Detail
                  label="IP address"
                  value={`${selected.ip || "Unavailable"} (${
                    selected.ipSource || "server"
                  })`}
                />

                <Detail label="Visitor ID" value={selected.visitorId} />
                <Detail label="Session ID" value={selected.sessionId} />

                <Detail
                  label="First seen"
                  value={formatTime(selected.firstSeen)}
                />

                <Detail
                  label="Last seen"
                  value={formatTime(selected.lastSeen)}
                />

                <Detail label="Total page views" value={selected.pageViews} />

                <Detail label="Today's views" value={selected.pageViewsToday} />

                <Detail
                  label="Current page"
                  value={`${selected.path || "/"}${
                    selected.title ? ` - ${selected.title}` : ""
                  }`}
                  wide
                />

                <Detail label="Referrer" value={selected.referrer} />

                <Detail label="Browser" value={selected.browser} />
                <Detail
                  label="Operating system"
                  value={selected.operatingSystem}
                />

                <Detail label="Device" value={selected.device} />
                <Detail label="Screen" value={selected.screen} />
                <Detail label="Language" value={selected.language} />

                <Detail label="Timezone" value={selected.timezone} />
                <Detail label="Platform" value={selected.platform} />
                <Detail label="CPU cores" value={selected.cpuCores} />

                <Detail label="Memory (GB)" value={selected.memoryGb} />
                <Detail label="Touch points" value={selected.touchPoints} />

                <Detail
                  label="Current status"
                  value={selected.isActive ? "Currently active" : "Inactive"}
                />

                <Detail
                  label="Online at last signal"
                  value={
                    selected.online === true
                      ? "Yes"
                      : selected.online === false
                        ? "No"
                        : null
                  }
                />

                <Detail label="User agent" value={selected.userAgent} wide />
              </div>

              <div className="mt-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Pages visited
                </p>

                {selected.pagesVisited?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selected.pagesVisited.map((page) => (
                      <span
                        key={page}
                        className="max-w-full break-all rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        {page}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No page history available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Current visitors"
              value={data.activeVisitors || 0}
              caption="Seen within last 2 minutes"
              icon={Users}
              accent="emerald"
            />

            <StatCard
              title="Page views today"
              value={data.pageViewsToday || 0}
              caption="Total tracked page views"
              icon={Activity}
              accent="blue"
            />

            <StatCard
              title="Top browser"
              value={data.browserStats?.mostUsed?.browser || "Unavailable"}
              caption={`${data.browserStats?.mostUsed?.visitors || 0} visitors`}
              icon={Monitor}
              accent="violet"
            />

            <StatCard
              title="Most viewed page"
              value={data.pageStats?.mostViewed?.page || "Unavailable"}
              caption={`${data.pageStats?.mostViewed?.views || 0} views`}
              icon={Globe2}
              accent="amber"
            />

            <StatCard
              title="Longest visit"
              value={formatDuration(data.pageStats?.longestTime?.seconds || 0)}
              caption={
                data.pageStats?.longestTime?.page || "No page data available"
              }
              icon={Clock3}
              accent="rose"
            />
          </div>

          {/* Browser + pages */}
          <div className="grid gap-5 lg:grid-cols-2">
            <AnalyticsSection
              title="Browser usage"
              subtitle="Visitors grouped by detected browser."
            >
              {browserBreakdown.length ? (
                <div className="space-y-3">
                  {browserBreakdown.map((item, index) => {
                    const total =
                      browserBreakdown.reduce(
                        (sum, browser) => sum + (Number(browser.visitors) || 0),
                        0,
                      ) || 1;

                    const percentage = Math.round(
                      ((Number(item.visitors) || 0) / total) * 100,
                    );

                    return (
                      <div key={`${item.browser}-${index}`}>
                        <div className="mb-1.5 flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {item.browser || "Unknown"}
                          </span>

                          <span className="shrink-0 text-xs font-black text-slate-500">
                            {item.visitors || 0}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${Math.min(100, percentage)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-32 items-center justify-center text-center text-sm text-slate-500">
                  No browser data available.
                </div>
              )}
            </AnalyticsSection>

            <AnalyticsSection
              title="Least viewed pages"
              subtitle="Pages with the lowest number of tracked views."
            >
              {leastViewedPages.length ? (
                <div className="space-y-2">
                  {leastViewedPages.map((item, index) => (
                    <div
                      key={`${item.page}-${index}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-400">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-700 dark:text-slate-300">
                          {item.page || "Unknown page"}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {item.views || 0} views
                        </p>
                      </div>

                      <Globe2 size={16} className="shrink-0 text-slate-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-32 items-center justify-center text-center text-sm text-slate-500">
                  No page data available.
                </div>
              )}
            </AnalyticsSection>
          </div>

          {/* Visitor list */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800 sm:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">
                    All visitors
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Click any visitor to inspect complete technical information.
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                  {/* Search */}
                  <div className="relative min-w-0 flex-1 sm:min-w-[260px] xl:flex-none">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search IP, page, browser..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Filter */}
                  <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                    {[
                      ["all", "All"],
                      ["active", "Active"],
                      ["inactive", "Inactive"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={[
                          "px-3 py-2.5 text-xs font-black transition",
                          filter === value
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {!loading && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                  <span>
                    Showing {filteredVisitors.length} of{" "}
                    {data.recentActivity?.length || 0} visitors
                  </span>

                  <span className="text-slate-300 dark:text-slate-700">•</span>

                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Active within 2 minutes
                  </span>
                </div>
              )}
            </div>

            {/* Loading */}
            {loading ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 sm:p-5"
                  >
                    <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-3 w-56 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                      <div className="h-3 w-72 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVisitors.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredVisitors.map((item) => (
                  <VisitorRow key={item.id} item={item} onOpen={setSelected} />
                ))}
              </div>
            ) : (
              <div className="px-5 py-14 text-center sm:px-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
                  {search || filter !== "all" ? (
                    <Search size={22} />
                  ) : (
                    <Users size={22} />
                  )}
                </div>

                <h4 className="mt-4 text-sm font-black text-slate-800 dark:text-slate-200">
                  {search || filter !== "all"
                    ? "No matching visitors"
                    : "No visitor activity yet"}
                </h4>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                  {search || filter !== "all"
                    ? "Try another search term or change the visitor filter."
                    : "When your website starts receiving tracked visitors, their activity will appear here automatically."}
                </p>
              </div>
            )}
          </div>

          {/* Bottom status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Wifi size={18} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500">Live status</p>
                <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
                  {data.activeVisitors || 0} visitors online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                <WifiOff size={18} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500">
                  Tracking mode
                </p>
                <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-white">
                  Anonymous analytics
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
