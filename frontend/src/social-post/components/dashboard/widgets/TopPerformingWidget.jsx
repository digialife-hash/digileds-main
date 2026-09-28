import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Crown,
  Trophy,
} from "lucide-react";

import { usePost } from "../../../hooks/usePost.js";

export default function TopPerformingWidget() {
  const { posts = [] } = usePost();

  const published = Array.isArray(posts)
    ? posts
        .filter(
          (post) =>
            String(post?.status || "")
              .trim()
              .toLowerCase() === "published"
        )
        .slice(0, 3)
    : [];

  return (
    <section
      className="
        group
        relative
        overflow-hidden
        rounded-[24px]
        border border-stone-200/80
        bg-white/75
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
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
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-52
          w-52
          rounded-full
          bg-amber-400/10
          blur-[90px]
          dark:bg-amber-500/[0.08]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -left-16
          h-48
          w-48
          rounded-full
          bg-orange-400/[0.06]
          blur-[80px]
          dark:bg-orange-500/[0.05]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-amber-400/30
          to-transparent
          dark:via-amber-400/20
        "
      />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-stone-200/70
          px-5
          py-5
          sm:px-6
          dark:border-white/[0.07]
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              relative
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-xl
              border
              border-amber-200/70
              bg-amber-50
              text-amber-600
              shadow-sm
              dark:border-amber-400/15
              dark:bg-amber-400/[0.08]
              dark:text-amber-400
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                -inset-1
                rounded-2xl
                bg-amber-400/10
                blur-lg
                dark:bg-amber-400/[0.08]
              "
            />

            <Trophy
              size={18}
              strokeWidth={1.8}
              className="relative z-10"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2
                className="
                  truncate
                  text-[15px]
                  font-black
                  tracking-tight
                  text-stone-900
                  dark:text-white
                "
              >
                Top performing
              </h2>

              <span
                className="
                  hidden
                  rounded-full
                  border
                  border-amber-200/70
                  bg-amber-50
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.1em]
                  text-amber-600
                  sm:inline-flex
                  dark:border-amber-400/15
                  dark:bg-amber-400/[0.08]
                  dark:text-amber-400
                "
              >
                Top 3
              </span>
            </div>

            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-stone-500
                dark:text-slate-400
              "
            >
              Your recent published content
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative p-4 sm:p-5">
        {published.length > 0 ? (
          <div className="space-y-2">
            {published.map((post, index) => (
              <TopPost
                key={post?.id ?? post?._id ?? index}
                post={post}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {published.length > 0 && (
        <div
          className="
            border-t
            border-stone-200/70
            bg-white/20
            px-5
            py-3.5
            sm:px-6
            dark:border-white/[0.07]
            dark:bg-white/[0.015]
          "
        >
          <Link
            to="/dashboard/analytics"
            className="
              group/link
              inline-flex
              items-center
              gap-1.5
              text-xs
              font-bold
              text-stone-500
              transition-colors
              hover:text-orange-600
              dark:text-slate-400
              dark:hover:text-orange-400
            "
          >
            View analytics

            <ArrowRight
              size={13}
              strokeWidth={2}
              className="
                transition-transform
                duration-200
                group-hover/link:translate-x-0.5
              "
            />
          </Link>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   TOP POST
========================================================= */

function TopPost({ post, index }) {
  const title =
    post?.title ||
    post?.caption ||
    "Untitled post";

  const platform =
    post?.platform ||
    post?.platformName ||
    "Social platform";

  const rankStyles = [
    {
      wrapper:
        "border-amber-200/80 bg-amber-50/80 dark:border-amber-400/15 dark:bg-amber-400/[0.08]",
      text:
        "text-amber-700 dark:text-amber-400",
      glow:
        "bg-amber-400/10 dark:bg-amber-400/[0.07]",
    },
    {
      wrapper:
        "border-stone-200/80 bg-stone-100/80 dark:border-white/[0.08] dark:bg-white/[0.045]",
      text:
        "text-stone-600 dark:text-slate-300",
      glow:
        "bg-stone-300/10 dark:bg-white/[0.04]",
    },
    {
      wrapper:
        "border-orange-200/70 bg-orange-50/70 dark:border-orange-400/15 dark:bg-orange-400/[0.07]",
      text:
        "text-orange-700 dark:text-orange-400",
      glow:
        "bg-orange-400/10 dark:bg-orange-400/[0.06]",
    },
  ];

  const rank = rankStyles[index] || rankStyles[2];

  return (
    <div
      className="
        group/row
        relative
        flex
        min-w-0
        items-center
        gap-3
        overflow-hidden
        rounded-2xl
        border
        border-transparent
        bg-white/40
        px-2.5
        py-3
        transition-all
        duration-200
        hover:border-stone-200/70
        hover:bg-white/75
        hover:shadow-sm
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.08]
        dark:hover:bg-white/[0.055]
        dark:hover:shadow-[0_8px_25px_rgba(0,0,0,0.16)]
      "
    >
      {/* Row glow */}

      <div
        className={`
          pointer-events-none
          absolute
          -left-8
          top-1/2
          h-16
          w-16
          -translate-y-1/2
          rounded-full
          blur-2xl
          opacity-0
          transition-opacity
          duration-300
          group-hover/row:opacity-100
          ${rank.glow}
        `}
      />

      {/* ===================================================
          RANK
      ==================================================== */}

      <div
        className={`
          relative
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-xl
          border
          text-xs
          font-black
          shadow-sm
          ${rank.wrapper}
          ${rank.text}
        `}
      >
        {index === 0 ? (
          <Crown
            size={15}
            strokeWidth={1.8}
          />
        ) : (
          `#${index + 1}`
        )}
      </div>

      {/* ===================================================
          INFO
      ==================================================== */}

      <div className="relative min-w-0 flex-1">
        <p
          className="
            truncate
            text-xs
            font-bold
            text-stone-800
            transition-colors
            group-hover/row:text-stone-950
            dark:text-slate-200
            dark:group-hover/row:text-white
          "
          title={title}
        >
          {title}
        </p>

        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <span
            className="
              h-1.5
              w-1.5
              shrink-0
              rounded-full
              bg-emerald-500
              shadow-[0_0_7px_rgba(16,185,129,0.6)]
              dark:bg-emerald-400
              dark:shadow-[0_0_8px_rgba(52,211,153,0.55)]
            "
          />

          <span
            className="
              truncate
              text-[10px]
              font-medium
              text-stone-400
              dark:text-slate-500
            "
          >
            {platform}
          </span>
        </div>
      </div>

      {/* ===================================================
          PUBLISHED
      ==================================================== */}

      <div
        className="
          hidden
          shrink-0
          items-center
          gap-1
          rounded-full
          border
          border-emerald-200/70
          bg-emerald-50/70
          px-2
          py-1
          text-[8px]
          font-black
          uppercase
          tracking-[0.08em]
          text-emerald-600
          sm:inline-flex
          dark:border-emerald-400/15
          dark:bg-emerald-400/[0.08]
          dark:text-emerald-400
        "
      >
        <CheckCircle2
          size={10}
          strokeWidth={2}
        />

        Live
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
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
        bg-white/25
        px-5
        py-8
        text-center
        dark:border-white/[0.08]
        dark:bg-white/[0.015]
      "
    >
      <div
        className="
          relative
          grid
          h-12
          w-12
          place-items-center
          rounded-2xl
          border
          border-white/80
          bg-white/75
          text-amber-500
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.045]
          dark:text-amber-400
        "
      >
        <Trophy
          size={19}
          strokeWidth={1.7}
        />

        <span
          className="
            pointer-events-none
            absolute
            -inset-2
            rounded-3xl
            bg-amber-400/5
            blur-xl
            dark:bg-amber-400/[0.06]
          "
        />
      </div>

      <h3
        className="
          mt-4
          text-sm
          font-black
          text-stone-800
          dark:text-white
        "
      >
        No performance data yet
      </h3>

      <p
        className="
          mt-1.5
          max-w-[230px]
          text-xs
          leading-5
          text-stone-400
          dark:text-slate-500
        "
      >
        Published posts will appear here once your content starts
        building engagement.
      </p>
    </div>
  );
}