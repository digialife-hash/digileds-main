import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
} from "lucide-react";

import { usePost } from "../../../hooks/usePost.js";

export default function UpcomingPosts() {
  const { posts = [] } = usePost();

  const scheduled = Array.isArray(posts)
    ? posts
        .filter(
          (post) =>
            String(post?.status || "")
              .trim()
              .toLowerCase() === "scheduled"
        )
        .slice(0, 5)
    : [];

  return (
    <section
      className="
        group relative overflow-hidden rounded-[24px]
        border border-stone-200/80
        bg-white/75
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all duration-300
        hover:border-stone-300/80
        hover:shadow-[0_22px_65px_rgba(15,23,42,0.09)]
        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
        dark:hover:border-white/[0.13]
        dark:hover:shadow-[0_25px_75px_rgba(0,0,0,0.38)]
      "
    >
      {/* =====================================================
          AMBIENT GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none absolute -right-20 -top-20
          h-52 w-52 rounded-full
          bg-orange-400/10 blur-[90px]
          dark:bg-orange-500/[0.08]
        "
      />

      <div
        className="
          pointer-events-none absolute -bottom-24 -left-20
          h-48 w-48 rounded-full
          bg-cyan-400/[0.06] blur-[80px]
          dark:bg-cyan-400/[0.06]
        "
      />

      <div
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent
          via-orange-400/30
          to-transparent
          dark:via-orange-400/20
        "
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative flex items-center justify-between gap-4
          border-b border-stone-200/70
          px-5 py-5
          sm:px-6
          dark:border-white/[0.07]
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          {/* ICON */}

          <div
            className="
              relative grid h-10 w-10 shrink-0 place-items-center
              overflow-hidden rounded-xl
              border border-orange-200/70
              bg-orange-50 text-orange-600
              shadow-sm
              dark:border-orange-400/15
              dark:bg-orange-400/[0.08]
              dark:text-orange-400
            "
          >
            <div
              className="
                pointer-events-none absolute inset-0
                bg-gradient-to-br
                from-orange-400/10
                via-transparent
                to-transparent
              "
            />

            <CalendarDays
              size={18}
              strokeWidth={1.8}
              className="relative"
            />
          </div>

          {/* TITLE */}

          <div className="min-w-0">
            <h2
              className="
                truncate text-[15px] font-black tracking-tight
                text-stone-900
                dark:text-white
              "
            >
              Coming up
            </h2>

            <p
              className="
                mt-0.5 truncate text-xs
                text-stone-500
                dark:text-slate-400
              "
            >
              Your next scheduled content
            </p>
          </div>
        </div>

        {/* CALENDAR LINK */}

        <Link
          to="/dashboard/calendar"
          className="
            group/calendar inline-flex shrink-0
            items-center gap-1.5
            text-xs font-bold
            text-orange-600
            transition-colors duration-200
            hover:text-orange-700
            dark:text-orange-400
            dark:hover:text-orange-300
          "
        >
          Calendar

          <ArrowRight
            size={14}
            strokeWidth={2}
            className="
              transition-transform duration-200
              group-hover/calendar:translate-x-0.5
            "
          />
        </Link>
      </div>

      {/* =====================================================
          LIST
      ====================================================== */}

      <div className="relative p-3 sm:p-4">
        {scheduled.length > 0 ? (
          <div className="space-y-1.5">
            {scheduled.map((post) => (
              <UpcomingRow
                key={post?.id ?? post?._id}
                post={post}
              />
            ))}
          </div>
        ) : (
          <EmptyScheduled />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   UPCOMING ROW
========================================================= */

function UpcomingRow({ post }) {
  const title =
    post?.title ||
    post?.caption ||
    "Untitled post";

  const platform =
    post?.platform ||
    post?.platformName ||
    "Social";

  const rawDate =
    post?.date ||
    post?.scheduledAt ||
    post?.scheduled_at ||
    "";

  const dateInfo = parseDate(rawDate);

  return (
    <div
      className="
        group/row flex min-w-0 items-center gap-3
        rounded-2xl
        border border-transparent
        px-2 py-2.5
        transition-all duration-200
        hover:border-stone-200/70
        hover:bg-stone-50/80
        sm:gap-3.5 sm:px-2.5
        dark:hover:border-white/[0.07]
        dark:hover:bg-white/[0.035]
      "
    >
      {/* ===================================================
          DATE BOX
      ==================================================== */}

      <div
        className="
          relative flex h-[58px] w-[58px]
          shrink-0 flex-col
          items-center justify-center
          overflow-hidden rounded-2xl
          border border-orange-200/70
          bg-orange-50/80
          shadow-sm
          transition-all duration-200
          group-hover/row:scale-[1.03]
          group-hover/row:shadow-md
          dark:border-orange-400/15
          dark:bg-orange-400/[0.08]
        "
      >
        <div
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-br
            from-white/50
            via-transparent
            to-orange-100/30
            dark:from-white/[0.06]
            dark:to-orange-400/[0.04]
          "
        />

        <span
          className="
            relative z-10
            text-[18px] font-black leading-none
            text-orange-700
            dark:text-orange-300
          "
        >
          {dateInfo.day}
        </span>

        <span
          className="
            relative z-10 mt-1
            text-[8px] font-black uppercase
            tracking-[0.14em]
            text-orange-500
            dark:text-orange-400
          "
        >
          {dateInfo.month}
        </span>
      </div>

      {/* ===================================================
          INFO
      ==================================================== */}

      <div className="min-w-0 flex-1">
        <p
          className="
            truncate text-sm font-bold
            text-stone-800
            transition-colors
            group-hover/row:text-stone-950
            dark:text-slate-100
            dark:group-hover/row:text-white
          "
          title={title}
        >
          {title}
        </p>

        <div
          className="
            mt-1.5 flex min-w-0
            items-center gap-1.5
            text-[10px] font-medium
            text-stone-400
            sm:text-[11px]
            dark:text-slate-500
          "
        >
          {/* TIME */}

          <span className="flex min-w-0 items-center gap-1">
            <Clock3
              size={11}
              strokeWidth={1.8}
              className="shrink-0"
            />

            <span className="truncate">
              {dateInfo.time || "Scheduled"}
            </span>
          </span>

          <span className="text-stone-300 dark:text-slate-700">
            ·
          </span>

          {/* PLATFORM */}

          <span className="truncate">
            {platform}
          </span>
        </div>
      </div>

      {/* ===================================================
          STATUS DOT
      ==================================================== */}

      <div className="hidden shrink-0 sm:block">
        <span
          className="
            block h-2 w-2 rounded-full
            bg-orange-500
            shadow-[0_0_9px_rgba(249,115,22,0.65)]
            dark:bg-orange-400
            dark:shadow-[0_0_10px_rgba(251,146,60,0.75)]
          "
          title="Scheduled"
        />
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyScheduled() {
  return (
    <div
      className="
        flex min-h-[210px]
        flex-col items-center justify-center
        px-5 py-9 text-center
      "
    >
      {/* ICON */}

      <div
        className="
          relative grid h-14 w-14
          place-items-center
          rounded-2xl
          border border-stone-200/80
          bg-white/80
          text-stone-400
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.045]
          dark:text-slate-500
        "
      >
        <div
          className="
            pointer-events-none absolute -inset-3
            rounded-3xl
            bg-orange-400/5
            blur-xl
            dark:bg-orange-400/[0.08]
          "
        />

        <CalendarDays
          size={21}
          strokeWidth={1.7}
          className="relative"
        />
      </div>

      {/* TITLE */}

      <h3
        className="
          mt-4 text-sm font-black
          text-stone-800
          dark:text-white
        "
      >
        Nothing scheduled
      </h3>

      {/* DESCRIPTION */}

      <p
        className="
          mt-1.5 max-w-[230px]
          text-xs leading-5
          text-stone-400
          dark:text-slate-500
        "
      >
        Schedule your next post and it will appear here.
      </p>

      {/* CREATE BUTTON */}

      <Link
        to="/dashboard/create-post"
        className="
          group/create mt-5 inline-flex
          items-center gap-2
          rounded-xl
          bg-stone-950
          px-4 py-2.5
          text-xs font-bold text-white
          shadow-sm
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-stone-800
          hover:shadow-lg
          dark:bg-white
          dark:text-slate-950
          dark:hover:bg-slate-100
        "
      >
        <FileText
          size={13}
          strokeWidth={2}
        />

        Create post

        <ArrowRight
          size={13}
          className="
            transition-transform duration-200
            group-hover/create:translate-x-0.5
          "
        />
      </Link>
    </div>
  );
}

/* =========================================================
   DATE PARSER
========================================================= */

function parseDate(value) {
  if (!value) {
    return {
      day: "—",
      month: "NEXT",
      time: "",
    };
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", {
        month: "short",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  }

  const text = String(value);

  const numericMatch = text.match(/\d+/);

  const firstPart =
    text.split(" ")[0] || "NEXT";

  return {
    day: numericMatch?.[0] || "—",
    month: firstPart.slice(0, 3).toUpperCase(),
    time: "",
  };
}