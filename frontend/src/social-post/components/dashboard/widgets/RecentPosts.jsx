import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  Plus,
  XCircle,
} from "lucide-react";

import { usePost } from "../../../hooks/usePost.js";

export default function RecentPosts() {
  const { posts = [] } = usePost();

  const recentPosts = Array.isArray(posts)
    ? posts.slice(0, 6)
    : [];

  return (
    <section
      className="
        group relative overflow-hidden rounded-[24px]
        border border-stone-200/80 bg-white/75
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
          pointer-events-none absolute -right-24 -top-24
          h-56 w-56 rounded-full
          bg-orange-400/10 blur-[90px]
          dark:bg-orange-500/[0.08]
        "
      />

      <div
        className="
          pointer-events-none absolute -bottom-24 -left-24
          h-56 w-56 rounded-full
          bg-cyan-400/[0.06] blur-[90px]
          dark:bg-cyan-400/[0.06]
        "
      />

      <div
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r from-transparent via-orange-400/30 to-transparent
          dark:via-orange-400/20
        "
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative flex flex-col gap-4
          border-b border-stone-200/70
          px-5 py-5
          sm:flex-row sm:items-center sm:justify-between sm:px-6
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
                bg-gradient-to-br from-orange-400/10 via-transparent to-transparent
              "
            />

            <FileText
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
              Recent posts
            </h2>

            <p
              className="
                mt-0.5 truncate text-xs
                text-stone-500
                dark:text-slate-400
              "
            >
              Keep an eye on your latest content
            </p>
          </div>
        </div>

        {/* VIEW ALL */}

        <Link
          to="/dashboard/posts"
          className="
            group/link inline-flex shrink-0 items-center gap-1.5
            text-xs font-bold
            text-orange-600
            transition-all duration-200
            hover:text-orange-700
            dark:text-orange-400
            dark:hover:text-orange-300
          "
        >
          View all

          <ArrowRight
            size={14}
            strokeWidth={2}
            className="
              transition-transform duration-200
              group-hover/link:translate-x-0.5
            "
          />
        </Link>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative px-3 py-3 sm:px-4 sm:py-4">
        {recentPosts.length > 0 ? (
          <div className="space-y-1">
            {recentPosts.map((post) => (
              <RecentPostRow
                key={post?.id ?? post?._id}
                post={post}
              />
            ))}
          </div>
        ) : (
          <EmptyPosts />
        )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {recentPosts.length > 0 && (
        <div
          className="
            border-t border-stone-200/70
            bg-stone-50/30
            px-5 py-3.5
            sm:px-6
            dark:border-white/[0.07]
            dark:bg-white/[0.015]
          "
        >
          <Link
            to="/dashboard/posts"
            className="
              group/manage inline-flex items-center gap-1.5
              text-xs font-bold
              text-stone-500
              transition-colors
              hover:text-stone-900
              dark:text-slate-400
              dark:hover:text-white
            "
          >
            Manage all content

            <ArrowRight
              size={13}
              strokeWidth={2}
              className="
                transition-transform duration-200
                group-hover/manage:translate-x-0.5
              "
            />
          </Link>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   POST ROW
========================================================= */

function RecentPostRow({ post }) {
  const status = String(post?.status || "draft")
    .trim()
    .toLowerCase();

  const statusConfig = getStatusConfig(status);

  const platform =
    post?.platform ||
    post?.platformName ||
    "Social";

  const title =
    post?.title ||
    post?.caption ||
    "Untitled post";

  const date =
    post?.date ||
    post?.publishedAt ||
    post?.published_at ||
    post?.scheduledAt ||
    post?.scheduled_at ||
    post?.createdAt ||
    post?.created_at ||
    "";

  const background =
    post?.color ||
    "linear-gradient(135deg, #f97316 0%, #8b5cf6 100%)";

  return (
    <div
      className="
        group/row flex min-w-0 items-center gap-3
        rounded-2xl px-2 py-3
        transition-all duration-200
        hover:bg-stone-50/80
        sm:gap-4 sm:px-3
        dark:hover:bg-white/[0.035]
      "
    >
      {/* ===================================================
          THUMBNAIL
      ==================================================== */}

      <div
        className="
          relative h-11 w-11 shrink-0 overflow-hidden rounded-xl
          border border-white/80 shadow-sm
          transition-all duration-200
          group-hover/row:scale-[1.03]
          group-hover/row:shadow-md
          sm:h-12 sm:w-12
          dark:border-white/10
        "
        style={{
          background: background,
        }}
      >
        <div
          className="
            absolute inset-0
            bg-gradient-to-br
            from-white/30 via-transparent to-black/10
          "
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-black/10 to-transparent
          "
        />

        <div className="relative grid h-full w-full place-items-center">
          <span
            className="
              text-base font-black text-white
              drop-shadow-[0_1px_4px_rgba(0,0,0,0.2)]
            "
          >
            ✦
          </span>
        </div>
      </div>

      {/* ===================================================
          POST INFO
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
            mt-1 flex min-w-0 items-center gap-1.5
            text-[10px] font-medium
            text-stone-400
            sm:text-[11px]
            dark:text-slate-500
          "
        >
          {/* PLATFORM */}

          <span className="inline-flex shrink-0 items-center gap-1">
            <Globe2
              size={11}
              strokeWidth={1.8}
              className="shrink-0"
            />

            <span className="max-w-[90px] truncate sm:max-w-[130px]">
              {platform}
            </span>
          </span>

          {/* DATE */}

          {date && (
            <>
              <span className="text-stone-300 dark:text-slate-700">
                ·
              </span>

              <span className="flex min-w-0 items-center gap-1">
                <CalendarDays
                  size={10}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                <span className="truncate">
                  {formatPostDate(date)}
                </span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ===================================================
          STATUS
      ==================================================== */}

      <div
        className={`
          inline-flex shrink-0 items-center gap-1.5
          rounded-full border px-2.5 py-1.5
          text-[9px] font-black uppercase
          tracking-[0.08em]
          transition-all duration-200
          sm:px-3
          ${statusConfig.wrapper}
          ${statusConfig.text}
          group-hover/row:shadow-sm
        `}
      >
        <statusConfig.icon
          size={11}
          strokeWidth={2}
        />

        <span className="hidden sm:inline">
          {capitalizeStatus(status)}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS CONFIG
========================================================= */

function getStatusConfig(status) {
  switch (status) {
    case "published":
      return {
        icon: CheckCircle2,
        wrapper: `
          border-emerald-200/70
          bg-emerald-50/70
          dark:border-emerald-400/15
          dark:bg-emerald-400/[0.08]
        `,
        text: `
          text-emerald-600
          dark:text-emerald-400
        `,
      };

    case "scheduled":
      return {
        icon: Clock3,
        wrapper: `
          border-orange-200/70
          bg-orange-50/70
          dark:border-orange-400/15
          dark:bg-orange-400/[0.08]
        `,
        text: `
          text-orange-600
          dark:text-orange-400
        `,
      };

    case "failed":
      return {
        icon: XCircle,
        wrapper: `
          border-red-200/70
          bg-red-50/70
          dark:border-red-400/15
          dark:bg-red-400/[0.08]
        `,
        text: `
          text-red-600
          dark:text-red-400
        `,
      };

    default:
      return {
        icon: FileText,
        wrapper: `
          border-stone-200/80
          bg-stone-100/70
          dark:border-white/[0.08]
          dark:bg-white/[0.045]
        `,
        text: `
          text-stone-500
          dark:text-slate-400
        `,
      };
  }
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyPosts() {
  return (
    <div
      className="
        flex min-h-[230px]
        flex-col items-center justify-center
        px-5 py-10 text-center
      "
    >
      {/* ICON */}

      <div
        className="
          relative grid h-14 w-14 place-items-center
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

        <FileText
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
        No posts yet
      </h3>

      {/* DESCRIPTION */}

      <p
        className="
          mt-1.5 max-w-xs text-xs leading-5
          text-stone-400
          dark:text-slate-500
        "
      >
        Create your first social post and it will appear here.
      </p>

      {/* CREATE BUTTON */}

      <Link
        to="/dashboard/create-post"
        className="
          group/create mt-5 inline-flex items-center gap-2
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
        <Plus
          size={13}
          strokeWidth={2.2}
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
   DATE FORMAT
========================================================= */

function formatPostDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* =========================================================
   STATUS LABEL
========================================================= */

function capitalizeStatus(value) {
  if (!value) {
    return "Draft";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}