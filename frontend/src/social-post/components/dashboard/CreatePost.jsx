import {
  AlertCircle,
  ArrowLeft,
  FilePlus2,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import PageHeader from "../layout/PageHeader.jsx";
import PostEditor from "../post/PostEditor.jsx";
import { usePost } from "../../hooks/usePost.js";

export default function CreatePost({ postId = "" }) {
  const { id } = useParams();
  const resolvedId = postId || id;
  const { posts = [], loading, error } = usePost();

  /*
   * Keep ID comparison safe even when:
   * - URL params are strings
   * - backend IDs are numbers
   * - backend uses _id instead of id Content studio
   */
  const editingPost = resolvedId
    ? posts.find((post) => {
        const postId = post?.id ?? post?._id;

        return String(postId ?? "") === String(resolvedId);
      })
    : null;

  const isEditMode = Boolean(resolvedId);

  return (
    <div className="rounded-2xl relative min-h-screen w-full overflow-x-hidden bg-[#f6f7fb] text-slate-900 transition-colors duration-300 dark:bg-[#070b14] dark:text-white">
      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================== */}
      {/* <div className="pointer-events-none absolute inset-0 overflow-hidden">
     
        <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-orange-400/[0.10] blur-[120px] dark:bg-orange-500/[0.055]" />

        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-cyan-400/[0.075] blur-[130px] dark:bg-cyan-400/[0.045]" />

        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-400/[0.055] blur-[120px] dark:bg-violet-500/[0.035]" />

        <div className="absolute right-1/4 bottom-20 h-64 w-64 rounded-full bg-emerald-400/[0.035] blur-[110px] dark:bg-emerald-500/[0.025]" />
      </div> */}

      <div className="relative mx-auto w-full max-w-[1550px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* =========================================================
            PAGE HEADER
        ========================================================== */}
        <PageHeader
          title={isEditMode ? "Edit post" : "Create a post"}
          description={
            isEditMode
              ? "Update your content, publishing settings or schedule."
              : "Turn your ideas into polished social content ready to publish."
          }
        />

        {/* =========================================================
            QUICK CONTEXT BAR
        ========================================================== */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Context pill */}
          <div
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-stone-200/80
              bg-white/70
              px-3
              py-2
              text-[10px]
              font-black
              uppercase
              tracking-[0.13em]
              text-stone-500
              shadow-[0_10px_30px_rgba(15,23,42,0.04)]
              backdrop-blur-xl
              transition-all
              duration-300
              dark:border-white/[0.08]
              dark:bg-[#0d1422]/75
              dark:text-slate-400
              dark:shadow-[0_15px_40px_rgba(0,0,0,0.18)]
            "
          >
            <span
              className="
                grid
                h-5
                w-5
                shrink-0
                place-items-center
                rounded-full
                bg-orange-50
                text-orange-500
                transition-transform
                duration-300
                group-hover:scale-110
                dark:bg-orange-500/10
                dark:text-orange-400
              "
            >
              {isEditMode ? <Sparkles size={11} /> : <FilePlus2 size={11} />}
            </span>

            {isEditMode ? "Editing existing content" : "New content draft"}
          </div>

          {/* Back button */}
          <Link
            to="/dashboard/posts"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-xl
              border
              border-transparent
              px-3
              py-2
              text-xs
              font-bold
              text-stone-500
              transition-all
              duration-200
              hover:border-stone-200
              hover:bg-white/60
              hover:text-stone-900
              dark:text-slate-400
              dark:hover:border-white/[0.08]
              dark:hover:bg-white/[0.04]
              dark:hover:text-white
            "
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to posts
          </Link>
        </div>

        {/* =========================================================
            EDITOR AREA
        ========================================================== */}
        <main className="relative mt-5 sm:mt-6">
          <div className="relative">
            {/* <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-orange-400/[0.09] blur-[100px] dark:bg-orange-500/[0.045]" />

            <div className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full bg-cyan-400/[0.07] blur-[100px] dark:bg-cyan-500/[0.035]" /> */}

            {/* =====================================================
                LOADING
            ====================================================== */}
            {isEditMode && loading ? (
              <LoadingState />
            ) : error ? (
              /* ===================================================
                 API / HOOK ERROR
              ==================================================== */
              <ErrorState message={error} />
            ) : isEditMode && !editingPost ? (
              /* ===================================================
                 POST NOT FOUND
              ==================================================== */
              <NotFoundState />
            ) : (
              /* ===================================================
                 POST EDITOR
              ==================================================== */
              <section
                className="
                  relative
                  overflow-hidden
                  rounded-[30px]
                  border
                  border-stone-200/80
                  bg-white/[0.68]
                  p-1
                  shadow-[0_28px_90px_rgba(15,23,42,0.07)]
                  backdrop-blur-2xl
                  transition-colors
                  duration-300
                  dark:border-white/[0.08]
                  dark:bg-[#0d1422]/80
                  dark:shadow-[0_25px_80px_rgba(0,0,0,0.30)]
                "
              >
                {/* <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/35 to-transparent dark:via-orange-400/20" />

                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[30px] bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[30px] bg-gradient-to-r from-orange-400/[0.08] via-transparent to-cyan-400/[0.07] dark:from-orange-400/[0.055] dark:to-cyan-400/[0.045]" />

                <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-400/[0.08] blur-[90px] dark:bg-orange-500/[0.045]" />

                <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-400/[0.045] blur-[90px] dark:bg-cyan-500/[0.025]" /> */}

                <div
                  className="
                    relative
                    rounded-[27px]
                    border
                    border-white/60
                    bg-white/50
                    p-2
                    backdrop-blur-xl
                    sm:p-3
                    lg:p-4
                    dark:border-white/[0.045]
                    dark:bg-[#0a111e]/45
                  "
                >
                  <PostEditor post={editingPost} />
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING STATE
========================================================= */

function LoadingState() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-stone-200/80
        bg-white/[0.72]
        p-6
        shadow-[0_24px_80px_rgba(15,23,42,0.06)]
        backdrop-blur-2xl
        transition-colors
        duration-300
        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]
        sm:p-8
        lg:p-10
      "
    >
      {/* top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/30 to-transparent dark:via-orange-400/20" />

      {/* reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04] dark:to-transparent" />

      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-400/10 blur-[90px] dark:bg-orange-500/[0.045]" />

      <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-400/[0.05] blur-[90px] dark:bg-cyan-500/[0.025]" />

      <div className="relative flex min-h-[420px] flex-col items-center justify-center text-center">
        {/* Loader aura */}
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-orange-400/10 blur-2xl dark:bg-orange-500/[0.06]" />

          <div
            className="
              relative
              grid
              h-16
              w-16
              place-items-center
              rounded-2xl
              border
              border-stone-200
              bg-white
              shadow-[0_15px_40px_rgba(15,23,42,0.06)]
              dark:border-white/[0.08]
              dark:bg-[#101827]
              dark:shadow-[0_15px_40px_rgba(0,0,0,0.28)]
            "
          >
            <LoaderCircle
              size={27}
              strokeWidth={1.8}
              className="animate-spin text-orange-500 dark:text-orange-400"
            />
          </div>
        </div>

        <h2 className="mt-6 text-lg font-black tracking-tight text-stone-900 dark:text-white">
          Loading post
        </h2>

        <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500 dark:text-slate-400">
          Fetching your post details. The editor will appear in a moment.
        </p>

        {/* Loading dots */}
        <div className="mt-6 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400 dark:bg-orange-500" />

          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400 dark:bg-orange-500"
            style={{ animationDelay: "120ms" }}
          />

          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-400 dark:bg-orange-500"
            style={{ animationDelay: "240ms" }}
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function ErrorState({ message }) {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-red-200/80
        bg-white/[0.78]
        p-6
        shadow-[0_24px_80px_rgba(127,29,29,0.06)]
        backdrop-blur-2xl
        transition-colors
        duration-300
        dark:border-red-500/20
        dark:bg-[#160f16]/80
        dark:shadow-[0_24px_80px_rgba(0,0,0,0.30)]
        sm:p-8
        lg:p-10
      "
    >
      {/* top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/35 to-transparent dark:via-red-400/25" />

      {/* glass reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.025] dark:to-transparent" />

      {/* glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-400/10 blur-[90px] dark:bg-red-500/[0.045]" />

      <div className="relative flex min-h-[380px] flex-col items-center justify-center text-center">
        <div
          className="
            grid
            h-16
            w-16
            place-items-center
            rounded-2xl
            border
            border-red-200
            bg-red-50
            text-red-500
            shadow-sm
            dark:border-red-500/20
            dark:bg-red-500/10
            dark:text-red-400
          "
        >
          <AlertCircle size={28} strokeWidth={1.8} />
        </div>

        <h2 className="mt-6 text-lg font-black tracking-tight text-stone-900 dark:text-white">
          Unable to load post
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-stone-500 dark:text-slate-400">
          {typeof message === "string"
            ? message
            : "Something went wrong while loading the post."}
        </p>

        <Link
          to="/dashboard/posts"
          className="
            mt-6
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-stone-950
            px-5
            text-xs
            font-extrabold
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-xl
            dark:bg-white
            dark:text-slate-950
            dark:shadow-[0_10px_30px_rgba(255,255,255,0.08)]
            dark:hover:shadow-[0_14px_35px_rgba(255,255,255,0.12)]
          "
        >
          <ArrowLeft size={14} />
          Back to posts
        </Link>
      </div>
    </section>
  );
}

/* =========================================================
   NOT FOUND STATE
========================================================= */

function NotFoundState() {
  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-[30px]
        border
        border-amber-200/80
        bg-white/[0.78]
        p-6
        shadow-[0_24px_80px_rgba(120,53,15,0.05)]
        backdrop-blur-2xl
        transition-colors
        duration-300
        dark:border-amber-500/20
        dark:bg-[#15130d]/80
        dark:shadow-[0_24px_80px_rgba(0,0,0,0.30)]
        sm:p-8
        lg:p-10
      "
    >
      {/* top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent dark:via-amber-400/25" />

      {/* reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.025] dark:to-transparent" />

      {/* ambient glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-amber-400/10 blur-[90px] dark:bg-amber-500/[0.045]" />

      <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-orange-400/[0.045] blur-[80px] dark:bg-orange-500/[0.025]" />

      <div className="relative flex min-h-[380px] flex-col items-center justify-center text-center">
        <div
          className="
            grid
            h-16
            w-16
            place-items-center
            rounded-2xl
            border
            border-amber-200
            bg-amber-50
            text-amber-600
            shadow-sm
            dark:border-amber-500/20
            dark:bg-amber-500/10
            dark:text-amber-400
          "
        >
          <FilePlus2 size={27} strokeWidth={1.8} />
        </div>

        <h2 className="mt-6 text-lg font-black tracking-tight text-stone-900 dark:text-white">
          Post not found
        </h2>

        <p className="mt-2 max-w-md text-sm leading-6 text-stone-500 dark:text-slate-400">
          This post may have been deleted, the link may be incorrect, or you may
          not have access to it.
        </p>

        <Link
          to="/dashboard/posts"
          className="
            group
            mt-6
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-stone-950
            px-5
            text-xs
            font-extrabold
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-xl
            dark:bg-white
            dark:text-slate-950
            dark:shadow-[0_10px_30px_rgba(255,255,255,0.08)]
            dark:hover:shadow-[0_14px_35px_rgba(255,255,255,0.12)]
          "
        >
          <ArrowLeft
            size={14}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Return to posts
        </Link>
      </div>
    </section>
  );
}
