import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Pencil,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import { usePost } from "../../hooks/usePost.js";
import { useEffect, useMemo, useState } from "react";

/* =========================================================
   FILTER CONFIG
========================================================= */

const FILTERS = [
  { label: "All", value: "All" },
  { label: "Drafts", value: "Draft" },
  { label: "Scheduled", value: "Scheduled" },
  { label: "Published", value: "Published" },
  { label: "Failed", value: "Failed" },
];

/* =========================================================
   HELPERS
========================================================= */

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function isEditableStatus(status) {
  return ["draft", "scheduled"].includes(normalize(status));
}

function getStatusConfig(status) {
  switch (normalize(status)) {
    case "published":
      return {
        label: "Published",
        icon: CheckCircle2,
        wrapper:
          "border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-400/15 dark:bg-emerald-400/[0.08] dark:text-emerald-300",
        dot: "bg-emerald-500",
      };

    case "scheduled":
      return {
        label: "Scheduled",
        icon: Clock3,
        wrapper:
          "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/[0.08] dark:text-amber-300",
        dot: "bg-amber-500",
      };

    case "draft":
      return {
        label: "Draft",
        icon: FileText,
        wrapper:
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300",
        dot: "bg-slate-500",
      };

    case "failed":
      return {
        label: "Failed",
        icon: XCircle,
        wrapper:
          "border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-400/15 dark:bg-rose-400/[0.08] dark:text-rose-300",
        dot: "bg-rose-500",
      };

    default:
      return {
        label: "Unknown",
        icon: FileText,
        wrapper:
          "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-400",
        dot: "bg-slate-400",
      };
  }
}

function getPlatformConfig(platform) {
  const value = normalize(platform);

  if (value.includes("instagram")) {
    return {
      label: "Instagram",
      short: "IG",
      wrapper:
        "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-400/15 dark:bg-fuchsia-400/[0.08] dark:text-fuchsia-300",
      iconBg:
        "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/[0.12] dark:text-fuchsia-300",
    };
  }

  if (value.includes("facebook")) {
    return {
      label: "Facebook",
      short: "FB",
      wrapper:
        "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/15 dark:bg-blue-400/[0.08] dark:text-blue-300",
      iconBg:
        "bg-blue-100 text-blue-700 dark:bg-blue-400/[0.12] dark:text-blue-300",
    };
  }

  if (value.includes("linkedin")) {
    return {
      label: "LinkedIn",
      short: "in",
      wrapper:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/15 dark:bg-sky-400/[0.08] dark:text-sky-300",
      iconBg:
        "bg-sky-100 text-sky-700 dark:bg-sky-400/[0.12] dark:text-sky-300",
    };
  }

  if (value === "x" || value.includes("twitter")) {
    return {
      label: "X",
      short: "X",
      wrapper:
        "border-slate-200 bg-slate-100 text-slate-800 dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-slate-200",
      iconBg:
        "bg-slate-200 text-slate-800 dark:bg-white/[0.08] dark:text-slate-200",
    };
  }

  if (value.includes("youtube")) {
    return {
      label: "YouTube",
      short: "YT",
      wrapper:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-400/15 dark:bg-red-400/[0.08] dark:text-red-300",
      iconBg:
        "bg-red-100 text-red-700 dark:bg-red-400/[0.12] dark:text-red-300",
    };
  }

  if (value.includes("google business")) {
    return {
      label: "Google Business",
      short: "GB",
      wrapper:
        "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-400/15 dark:bg-indigo-400/[0.08] dark:text-indigo-300",
      iconBg:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/[0.12] dark:text-indigo-300",
    };
  }

  return {
    label: platform || "Unknown",
    short: String(platform || "?").slice(0, 2).toUpperCase(),
    wrapper:
      "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300",
    iconBg:
      "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300",
  };
}

function getPostTitle(post) {
  return post?.title || post?.caption || "Untitled post";
}

function getPostDate(post) {
  return (
    post?.scheduledFor ||
    post?.date ||
    post?.publishedAt ||
    post?.published_at ||
    post?.scheduledAt ||
    post?.scheduled_at ||
    post?.createdAt ||
    post?.created_at ||
    "—"
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function PostHistory({ initialFilter = "All" }) {
  const {
    posts = [],
    deletePost,
    updatePublishedVisibility,
    updatePublishedThumbnail,
    repostPost,
  } = usePost();

  const { status: routeStatus } = useParams();
  const [searchParams] = useSearchParams();

  const [deleteError, setDeleteError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");
  const [repostState, setRepostState] = useState("");
  const [repostError, setRepostError] = useState("");

  const focusedPostId = searchParams.get("focus");

  async function confirmDelete(platforms) {
    setDeleteError("");

    try {
      await deletePost(deleteTarget.id ?? deleteTarget._id, platforms);
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(
        error.message || "Selected platform deletion failed."
      );
    }
  }

  async function handleRepost(post) {
    const id = post.id ?? post._id;

    setRepostError("");
    setRepostState(id);

    try {
      await repostPost(id);
    } catch (error) {
      setRepostError(error.message || "Post could not be reposted.");
    } finally {
      setRepostState("");
    }
  }

  const routeFilter = useMemo(() => {
    if (!routeStatus) return null;

    const routeMap = {
      drafts: "Draft",
      draft: "Draft",
      scheduled: "Scheduled",
      published: "Published",
      failed: "Failed",
    };

    return routeMap[normalize(routeStatus)] || null;
  }, [routeStatus]);

  const activeFilter = routeFilter || selectedFilter;

  const safePosts = Array.isArray(posts) ? posts : [];

  const visiblePosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return safePosts.filter((post) => {
      const matchesFilter =
        activeFilter === "All" ||
        normalize(post?.status) === normalize(activeFilter);

      if (!matchesFilter) return false;
      if (!query) return true;

      const searchableText = [
        post?.title,
        post?.caption,
        post?.hashtags,
        post?.platform,
        post?.id,
        post?._id,
        post?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [safePosts, activeFilter, search]);

  useEffect(() => {
    if (!focusedPostId || !visiblePosts.length) return;

    const target = document.querySelector(
      `[data-post-id="${CSS.escape(focusedPostId)}"]`
    );

    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    target.classList.add("calendar-post-focus");

    const timer = window.setTimeout(() => {
      target.classList.remove("calendar-post-focus");
    }, 2600);

    return () => {
      window.clearTimeout(timer);
      target.classList.remove("calendar-post-focus");
    };
  }, [focusedPostId, visiblePosts]);

  const counts = useMemo(
    () => ({
      all: safePosts.length,
      draft: safePosts.filter(
        (post) => normalize(post?.status) === "draft"
      ).length,
      scheduled: safePosts.filter(
        (post) => normalize(post?.status) === "scheduled"
      ).length,
      published: safePosts.filter(
        (post) => normalize(post?.status) === "published"
      ).length,
      failed: safePosts.filter(
        (post) => normalize(post?.status) === "failed"
      ).length,
    }),
    [safePosts]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* =====================================================
          ATMOSPHERE
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-orange-400/[0.07] blur-3xl dark:bg-orange-400/[0.055]" />
        <div className="absolute right-[-180px] top-[12%] h-[460px] w-[460px] rounded-full bg-cyan-400/[0.06] blur-3xl dark:bg-cyan-400/[0.045]" />
        <div className="absolute bottom-[-220px] left-[35%] h-[480px] w-[480px] rounded-full bg-violet-400/[0.05] blur-3xl dark:bg-violet-400/[0.035]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1560px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 2xl:px-10">
        <PageHeader
          eyebrow="Content workflow"
          title="Posts"
          description="Manage drafts, scheduled, published and failed content from one place."
          action={
            <Link
              to="/dashboard/create-post"
              className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white shadow-[0_14px_35px_rgba(15,23,42,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:bg-white dark:text-slate-950 dark:shadow-[0_14px_35px_rgba(0,0,0,0.3)] dark:hover:bg-slate-100 dark:focus:ring-white/20 sm:w-auto"
            >
              <Plus
                size={17}
                strokeWidth={2.2}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
              Create post
            </Link>
          }
        />

        {/* =====================================================
            STATS
        ====================================================== */}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-5">
          <SummaryCard
            label="All posts"
            value={counts.all}
            active={activeFilter === "All"}
            onClick={() => setSelectedFilter("All")}
          />

          <SummaryCard
            label="Drafts"
            value={counts.draft}
            active={activeFilter === "Draft"}
            onClick={() => setSelectedFilter("Draft")}
          />

          <SummaryCard
            label="Scheduled"
            value={counts.scheduled}
            active={activeFilter === "Scheduled"}
            onClick={() => setSelectedFilter("Scheduled")}
          />

          <SummaryCard
            label="Published"
            value={counts.published}
            active={activeFilter === "Published"}
            onClick={() => setSelectedFilter("Published")}
          />

          <SummaryCard
            label="Failed"
            value={counts.failed}
            active={activeFilter === "Failed"}
            onClick={() => setSelectedFilter("Failed")}
            className="col-span-2 sm:col-span-1"
          />
        </section>

        {/* =====================================================
            FILTER BAR
        ====================================================== */}

        <section className="relative mt-5 overflow-hidden rounded-[24px] border border-stone-200/80 bg-white/[0.78] shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#0d1422]/[0.86] dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent dark:via-orange-400/20" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.035] dark:to-transparent" />

          <div className="relative flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950">
                <Filter size={16} strokeWidth={2} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-extrabold tracking-tight text-slate-950 dark:text-white">
                  Content library
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {visiblePosts.length}{" "}
                  {visiblePosts.length === 1 ? "post" : "posts"} shown
                </p>
              </div>
            </div>

            <div className="max-w-full overflow-x-auto pb-1 [scrollbar-width:none]">
              <div className="flex min-w-max gap-2">
                {FILTERS.map((filter) => {
                  const active = activeFilter === filter.value;

                  const count =
                    filter.value === "All"
                      ? counts.all
                      : filter.value === "Draft"
                      ? counts.draft
                      : filter.value === "Scheduled"
                      ? counts.scheduled
                      : filter.value === "Published"
                      ? counts.published
                      : counts.failed;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setSelectedFilter(filter.value)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                        active
                          ? "border-slate-950 bg-slate-950 text-white shadow-sm dark:border-white dark:bg-white dark:text-slate-950"
                          : "border-stone-200 bg-white/80 text-slate-500 hover:border-stone-300 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-400 dark:hover:border-white/[0.14] dark:hover:bg-white/[0.055] dark:hover:text-white"
                      }`}
                    >
                      <span>{filter.label}</span>

                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                          active
                            ? "bg-white/10 text-white dark:bg-slate-950/10 dark:text-slate-950"
                            : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative border-t border-stone-200/70 px-4 py-4 sm:px-5 dark:border-white/[0.07]">
            <div className="flex h-11 items-center gap-3 rounded-xl border border-stone-200 bg-white/85 px-3.5 shadow-sm transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-500/10 dark:border-white/[0.08] dark:bg-[#101827]/90 dark:focus-within:border-orange-400/30 dark:focus-within:ring-orange-400/10">
              <Search
                size={17}
                className="shrink-0 text-slate-400 dark:text-slate-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search posts by title, caption, platform or ID..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-600"
                aria-label="Search posts"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear post search"
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <section className="relative mt-5 overflow-hidden rounded-[26px] border border-stone-200/80 bg-white/[0.84] shadow-[0_22px_70px_rgba(15,23,42,0.07)] backdrop-blur-xl transition-colors duration-300 dark:border-white/[0.08] dark:bg-[#0d1422]/[0.9] dark:shadow-[0_22px_75px_rgba(0,0,0,0.3)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/25 to-transparent dark:via-orange-400/15" />

          {deleteError && (
            <div
              className="relative flex items-start gap-3 border-b border-rose-200/80 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:border-rose-400/10 dark:bg-rose-400/[0.06] dark:text-rose-300 sm:px-5"
              role="alert"
            >
              <XCircle className="mt-0.5 shrink-0" size={17} />
              <p className="font-semibold">{deleteError}</p>
            </div>
          )}

          {repostError && (
            <div
              className="flex items-start gap-3 border-b border-rose-200/80 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 dark:border-rose-400/10 dark:bg-rose-400/[0.06] dark:text-rose-300 sm:px-5"
              role="alert"
            >
              <XCircle className="mt-0.5 shrink-0" size={17} />
              <p className="font-semibold">{repostError}</p>
            </div>
          )}

          {repostState && (
            <div
              className="relative overflow-hidden border-b border-violet-200/80 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-violet-50 px-4 py-3.5 dark:border-violet-400/10 dark:from-violet-400/[0.07] dark:via-fuchsia-400/[0.05] dark:to-violet-400/[0.07] sm:px-5"
              role="status"
              aria-live="polite"
            >
              <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[repost-shimmer_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/10" />

              <div className="relative flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20 dark:bg-violet-500">
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-black text-violet-900 dark:text-violet-200">
                    Reposting your content
                    <span className="animate-pulse">...</span>
                  </p>

                  <p className="mt-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-300/80">
                    Publishing to the connected platform. Please wait.
                  </p>
                </div>

                <span className="ml-auto hidden rounded-full bg-white/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-violet-600 dark:bg-white/[0.07] dark:text-violet-300 sm:inline-flex">
                  In progress
                </span>
              </div>
            </div>
          )}

          {/* desktop header */}

          <div className="hidden grid-cols-[minmax(270px,1.8fr)_minmax(150px,0.85fr)_minmax(130px,0.7fr)_minmax(190px,1fr)] gap-4 border-b border-stone-200/70 bg-stone-50/75 px-5 py-3.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.025] dark:text-slate-500 md:grid lg:px-6">
            <span>Post</span>
            <span>Platform</span>
            <span>Status</span>
            <span>Activity</span>
          </div>

          {visiblePosts.length === 0 && (
            <EmptyState filter={activeFilter} />
          )}

          {visiblePosts.length > 0 && (
            <>
              <div className="hidden md:block">
                {visiblePosts.map((post, index) => (
                  <DesktopPostRow
                    key={
                      post?.id ??
                      post?._id ??
                      `post-${index}`
                    }
                    post={post}
                    onDelete={setDeleteTarget}
                    onView={setViewTarget}
                    onRepost={handleRepost}
                    repostState={repostState}
                    focused={
                      focusedPostId ===
                      String(post?.id ?? post?._id)
                    }
                  />
                ))}
              </div>

              <div className="divide-y divide-stone-200/70 dark:divide-white/[0.06] md:hidden">
                {visiblePosts.map((post, index) => (
                  <MobilePostCard
                    key={
                      post?.id ??
                      post?._id ??
                      `mobile-post-${index}`
                    }
                    post={post}
                    onDelete={setDeleteTarget}
                    onView={setViewTarget}
                    onRepost={handleRepost}
                    repostState={repostState}
                    focused={
                      focusedPostId ===
                      String(post?.id ?? post?._id)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {deleteTarget && (
          <DeletePostDialog
            post={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
          />
        )}

        {viewTarget && (
          <PostDetailsDialog
            post={viewTarget}
            onClose={() => setViewTarget(null)}
            onVisibilityUpdate={updatePublishedVisibility}
            onThumbnailUpdate={updatePublishedThumbnail}
          />
        )}

        {visiblePosts.length > 0 && (
          <div className="mt-3 flex flex-col gap-2 px-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing{" "}
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {visiblePosts.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-600 dark:text-slate-300">
                {safePosts.length}
              </span>{" "}
              posts
            </p>

            <div className="flex items-center gap-1.5">
              <Clock3 size={11} />
              Content activity history
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes repost-shimmer {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(420%);
          }
        }

        .calendar-post-focus {
          animation: calendarPostFocus 2.6s ease-out;
        }

        @keyframes calendarPostFocus {
          0% {
            background-color: rgba(251, 146, 60, 0.12);
            box-shadow: inset 3px 0 0 rgba(249, 115, 22, 0.7);
          }

          55% {
            background-color: rgba(251, 146, 60, 0.08);
            box-shadow: inset 3px 0 0 rgba(249, 115, 22, 0.5);
          }

          100% {
            background-color: transparent;
            box-shadow: inset 0 0 0 rgba(249, 115, 22, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .calendar-post-focus {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  active = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[20px] border bg-white/[0.78] p-4 text-left shadow-[0_12px_40px_rgba(15,23,42,0.045)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#0d1422]/[0.82] dark:shadow-[0_16px_48px_rgba(0,0,0,0.2)] dark:hover:border-white/[0.12] dark:hover:shadow-[0_20px_55px_rgba(0,0,0,0.3)] ${
        active
          ? "border-slate-950 ring-1 ring-slate-950/5 dark:border-white dark:ring-white/10"
          : "border-stone-200/80"
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/20 to-transparent dark:via-orange-400/15" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          {label}
        </span>

        <span
          className={`h-2 w-2 rounded-full transition ${
            active
              ? "bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.35)] dark:bg-orange-400"
              : "bg-slate-200 group-hover:bg-slate-400 dark:bg-white/[0.1] dark:group-hover:bg-slate-500"
          }`}
        />
      </div>

      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-[28px]">
        {value}
      </p>
    </button>
  );
}

/* =========================================================
   DESKTOP ROW
========================================================= */

function DesktopPostRow({
  post,
  onDelete,
  onView,
  onRepost,
  repostState,
  focused = false,
}) {
  const title = getPostTitle(post);
  const platform =
    post?.platform || post?.platformName || "Unknown";
  const statusConfig = getStatusConfig(post?.status);
  const platformConfig = getPlatformConfig(platform);
  const date = getPostDate(post);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      data-post-id={post?.id ?? post?._id}
      className={`group grid grid-cols-[minmax(270px,1.8fr)_minmax(150px,0.85fr)_minmax(130px,0.7fr)_minmax(190px,1fr)] items-center gap-4 border-b border-stone-200/60 px-5 py-4 transition duration-200 last:border-b-0 hover:bg-stone-50/70 dark:border-white/[0.055] dark:hover:bg-white/[0.025] lg:px-6 ${
        focused ? "calendar-post-focus" : ""
      }`}
    >
      {/* post */}

      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-100 text-slate-500 shadow-sm dark:border-white/[0.08] dark:from-white/[0.07] dark:to-white/[0.025] dark:text-slate-400">
          <FileText size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0">
          <p
            className="truncate text-sm font-extrabold text-slate-900 dark:text-white"
            title={title}
          >
            {title}
          </p>

          {post?.id || post?._id ? (
            <p className="mt-0.5 truncate text-[9px] font-medium text-slate-400 dark:text-slate-500">
              ID: {post.id ?? post._id}
            </p>
          ) : null}

          <ProviderLinks results={post?.providerResults} />
        </div>
      </div>

      {/* platform */}

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[9px] font-black ${platformConfig.iconBg}`}
          >
            {platformConfig.short}
          </span>

          <span
            className={`inline-flex min-w-0 max-w-full truncate rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${platformConfig.wrapper}`}
            title={platform}
          >
            {platformConfig.label}
          </span>
        </div>
      </div>

      {/* status */}

      <div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.06em] ${statusConfig.wrapper}`}
        >
          <StatusIcon size={11} strokeWidth={2} />
          {statusConfig.label}
        </span>
      </div>

      {/* activity */}

      <div className="flex min-w-0 items-center gap-2">
        <CalendarDays
          size={14}
          strokeWidth={1.8}
          className="shrink-0 text-slate-400 dark:text-slate-500"
        />

        <span
          className="min-w-0 truncate text-xs font-medium text-slate-500 dark:text-slate-400"
          title={String(date)}
        >
          {formatPostActivityDate(post)}
        </span>

        <PostActions
          post={post}
          onDelete={onDelete}
          onView={onView}
          onRepost={onRepost}
          repostState={repostState}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MOBILE CARD
========================================================= */

function MobilePostCard({
  post,
  onDelete,
  onView,
  onRepost,
  repostState,
  focused = false,
}) {
  const title = getPostTitle(post);
  const platform =
    post?.platform || post?.platformName || "Unknown";
  const statusConfig = getStatusConfig(post?.status);
  const platformConfig = getPlatformConfig(platform);
  const StatusIcon = statusConfig.icon;

  return (
    <article
      data-post-id={post?.id ?? post?._id}
      className={`p-4 transition-colors sm:p-5 dark:hover:bg-white/[0.015] ${
        focused ? "calendar-post-focus" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-100 text-slate-500 shadow-sm dark:border-white/[0.08] dark:from-white/[0.07] dark:to-white/[0.025] dark:text-slate-400">
          <FileText size={17} strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-extrabold text-slate-950 dark:text-white"
            title={title}
          >
            {title}
          </p>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[8px] font-black ${platformConfig.iconBg}`}
            >
              {platformConfig.short}
            </span>

            <span
              className={`max-w-[calc(100%-40px)] truncate rounded-lg border px-2 py-1 text-[9px] font-bold ${platformConfig.wrapper}`}
              title={platform}
            >
              {platformConfig.label}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.05em] ${statusConfig.wrapper}`}
            >
              <StatusIcon size={10} strokeWidth={2} />
              {statusConfig.label}
            </span>
          </div>

          <ProviderLinks results={post?.providerResults} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/70 pt-3 dark:border-white/[0.06]">
        <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
          <CalendarDays size={12} strokeWidth={1.8} />
          <span className="truncate">
            {formatPostActivityDate(post)}
          </span>
        </div>

        <PostActions
          post={post}
          onDelete={onDelete}
          onView={onView}
          onRepost={onRepost}
          repostState={repostState}
          mobile
        />
      </div>
    </article>
  );
}

/* =========================================================
   ACTIONS
========================================================= */

function PostActions({
  post,
  onDelete,
  onView,
  onRepost,
  repostState,
  mobile = false,
}) {
  return (
    <div
      className={`ml-auto flex items-center gap-1 ${
        mobile ? "shrink-0" : ""
      }`}
    >
      <ActionButton
        label="View post"
        onClick={() => onView(post)}
        icon={Eye}
      />

      {normalize(post?.status) === "failed" && (
        <ActionButton
          label="Repost failed post"
          onClick={() => onRepost(post)}
          icon={RotateCcw}
          tone="repost"
          disabled={repostState === (post.id ?? post._id)}
          loading={repostState === (post.id ?? post._id)}
        />
      )}

      {isEditableStatus(post?.status) && (
        <ActionButton
          label="Edit post"
          icon={Pencil}
          as={Link}
          to={`/dashboard/posts/${post.id ?? post._id}/edit`}
          tone="edit"
        />
      )}

      <ActionButton
        label="Delete post"
        onClick={() => onDelete(post)}
        icon={Trash2}
        tone="danger"
      />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon: Icon,
  as = "button",
  to,
  tone = "default",
  disabled = false,
  loading = false,
}) {
  const className = `grid h-9 w-9 place-items-center rounded-xl transition ${
    tone === "danger"
      ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-500 dark:hover:bg-rose-400/[0.08] dark:hover:text-rose-300"
      : tone === "edit"
      ? "text-slate-400 hover:bg-amber-50 hover:text-amber-700 dark:text-slate-500 dark:hover:bg-amber-400/[0.08] dark:hover:text-amber-300"
      : tone === "repost"
      ? "text-slate-400 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-500 dark:hover:bg-violet-400/[0.08] dark:hover:text-violet-300"
      : "text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-white/[0.06] dark:hover:text-white"
  }`;

  if (as === Link) {
    return (
      <Link
        to={to}
        className={className}
        aria-label={label}
        title={label}
      >
        {loading ? (
          <LoaderCircle size={14} className="animate-spin" />
        ) : (
          <Icon size={14} />
        )}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-40`}
      aria-label={label}
      title={label}
    >
      {loading ? (
        <LoaderCircle size={14} className="animate-spin" />
      ) : (
        <Icon size={14} />
      )}
    </button>
  );
}

/* =========================================================
   PROVIDER LINKS
========================================================= */

function ProviderLinks({ results }) {
  const entries = Object.entries(results || {}).filter(
    ([, result]) => result?.url
  );

  if (!entries.length) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1">
      {entries.map(([provider, result]) => (
        <a
          key={provider}
          href={result.url}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 transition hover:text-slate-950 hover:underline dark:text-slate-500 dark:hover:text-slate-200"
        >
          <ExternalLink size={10} />

          Open {provider}

          {provider === "Google Business" &&
            result.state && (
              <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-indigo-600 dark:bg-indigo-400/[0.1] dark:text-indigo-300">
                {String(result.state).toLowerCase()}
              </span>
            )}
        </a>
      ))}
    </div>
  );
}

/* =========================================================
   POST DETAILS DIALOG
========================================================= */

function PostDetailsDialog({
  post,
  onClose,
  onVisibilityUpdate,
  onThumbnailUpdate,
}) {
  const title = getPostTitle(post);

  const platforms = String(post?.platform || "Unknown")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const hasYouTubeVideo = Boolean(
    post?.providerResults?.YouTube?.id
  );

  const [visibility, setVisibility] = useState(
    post?.visibility === "Private" ? "Private" : "Public"
  );

  const [visibilityState, setVisibilityState] =
    useState("");

  const [visibilityError, setVisibilityError] =
    useState("");

  const [thumbnailState, setThumbnailState] =
    useState("");

  const [thumbnailError, setThumbnailError] =
    useState("");

  async function saveYouTubeVisibility() {
    setVisibilityError("");
    setVisibilityState("saving");

    try {
      await onVisibilityUpdate(
        post.id ?? post._id,
        "YouTube",
        visibility
      );

      setVisibilityState("saved");
    } catch (error) {
      setVisibilityState("");
      setVisibilityError(
        error.message ||
          "YouTube visibility update failed."
      );
    }
  }

  async function saveYouTubeThumbnail(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setThumbnailError("");
    setThumbnailState("saving");

    try {
      await onThumbnailUpdate(
        post.id ?? post._id,
        "YouTube",
        file
      );

      setThumbnailState("saved");
    } catch (error) {
      setThumbnailState("");

      setThumbnailError(
        error.message ||
          "YouTube thumbnail update failed."
      );
    }
  }

  return (
    <Modal onClose={onClose} title="Post details">
      <div className="flex items-start justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-white/[0.08]">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
            Content
          </p>

          <h3 className="mt-1 line-clamp-2 text-lg font-black tracking-tight text-slate-950 dark:text-white">
            {title}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
          aria-label="Close"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailRow
          label="Status"
          value={post?.status || "Unknown"}
        />

        <DetailRow
          label="Platforms"
          value={platforms.join(", ")}
        />

        <DetailRow
          label="Visibility"
          value={post?.visibility || "Public"}
        />

        <DetailRow
          label="Date"
          value={formatPostActivityDate(post)}
        />
      </div>

      {hasYouTubeVideo ? (
        <section className="relative mt-5 overflow-hidden rounded-2xl border border-red-200/80 bg-red-50/70 p-4 dark:border-red-400/10 dark:bg-red-400/[0.06]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-slate-950 dark:text-white">
                YouTube controls
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                Manage video visibility and upload a custom
                thumbnail.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-red-700 shadow-sm dark:bg-white/[0.07] dark:text-red-300">
              Supported
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-red-100 bg-white/85 p-3 dark:border-red-400/10 dark:bg-[#101827]/80">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
              Visibility
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {["Public", "Private"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setVisibility(option);
                    setVisibilityState("");
                  }}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    visibility === option
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-stone-200 bg-white text-slate-600 hover:border-stone-300 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-white/[0.14]"
                  }`}
                >
                  {option}
                </button>
              ))}

              <button
                type="button"
                onClick={saveYouTubeVisibility}
                disabled={visibilityState === "saving"}
                className="ml-auto rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-400"
              >
                {visibilityState === "saving"
                  ? "Saving..."
                  : "Save visibility"}
              </button>
            </div>

            {visibilityState === "saved" && (
              <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                YouTube visibility updated.
              </p>
            )}

            {visibilityError && (
              <p
                className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300"
                role="alert"
              >
                {visibilityError}
              </p>
            )}
          </div>

          <div className="mt-3 rounded-xl border border-red-100 bg-white/85 p-3 dark:border-red-400/10 dark:bg-[#101827]/80">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                  Thumbnail
                </p>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Upload a JPG, PNG or GIF image.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
                {thumbnailState === "saving"
                  ? "Uploading..."
                  : "Choose image"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  disabled={thumbnailState === "saving"}
                  onChange={saveYouTubeThumbnail}
                />
              </label>
            </div>

            {thumbnailState === "saved" && (
              <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                YouTube thumbnail updated.
              </p>
            )}

            {thumbnailError && (
              <p
                className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300"
                role="alert"
              >
                {thumbnailError}
              </p>
            )}
          </div>
        </section>
      ) : (
        <p className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs leading-5 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-slate-400">
          Public/Private visibility editing is not available
          for the selected platforms because their configured
          integrations do not support it.
        </p>
      )}

      <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.025]">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
          Caption
        </p>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
          {post?.caption || "No caption"}
        </p>
      </div>

      <ProviderLinks results={post?.providerResults} />

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {isEditableStatus(post?.status) && (
          <Link
            to={`/dashboard/posts/${post.id ?? post._id}/edit`}
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <Pencil size={14} />
            Edit post
          </Link>
        )}

        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-stone-50 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   DELETE DIALOG
========================================================= */

function DeletePostDialog({
  post,
  onClose,
  onConfirm,
}) {
  const platforms = Object.keys(
    post?.providerResults || {}
  );

  const deletablePlatforms = platforms.filter((platform) =>
    ["Facebook", "X", "YouTube", "Google Business"].includes(
      platform
    )
  );

  const manualPlatforms = platforms.filter(
    (platform) => platform === "Instagram"
  );

  const unsupportedPlatforms = platforms.filter(
    (platform) =>
      !deletablePlatforms.includes(platform) &&
      !manualPlatforms.includes(platform)
  );

  const [selected, setSelected] = useState(
    deletablePlatforms
  );

  const allSelected =
    deletablePlatforms.length > 0 &&
    selected.length === deletablePlatforms.length;

  function toggleAll() {
    setSelected(
      allSelected ? [] : deletablePlatforms
    );
  }

  return (
    <Modal
      onClose={onClose}
      title="Delete published post"
      maxWidth="max-w-lg"
    >
      <div className="flex items-start justify-between gap-4 border-b border-stone-200/80 pb-4 dark:border-white/[0.08]">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-500 dark:text-rose-400">
            Permanent action
          </p>

          <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950 dark:text-white">
            Delete published post
          </h3>

          <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Choose the platforms from which this post
            should be removed.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
          aria-label="Close"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {deletablePlatforms.length > 1 && (
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5 text-sm font-bold transition hover:border-stone-300 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-white/[0.14]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-300 accent-slate-950 dark:border-white/[0.2]"
            />

            <span className="text-slate-800 dark:text-slate-200">
              All supported platforms
            </span>
          </label>
        )}

        {deletablePlatforms.map((platform) => (
          <label
            key={platform}
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 text-sm transition hover:border-stone-300 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-white/[0.14]"
          >
            <input
              type="checkbox"
              checked={selected.includes(platform)}
              onChange={() =>
                setSelected((items) =>
                  items.includes(platform)
                    ? items.filter(
                        (item) => item !== platform
                      )
                    : [...items, platform]
                )
              }
              className="h-4 w-4 rounded border-slate-300 accent-slate-950 dark:border-white/[0.2]"
            />

            <span className="font-bold text-slate-800 dark:text-slate-200">
              Delete from {platform}
            </span>
          </label>
        ))}

        {manualPlatforms.map((platform) => (
          <div
            key={platform}
            className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800 dark:border-amber-400/15 dark:bg-amber-400/[0.07] dark:text-amber-300"
          >
            <div className="font-bold">
              {platform} requires manual deletion
            </div>

            <p className="mt-1 text-xs leading-5">
              Instagram does not provide an official API
              for deleting published media through this
              integration.
            </p>

            {post.providerResults?.[platform]?.url && (
              <a
                href={post.providerResults[platform].url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-900 underline dark:text-amber-200"
              >
                Open Instagram post
              </a>
            )}
          </div>
        ))}

        {unsupportedPlatforms.map((platform) => (
          <div
            key={platform}
            className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 text-sm text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-slate-400"
          >
            <div className="font-bold text-slate-700 dark:text-slate-200">
              {platform} deletion is unavailable
            </div>

            <p className="mt-1 text-xs leading-5">
              This platform does not have a configured
              delete integration.
            </p>
          </div>
        ))}

        {!platforms.length && (
          <p className="rounded-2xl bg-stone-50 p-4 text-sm text-slate-500 dark:bg-white/[0.025] dark:text-slate-400">
            This post has no recorded published platform.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-xl border border-stone-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-stone-50 hover:text-slate-950 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.07] dark:hover:text-white"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={
            platforms.length > 0 && !selected.length
          }
          onClick={() => onConfirm(selected)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-500 dark:hover:bg-rose-400"
        >
          <Trash2 size={14} />
          {platforms.length
            ? "Delete selected"
            : "Delete post"}
        </button>
      </div>
    </Modal>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  children,
  onClose,
  title,
  maxWidth = "max-w-xl",
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm dark:bg-black/70 sm:p-5"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center py-4 sm:py-8">
        <div
          className={`relative w-full ${maxWidth} overflow-hidden rounded-[26px] border border-stone-200/80 bg-white p-4 shadow-[0_30px_100px_rgba(2,6,23,0.22)] backdrop-blur-xl dark:border-white/[0.09] dark:bg-[#0d1422] dark:shadow-[0_35px_110px_rgba(0,0,0,0.55)] sm:p-6`}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/35 to-transparent dark:via-orange-400/20" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.035] dark:to-transparent" />

          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-white/[0.08] dark:bg-white/[0.025]">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ filter }) {
  const label =
    filter === "All"
      ? "No posts yet"
      : `No ${filter.toLowerCase()} posts`;

  const description =
    filter === "All"
      ? "Create your first post and it will appear here."
      : `There are currently no posts with the ${filter.toLowerCase()} status.`;

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-5 py-16 text-center">
      <div className="relative grid h-16 w-16 place-items-center rounded-[20px] border border-stone-200 bg-stone-50 text-slate-400 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-slate-500">
        <FileText size={24} strokeWidth={1.7} />

        <span className="pointer-events-none absolute -inset-2 rounded-[28px] bg-orange-300/10 blur-xl dark:bg-orange-400/[0.06]" />
      </div>

      <h3 className="mt-5 text-base font-black tracking-tight text-slate-900 dark:text-white">
        {label}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>

      <Link
        to="/dashboard/create-post"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
      >
        <Plus size={14} strokeWidth={2.2} />
        Create post
      </Link>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {
  if (!value || value === "—") return "—";

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return String(value);
}

function formatPostActivityDate(post) {
  const isScheduled =
    normalize(post?.status) === "scheduled";

  const value = isScheduled
    ? post?.scheduledFor || post?.date
    : post?.publishedAt ||
      post?.published_at ||
      post?.date ||
      post?.createdAt;

  if (!value || value === "Not scheduled") return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
}