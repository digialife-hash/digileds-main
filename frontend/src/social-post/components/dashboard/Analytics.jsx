import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Info,
  MessageCircle,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import { usePost } from "../../hooks/usePost.js";
import { apiRequest } from "../../services/api.js";

/* =========================================================
   CONSTANTS
========================================================= */

const RANGES = ["Last 7 days", "Last 30 days"];

/* =========================================================
   HELPERS
========================================================= */

function getStatus(post) {
  return String(post?.status || "")
    .trim()
    .toLowerCase();
}

function getPostDate(post) {
  const value =
    post?.createdAt ||
    post?.created_at ||
    post?.publishedAt ||
    post?.published_at ||
    post?.scheduledAt ||
    post?.scheduled_at ||
    post?.date;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getRangeStart(range) {
  const now = new Date();
  const days = range === "Last 7 days" ? 7 : 30;

  const start = new Date(now);

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return start;
}

function formatRangeDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatMetric(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return Number(value).toLocaleString();
}

function formatPercent(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return `${Number(value).toFixed(
    Number(value) % 1 === 0 ? 0 : 1
  )}%`;
}

function getProviderStatus(provider) {
  if (!provider?.connected) {
    return {
      label: "Not connected",
      className:
        "border-stone-200 bg-stone-100 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400",
    };
  }

  if (provider?.error) {
    return {
      label: "Needs permission",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/[0.08] dark:text-amber-300",
    };
  }

  return {
    label: "Live",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300",
  };
}

function getPlatformInitial(platform) {
  const value = String(platform || "")
    .trim()
    .toLowerCase();

  if (value.includes("instagram")) return "IG";
  if (value.includes("facebook")) return "FB";
  if (value.includes("youtube")) return "YT";
  if (value.includes("linkedin")) return "IN";

  if (value.includes("twitter") || value === "x") {
    return "X";
  }

  if (value.includes("google")) return "G";

  return value.charAt(0).toUpperCase() || "S";
}

function getPlatformStyle(platform) {
  const value = String(platform || "")
    .trim()
    .toLowerCase();

  if (value.includes("instagram")) {
    return "border-pink-200 bg-pink-50 text-pink-600 dark:border-pink-400/20 dark:bg-pink-400/[0.08] dark:text-pink-300";
  }

  if (value.includes("facebook")) {
    return "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/[0.08] dark:text-blue-300";
  }

  if (value.includes("youtube")) {
    return "border-red-200 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300";
  }

  if (value.includes("linkedin")) {
    return "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-400/20 dark:bg-sky-400/[0.08] dark:text-sky-300";
  }

  if (value.includes("twitter") || value === "x") {
    return "border-stone-200 bg-stone-100 text-stone-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200";
  }

  if (value.includes("google")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300";
  }

  return "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/[0.08] dark:text-violet-300";
}

/* =========================================================
   MAIN
========================================================= */

export default function Analytics() {
  const { posts = [] } = usePost();

  const [range, setRange] = useState("Last 30 days");

  const [providerAnalytics, setProviderAnalytics] = useState({
    totals: {},
    providers: [],
  });

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const safePosts = Array.isArray(posts) ? posts : [];

  /* =======================================================
     LOAD PROVIDER ANALYTICS
  ======================================================== */

  const loadProviderAnalytics = useCallback(
    async (manual = false) => {
      if (manual) {
        setRefreshing(true);
      } else {
        setAnalyticsLoading(true);
      }

      try {
        const response = await apiRequest(
          `/analytics?range=${
            range === "Last 7 days" ? "7" : "30"
          }`
        );

        setProviderAnalytics({
          totals: response?.totals || {},
          providers: Array.isArray(response?.providers)
            ? response.providers
            : [],
        });
      } catch {
        setProviderAnalytics({
          totals: {},
          providers: [],
        });
      } finally {
        setAnalyticsLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    loadProviderAnalytics();
  }, [loadProviderAnalytics]);

  /* =======================================================
     STATUS COUNTS
  ======================================================== */

  const published = useMemo(
    () =>
      safePosts.filter(
        (post) => getStatus(post) === "published"
      ),
    [safePosts]
  );

  const scheduled = useMemo(
    () =>
      safePosts.filter(
        (post) => getStatus(post) === "scheduled"
      ),
    [safePosts]
  );

  const drafts = useMemo(
    () =>
      safePosts.filter(
        (post) => getStatus(post) === "draft"
      ),
    [safePosts]
  );

  const failed = useMemo(
    () =>
      safePosts.filter(
        (post) => getStatus(post) === "failed"
      ),
    [safePosts]
  );

  /* =======================================================
     RANGE DATA
  ======================================================== */

  const rangeData = useMemo(() => {
    const start = getRangeStart(range);
    const now = new Date();

    const days = range === "Last 7 days" ? 7 : 30;

    const buckets = Array.from(
      { length: days },
      (_, index) => {
        const date = new Date(start);

        date.setDate(start.getDate() + index);

        return {
          date,
          count: 0,
        };
      }
    );

    safePosts.forEach((post) => {
      const date = getPostDate(post);

      if (!date) return;

      if (date < start || date > now) {
        return;
      }

      const index = Math.floor(
        (date.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (
        index >= 0 &&
        index < buckets.length
      ) {
        buckets[index].count += 1;
      }
    });

    const maxCount = Math.max(
      ...buckets.map((item) => item.count),
      1
    );

    return buckets.map((item) => ({
      ...item,
      height:
        item.count === 0
          ? 3
          : Math.max(
              8,
              (item.count / maxCount) * 100
            ),
    }));
  }, [safePosts, range]);

  /* =======================================================
     PLATFORM COUNTS
  ======================================================== */

  const platformCounts = useMemo(() => {
    const counts = {};

    safePosts.forEach((post) => {
      const platforms = String(
        post?.platform || "Other"
      )
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!platforms.length) {
        platforms.push("Other");
      }

      platforms.forEach((platform) => {
        counts[platform] =
          (counts[platform] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort(
        ([, first], [, second]) =>
          second - first
      )
      .slice(0, 6);
  }, [safePosts]);

  /* =======================================================
     TOTALS
  ======================================================== */

  const rangeTotal = rangeData.reduce(
    (total, item) => total + item.count,
    0
  );

  const maxPlatformCount =
    platformCounts[0]?.[1] || 1;

  const totalPosts = safePosts.length;

  const publishedRate =
    totalPosts > 0
      ? Math.round(
          (published.length / totalPosts) * 100
        )
      : 0;

  const activeProviders =
    providerAnalytics.providers.filter(
      (provider) =>
        provider?.connected &&
        !provider?.error
    ).length;

  const providerIssues =
    providerAnalytics.providers.filter(
      (provider) =>
        provider?.connected &&
        provider?.error
    ).length;

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* Ambient background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-24 h-80 w-80 rounded-full bg-orange-400/[0.035] blur-[120px] dark:bg-orange-400/[0.055]" />

        <div className="absolute right-[-140px] top-32 h-96 w-96 rounded-full bg-cyan-400/[0.035] blur-[130px] dark:bg-cyan-400/[0.045]" />

        <div className="absolute bottom-[-180px] left-1/3 h-[420px] w-[420px] rounded-full bg-violet-400/[0.025] blur-[140px] dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* ===================================================
            HEADER
        ==================================================== */}

        <PageHeader
          eyebrow="Insights"
          title="Analytics"
          description="Track your publishing workflow, content activity, and verified platform performance."
          action={
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  loadProviderAnalytics(true)
                }
                disabled={
                  analyticsLoading || refreshing
                }
                className="
                  inline-flex
                  h-11
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-stone-200/90
                  bg-white/75
                  px-4
                  text-xs
                  font-bold
                  text-stone-700
                  shadow-[0_8px_25px_rgba(15,23,42,0.04)]
                  backdrop-blur-xl
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-stone-300
                  hover:bg-white
                  hover:shadow-[0_12px_30px_rgba(15,23,42,0.07)]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:border-white/[0.08]
                  dark:bg-white/[0.045]
                  dark:text-slate-200
                  dark:shadow-[0_10px_30px_rgba(0,0,0,0.18)]
                  dark:hover:border-white/[0.14]
                  dark:hover:bg-white/[0.07]
                  sm:flex-none
                "
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing || analyticsLoading
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <Link
                to="/dashboard/create-post"
                className="
                  group
                  inline-flex
                  h-11
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-stone-950
                  px-4
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_12px_30px_rgba(15,23,42,0.14)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-stone-800
                  dark:bg-white
                  dark:text-slate-950
                  dark:shadow-[0_12px_35px_rgba(0,0,0,0.25)]
                  dark:hover:bg-slate-100
                  sm:flex-none
                "
              >
                <Plus
                  size={16}
                  strokeWidth={2.2}
                  className="transition-transform duration-200 group-hover:rotate-90"
                />

                Create post

                <Sparkles
                  size={12}
                  className="text-orange-300 dark:text-orange-500"
                />
              </Link>
            </div>
          }
        />

        {/* ===================================================
            QUICK STATUS
        ==================================================== */}

        <section className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsStat
            icon={CheckCircle2}
            label="Published"
            value={published.length}
            description="Successfully published"
            tone="green"
          />

          <AnalyticsStat
            icon={Clock3}
            label="Scheduled"
            value={scheduled.length}
            description="Queued for publishing"
            tone="orange"
          />

          <AnalyticsStat
            icon={FileText}
            label="Drafts"
            value={drafts.length}
            description="Still being prepared"
            tone="slate"
          />

          <AnalyticsStat
            icon={XCircle}
            label="Failed"
            value={failed.length}
            description={
              failed.length > 0
                ? "Needs attention"
                : "No failed posts"
            }
            tone="red"
          />
        </section>

        {/* ===================================================
            PROVIDER NOTICE
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[24px]
            border
            border-blue-200/70
            bg-blue-50/55
            shadow-[0_16px_50px_rgba(37,99,235,0.04)]
            backdrop-blur-xl
            dark:border-blue-400/[0.12]
            dark:bg-blue-400/[0.045]
            dark:shadow-[0_18px_55px_rgba(0,0,0,0.18)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-400/10 blur-[80px] dark:bg-blue-400/[0.08]" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent dark:via-blue-400/25" />

          <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-blue-200
                  bg-blue-100/70
                  text-blue-600
                  dark:border-blue-400/20
                  dark:bg-blue-400/[0.08]
                  dark:text-blue-300
                "
              >
                <BarChart3
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-black text-blue-950 dark:text-blue-100">
                  Verified provider analytics
                </p>

                <p className="mt-1 max-w-4xl text-xs leading-5 text-blue-700/80 dark:text-blue-200/60">
                  Reach, impressions, engagement rate,
                  audience metrics and other performance
                  numbers come from connected official
                  platform APIs. No synthetic metrics are
                  generated.
                </p>
              </div>
            </div>

            <span
              className="
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                border-blue-200/70
                bg-blue-100/70
                px-2.5
                py-1.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-blue-600
                dark:border-blue-400/20
                dark:bg-blue-400/[0.08]
                dark:text-blue-300
              "
            >
              <Info size={10} />
              API dependent
            </span>
          </div>
        </section>

        {/* ===================================================
            PROVIDER ANALYTICS
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-stone-200/80
            bg-white/[0.72]
            shadow-[0_20px_65px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.04] dark:to-transparent" />

          <div className="flex flex-col gap-4 border-b border-stone-200/70 px-4 py-5 dark:border-white/[0.07] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  text-emerald-600
                  dark:border-emerald-400/20
                  dark:bg-emerald-400/[0.08]
                  dark:text-emerald-300
                "
              >
                <TrendingUp
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-[15px] font-black text-stone-900 dark:text-white">
                  Platform performance
                </h2>

                <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                  Verified metrics from connected
                  provider accounts.
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-stone-400 dark:text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.45)]" />
                {activeProviders} live
              </span>

              {providerIssues > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <AlertCircle size={12} />
                  {providerIssues} attention
                </span>
              )}
            </div>
          </div>

          {/* Overall metrics */}

          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
            <ProviderMetric
              icon={BarChart3}
              label="Views"
              value={formatMetric(
                providerAnalytics.totals?.views
              )}
            />

            <ProviderMetric
              icon={Share2}
              label="Reach"
              value={formatMetric(
                providerAnalytics.totals?.reach
              )}
            />

            <ProviderMetric
              icon={TrendingUp}
              label="Impressions"
              value={formatMetric(
                providerAnalytics.totals?.impressions
              )}
            />

            <ProviderMetric
              icon={MessageCircle}
              label="Engagement rate"
              value={formatPercent(
                providerAnalytics.totals
                  ?.engagementRate
              )}
            />
          </div>

          {/* Provider cards */}

          <div className="border-t border-stone-200/60 p-4 dark:border-white/[0.06] sm:p-5">
            {providerAnalytics.providers.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {providerAnalytics.providers.map(
                  (provider) => (
                    <ProviderCard
                      key={provider?.platform}
                      provider={provider}
                    />
                  )
                )}
              </div>
            ) : (
              <ProviderEmptyState
                loading={analyticsLoading}
              />
            )}
          </div>
        </section>

        {/* ===================================================
            ACTIVITY + PLATFORM MIX
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            gap-5
            xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]
            sm:mt-6
          "
        >
          {/* =================================================
              ACTIVITY CHART
          ================================================== */}

          <section
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-stone-200/80
              bg-white/[0.72]
              shadow-[0_20px_65px_rgba(15,23,42,0.05)]
              backdrop-blur-xl
              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            "
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-400/5 blur-[90px] dark:bg-violet-400/[0.06]" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.04] dark:to-transparent" />

            {/* Header */}

            <div
              className="
                relative
                flex
                flex-col
                gap-4
                border-b
                border-stone-200/70
                px-4
                py-5
                dark:border-white/[0.07]
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
              "
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-xl
                    border
                    border-violet-200
                    bg-violet-50
                    text-violet-600
                    dark:border-violet-400/20
                    dark:bg-violet-400/[0.08]
                    dark:text-violet-300
                  "
                >
                  <CalendarDays
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[15px] font-black tracking-tight text-stone-900 dark:text-white">
                    Content activity
                  </h2>

                  <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                    Posts created during the selected
                    period.
                  </p>
                </div>
              </div>

              <label className="relative w-full sm:w-auto">
                <span className="sr-only">
                  Analytics range
                </span>

                <select
                  value={range}
                  onChange={(event) =>
                    setRange(event.target.value)
                  }
                  className="
                    h-10
                    w-full
                    appearance-none
                    rounded-xl
                    border
                    border-stone-200
                    bg-white
                    px-3
                    pr-9
                    text-xs
                    font-bold
                    text-stone-600
                    outline-none
                    transition
                    focus:border-violet-300
                    focus:ring-4
                    focus:ring-violet-500/10
                    dark:border-white/[0.08]
                    dark:bg-[#101827]
                    dark:text-slate-200
                    dark:focus:border-violet-400/40
                    dark:focus:ring-violet-400/10
                    sm:w-auto
                  "
                >
                  {RANGES.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-white text-stone-700 dark:bg-[#101827] dark:text-slate-200"
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500"
                />
              </label>
            </div>

            {/* Chart */}

            <div className="relative p-4 sm:p-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
                    Total activity
                  </p>

                  <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-stone-950 dark:text-white">
                    {rangeTotal}
                  </p>
                </div>

                <span
                  className="
                    rounded-full
                    border
                    border-stone-200
                    bg-stone-50
                    px-2.5
                    py-1.5
                    text-[9px]
                    font-bold
                    text-stone-400
                    dark:border-white/[0.08]
                    dark:bg-white/[0.045]
                    dark:text-slate-400
                  "
                >
                  {range}
                </span>
              </div>

              <div className="relative h-[250px]">
                {/* Grid */}

                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                  {["100%", "75%", "50%", "25%", "0"].map(
                    (value) => (
                      <div
                        key={value}
                        className="flex items-center gap-2"
                      >
                        <span className="w-7 text-right text-[8px] font-medium text-stone-300 dark:text-slate-600">
                          {value}
                        </span>

                        <div className="h-px flex-1 bg-stone-100 dark:bg-white/[0.06]" />
                      </div>
                    )
                  )}
                </div>

                {/* Bars */}

                <div className="absolute inset-y-0 left-9 right-0 flex items-end gap-1 sm:gap-2">
                  {rangeData.map((item, index) => (
                    <div
                      key={item.date.toISOString()}
                      className="
                        group
                        relative
                        flex
                        h-full
                        min-w-0
                        flex-1
                        items-end
                        justify-center
                      "
                    >
                      {/* Tooltip */}

                      <div
                        className="
                          pointer-events-none
                          absolute
                          bottom-[calc(var(--bar-height)+8px)]
                          left-1/2
                          z-20
                          -translate-x-1/2
                          rounded-lg
                          bg-stone-900
                          px-2
                          py-1
                          text-[8px]
                          font-bold
                          text-white
                          opacity-0
                          shadow-lg
                          transition-opacity
                          duration-200
                          group-hover:opacity-100
                          dark:bg-white
                          dark:text-slate-950
                        "
                      >
                        {item.count}
                      </div>

                      <div
                        className="
                          w-full
                          max-w-[24px]
                          min-w-[4px]
                          rounded-t-lg
                          bg-gradient-to-t
                          from-violet-600/80
                          to-violet-400/70
                          shadow-[0_-4px_18px_rgba(139,92,246,0.08)]
                          transition-all
                          duration-300
                          group-hover:from-violet-700
                          group-hover:to-violet-500
                          dark:from-violet-500/80
                          dark:to-violet-400/70
                        "
                        style={{
                          height: `${item.height}%`,
                          "--bar-height": `${item.height}%`,
                        }}
                      />

                      {/* Day indicator */}

                      {range === "Last 7 days" && (
                        <div className="pointer-events-none absolute bottom-[-21px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-medium text-stone-400 dark:text-slate-500">
                          {item.date.toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                            }
                          )}
                        </div>
                      )}

                      {range === "Last 30 days" &&
                        (index === 0 ||
                          index ===
                            rangeData.length - 1 ||
                          index % 7 === 0) && (
                          <div className="pointer-events-none absolute bottom-[-21px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-medium text-stone-400 dark:text-slate-500">
                            {formatRangeDate(
                              item.date
                            )}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-5" />
            </div>
          </section>

          {/* =================================================
              PLATFORM MIX
          ================================================== */}

          <section
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-stone-200/80
              bg-white/[0.72]
              shadow-[0_20px_65px_rgba(15,23,42,0.05)]
              backdrop-blur-xl
              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            "
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-orange-400/10 blur-[80px] dark:bg-orange-400/[0.055]" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.04] dark:to-transparent" />

            <div className="relative border-b border-stone-200/70 px-5 py-5 dark:border-white/[0.07]">
              <div className="flex items-start gap-3">
                <div
                  className="
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-xl
                    border
                    border-orange-200
                    bg-orange-50
                    text-orange-600
                    dark:border-orange-400/20
                    dark:bg-orange-400/[0.08]
                    dark:text-orange-300
                  "
                >
                  <Share2
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">
                  <h2 className="text-[15px] font-black tracking-tight text-stone-900 dark:text-white">
                    Platform mix
                  </h2>

                  <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                    Where your content is being published.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative p-5">
              {platformCounts.length > 0 ? (
                <div className="space-y-4">
                  {platformCounts.map(
                    ([name, count], index) => {
                      const percentage = Math.round(
                        (count / maxPlatformCount) * 100
                      );

                      const style =
                        getPlatformStyle(name);

                      return (
                        <div
                          key={name}
                          className="group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                                grid
                                h-8
                                w-8
                                shrink-0
                                place-items-center
                                rounded-lg
                                border
                                text-[9px]
                                font-black
                                ${style}
                              `}
                            >
                              {getPlatformInitial(
                                name
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className="
                                    truncate
                                    text-xs
                                    font-bold
                                    text-stone-700
                                    dark:text-slate-200
                                  "
                                  title={name}
                                >
                                  {name}
                                </span>

                                <span className="shrink-0 text-[10px] font-bold text-stone-400 dark:text-slate-500">
                                  {count}{" "}
                                  {count === 1
                                    ? "post"
                                    : "posts"}
                                </span>
                              </div>

                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-white/[0.06]">
                                <div
                                  className="
                                    h-full
                                    rounded-full
                                    bg-gradient-to-r
                                    from-orange-400
                                    to-violet-500
                                    shadow-[0_0_12px_rgba(139,92,246,0.12)]
                                    transition-all
                                    duration-500
                                  "
                                  style={{
                                    width: `${Math.max(
                                      percentage,
                                      8
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>

                            <span className="hidden w-9 shrink-0 text-right text-[10px] font-black text-stone-500 dark:text-slate-400 sm:block">
                              {percentage}%
                            </span>
                          </div>

                          {index === 0 && (
                            <div className="mt-2 ml-11 flex items-center gap-1.5 text-[9px] font-bold text-violet-500 dark:text-violet-400">
                              <TrendingUp size={10} />
                              Top platform
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <EmptyAnalytics text="Create a post and assign a platform to start seeing your publishing mix." />
              )}
            </div>
          </section>
        </section>

        {/* ===================================================
            WORKFLOW SUMMARY
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-stone-200/80
            bg-white/[0.72]
            shadow-[0_20px_65px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/5 blur-[100px] dark:bg-cyan-400/[0.045]" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent dark:from-white/[0.04] dark:to-transparent" />

          <div className="relative border-b border-stone-200/70 px-5 py-5 dark:border-white/[0.07] sm:px-6">
            <div className="flex items-start gap-3">
              <div
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-cyan-200
                  bg-cyan-50
                  text-cyan-600
                  dark:border-cyan-400/20
                  dark:bg-cyan-400/[0.08]
                  dark:text-cyan-300
                "
              >
                <TrendingUp
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2 className="text-[15px] font-black tracking-tight text-stone-900 dark:text-white">
                  Workflow summary
                </h2>

                <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
                  Quick overview of your publishing pipeline.
                </p>
              </div>
            </div>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3">
            <SummaryBlock
              icon={CheckCircle2}
              label="Published"
              value={published.length}
              description={
                published.length === 1
                  ? "published post"
                  : "published posts"
              }
              tone="green"
            />

            <SummaryBlock
              icon={Clock3}
              label="Scheduled"
              value={scheduled.length}
              description={
                scheduled.length === 1
                  ? "scheduled post"
                  : "scheduled posts"
              }
              tone="orange"
            />

            <SummaryBlock
              icon={TrendingUp}
              label="Activity"
              value={rangeTotal}
              description={`${range.toLowerCase()} content activity`}
              tone="violet"
            />
          </div>
        </section>

        {/* ===================================================
            HEALTH / DATA INTEGRITY
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            gap-3
            sm:mt-6
            lg:grid-cols-3
          "
        >
          <HealthCard
            icon={CheckCircle2}
            title="Publishing health"
            value={`${publishedRate}%`}
            description="Of current posts are published successfully."
            tone="green"
          />

          <HealthCard
            icon={Clock3}
            title="Scheduled pipeline"
            value={scheduled.length}
            description="Posts currently waiting to be published."
            tone="orange"
          />

          <HealthCard
            icon={AlertCircle}
            title="Attention needed"
            value={failed.length + providerIssues}
            description="Failed posts and provider issues requiring review."
            tone={
              failed.length + providerIssues > 0
                ? "red"
                : "slate"
            }
          />
        </section>

        {/* ===================================================
            EMPTY ANALYTICS NOTICE
        ==================================================== */}

        {published.length === 0 && (
          <div
            className="
              relative
              mt-5
              flex
              items-start
              gap-3
              overflow-hidden
              rounded-2xl
              border
              border-stone-200/80
              bg-white/[0.72]
              p-4
              shadow-[0_12px_35px_rgba(15,23,42,0.04)]
              backdrop-blur-xl
              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:shadow-[0_14px_40px_rgba(0,0,0,0.2)]
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent dark:via-orange-400/20" />

            <div
              className="
                grid
                h-9
                w-9
                shrink-0
                place-items-center
                rounded-xl
                border
                border-stone-200
                bg-stone-100
                text-stone-500
                dark:border-white/[0.08]
                dark:bg-white/[0.05]
                dark:text-slate-400
              "
            >
              <MessageCircle size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-black text-stone-700 dark:text-slate-200">
                No published analytics yet
              </p>

              <p className="mt-1 text-[11px] leading-5 text-stone-400 dark:text-slate-500">
                Publish content and connect official provider
                APIs to start receiving verified performance
                data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   ANALYTICS STAT
========================================================= */

function AnalyticsStat({
  icon: Icon,
  label,
  value,
  description,
  tone = "slate",
}) {
  const tones = {
    green: {
      box:
        "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300",
    },

    orange: {
      box:
        "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-400/20 dark:bg-orange-400/[0.08] dark:text-orange-300",
    },

    slate: {
      box:
        "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400",
    },

    red: {
      box:
        "border-red-200 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300",
    },
  };

  const style = tones[tone] || tones.slate;

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-stone-200/80
        bg-white/[0.72]
        p-4
        shadow-[0_14px_40px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-stone-300
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]
        dark:hover:border-white/[0.13]
        dark:hover:bg-white/[0.05]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-orange-400/5 blur-[40px] dark:bg-orange-400/[0.045]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500 sm:text-[10px]">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-950 dark:text-white sm:mt-3">
            {value}
          </p>

          <p className="mt-1 text-xs text-stone-400 dark:text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            ${style.box}
          `}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PROVIDER METRIC
========================================================= */

function ProviderMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-stone-200/80
        bg-white/[0.65]
        p-4
        transition-all
        hover:border-stone-300
        hover:bg-white/80
        hover:shadow-sm
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.12]
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.16)]
      "
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-stone-400 dark:text-slate-500">
          {label}
        </p>

        <Icon
          size={14}
          className="text-stone-300 transition-colors group-hover:text-stone-500 dark:text-slate-600 dark:group-hover:text-slate-400"
        />
      </div>

      <p className="mt-2 text-2xl font-black tracking-tight text-stone-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PROVIDER CARD
========================================================= */

function ProviderCard({ provider }) {
  const status = getProviderStatus(provider);

  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-stone-200/80
        bg-white/[0.62]
        p-4
        transition-all
        hover:-translate-y-0.5
        hover:border-stone-300
        hover:bg-white/80
        hover:shadow-sm
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.12]
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/[0.08]" />

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-xl
              border
              text-[9px]
              font-black
              ${getPlatformStyle(
                provider?.platform
              )}
            `}
          >
            {getPlatformInitial(
              provider?.platform
            )}
          </div>

          <div className="min-w-0">
            <p
              className="truncate text-sm font-black text-stone-800 dark:text-slate-100"
              title={provider?.platform}
            >
              {provider?.platform || "Platform"}
            </p>

            <p className="mt-0.5 text-[10px] text-stone-400 dark:text-slate-500">
              Connected provider
            </p>
          </div>
        </div>

        <span
          className={`
            shrink-0
            rounded-full
            border
            px-2.5
            py-1.5
            text-[9px]
            font-black
            ${status.className}
          `}
        >
          {status.label}
        </span>
      </div>

      {provider?.error ? (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-amber-200
            bg-amber-50
            p-3
            dark:border-amber-400/20
            dark:bg-amber-400/[0.07]
          "
        >
          <div className="flex items-start gap-2">
            <AlertCircle
              size={13}
              className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
            />

            <p className="break-words text-[10px] leading-5 text-amber-700 dark:text-amber-300">
              {provider.error}
            </p>
          </div>
        </div>
      ) : provider?.connected ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <MiniMetric
            label="Views"
            value={formatMetric(
              provider.metrics?.views
            )}
          />

          <MiniMetric
            label="Likes"
            value={formatMetric(
              provider.metrics?.likes
            )}
          />

          <MiniMetric
            label="Comments"
            value={formatMetric(
              provider.metrics?.comments
            )}
          />
        </div>
      ) : (
        <div
          className="
            mt-4
            rounded-xl
            border
            border-stone-200
            bg-stone-50
            px-3
            py-2.5
            text-[10px]
            font-semibold
            leading-5
            text-stone-400
            dark:border-white/[0.07]
            dark:bg-white/[0.035]
            dark:text-slate-500
          "
        >
          Connect this platform to start
          receiving verified performance data.
        </div>
      )}
    </article>
  );
}

/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-stone-100
        bg-stone-50/80
        p-2.5
        text-center
        dark:border-white/[0.06]
        dark:bg-white/[0.035]
      "
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-stone-400 dark:text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xs font-black text-stone-700 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PROVIDER EMPTY
========================================================= */

function ProviderEmptyState({
  loading,
}) {
  return (
    <div
      className="
        flex
        min-h-[180px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-stone-200
        bg-stone-50/50
        px-5
        py-10
        text-center
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
      "
    >
      <div
        className="
          grid
          h-11
          w-11
          place-items-center
          rounded-xl
          border
          border-stone-200
          bg-white
          text-stone-300
          shadow-sm
          dark:border-white/[0.07]
          dark:bg-white/[0.045]
          dark:text-slate-500
        "
      >
        {loading ? (
          <RefreshCw
            size={18}
            className="animate-spin"
          />
        ) : (
          <BarChart3
            size={19}
            strokeWidth={1.6}
          />
        )}
      </div>

      <p className="mt-4 text-xs font-bold text-stone-600 dark:text-slate-300">
        {loading
          ? "Loading provider data..."
          : "No provider analytics yet"}
      </p>

      <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-stone-400 dark:text-slate-500">
        {loading
          ? "Fetching verified analytics from configured platform APIs."
          : "Connect official social provider APIs to receive verified platform performance data."}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY BLOCK
========================================================= */

function SummaryBlock({
  icon: Icon,
  label,
  value,
  description,
  tone = "violet",
}) {
  const tones = {
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300",
    orange:
      "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-400/20 dark:bg-orange-400/[0.08] dark:text-orange-300",
    violet:
      "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/[0.08] dark:text-violet-300",
  };

  return (
    <div
      className="
        border-b
        border-stone-200/60
        p-5
        last:border-b-0
        dark:border-white/[0.06]
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            grid
            h-9
            w-9
            shrink-0
            place-items-center
            rounded-xl
            border
            ${tones[tone] || tones.violet}
          `}
        >
          <Icon
            size={16}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-xl font-black tracking-tight text-stone-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-stone-400 dark:text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HEALTH CARD
========================================================= */

function HealthCard({
  icon: Icon,
  title,
  value,
  description,
  tone = "slate",
}) {
  const tones = {
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/[0.08] dark:text-emerald-300",
    orange:
      "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-400/20 dark:bg-orange-400/[0.08] dark:text-orange-300",
    red:
      "border-red-200 bg-red-50 text-red-600 dark:border-red-400/20 dark:bg-red-400/[0.08] dark:text-red-300",
    slate:
      "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-400",
  };

  return (
    <article
      className="
        rounded-[20px]
        border
        border-stone-200/80
        bg-white/[0.72]
        p-4
        shadow-[0_12px_35px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_14px_40px_rgba(0,0,0,0.2)]
        sm:p-5
      "
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            ${tones[tone] || tones.slate}
          `}
        >
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 dark:text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-xl font-black text-stone-900 dark:text-white">
            {value}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-stone-400 dark:text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY ANALYTICS
========================================================= */

function EmptyAnalytics({ text }) {
  return (
    <div
      className="
        flex
        min-h-[220px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-stone-200
        bg-stone-50/50
        px-5
        py-10
        text-center
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
      "
    >
      <div
        className="
          grid
          h-11
          w-11
          place-items-center
          rounded-xl
          border
          border-stone-200
          bg-white
          text-stone-300
          shadow-sm
          dark:border-white/[0.07]
          dark:bg-white/[0.045]
          dark:text-slate-500
        "
      >
        <BarChart3
          size={19}
          strokeWidth={1.6}
        />
      </div>

      <p className="mt-4 text-xs font-bold text-stone-600 dark:text-slate-300">
        No data yet
      </p>

      <p className="mt-1.5 max-w-xs text-[11px] leading-5 text-stone-400 dark:text-slate-500">
        {text}
      </p>
    </div>
  );
}