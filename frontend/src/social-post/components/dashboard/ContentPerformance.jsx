import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  FileText,
  Info,
  Layers3,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import { usePost } from "../../hooks/usePost.js";

/* =========================================================
   HELPERS
========================================================= */

function getStatus(post) {
  return String(post?.status || "")
    .trim()
    .toLowerCase();
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
    return `
      border-pink-200/80
      bg-pink-50
      text-pink-600
      dark:border-pink-400/15
      dark:bg-pink-400/10
      dark:text-pink-300
    `;
  }

  if (value.includes("facebook")) {
    return `
      border-blue-200/80
      bg-blue-50
      text-blue-600
      dark:border-blue-400/15
      dark:bg-blue-400/10
      dark:text-blue-300
    `;
  }

  if (value.includes("youtube")) {
    return `
      border-red-200/80
      bg-red-50
      text-red-600
      dark:border-red-400/15
      dark:bg-red-400/10
      dark:text-red-300
    `;
  }

  if (value.includes("linkedin")) {
    return `
      border-sky-200/80
      bg-sky-50
      text-sky-600
      dark:border-sky-400/15
      dark:bg-sky-400/10
      dark:text-sky-300
    `;
  }

  if (value.includes("twitter") || value === "x") {
    return `
      border-stone-200
      bg-stone-100
      text-stone-700
      dark:border-white/10
      dark:bg-white/[0.06]
      dark:text-slate-200
    `;
  }

  if (value.includes("google")) {
    return `
      border-emerald-200/80
      bg-emerald-50
      text-emerald-600
      dark:border-emerald-400/15
      dark:bg-emerald-400/10
      dark:text-emerald-300
    `;
  }

  return `
    border-violet-200/80
    bg-violet-50
    text-violet-600
    dark:border-violet-400/15
    dark:bg-violet-400/10
    dark:text-violet-300
  `;
}

function getPostTitle(post) {
  return (
    String(
      post?.title ||
        post?.caption ||
        post?.content ||
        ""
    ).trim() || "Untitled post"
  );
}

function getPostDate(post) {
  const value =
    post?.createdAt ||
    post?.created_at ||
    post?.publishedAt ||
    post?.published_at ||
    post?.date;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   MAIN
========================================================= */

export default function ContentPerformance() {
  const { posts = [] } = usePost();

  const safePosts = Array.isArray(posts)
    ? posts
    : [];

  /* =======================================================
     PUBLISHED
  ======================================================== */

  const published = safePosts.filter(
    (post) => getStatus(post) === "published"
  );

  const totalPublished = published.length;

  /* =======================================================
     PLATFORM COUNTS
  ======================================================== */

  const platformCounts = published.reduce(
    (acc, post) => {
      const platforms = String(
        post?.platform || "Unknown"
      )
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (!platforms.length) {
        platforms.push("Unknown");
      }

      platforms.forEach((platform) => {
        acc[platform] =
          (acc[platform] || 0) + 1;
      });

      return acc;
    },
    {}
  );

  const sortedPlatforms = Object.entries(
    platformCounts
  ).sort(
    ([, first], [, second]) =>
      second - first
  );

  const topPlatforms =
    sortedPlatforms.slice(0, 6);

  const totalPlatformAssignments =
    sortedPlatforms.reduce(
      (total, [, count]) =>
        total + count,
      0
    );

  const topPlatform =
    sortedPlatforms[0]?.[0] || "—";

  const topPlatformCount =
    sortedPlatforms[0]?.[1] || 0;

  const topPlatformShare =
    totalPublished > 0
      ? Math.round(
          (topPlatformCount /
            totalPublished) *
            100
        )
      : 0;

  /* =======================================================
     CONTENT MIX
  ======================================================== */

  const nonPublished = safePosts.filter(
    (post) =>
      getStatus(post) !== "published"
  );

  const otherContent =
    safePosts.length > 0
      ? safePosts.length - totalPublished
      : 0;

  return (
    <div
      className="
        relative
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[#f7f7f5]
        transition-colors
        duration-300
        dark:bg-[#070b14]
      "
    >
      {/* ===================================================
          AMBIENT BACKGROUND
      ==================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-40
            top-20
            h-80
            w-80
            rounded-full
            bg-orange-400/[0.035]
            blur-[120px]
            dark:bg-orange-400/[0.055]
          "
        />

        <div
          className="
            absolute
            right-[-140px]
            top-32
            h-96
            w-96
            rounded-full
            bg-cyan-400/[0.035]
            blur-[130px]
            dark:bg-cyan-400/[0.045]
          "
        />

        <div
          className="
            absolute
            bottom-[-180px]
            left-1/3
            h-[420px]
            w-[420px]
            rounded-full
            bg-violet-400/[0.025]
            blur-[140px]
            dark:bg-violet-400/[0.04]
          "
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">

        {/* ===================================================
            HEADER
        ==================================================== */}

        <PageHeader
          eyebrow="Analytics"
          title="Content performance"
          description="Find the content and platforms that deserve more attention."
          action={
            <div
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-stone-200/80
                bg-white/75
                px-4
                py-3
                text-xs
                font-bold
                text-stone-600
                shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                backdrop-blur-xl
                transition-colors
                dark:border-white/[0.08]
                dark:bg-white/[0.045]
                dark:text-slate-300
                dark:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                sm:w-auto
              "
            >
              <Sparkles
                size={14}
                className="text-orange-500 dark:text-orange-400"
              />

              Publishing insights
            </div>
          }
        />

        {/* ===================================================
            DATA NOTICE
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-violet-200/70
            bg-white/[0.72]
            shadow-[0_18px_60px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            transition-colors
            dark:border-violet-400/[0.12]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
            sm:mt-6
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-violet-400/40
              to-transparent
              dark:via-violet-400/20
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-56
              w-56
              rounded-full
              bg-violet-400/10
              blur-[90px]
              dark:bg-violet-400/[0.07]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-20
              left-1/3
              h-48
              w-48
              rounded-full
              bg-cyan-400/5
              blur-[80px]
              dark:bg-cyan-400/[0.035]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-20
              bg-gradient-to-b
              from-white/45
              to-transparent
              dark:from-white/[0.035]
              dark:to-transparent
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-4
              p-4
              sm:p-5
              lg:flex-row
              lg:items-center
              lg:justify-between
              lg:p-6
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
                  rounded-2xl
                  border
                  border-violet-200
                  bg-violet-50
                  text-violet-600
                  dark:border-violet-400/15
                  dark:bg-violet-400/10
                  dark:text-violet-300
                "
              >
                <BarChart3
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className="
                      text-sm
                      font-black
                      tracking-tight
                      text-stone-900
                      dark:text-white
                    "
                  >
                    Content insights
                  </h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-violet-200
                      bg-violet-50
                      px-2
                      py-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-violet-600
                      dark:border-violet-400/15
                      dark:bg-violet-400/10
                      dark:text-violet-300
                    "
                  >
                    Data aware
                  </span>
                </div>

                <p
                  className="
                    mt-1.5
                    max-w-4xl
                    text-xs
                    leading-5
                    text-stone-500
                    dark:text-slate-400
                  "
                >
                  This dashboard shows your actual publishing
                  distribution. Reach, impressions, likes and
                  engagement metrics require verified analytics
                  returned by connected social platform APIs.
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
                border-stone-200
                bg-stone-50
                px-3
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.1em]
                text-stone-500
                dark:border-white/[0.08]
                dark:bg-white/[0.045]
                dark:text-slate-400
              "
            >
              <Info size={11} />

              Real workspace data
            </span>
          </div>
        </section>

        {/* ===================================================
            SUMMARY CARDS
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            sm:mt-6
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <SummaryCard
            icon={Award}
            label="Published content"
            value={totalPublished}
            description="Successfully published posts"
            tone="amber"
          />

          <SummaryCard
            icon={Layers3}
            label="Platform assignments"
            value={totalPlatformAssignments}
            description="Published placements"
            tone="violet"
          />

          <SummaryCard
            icon={Share2}
            label="Platforms used"
            value={Object.keys(platformCounts).length}
            description="Platforms represented"
            tone="cyan"
          />

          <SummaryCard
            icon={FileText}
            label="Content library"
            value={safePosts.length}
            description="All workspace posts"
            tone="slate"
          />
        </section>

        {/* ===================================================
            HIGHLIGHT CARD
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[24px]
            border
            border-stone-200/80
            bg-white/[0.72]
            shadow-[0_16px_50px_rgba(15,23,42,0.04)]
            backdrop-blur-xl
            transition-colors
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.22)]
            sm:mt-6
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-orange-400/30
              to-transparent
              dark:via-orange-400/15
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-16
              -top-16
              h-40
              w-40
              rounded-full
              bg-orange-400/10
              blur-[70px]
              dark:bg-orange-400/[0.06]
            "
          />

          <div
            className="
              relative
              grid
              grid-cols-1
              gap-4
              p-4
              sm:p-5
              lg:grid-cols-[minmax(0,1fr)_220px_220px]
              lg:items-center
              lg:p-6
            "
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={16}
                  className="text-orange-500 dark:text-orange-400"
                />

                <span
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-stone-400
                    dark:text-slate-500
                  "
                >
                  Current leader
                </span>
              </div>

              <h2
                className="
                  mt-2
                  truncate
                  text-lg
                  font-black
                  tracking-tight
                  text-stone-900
                  dark:text-white
                  sm:text-xl
                "
              >
                {topPlatform === "—"
                  ? "No platform data yet"
                  : `${topPlatform} is your leading platform`}
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-stone-500
                  dark:text-slate-400
                "
              >
                {topPlatform === "—"
                  ? "Publish content to start building platform performance insights."
                  : `${topPlatformCount} published ${
                      topPlatformCount === 1
                        ? "post"
                        : "posts"
                    } are currently assigned to this platform.`}
              </p>
            </div>

            <HighlightMetric
              label="Published posts"
              value={topPlatformCount}
            />

            <HighlightMetric
              label="Content share"
              value={
                totalPublished > 0
                  ? `${topPlatformShare}%`
                  : "—"
              }
            />
          </div>
        </section>

        {/* ===================================================
            PLATFORM DISTRIBUTION
        ==================================================== */}

        <section
          className="
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-stone-200/80
            bg-white/[0.72]
            shadow-[0_20px_65px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            transition-colors
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
            sm:mt-6
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-cyan-400/25
              to-transparent
              dark:via-cyan-400/15
            "
          />

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-stone-200/70
              px-4
              py-5
              dark:border-white/[0.07]
              sm:px-6
              lg:flex-row
              lg:items-center
              lg:justify-between
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
                  border-cyan-200
                  bg-cyan-50
                  text-cyan-600
                  dark:border-cyan-400/15
                  dark:bg-cyan-400/10
                  dark:text-cyan-300
                "
              >
                <BarChart3
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <h2
                  className="
                    text-[15px]
                    font-black
                    text-stone-900
                    dark:text-white
                  "
                >
                  Platform distribution
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-stone-500
                    dark:text-slate-400
                  "
                >
                  Where your published content is currently
                  distributed.
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
                border-stone-200
                bg-stone-50
                px-3
                py-1.5
                text-[10px]
                font-black
                text-stone-500
                dark:border-white/[0.08]
                dark:bg-white/[0.045]
                dark:text-slate-400
              "
            >
              {totalPublished}{" "}
              {totalPublished === 1
                ? "published post"
                : "published posts"}
            </span>
          </div>

          <div className="relative p-4 sm:p-6">
            {topPlatforms.length > 0 ? (
              <div className="space-y-4">
                {topPlatforms.map(
                  ([platform, count], index) => {
                    const percentage =
                      totalPublished > 0
                        ? Math.round(
                            (count /
                              totalPublished) *
                              100
                          )
                        : 0;

                    const style =
                      getPlatformStyle(platform);

                    return (
                      <div
                        key={platform}
                        className="
                          group
                          rounded-2xl
                          border
                          border-transparent
                          bg-stone-50/55
                          p-3
                          transition-all
                          duration-200
                          hover:border-stone-200
                          hover:bg-white
                          hover:shadow-sm
                          dark:bg-white/[0.025]
                          dark:hover:border-white/[0.08]
                          dark:hover:bg-white/[0.045]
                          dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                          sm:p-4
                        "
                      >
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
                              ${style}
                            `}
                          >
                            {getPlatformInitial(
                              platform
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <span
                                  className="
                                    truncate
                                    text-sm
                                    font-black
                                    text-stone-800
                                    dark:text-slate-100
                                  "
                                  title={platform}
                                >
                                  {platform}
                                </span>

                                {index === 0 && (
                                  <span
                                    className="
                                      hidden
                                      shrink-0
                                      rounded-full
                                      border
                                      border-orange-200
                                      bg-orange-50
                                      px-2
                                      py-1
                                      text-[8px]
                                      font-black
                                      uppercase
                                      tracking-[0.08em]
                                      text-orange-600
                                      dark:border-orange-400/15
                                      dark:bg-orange-400/10
                                      dark:text-orange-300
                                      sm:inline-flex
                                    "
                                  >
                                    Top
                                  </span>
                                )}
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <span
                                  className="
                                    text-[10px]
                                    font-bold
                                    text-stone-400
                                    dark:text-slate-500
                                  "
                                >
                                  {count}{" "}
                                  {count === 1
                                    ? "post"
                                    : "posts"}
                                </span>

                                <span
                                  className="
                                    hidden
                                    w-10
                                    text-right
                                    text-[10px]
                                    font-black
                                    text-stone-500
                                    dark:text-slate-400
                                    sm:block
                                  "
                                >
                                  {percentage}%
                                </span>
                              </div>
                            </div>

                            <div
                              className="
                                mt-2
                                h-2
                                overflow-hidden
                                rounded-full
                                bg-stone-200/70
                                dark:bg-white/[0.07]
                              "
                            >
                              <div
                                className="
                                  h-full
                                  rounded-full
                                  bg-gradient-to-r
                                  from-cyan-500
                                  via-blue-500
                                  to-violet-500
                                  transition-all
                                  duration-700
                                "
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      percentage,
                                      3
                                    ),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No platform data yet"
                description="Publish content and assign one or more platforms to start building your distribution overview."
              />
            )}
          </div>
        </section>

        {/* ===================================================
            CONTENT SNAPSHOT
        ==================================================== */}

        <section
          className="
            mt-5
            grid
            gap-5
            sm:mt-6
            xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]
          "
        >
          {/* Published content */}

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
              dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
            "
          >
            <div
              className="
                flex
                flex-col
                gap-3
                border-b
                border-stone-200/70
                px-4
                py-5
                dark:border-white/[0.07]
                sm:px-6
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
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
                    border-amber-200
                    bg-amber-50
                    text-amber-600
                    dark:border-amber-400/15
                    dark:bg-amber-400/10
                    dark:text-amber-300
                  "
                >
                  <Award
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      text-[15px]
                      font-black
                      text-stone-900
                      dark:text-white
                    "
                  >
                    Published content
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-stone-500
                      dark:text-slate-400
                    "
                  >
                    Your latest published posts.
                  </p>
                </div>
              </div>

              <span
                className="
                  inline-flex
                  w-fit
                  items-center
                  rounded-full
                  border
                  border-stone-200
                  bg-stone-50
                  px-3
                  py-1.5
                  text-[10px]
                  font-black
                  text-stone-500
                  dark:border-white/[0.08]
                  dark:bg-white/[0.045]
                  dark:text-slate-400
                "
              >
                {published.length} items
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {published.length > 0 ? (
                <div className="space-y-3">
                  {published
                    .slice(0, 8)
                    .map((post, index) => (
                      <PublishedPost
                        key={
                          post?.id ??
                          `${getPostTitle(
                            post
                          )}-${index}`
                        }
                        post={post}
                      />
                    ))}

                  {published.length > 8 && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-dashed
                        border-stone-200
                        bg-stone-50/60
                        px-4
                        py-3
                        text-center
                        text-[10px]
                        font-semibold
                        text-stone-400
                        dark:border-white/[0.08]
                        dark:bg-white/[0.025]
                        dark:text-slate-500
                      "
                    >
                      Showing 8 of{" "}
                      {published.length}{" "}
                      published posts
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={Award}
                  title="No published content yet"
                  description="Publish your first post to start building real content performance insights."
                />
              )}
            </div>
          </section>

          {/* Content health */}

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
              dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
            "
          >
            <div
              className="
                border-b
                border-stone-200/70
                px-5
                py-5
                dark:border-white/[0.07]
              "
            >
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
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-600
                    dark:border-emerald-400/15
                    dark:bg-emerald-400/10
                    dark:text-emerald-300
                  "
                >
                  <CheckCircle2
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h2
                    className="
                      text-[15px]
                      font-black
                      text-stone-900
                      dark:text-white
                    "
                  >
                    Content health
                  </h2>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-stone-500
                      dark:text-slate-400
                    "
                  >
                    Quick view of your current content
                    pipeline.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <HealthRow
                label="Published"
                value={totalPublished}
                percentage={
                  safePosts.length > 0
                    ? Math.round(
                        (totalPublished /
                          safePosts.length) *
                          100
                      )
                    : 0
                }
                tone="green"
              />

              <HealthRow
                label="Other content"
                value={nonPublished.length}
                percentage={
                  safePosts.length > 0
                    ? Math.round(
                        (otherContent /
                          safePosts.length) *
                          100
                      )
                    : 0
                }
                tone="slate"
              />

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-stone-200
                  bg-stone-50/70
                  p-4
                  dark:border-white/[0.08]
                  dark:bg-white/[0.025]
                "
              >
                <div className="flex items-start gap-3">
                  <Info
                    size={15}
                    className="
                      mt-0.5
                      shrink-0
                      text-stone-400
                      dark:text-slate-500
                    "
                  />

                  <p
                    className="
                      text-[10px]
                      leading-5
                      text-stone-500
                      dark:text-slate-400
                    "
                  >
                    Content performance metrics such as
                    reach, impressions, likes and engagement
                    require verified provider analytics.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* ===================================================
            PERFORMANCE OPPORTUNITIES
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
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
            sm:mt-6
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              bg-violet-400/[0.04]
              blur-[100px]
              dark:bg-violet-400/[0.05]
            "
          />

          <div
            className="
              border-b
              border-stone-200/70
              px-5
              py-5
              dark:border-white/[0.07]
              sm:px-6
            "
          >
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
                  border-violet-200
                  bg-violet-50
                  text-violet-600
                  dark:border-violet-400/15
                  dark:bg-violet-400/10
                  dark:text-violet-300
                "
              >
                <Sparkles
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2
                  className="
                    text-[15px]
                    font-black
                    text-stone-900
                    dark:text-white
                  "
                >
                  Performance opportunities
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-stone-500
                    dark:text-slate-400
                  "
                >
                  Areas that can become smarter once provider
                  analytics are connected.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <OpportunityCard
              title="Top content"
              text="Identify posts that generate the strongest engagement."
            />

            <OpportunityCard
              title="Best platform"
              text="Compare where your content performs most effectively."
            />

            <OpportunityCard
              title="Best format"
              text="Discover which content formats deserve more focus."
            />

            <OpportunityCard
              title="Posting timing"
              text="Find the publishing windows that drive better results."
            />
          </div>
        </section>

        {/* ===================================================
            DATA INTEGRITY
        ==================================================== */}

        <section
          className="
            relative
            mt-5
            flex
            flex-col
            gap-4
            overflow-hidden
            rounded-[24px]
            border
            border-stone-200/80
            bg-white/[0.72]
            p-4
            shadow-[0_16px_50px_rgba(15,23,42,0.04)]
            backdrop-blur-xl
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_18px_55px_rgba(0,0,0,0.22)]
            sm:mt-6
            sm:flex-row
            sm:items-center
            sm:p-5
          "
        >
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-emerald-400/25
              to-transparent
              dark:via-emerald-400/15
            "
          />

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
              dark:bg-white/[0.045]
              dark:text-slate-400
            "
          >
            <Info
              size={17}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              className="
                text-sm
                font-black
                text-stone-800
                dark:text-slate-100
              "
            >
              Data integrity
            </h2>

            <p
              className="
                mt-1
                text-xs
                leading-5
                text-stone-500
                dark:text-slate-400
              "
            >
              This page does not invent performance statistics.
              Platform distribution comes from your workspace
              posts, while provider-specific engagement metrics
              should come directly from official social APIs.
            </p>
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
              border-emerald-200
              bg-emerald-50
              px-2.5
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.1em]
              text-emerald-600
              dark:border-emerald-400/15
              dark:bg-emerald-400/10
              dark:text-emerald-300
            "
          >
            <CheckCircle2 size={11} />

            Verified logic
          </span>
        </section>
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
}) {
  const tones = {
    amber: `
      border-amber-200
      bg-amber-50
      text-amber-600
      dark:border-amber-400/15
      dark:bg-amber-400/10
      dark:text-amber-300
    `,

    violet: `
      border-violet-200
      bg-violet-50
      text-violet-600
      dark:border-violet-400/15
      dark:bg-violet-400/10
      dark:text-violet-300
    `,

    cyan: `
      border-cyan-200
      bg-cyan-50
      text-cyan-600
      dark:border-cyan-400/15
      dark:bg-cyan-400/10
      dark:text-cyan-300
    `,

    slate: `
      border-stone-200
      bg-stone-50
      text-stone-500
      dark:border-white/[0.08]
      dark:bg-white/[0.045]
      dark:text-slate-400
    `,
  };

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
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]
        dark:hover:border-white/[0.12]
        dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)]
        sm:p-5
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white
          to-transparent
          dark:via-white/[0.06]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          bg-violet-400/5
          blur-[45px]
          dark:bg-violet-400/[0.035]
        "
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-stone-400
              dark:text-slate-500
              sm:text-[10px]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-black
              tracking-[-0.04em]
              text-stone-950
              dark:text-white
              sm:mt-3
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-stone-400
              dark:text-slate-500
            "
          >
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
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   HIGHLIGHT METRIC
========================================================= */

function HighlightMetric({
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-stone-200
        bg-stone-50/70
        p-4
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
      "
    >
      <p
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.12em]
          text-stone-400
          dark:text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-2xl
          font-black
          tracking-tight
          text-stone-900
          dark:text-white
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PUBLISHED POST
========================================================= */

function PublishedPost({ post }) {
  const title = getPostTitle(post);

  const platform =
    String(post?.platform || "Unknown")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)[0] || "Unknown";

  const date = getPostDate(post);

  return (
    <article
      className="
        group
        flex
        min-w-0
        flex-col
        gap-3
        rounded-2xl
        border
        border-stone-200/70
        bg-stone-50/50
        p-3
        transition-all
        duration-200
        hover:border-stone-300
        hover:bg-white
        hover:shadow-sm
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.11]
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
        sm:flex-row
        sm:items-center
        sm:p-4
      "
    >
      <div
        className="
          grid
          h-10
          w-10
          shrink-0
          place-items-center
          rounded-xl
          bg-white
          text-stone-500
          shadow-sm
          ring-1
          ring-stone-200
          dark:bg-white/[0.055]
          dark:text-slate-400
          dark:ring-white/[0.08]
        "
      >
        <FileText size={17} />
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className="
            truncate
            text-sm
            font-black
            text-stone-800
            dark:text-slate-100
          "
          title={title}
        >
          {title}
        </h3>

        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
          <span
            className={`
              inline-flex
              items-center
              rounded-lg
              border
              px-2
              py-1
              text-[8px]
              font-black
              uppercase
              tracking-[0.08em]
              ${getPlatformStyle(platform)}
            `}
          >
            {getPlatformInitial(platform)}

            <span className="ml-1">
              {platform}
            </span>
          </span>

          <span
            className="
              text-[10px]
              text-stone-400
              dark:text-slate-500
            "
          >
            {formatDate(date)}
          </span>
        </div>
      </div>

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          gap-2
          border-t
          border-stone-100
          pt-3
          dark:border-white/[0.06]
          sm:border-0
          sm:pt-0
        "
      >
        <span
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.1em]
            text-emerald-600
            dark:text-emerald-400
          "
        >
          Published
        </span>

        <ArrowRight
          size={15}
          className="
            text-stone-300
            transition-transform
            duration-200
            group-hover:translate-x-0.5
            group-hover:text-stone-500
            dark:text-slate-600
            dark:group-hover:text-slate-300
          "
        />
      </div>
    </article>
  );
}

/* =========================================================
   HEALTH ROW
========================================================= */

function HealthRow({
  label,
  value,
  percentage,
  tone = "slate",
}) {
  const barTone = {
    green:
      "bg-gradient-to-r from-emerald-400 to-emerald-500",

    slate:
      "bg-gradient-to-r from-stone-300 to-stone-400 dark:from-slate-600 dark:to-slate-500",
  };

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between gap-3">
        <span
          className="
            text-xs
            font-bold
            text-stone-700
            dark:text-slate-300
          "
        >
          {label}
        </span>

        <div className="flex items-center gap-2">
          <span
            className="
              text-xs
              font-black
              text-stone-800
              dark:text-slate-100
            "
          >
            {value}
          </span>

          <span
            className="
              text-[9px]
              font-bold
              text-stone-400
              dark:text-slate-500
            "
          >
            {percentage}%
          </span>
        </div>
      </div>

      <div
        className="
          mt-2
          h-2
          overflow-hidden
          rounded-full
          bg-stone-100
          dark:bg-white/[0.07]
        "
      >
        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-500
            ${barTone[tone] || barTone.slate}
          `}
          style={{
            width: `${Math.min(
              Math.max(percentage, 0),
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   OPPORTUNITY CARD
========================================================= */

function OpportunityCard({
  title,
  text,
}) {
  return (
    <article
      className="
        group
        rounded-[20px]
        border
        border-stone-200/80
        bg-stone-50/60
        p-4
        transition-all
        duration-200
        hover:border-violet-200
        hover:bg-white
        hover:shadow-sm
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
        dark:hover:border-violet-400/15
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]
      "
    >
      <div className="flex items-start gap-3">
        <div
          className="
            mt-0.5
            grid
            h-8
            w-8
            shrink-0
            place-items-center
            rounded-lg
            bg-violet-50
            text-violet-500
            dark:bg-violet-400/10
            dark:text-violet-300
          "
        >
          <Sparkles size={14} />
        </div>

        <div className="min-w-0">
          <h3
            className="
              text-xs
              font-black
              text-stone-700
              dark:text-slate-200
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-[10px]
              leading-5
              text-stone-400
              dark:text-slate-500
            "
          >
            {text}
          </p>

          <span
            className="
              mt-2
              inline-flex
              text-[9px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-violet-400
              dark:text-violet-300
            "
          >
            API powered
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon: Icon = BarChart3,
  title,
  description,
}) {
  return (
    <div
      className="
        flex
        min-h-[250px]
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
        dark:bg-white/[0.02]
      "
    >
      <div
        className="
          grid
          h-12
          w-12
          place-items-center
          rounded-2xl
          border
          border-white
          bg-white
          text-stone-300
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.045]
          dark:text-slate-600
        "
      >
        <Icon
          size={21}
          strokeWidth={1.6}
        />
      </div>

      <h3
        className="
          mt-4
          text-sm
          font-black
          text-stone-700
          dark:text-slate-200
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1.5
          max-w-md
          text-xs
          leading-5
          text-stone-400
          dark:text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}