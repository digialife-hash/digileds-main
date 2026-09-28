
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Layers3,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import { usePost } from "../../hooks/usePost.js";

/* =========================================================
   HELPERS
========================================================= */

function getPlatformValue(platform) {
  return String(platform || "")
    .trim()
    .toLowerCase();
}

function getPlatformInitial(platform) {
  const value = getPlatformValue(platform);

  if (value.includes("instagram")) return "IG";
  if (value.includes("facebook")) return "FB";
  if (value.includes("linkedin")) return "IN";
  if (value.includes("youtube")) return "YT";

  if (value.includes("twitter") || value === "x") {
    return "X";
  }

  if (value.includes("google")) return "G";

  return value.charAt(0).toUpperCase() || "S";
}

function getPlatformStyle(platform) {
  const value = getPlatformValue(platform);

  if (value.includes("instagram")) {
    return "border-pink-100 bg-pink-50 text-pink-600 dark:border-pink-400/15 dark:bg-pink-400/10 dark:text-pink-300";
  }

  if (value.includes("facebook")) {
    return "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-300";
  }

  if (value.includes("linkedin")) {
    return "border-sky-100 bg-sky-50 text-sky-600 dark:border-sky-400/15 dark:bg-sky-400/10 dark:text-sky-300";
  }

  if (value.includes("twitter") || value === "x") {
    return "border-stone-200 bg-stone-100 text-stone-700 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-slate-200";
  }

  if (value.includes("youtube")) {
    return "border-red-100 bg-red-50 text-red-600 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-300";
  }

  if (value.includes("google")) {
    return "border-emerald-100 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300";
  }

  return "border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300";
}

/* =========================================================
   MAIN
========================================================= */

export default function PlatformPerformance() {
  const { posts = [] } = usePost();

  const safePosts = Array.isArray(posts) ? posts : [];

  /* =======================================================
     PLATFORM COUNTS
  ======================================================== */

  const counts = safePosts.reduce((result, post) => {
    const rawPlatforms = String(post?.platform || "Other")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const platforms =
      rawPlatforms.length > 0 ? rawPlatforms : ["Other"];

    platforms.forEach((name) => {
      result[name] = (result[name] || 0) + 1;
    });

    return result;
  }, {});

  /* =======================================================
     SORT PLATFORMS
  ======================================================== */

  const platformEntries = Object.entries(counts).sort(
    ([firstName, firstCount], [secondName, secondCount]) => {
      if (secondCount !== firstCount) {
        return secondCount - firstCount;
      }

      return firstName.localeCompare(secondName);
    }
  );

  const totalPlatformAssignments = platformEntries.reduce(
    (total, [, count]) => total + count,
    0
  );

  const maxCount = platformEntries[0]?.[1] || 1;

  const topPlatform = platformEntries[0]?.[0] || "—";

  const topPlatformCount = platformEntries[0]?.[1] || 0;

  const topPlatformShare =
    totalPlatformAssignments > 0
      ? Math.round(
          (topPlatformCount / totalPlatformAssignments) * 100
        )
      : 0;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/[0.035] blur-[110px] dark:bg-orange-400/[0.055]" />
        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-[120px] dark:bg-cyan-400/[0.045]" />
        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.025] blur-[130px] dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <PageHeader
          eyebrow="Analytics"
          title="Platform performance"
          description="Compare how your content is distributed across connected publishing platforms."
          action={
            <Link
              to="/dashboard/create-post"
              className="
                group
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-stone-950
                px-4
                text-sm
                font-bold
                text-white
                shadow-[0_10px_25px_rgba(0,0,0,0.10)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-stone-800
                hover:shadow-[0_15px_35px_rgba(249,115,22,0.14)]
                focus:outline-none
                focus:ring-2
                focus:ring-orange-500/20
                focus:ring-offset-2
                dark:bg-white
                dark:text-slate-950
                dark:hover:bg-slate-100
                dark:focus:ring-orange-400/20
                dark:focus:ring-offset-[#070b14]
                sm:w-auto
              "
            >
              <Plus
                size={17}
                strokeWidth={2.2}
                className="
                  shrink-0
                  transition-transform
                  duration-200
                  group-hover:rotate-90
                "
              />

              <span>Create post</span>

              <Sparkles
                size={13}
                className="shrink-0 text-orange-300 dark:text-orange-500"
              />
            </Link>
          }
        />

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <section className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Share2}
            label="Platforms"
            value={platformEntries.length}
            description="Platforms with content"
            tone="orange"
          />

          <SummaryCard
            icon={Layers3}
            label="Assignments"
            value={totalPlatformAssignments}
            description="Platform placements"
            tone="violet"
          />

          <SummaryCard
            icon={BarChart3}
            label="Total posts"
            value={safePosts.length}
            description="Workspace content"
            tone="slate"
          />

          <SummaryCard
            icon={TrendingUp}
            label="Top platform"
            value={topPlatform}
            description={
              topPlatform === "—"
                ? "No platform data yet"
                : `${topPlatformShare}% of assignments`
            }
            tone="green"
            compact
          />
        </section>

        {/* =====================================================
            TOP PLATFORM HIGHLIGHT
        ====================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[24px]
            border
            border-white/80
            bg-white/[0.68]
            p-4
            shadow-[0_18px_55px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
            sm:p-5
            lg:p-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent dark:via-orange-400/20" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-orange-400/10 blur-[80px] dark:bg-orange-400/[0.07]" />

          <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px] lg:items-center">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={15}
                  className="text-orange-500 dark:text-orange-400"
                />

                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
                  Platform leader
                </span>
              </div>

              <h2 className="mt-2 truncate text-lg font-black tracking-tight text-stone-900 transition-colors duration-300 dark:text-white sm:text-xl">
                {topPlatform === "—"
                  ? "No platform data yet"
                  : `${topPlatform} is leading`}
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-stone-500 transition-colors duration-300 dark:text-slate-400">
                {topPlatform === "—"
                  ? "Create and assign posts to platforms to see which channel currently receives the most content."
                  : `${topPlatformCount} ${
                      topPlatformCount === 1
                        ? "post is"
                        : "posts are"
                    } currently assigned to ${topPlatform}.`}
              </p>
            </div>

            <HighlightMetric
              label="Assignments"
              value={topPlatformCount}
            />

            <HighlightMetric
              label="Share"
              value={
                topPlatform === "—"
                  ? "—"
                  : `${topPlatformShare}%`
              }
            />
          </div>
        </section>

        {/* =====================================================
            MAIN PLATFORM CARD
        ====================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-white/80
            bg-white/[0.68]
            shadow-[0_18px_55px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent dark:via-violet-400/20" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04] dark:to-transparent" />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-400/10 blur-[100px] dark:bg-violet-400/[0.055]" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-400/5 blur-[100px] dark:bg-orange-400/[0.04]" />

          {/* ===================================================
              CARD HEADER
          ==================================================== */}

          <div
            className="
              relative
              flex
              min-w-0
              flex-col
              gap-4
              border-b
              border-stone-200/70
              px-4
              py-4
              dark:border-white/[0.07]
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-6
              sm:py-5
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-violet-100
                  bg-violet-50
                  text-violet-600
                  dark:border-violet-400/15
                  dark:bg-violet-400/10
                  dark:text-violet-300
                "
              >
                <BarChart3 size={18} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    truncate
                    text-[15px]
                    font-black
                    tracking-tight
                    text-stone-900
                    transition-colors
                    duration-300
                    dark:text-white
                    sm:text-base
                  "
                >
                  Content by platform
                </h2>

                <p className="mt-0.5 text-xs leading-5 text-stone-500 dark:text-slate-400">
                  Distribution of content across your publishing channels.
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
                border-stone-200/80
                bg-white/70
                px-2.5
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]
                text-stone-400
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-400
              "
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500 dark:bg-violet-400" />
              Live workspace data
            </span>
          </div>

          {/* ===================================================
              PLATFORM LIST
          ==================================================== */}

          <div className="relative p-3 sm:p-5 lg:p-6">
            {platformEntries.length > 0 ? (
              <div className="space-y-3">
                {platformEntries.map(
                  ([platform, count], index) => (
                    <PlatformRow
                      key={platform}
                      platform={platform}
                      count={count}
                      rank={index + 1}
                      maxCount={maxCount}
                      totalAssignments={totalPlatformAssignments}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </section>

        {/* =====================================================
            INSIGHT CARDS
        ====================================================== */}

        <section className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-3">
          <InfoCard
            icon={CheckCircle2}
            title="What this data means"
            description="These numbers represent actual platform assignments in posts stored in your workspace."
            tone="green"
          />

          <InfoCard
            icon={Share2}
            title="Multiple platforms"
            description="A single post assigned to several platforms contributes one placement to each selected platform."
            tone="violet"
          />

          <InfoCard
            icon={BarChart3}
            title="Provider analytics"
            description="Reach, impressions, likes and engagement require verified metrics from connected platform APIs."
            tone="blue"
          />
        </section>

        {/* =====================================================
            PLATFORM BREAKDOWN
        ====================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-white/80
            bg-white/[0.68]
            shadow-[0_18px_55px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent dark:via-orange-400/15" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04] dark:to-transparent" />

          <div className="border-b border-stone-200/70 px-4 py-5 dark:border-white/[0.07] sm:px-6">
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
                  border-orange-100
                  bg-orange-50
                  text-orange-600
                  dark:border-orange-400/15
                  dark:bg-orange-400/10
                  dark:text-orange-300
                "
              >
                <Share2 size={18} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <h2 className="text-[15px] font-black tracking-tight text-stone-900 dark:text-white">
                  Platform breakdown
                </h2>

                <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-slate-400">
                  A quick comparison of your content distribution.
                </p>
              </div>
            </div>
          </div>

          {platformEntries.length > 0 ? (
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
              {platformEntries.map(
                ([platform, count], index) => (
                  <BreakdownCard
                    key={platform}
                    platform={platform}
                    count={count}
                    rank={index + 1}
                    total={totalPlatformAssignments}
                  />
                )
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              <EmptyState small />
            </div>
          )}
        </section>

        {/* =====================================================
            FOOTER INFORMATION
        ====================================================== */}

        <section
          className="
            mt-5
            flex
            flex-col
            gap-4
            rounded-[24px]
            border
            border-stone-200/80
            bg-white/[0.68]
            p-4
            shadow-[0_18px_55px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.24)]
            sm:mt-6
            sm:flex-row
            sm:items-center
            sm:p-5
          "
        >
          <div className="pointer-events-none absolute" />

          <div
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-xl
              border
              border-stone-200
              bg-stone-50
              text-stone-500
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-slate-400
            "
          >
            <BarChart3 size={17} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black text-stone-800 dark:text-white">
              Keep publishing consistently
            </h3>

            <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-slate-400">
              Use this view to understand where your content is being
              distributed. Provider-specific performance should be evaluated
              using verified API analytics.
            </p>
          </div>

          <Link
            to="/dashboard/create-post"
            className="
              inline-flex
              w-full
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-stone-200
              bg-stone-50
              px-4
              py-2.5
              text-xs
              font-bold
              text-stone-700
              transition-all
              duration-200
              hover:border-stone-300
              hover:bg-white
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-slate-200
              dark:hover:border-white/[0.14]
              dark:hover:bg-white/[0.07]
              sm:w-auto
            "
          >
            Create post
            <ArrowRight size={13} />
          </Link>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   PLATFORM ROW
========================================================= */

function PlatformRow({
  platform,
  count,
  rank,
  maxCount,
  totalAssignments,
}) {
  const relativeWidth = Math.max(
    7,
    Math.min(100, (count / maxCount) * 100)
  );

  const share =
    totalAssignments > 0
      ? Math.round((count / totalAssignments) * 100)
      : 0;

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-transparent
        bg-stone-50/50
        p-3.5
        transition-all
        duration-200
        hover:border-stone-200/80
        hover:bg-white
        hover:shadow-sm
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.08]
        dark:hover:bg-white/[0.05]
        dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
        sm:p-4
        lg:p-5
      "
    >
      <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
        {/* Rank */}

        <div
          className="
            grid
            h-8
            w-8
            shrink-0
            place-items-center
            rounded-lg
            border
            border-stone-200/80
            bg-stone-50
            text-[9px]
            font-black
            text-stone-500
            dark:border-white/[0.08]
            dark:bg-white/[0.04]
            dark:text-slate-400
            sm:h-9
            sm:w-9
            sm:rounded-xl
            sm:text-[10px]
          "
        >
          #{rank}
        </div>

        {/* Platform */}

        <div className="flex min-w-0 w-full items-center gap-3 sm:w-[210px] sm:shrink-0 lg:w-[230px]">
          <div
            className={`
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-xl
              border
              text-[10px]
              font-black
              ${getPlatformStyle(platform)}
            `}
          >
            {getPlatformInitial(platform)}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-black text-stone-800 dark:text-slate-100"
              title={platform}
            >
              {platform}
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-stone-400 dark:text-slate-500">
              {count} {count === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>

        {/* Progress */}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[9px] font-black uppercase tracking-[0.12em] text-stone-400 dark:text-slate-500">
              Distribution
            </span>

            <span className="shrink-0 text-[10px] font-bold text-stone-500 dark:text-slate-400">
              {share}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-stone-200/70 dark:bg-white/[0.08]">
            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-orange-400
                via-violet-500
                to-cyan-400
                transition-all
                duration-700
              "
              style={{
                width: `${relativeWidth}%`,
              }}
            />
          </div>
        </div>

        {/* Count */}

        <div
          className="
            flex
            w-full
            items-center
            justify-between
            gap-2
            border-t
            border-stone-100
            pt-3
            dark:border-white/[0.06]
            sm:w-[90px]
            sm:justify-end
            sm:border-t-0
            sm:pt-0
          "
        >
          <span className="text-[9px] font-black uppercase tracking-[0.08em] text-stone-400 dark:text-slate-500 sm:hidden">
            Total
          </span>

          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-black tracking-tight text-stone-900 dark:text-white">
              {count}
            </span>

            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-stone-400 dark:text-slate-500">
              posts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "slate",
  compact = false,
}) {
  const tones = {
    orange:
      "border-orange-200/70 bg-orange-50 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",

    violet:
      "border-violet-200/70 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",

    slate:
      "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400",

    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",
  };

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-white/[0.68]
        p-4
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
        dark:hover:border-white/[0.11]
        dark:hover:bg-white/[0.045]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/[0.08]" />

      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-400/5 blur-[45px] dark:bg-orange-400/[0.04]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500 sm:text-[10px]">
            {label}
          </p>

          <p
            className={`
              mt-2
              truncate
              font-black
              tracking-[-0.04em]
              text-stone-950
              transition-colors
              duration-300
              dark:text-white
              ${
                compact
                  ? "max-w-[150px] text-xl sm:text-2xl"
                  : "text-3xl"
              }
              sm:mt-3
            `}
            title={String(value)}
          >
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-stone-400 dark:text-slate-500">
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
            ${tones[tone] || tones.slate}
          `}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   HIGHLIGHT METRIC
========================================================= */

function HighlightMetric({ label, value }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-stone-200
        bg-stone-50/70
        p-4
        transition-colors
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
      "
    >
      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-stone-400 dark:text-slate-500">
        {label}
      </p>

      <p className="mt-2 truncate text-2xl font-black tracking-tight text-stone-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  title,
  description,
  tone = "green",
}) {
  const tones = {
    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",

    violet:
      "border-violet-200/70 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",

    blue:
      "border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-300",
  };

  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-white/[0.68]
        p-4
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/[0.08]" />

      <div className="relative flex items-start gap-3">
        <div
          className={`
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            ${tones[tone] || tones.green}
          `}
        >
          <Icon size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-black text-stone-800 dark:text-white">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-stone-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   BREAKDOWN CARD
========================================================= */

function BreakdownCard({
  platform,
  count,
  rank,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((count / total) * 100)
      : 0;

  return (
    <article
      className="
        rounded-[20px]
        border
        border-stone-200/80
        bg-stone-50/55
        p-4
        transition-all
        duration-200
        hover:border-stone-300
        hover:bg-white
        hover:shadow-sm
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.1]
        dark:hover:bg-white/[0.05]
        dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
      "
    >
      <div className="flex items-center gap-3">
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
            ${getPlatformStyle(platform)}
          `}
        >
          {getPlatformInitial(platform)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span
              className="truncate text-xs font-black text-stone-700 dark:text-slate-200"
              title={platform}
            >
              {platform}
            </span>

            <span className="shrink-0 text-[9px] font-bold text-stone-400 dark:text-slate-500">
              #{rank}
            </span>
          </div>

          <div className="mt-1.5 flex items-baseline justify-between gap-3">
            <span className="text-lg font-black tracking-tight text-stone-900 dark:text-white">
              {count}
            </span>

            <span className="text-[9px] font-bold text-stone-400 dark:text-slate-500">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200/70 dark:bg-white/[0.08]">
        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-orange-400
            to-violet-500
          "
          style={{
            width: `${Math.max(
              5,
              Math.min(100, percentage)
            )}%`,
          }}
        />
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ small = false }) {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-stone-200
        bg-stone-50/50
        px-5
        text-center
        transition-colors
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.02]
        ${
          small
            ? "min-h-[200px] py-8"
            : "min-h-[300px] py-12"
        }
      `}
    >
      <div
        className="
          grid
          h-14
          w-14
          place-items-center
          rounded-2xl
          border
          border-white
          bg-white
          text-stone-300
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.05]
          dark:text-slate-500
        "
      >
        <Share2 size={22} strokeWidth={1.6} />
      </div>

      <h3 className="mt-4 text-sm font-black text-stone-700 dark:text-slate-200">
        No platform data yet
      </h3>

      <p className="mt-1.5 max-w-sm text-xs leading-5 text-stone-400 dark:text-slate-500">
        Create a post and assign one or more platforms to start seeing your
        content distribution here.
      </p>

      {!small && (
        <Link
          to="/dashboard/create-post"
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-stone-950
            px-4
            py-2.5
            text-xs
            font-bold
            text-white
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-stone-800
            dark:bg-white
            dark:text-slate-950
            dark:hover:bg-slate-100
          "
        >
          <Plus size={13} />
          Create post
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

