import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Eye,
  FileEdit,
  FileText,
  Plus,
  Send,
  Share2,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import StatsCard from "./widgets/StatsCard.jsx";
import QuickActions from "./widgets/QuickActions.jsx";
import RecentPosts from "./widgets/RecentPosts.jsx";
import UpcomingPosts from "./widgets/UpcomingPosts.jsx";
import ConnectedAccountsWidget from "./widgets/ConnectedAccountsWidget.jsx";
import TopPerformingWidget from "./widgets/TopPerformingWidget.jsx";

import { usePost } from "../../hooks/usePost.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useSocialAccounts } from "../../hooks/useSocialAccounts.js";

export default function Dashboard() {
  const { posts = [] } = usePost();
  const { user } = useAuth();
  const { accounts = [] } = useSocialAccounts();

  /* =========================================================
     DATE + GREETING
  ========================================================== */

  const today = new Date();

  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const hour = today.getHours();

  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";

  /* =========================================================
     SAFE STATUS
  ========================================================== */

  const getStatus = (post) =>
    String(post?.status || "")
      .trim()
      .toLowerCase();

  /* =========================================================
     POST COUNTS
  ========================================================== */

  const publishedPosts = posts.filter(
    (post) => getStatus(post) === "published",
  ).length;

  const scheduledPosts = posts.filter(
    (post) => getStatus(post) === "scheduled",
  ).length;

  const failedPosts = posts.filter(
    (post) => getStatus(post) === "failed",
  ).length;

  const draftPosts = posts.filter(
    (post) => getStatus(post) === "draft",
  ).length;

  /* =========================================================
     CONNECTED ACCOUNTS
  ========================================================== */

  const connectedAccounts = accounts.filter(
    (account) => account?.connected === true,
  ).length;

  /* =========================================================
     THIS MONTH POSTS
  ========================================================== */

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const postsThisMonth = posts.filter((post) => {
    const rawDate =
      post?.createdAt ||
      post?.created_at ||
      post?.publishedAt ||
      post?.published_at ||
      post?.scheduledAt ||
      post?.scheduled_at;

    if (!rawDate) return false;

    const postDate = new Date(rawDate);

    if (Number.isNaN(postDate.getTime())) return false;

    return (
      postDate.getMonth() === currentMonth &&
      postDate.getFullYear() === currentYear
    );
  });

  /* =========================================================
     ATTENTION STATE
  ========================================================== */

  const needsAttention =
    failedPosts > 0 || connectedAccounts === 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb] text-slate-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-white">
      {/* =====================================================
          GLOBAL AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-orange-400/[0.045] blur-[120px] dark:bg-orange-500/[0.07]" />

        <div className="absolute right-[-180px] top-[20%] h-[460px] w-[460px] rounded-full bg-cyan-400/[0.04] blur-[130px] dark:bg-cyan-500/[0.06]" />

        <div className="absolute bottom-[-180px] left-[35%] h-[420px] w-[420px] rounded-full bg-violet-400/[0.035] blur-[130px] dark:bg-violet-500/[0.045]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 xl:px-8 2xl:px-10">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <PageHeader
          eyebrow={dateLabel}
          title={`${greeting}, ${user?.name || "Admin"}.`}
          description="Here's what's happening with your content today."
          action={
            <Link
              to="/dashboard/create-post"
              className="
                group inline-flex h-11
                items-center justify-center gap-2
                rounded-xl
                border border-slate-900
                bg-slate-950
                px-4
                text-sm font-bold text-white
                shadow-[0_12px_30px_rgba(15,23,42,0.12)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-slate-800
                hover:shadow-[0_16px_35px_rgba(249,115,22,0.16)]
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-orange-500/40
                focus-visible:ring-offset-2
                focus-visible:ring-offset-[#f6f7fb]
                active:translate-y-0
                dark:border-white/10
                dark:bg-white
                dark:text-slate-950
                dark:hover:bg-slate-100
                dark:focus-visible:ring-offset-[#070b14]
              "
            >
              <Plus
                size={17}
                strokeWidth={2.3}
                className="transition-transform duration-200 group-hover:rotate-90"
              />

              <span>Create post</span>

              <Sparkles
                size={13}
                className="text-orange-400 dark:text-orange-500"
              />
            </Link>
          }
        />

        {/* =====================================================
            STATUS BANNER
        ====================================================== */}

        <section
          className="
            relative mt-5 overflow-hidden
            rounded-[22px]
            border border-white/80
            bg-white/75
            shadow-[0_12px_40px_rgba(15,23,42,0.045)]
            backdrop-blur-2xl
            transition-colors duration-300
            dark:border-white/[0.07]
            dark:bg-slate-900/65
            dark:shadow-[0_18px_50px_rgba(0,0,0,0.20)]
          "
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/[0.045] via-transparent to-cyan-500/[0.045] dark:from-orange-500/[0.06] dark:to-cyan-500/[0.05]" />

          <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-orange-400/[0.08] blur-[70px] dark:bg-orange-500/[0.09]" />

          <div className="relative flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`
                  mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl
                  transition-colors
                  ${
                    needsAttention
                      ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900/60"
                      : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/60"
                  }
                `}
              >
                {needsAttention ? (
                  <AlertCircle size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                  {needsAttention
                    ? "A few things need your attention"
                    : "Everything is running smoothly"}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {failedPosts > 0
                    ? `${failedPosts} failed post${
                        failedPosts > 1 ? "s" : ""
                      } need review.`
                    : connectedAccounts === 0
                      ? "Connect a social account to start publishing."
                      : "Your workspace is ready for publishing."}
                </p>
              </div>
            </div>

            {needsAttention ? (
              <Link
                to={
                  failedPosts > 0
                    ? "/dashboard/posts/failed"
                    : "/dashboard/social-accounts"
                }
                className="
                  shrink-0 self-start
                  rounded-lg px-2 py-1
                  text-xs font-bold
                  text-orange-600
                  transition-all
                  hover:bg-orange-50
                  hover:text-orange-700
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-orange-500/30
                  sm:self-auto
                  dark:text-orange-400
                  dark:hover:bg-orange-950/40
                  dark:hover:text-orange-300
                "
              >
                Review now →
              </Link>
            ) : (
              <span className="shrink-0 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400">
                All systems operational
              </span>
            )}
          </div>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            <StatsCard
              icon={
                <CalendarClock
                  size={19}
                  strokeWidth={1.8}
                />
              }
              label="Posts this month"
              value={postsThisMonth.length}
              change="Content activity"
            />

            <StatsCard
              icon={
                <Eye
                  size={19}
                  strokeWidth={1.8}
                />
              }
              label="Total reach"
              value="—"
              change="Connect accounts for reach"
            />

            <StatsCard
              icon={
                <TrendingUp
                  size={19}
                  strokeWidth={1.8}
                />
              }
              label="Engagement rate"
              value="—"
              change="Provider analytics unavailable"
            />

            <StatsCard
              icon={
                <Clock3
                  size={19}
                  strokeWidth={1.8}
                />
              }
              label="Scheduled"
              value={scheduledPosts}
              change={
                scheduledPosts > 0
                  ? "Ready to publish"
                  : "No posts scheduled"
              }
            />

            <StatsCard
              icon={
                <AlertCircle
                  size={19}
                  strokeWidth={1.8}
                />
              }
              label="Failed posts"
              value={failedPosts}
              change={
                failedPosts > 0
                  ? "Needs attention"
                  : "No failed posts"
              }
            />

            <StatsCard
              icon={
                <Share2
                  size={19}
                  strokeWidth={1.8}
                />
              }
              label="Connected accounts"
              value={connectedAccounts}
              change={
                connectedAccounts > 0
                  ? "Ready to publish"
                  : "Connect an account"
              }
            />
          </div>
        </section>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="mt-6">
          <QuickActions />
        </section>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          {/* ===================================================
              LEFT
          ==================================================== */}

          <div className="min-w-0 space-y-6">
            <RecentPosts />

            {/* =================================================
                CONTENT STATUS
            ================================================== */}

            <section
              className="
                relative overflow-hidden
                rounded-[26px]
                border border-white/80
                bg-white/70
                p-4
                shadow-[0_18px_55px_rgba(15,23,42,0.055)]
                backdrop-blur-2xl
                transition-all duration-300
                sm:p-5
                lg:p-6
                dark:border-white/[0.07]
                dark:bg-slate-900/65
                dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]
              "
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-400/[0.08] blur-[80px] dark:bg-orange-500/[0.09]" />

              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-cyan-400/[0.05] blur-[80px] dark:bg-cyan-500/[0.06]" />

              <div className="relative">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100/80 dark:bg-orange-950/40 dark:text-orange-400 dark:ring-orange-900/60">
                        <FileText size={15} />
                      </span>

                      <div>
                        <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                          Content status
                        </h2>

                        <p className="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          Publishing pipeline
                        </p>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Your current publishing pipeline.
                    </p>
                  </div>

                  <Link
                    to="/dashboard/posts"
                    className="
                      shrink-0 rounded-lg px-2 py-1
                      text-xs font-bold
                      text-orange-600
                      transition-all
                      hover:bg-orange-50
                      hover:text-orange-700
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-orange-500/30
                      dark:text-orange-400
                      dark:hover:bg-orange-950/40
                      dark:hover:text-orange-300
                    "
                  >
                    View all posts →
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatusItem
                    label="Published"
                    value={publishedPosts}
                    icon={CheckCircle2}
                    tone="green"
                  />

                  <StatusItem
                    label="Scheduled"
                    value={scheduledPosts}
                    icon={Clock3}
                    tone="orange"
                  />

                  <StatusItem
                    label="Drafts"
                    value={draftPosts}
                    icon={FileEdit}
                    tone="slate"
                  />

                  <StatusItem
                    label="Failed"
                    value={failedPosts}
                    icon={XCircle}
                    tone="red"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ===================================================
              RIGHT
          ==================================================== */}

          <div className="min-w-0 space-y-6">
            <UpcomingPosts />

            <ConnectedAccountsWidget />

            <TopPerformingWidget />
          </div>
        </section>

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}

        <section
          className="
            relative mt-6
            overflow-hidden
            rounded-[28px]
            border border-slate-800/10
            bg-slate-950
            shadow-[0_25px_70px_rgba(15,23,42,0.12)]
            dark:border-white/[0.06]
            dark:shadow-[0_25px_80px_rgba(0,0,0,0.35)]
          "
        >
          {/* Ambient glow */}

          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-orange-500/15 blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-cyan-400/10 blur-[100px]" />

          <div className="pointer-events-none absolute right-[25%] top-0 h-40 w-40 rounded-full bg-violet-500/[0.06] blur-[90px]" />

          {/* Inner gradient */}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/[0.05] via-transparent to-cyan-400/[0.05]" />

          <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
            <div className="flex min-w-0 items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-orange-300 shadow-inner">
                <Send size={18} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-white">
                    Ready to publish something new?
                  </h2>

                  <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-orange-300">
                    Create
                  </span>
                </div>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
                  Create a post, choose your social accounts, and
                  publish it now or schedule it for later.
                </p>
              </div>
            </div>

            <Link
              to="/dashboard/create-post"
              className="
                group inline-flex shrink-0
                items-center justify-center gap-2
                rounded-xl
                border border-white/10
                bg-white
                px-5 py-3
                text-sm font-extrabold
                text-slate-900
                shadow-[0_10px_30px_rgba(255,255,255,0.08)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-slate-100
                hover:shadow-[0_14px_35px_rgba(255,255,255,0.12)]
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/40
                focus-visible:ring-offset-2
                focus-visible:ring-offset-slate-950
                active:translate-y-0
              "
            >
              <Plus
                size={16}
                className="transition-transform duration-200 group-hover:rotate-90"
              />

              <span>Create a post</span>

              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS ITEM
========================================================= */

function StatusItem({
  label,
  value,
  icon: Icon,
  tone = "slate",
}) {
  const toneStyles = {
    green: {
      wrapper:
        "border-emerald-200/70 bg-emerald-50/70 hover:border-emerald-300 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:hover:border-emerald-800",
      icon:
        "bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/70 dark:text-emerald-400 dark:ring-emerald-900/60",
      value:
        "text-emerald-700 dark:text-emerald-400",
    },

    orange: {
      wrapper:
        "border-orange-200/70 bg-orange-50/70 hover:border-orange-300 dark:border-orange-900/60 dark:bg-orange-950/25 dark:hover:border-orange-800",
      icon:
        "bg-orange-100 text-orange-600 ring-1 ring-orange-200/60 dark:bg-orange-950/70 dark:text-orange-400 dark:ring-orange-900/60",
      value:
        "text-orange-700 dark:text-orange-400",
    },

    slate: {
      wrapper:
        "border-slate-200/80 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700",
      icon:
        "bg-slate-100 text-slate-500 ring-1 ring-slate-200/70 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-800",
      value:
        "text-slate-800 dark:text-slate-200",
    },

    red: {
      wrapper:
        "border-red-200/70 bg-red-50/70 hover:border-red-300 dark:border-red-900/60 dark:bg-red-950/25 dark:hover:border-red-800",
      icon:
        "bg-red-100 text-red-600 ring-1 ring-red-200/60 dark:bg-red-950/70 dark:text-red-400 dark:ring-red-900/60",
      value:
        "text-red-700 dark:text-red-400",
    },
  };

  const styles =
    toneStyles[tone] || toneStyles.slate;

  return (
    <div
      className={`
        group flex min-w-0 items-center gap-3
        rounded-2xl
        border
        p-3.5
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_10px_25px_rgba(15,23,42,0.05)]
        dark:hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)]
        ${styles.wrapper}
      `}
    >
      <div
        className={`
          grid h-10 w-10 shrink-0
          place-items-center
          rounded-xl
          transition-transform duration-200
          group-hover:scale-105
          ${styles.icon}
        `}
      >
        <Icon
          size={16}
          strokeWidth={1.8}
        />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p
          className={`
            mt-1
            text-lg
            font-black
            leading-none
            tracking-tight
            ${styles.value}
          `}
        >
          {value}
        </p>
      </div>
    </div>
  );
}