
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  Filter,
  Plus,
  Search,
  Send,
  Timer,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

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

function getScheduleDate(post) {
  const value =
    post?.scheduledAt ||
    post?.scheduled_at ||
    post?.date;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function formatDate(value) {
  if (!value) return "Date not set";

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRelativeSchedule(value) {
  if (!value) return "Date not set";

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  const diff = date.getTime() - Date.now();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < 0) {
    const elapsed = Math.abs(diff);

    if (elapsed < minute) {
      return "Due now";
    }

    if (elapsed < hour) {
      return `${Math.floor(elapsed / minute)}m overdue`;
    }

    if (elapsed < day) {
      return `${Math.floor(elapsed / hour)}h overdue`;
    }

    return `${Math.floor(elapsed / day)}d overdue`;
  }

  if (diff < minute) {
    return "Publishing soon";
  }

  if (diff < hour) {
    return `In ${Math.floor(diff / minute)}m`;
  }

  if (diff < day) {
    return `In ${Math.floor(diff / hour)}h`;
  }

  return `In ${Math.floor(diff / day)}d`;
}

function getScheduleState(date) {
  if (!date) {
    return {
      label: "No date",
      tone: "slate",
    };
  }

  if (date.getTime() < Date.now()) {
    return {
      label: "Overdue",
      tone: "red",
    };
  }

  const diff =
    date.getTime() - Date.now();

  if (diff <= 60 * 60 * 1000) {
    return {
      label: "Soon",
      tone: "orange",
    };
  }

  return {
    label: "Queued",
    tone: "green",
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

  if (
    value.includes("twitter") ||
    value === "x"
  ) {
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
      border-pink-200/70
      bg-pink-50
      text-pink-600
      dark:border-pink-400/15
      dark:bg-pink-400/10
      dark:text-pink-300
    `;
  }

  if (value.includes("facebook")) {
    return `
      border-blue-200/70
      bg-blue-50
      text-blue-600
      dark:border-blue-400/15
      dark:bg-blue-400/10
      dark:text-blue-300
    `;
  }

  if (value.includes("youtube")) {
    return `
      border-red-200/70
      bg-red-50
      text-red-600
      dark:border-red-400/15
      dark:bg-red-400/10
      dark:text-red-300
    `;
  }

  if (value.includes("linkedin")) {
    return `
      border-sky-200/70
      bg-sky-50
      text-sky-600
      dark:border-sky-400/15
      dark:bg-sky-400/10
      dark:text-sky-300
    `;
  }

  if (
    value.includes("twitter") ||
    value === "x"
  ) {
    return `
      border-stone-200
      bg-stone-100
      text-stone-700
      dark:border-white/[0.08]
      dark:bg-white/[0.05]
      dark:text-slate-300
    `;
  }

  if (value.includes("google")) {
    return `
      border-emerald-200/70
      bg-emerald-50
      text-emerald-600
      dark:border-emerald-400/15
      dark:bg-emerald-400/10
      dark:text-emerald-300
    `;
  }

  return `
    border-violet-200/70
    bg-violet-50
    text-violet-600
    dark:border-violet-400/15
    dark:bg-violet-400/10
    dark:text-violet-300
  `;
}

function getTitle(post) {
  return (
    String(
      post?.title ||
        post?.caption ||
        post?.content ||
        ""
    ).trim() || "Untitled post"
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function PublishingQueue() {
  const { posts = [] } = usePost();

  const safePosts = Array.isArray(posts)
    ? posts
    : [];

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] =
    useState("all");

  /* =======================================================
     SCHEDULED
  ======================================================== */

  const scheduled = useMemo(() => {
    return safePosts
      .filter(
        (post) =>
          getStatus(post) === "scheduled"
      )
      .map((post, index) => ({
        ...post,
        __queueIndex: index,
        __date: getScheduleDate(post),
      }))
      .sort((a, b) => {
        const first = a.__date
          ? a.__date.getTime()
          : Infinity;

        const second = b.__date
          ? b.__date.getTime()
          : Infinity;

        return first - second;
      });
  }, [safePosts]);

  /* =======================================================
     PLATFORM OPTIONS
  ======================================================== */

  const platforms = useMemo(() => {
    const values = scheduled.flatMap(
      (post) =>
        String(
          post?.platform || ""
        )
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
    );

    return [...new Set(values)].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [scheduled]);

  /* =======================================================
     FILTERED QUEUE
  ======================================================== */

  const filteredScheduled = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return scheduled.filter((post) => {
      const title = getTitle(post).toLowerCase();

      const platform = String(
        post?.platform || ""
      ).toLowerCase();

      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        platform.includes(keyword);

      const matchesPlatform =
        platformFilter === "all" ||
        platform
          .split(",")
          .map((item) => item.trim())
          .includes(
            platformFilter.toLowerCase()
          );

      return (
        matchesSearch &&
        matchesPlatform
      );
    });
  }, [
    scheduled,
    search,
    platformFilter,
  ]);

  /* =======================================================
     QUEUE STATS
  ======================================================== */

  const queueStats = useMemo(() => {
    const now = Date.now();

    let overdue = 0;
    let today = 0;
    let upcoming = 0;

    scheduled.forEach((post) => {
      const date = post.__date;

      if (!date) {
        upcoming += 1;
        return;
      }

      const timestamp = date.getTime();

      if (timestamp < now) {
        overdue += 1;
      } else {
        const current = new Date();
        const target = new Date(date);

        const sameDay =
          current.getFullYear() ===
            target.getFullYear() &&
          current.getMonth() ===
            target.getMonth() &&
          current.getDate() ===
            target.getDate();

        if (sameDay) {
          today += 1;
        } else {
          upcoming += 1;
        }
      }
    });

    return {
      total: scheduled.length,
      overdue,
      today,
      upcoming,
    };
  }, [scheduled]);

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
      {/* =================================================
          AMBIENT BACKGROUND
      ================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/[0.035] blur-[110px] dark:bg-orange-400/[0.055]" />

        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-[120px] dark:bg-cyan-400/[0.045]" />

        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.025] blur-[130px] dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">

        {/* =================================================
            HEADER
        ================================================== */}

        <PageHeader
          eyebrow="Tools"
          title="Publishing queue"
          description="Review and monitor content waiting for its scheduled publishing time."
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
                dark:bg-white
                dark:text-slate-950
                dark:shadow-[0_12px_30px_rgba(0,0,0,0.24)]
                dark:hover:bg-slate-100
                sm:w-auto
              "
            >
              <Plus
                size={16}
                className="
                  transition-transform
                  duration-200
                  group-hover:rotate-90
                "
              />

              Schedule post
            </Link>
          }
        />

        {/* =================================================
            QUEUE OVERVIEW
        ================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-orange-200/70
            bg-white/[0.68]
            shadow-[0_20px_60px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-orange-400/10
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent dark:via-orange-400/20" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-56
              w-56
              rounded-full
              bg-orange-400/[0.08]
              blur-[90px]
              dark:bg-orange-400/[0.055]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-20
              left-1/3
              h-40
              w-40
              rounded-full
              bg-cyan-400/[0.04]
              blur-[80px]
              dark:bg-cyan-400/[0.035]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
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
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  border
                  border-orange-200/70
                  bg-orange-50
                  text-orange-600
                  dark:border-orange-400/15
                  dark:bg-orange-400/10
                  dark:text-orange-300
                "
              >
                <CalendarClock
                  size={20}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black tracking-tight text-stone-900 transition-colors duration-300 dark:text-white sm:text-base">
                    Publishing pipeline
                  </h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-orange-200/70
                      bg-orange-50
                      px-2
                      py-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-orange-600
                      dark:border-orange-400/15
                      dark:bg-orange-400/10
                      dark:text-orange-300
                    "
                  >
                    Live queue
                  </span>
                </div>

                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-stone-500 transition-colors duration-300 dark:text-slate-400">
                  Keep track of scheduled content before it
                  goes live across your connected platforms.
                </p>
              </div>
            </div>

            <div
              className="
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                border-stone-200
                bg-white/75
                px-3
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.1em]
                text-stone-500
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-400
              "
            >
              <Clock3 size={12} />
              {scheduled.length} queued
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================== */}

        <section
          className="
            mt-5
            grid
            grid-cols-2
            gap-3
            sm:mt-6
            lg:grid-cols-4
          "
        >
          <QueueStat
            icon={Send}
            label="Total queued"
            value={queueStats.total}
            tone="violet"
          />

          <QueueStat
            icon={CalendarClock}
            label="Today"
            value={queueStats.today}
            tone="orange"
          />

          <QueueStat
            icon={Timer}
            label="Upcoming"
            value={queueStats.upcoming}
            tone="cyan"
          />

          <QueueStat
            icon={AlertCircle}
            label="Overdue"
            value={queueStats.overdue}
            tone={
              queueStats.overdue > 0
                ? "red"
                : "green"
            }
          />
        </section>

        {/* =================================================
            FILTERS
        ================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[22px]
            border
            border-white/80
            bg-white/[0.68]
            p-3
            shadow-[0_14px_40px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_16px_45px_rgba(0,0,0,0.2)]
            sm:mt-6
            sm:p-4
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[0.08]" />

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">

            {/* Search */}

            <div className="relative min-w-0">
              <Search
                size={15}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-stone-400
                  dark:text-slate-500
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search scheduled posts..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-stone-200
                  bg-white/80
                  pl-9
                  pr-10
                  text-xs
                  font-medium
                  text-stone-700
                  outline-none
                  placeholder:text-stone-400
                  transition-all
                  duration-200
                  focus:border-orange-300
                  focus:ring-4
                  focus:ring-orange-500/10
                  dark:border-white/[0.08]
                  dark:bg-white/[0.035]
                  dark:text-slate-200
                  dark:placeholder:text-slate-500
                  dark:focus:border-orange-400/30
                  dark:focus:ring-orange-400/10
                "
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-stone-400
                    transition-colors
                    hover:text-stone-700
                    dark:text-slate-500
                    dark:hover:text-slate-200
                  "
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Platform */}

            <div className="relative">
              <Filter
                size={14}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  z-10
                  -translate-y-1/2
                  text-stone-400
                  dark:text-slate-500
                "
              />

              <select
                value={platformFilter}
                onChange={(event) =>
                  setPlatformFilter(
                    event.target.value
                  )
                }
                className="
                  h-11
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-stone-200
                  bg-white/80
                  pl-9
                  pr-9
                  text-xs
                  font-bold
                  text-stone-700
                  outline-none
                  transition-all
                  duration-200
                  focus:border-orange-300
                  focus:ring-4
                  focus:ring-orange-500/10
                  dark:border-white/[0.08]
                  dark:bg-[#101722]
                  dark:text-slate-200
                  dark:focus:border-orange-400/30
                  dark:focus:ring-orange-400/10
                "
              >
                <option
                  value="all"
                  className="bg-white text-stone-800 dark:bg-[#101722] dark:text-slate-200"
                >
                  All platforms
                </option>

                {platforms.map((platform) => (
                  <option
                    key={platform}
                    value={platform}
                    className="bg-white text-stone-800 dark:bg-[#101722] dark:text-slate-200"
                  >
                    {platform}
                  </option>
                ))}
              </select>

              <ArrowRight
                size={12}
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rotate-90
                  text-stone-400
                  dark:text-slate-500
                "
              />
            </div>

            {/* Result */}

            <div
              className="
                flex
                h-11
                items-center
                justify-center
                rounded-xl
                border
                border-stone-200
                bg-stone-50/80
                px-4
                text-[10px]
                font-black
                uppercase
                tracking-[0.1em]
                text-stone-400
                dark:border-white/[0.08]
                dark:bg-white/[0.025]
                dark:text-slate-500
              "
            >
              {filteredScheduled.length} result
              {filteredScheduled.length === 1
                ? ""
                : "s"}
            </div>
          </div>
        </section>

        {/* =================================================
            QUEUE
        ================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-white/80
            bg-white/[0.68]
            shadow-[0_22px_70px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_22px_75px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent dark:via-cyan-400/15" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

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
                  border-cyan-200/70
                  bg-cyan-50
                  text-cyan-600
                  dark:border-cyan-400/15
                  dark:bg-cyan-400/10
                  dark:text-cyan-300
                "
              >
                <Send
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-[15px] font-black tracking-tight text-stone-900 transition-colors duration-300 dark:text-white">
                  Upcoming publications
                </h2>

                <p className="mt-1 text-xs leading-5 text-stone-500 transition-colors duration-300 dark:text-slate-400">
                  Scheduled posts waiting to be published.
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
                dark:bg-white/[0.04]
                dark:text-slate-400
              "
            >
              <CalendarClock size={12} />
              {scheduled.length === 1
                ? "1 scheduled post"
                : `${scheduled.length} scheduled posts`}
            </span>
          </div>

          {/* Queue content */}

          <div className="p-3 sm:p-5">
            {filteredScheduled.length > 0 ? (
              <div className="space-y-3">
                {filteredScheduled.map(
                  (post, index) => (
                    <QueueItem
                      key={
                        post?.id ??
                        `${getTitle(post)}-${index}`
                      }
                      post={post}
                    />
                  )
                )}
              </div>
            ) : (
              <EmptyQueue
                filtered={
                  scheduled.length > 0
                }
                onClear={() => {
                  setSearch("");
                  setPlatformFilter("all");
                }}
              />
            )}
          </div>
        </section>

        {/* =================================================
            HOW IT WORKS
        ================================================== */}

        <section
          className="
            mt-5
            grid
            gap-3
            pb-4
            sm:mt-6
            sm:pb-6
            md:grid-cols-3
          "
        >
          <InfoCard
            icon={CalendarClock}
            title="Scheduled"
            text="Posts are shown here when their status is scheduled and a publishing date is available."
          />

          <InfoCard
            icon={Clock3}
            title="Upcoming"
            text="The queue automatically sorts scheduled content from the earliest publishing time."
          />

          <InfoCard
            icon={CheckCircle2}
            title="Ready to publish"
            text="Actual publishing depends on your connected provider APIs and the permissions available to your account."
          />
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   QUEUE ITEM
========================================================= */

function QueueItem({ post }) {
  const title = getTitle(post);

  const platforms = String(
    post?.platform || "Platform not set"
  )
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const date = post.__date;

  const state =
    getScheduleState(date);

  const stateClasses = {
    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",

    orange:
      "border-orange-200/70 bg-orange-50 text-orange-700 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",

    red:
      "border-red-200/70 bg-red-50 text-red-700 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-300",

    slate:
      "border-stone-200 bg-stone-100 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-500",
  };

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-stone-200/80
        bg-white/[0.62]
        p-4
        shadow-[0_8px_25px_rgba(15,23,42,0.025)]
        transition-all
        duration-200
        hover:border-stone-300
        hover:bg-white/[0.82]
        hover:shadow-[0_14px_35px_rgba(15,23,42,0.06)]
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
        dark:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
        dark:hover:border-white/[0.12]
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.2)]
        sm:p-5
      "
    >
      {/* Timeline indicator */}

      <div
        className={`
          absolute
          bottom-0
          left-0
          top-0
          w-1
          ${
            state.tone === "red"
              ? "bg-red-400 dark:bg-red-400/80"
              : state.tone === "orange"
              ? "bg-orange-400 dark:bg-orange-400/80"
              : state.tone === "green"
              ? "bg-emerald-400 dark:bg-emerald-400/80"
              : "bg-stone-300 dark:bg-slate-600"
          }
        `}
      />

      <div
        className="
          flex
          min-w-0
          flex-col
          gap-4
          pl-2
          lg:flex-row
          lg:items-center
        "
      >
        {/* Main content */}

        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="
              grid
              h-11
              w-11
              shrink-0
              place-items-center
              rounded-2xl
              border
              border-stone-200
              bg-stone-50
              text-stone-500
              shadow-sm
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-slate-400
              dark:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
            "
          >
            <FileText
              size={18}
              strokeWidth={1.7}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3
                className="
                  max-w-full
                  truncate
                  text-sm
                  font-black
                  text-stone-800
                  transition-colors
                  duration-300
                  dark:text-slate-100
                "
                title={title}
              >
                {title}
              </h3>

              <span
                className={`
                  shrink-0
                  rounded-full
                  border
                  px-2
                  py-1
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.08em]
                  ${stateClasses[state.tone]}
                `}
              >
                {state.label}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    px-2
                    py-1
                    text-[8px]
                    font-black
                    ${getPlatformStyle(
                      platform
                    )}
                  `}
                >
                  <span>
                    {getPlatformInitial(
                      platform
                    )}
                  </span>

                  <span className="max-w-[130px] truncate">
                    {platform}
                  </span>
                </span>
              ))}

              {platforms.length === 0 && (
                <span className="rounded-lg bg-stone-100 px-2 py-1 text-[9px] font-bold text-stone-400 dark:bg-white/[0.04] dark:text-slate-500">
                  Platform not set
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-stone-400 dark:text-slate-500">
                <Clock3 size={11} />
                {formatDate(date)}
              </span>

              <span
                className={`
                  text-[10px]
                  font-black
                  ${
                    state.tone === "red"
                      ? "text-red-500 dark:text-red-400"
                      : state.tone === "orange"
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-stone-400 dark:text-slate-500"
                  }
                `}
              >
                {getRelativeSchedule(
                  date
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule panel */}

        <div
          className="
            flex
            min-w-0
            items-center
            justify-between
            gap-4
            border-t
            border-stone-100
            pt-3
            dark:border-white/[0.06]
            lg:min-w-[240px]
            lg:border-t-0
            lg:border-l
            lg:border-stone-100
            lg:pl-5
            lg:pt-0
            lg:dark:border-white/[0.06]
          "
        >
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-stone-400 dark:text-slate-500">
              Publishing at
            </p>

            <p className="mt-1 truncate text-xs font-black text-stone-700 dark:text-slate-200">
              {date
                ? date.toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )
                : "Not set"}
            </p>
          </div>

          <ArrowRight
            size={17}
            className="
              shrink-0
              text-stone-300
              transition-all
              duration-200
              group-hover:translate-x-0.5
              group-hover:text-cyan-500
              dark:text-slate-600
              dark:group-hover:text-cyan-400
            "
          />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   QUEUE STAT
========================================================= */

function QueueStat({
  icon: Icon,
  label,
  value,
  tone = "slate",
}) {
  const tones = {
    violet:
      "border-violet-200/70 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",

    orange:
      "border-orange-200/70 bg-orange-50 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",

    cyan:
      "border-cyan-200/70 bg-cyan-50 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300",

    red:
      "border-red-200/70 bg-red-50 text-red-600 dark:border-red-400/15 dark:bg-red-400/10 dark:text-red-300",

    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",

    slate:
      "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400",
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
        shadow-[0_14px_40px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_16px_45px_rgba(0,0,0,0.2)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[0.08]" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 dark:text-slate-500 sm:text-[10px]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black tracking-tight text-stone-900 transition-colors duration-300 dark:text-white sm:text-3xl">
            {value}
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
          <Icon size={17} />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY QUEUE
========================================================= */

function EmptyQueue({
  filtered,
  onClear,
}) {
  return (
    <div
      className="
        relative
        flex
        min-h-[320px]
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-[22px]
        border
        border-dashed
        border-stone-300
        bg-stone-50/50
        px-5
        py-12
        text-center
        transition-colors
        duration-300
        dark:border-white/[0.1]
        dark:bg-white/[0.02]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-48
          w-48
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-cyan-400/[0.035]
          blur-[70px]
          dark:bg-cyan-400/[0.045]
        "
      />

      <div
        className="
          relative
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
          dark:bg-white/[0.04]
          dark:text-slate-600
        "
      >
        {filtered ? (
          <Search
            size={22}
            strokeWidth={1.6}
          />
        ) : (
          <Send
            size={22}
            strokeWidth={1.6}
          />
        )}
      </div>

      <h3 className="relative mt-4 text-sm font-black text-stone-700 transition-colors duration-300 dark:text-slate-200">
        {filtered
          ? "No matching scheduled posts"
          : "Your publishing queue is empty"}
      </h3>

      <p className="relative mt-1.5 max-w-md text-xs leading-5 text-stone-400 dark:text-slate-500">
        {filtered
          ? "Try another search term or platform filter."
          : "Schedule a post to see it appear here before its publishing time."}
      </p>

      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="
            relative
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-stone-200
            bg-white
            px-4
            py-2.5
            text-xs
            font-bold
            text-stone-600
            shadow-sm
            transition
            hover:bg-stone-50
            dark:border-white/[0.08]
            dark:bg-white/[0.04]
            dark:text-slate-300
            dark:hover:bg-white/[0.07]
          "
        >
          <X size={13} />
          Clear filters
        </button>
      ) : (
        <Link
          to="/dashboard/create-post"
          className="
            relative
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
            transition
            hover:-translate-y-0.5
            hover:bg-stone-800
            dark:bg-white
            dark:text-slate-950
            dark:hover:bg-slate-100
          "
        >
          <Plus size={13} />
          Schedule a post
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-white/80
        bg-white/[0.68]
        p-4
        shadow-[0_12px_35px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        dark:border-white/[0.08]
        dark:bg-white/[0.03]
        dark:shadow-[0_14px_40px_rgba(0,0,0,0.18)]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[0.07]" />

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
            border-stone-200
            bg-stone-50
            text-stone-500
            dark:border-white/[0.08]
            dark:bg-white/[0.04]
            dark:text-slate-400
          "
        >
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-black text-stone-800 transition-colors duration-300 dark:text-slate-200">
            {title}
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-stone-500 transition-colors duration-300 dark:text-slate-400">
            {text}
          </p>
        </div>
      </div>
    </article>
  );
}

