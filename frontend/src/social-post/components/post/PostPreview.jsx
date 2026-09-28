import { useEffect, useMemo } from "react";

export default function PostPreview({
  caption,
  file,
  platform = "Instagram",
}) {
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  const isVideo = Boolean(
    file?.type?.startsWith("video/") ||
      /\.(mp4|mov|webm|m4v|avi)$/i.test(
        file?.name || "",
      ),
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-stone-200/80
        bg-white/70
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl

        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
      "
    >
      {/* =====================================================
          AMBIENT GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-16
          -top-16
          h-32
          w-32
          rounded-full
          bg-orange-400/[0.06]
          blur-3xl
          dark:bg-orange-500/[0.035]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -left-16
          h-32
          w-32
          rounded-full
          bg-cyan-400/[0.05]
          blur-3xl
          dark:bg-cyan-500/[0.025]
        "
      />

      {/* =====================================================
          TOP REFLECTION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-20
          bg-gradient-to-b
          from-white/40
          to-transparent
          dark:from-white/[0.045]
          dark:to-transparent
        "
      />

      {/* =====================================================
          TOP EDGE
      ====================================================== */}

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
          dark:via-orange-400/20
        "
      />

      {/* =====================================================
          PROFILE HEADER
      ====================================================== */}

      <div
        className="
          relative
          flex
          items-center
          gap-3
          border-b
          border-stone-200/70
          px-4
          py-4

          dark:border-white/[0.06]
        "
      >
        {/* Avatar */}
        <span
          className="
            relative
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            overflow-hidden
            rounded-full
            border
            border-orange-200
            bg-gradient-to-br
            from-orange-100
            via-white
            to-orange-50
            font-serif
            text-base
            font-bold
            italic
            text-orange-700
            shadow-sm

            dark:border-orange-400/15
            dark:from-orange-400/[0.12]
            dark:via-white/[0.04]
            dark:to-orange-400/[0.06]
            dark:text-orange-400
          "
        >
          S

          <span
            className="
              pointer-events-none
              absolute
              inset-0
              rounded-full
              bg-gradient-to-b
              from-white/40
              to-transparent
              dark:from-white/[0.06]
            "
          />
        </span>

        {/* Account info */}
        <div className="min-w-0 flex-1">
          <strong
            className="
              block
              truncate
              text-sm
              font-bold
              text-stone-800
              dark:text-slate-200
            "
          >
            alexcreates
          </strong>

          <span
            className="
              mt-0.5
              block
              truncate
              text-[11px]
              font-medium
              text-stone-400
              dark:text-slate-500
            "
          >
            {platform} · Just now
          </span>
        </div>

        {/* Platform indicator */}
        <span
          className="
            hidden
            rounded-full
            border
            border-stone-200
            bg-stone-50
            px-2.5
            py-1
            text-[9px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-stone-400

            dark:border-white/[0.07]
            dark:bg-white/[0.035]
            dark:text-slate-500

            sm:block
          "
        >
          Preview
        </span>
      </div>

      {/* =====================================================
          MEDIA
      ====================================================== */}

      {file ? (
        <div
          className="
            relative
            flex
            h-64
            items-center
            justify-center
            overflow-hidden
            bg-stone-100

            dark:bg-[#080d16]

            sm:h-72
          "
        >
          {/* Media top overlay */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              z-10
              h-16
              bg-gradient-to-b
              from-black/10
              to-transparent
              dark:from-black/20
            "
          />

          {isVideo ? (
            <video
              className="
                relative
                z-[1]
                h-full
                w-full
                object-contain
              "
              src={previewUrl}
              controls
              muted
              playsInline
              preload="metadata"
              aria-label="Video post preview"
            />
          ) : (
            <img
              className="
                relative
                z-[1]
                h-full
                w-full
                object-cover
              "
              src={previewUrl}
              alt="Post preview"
            />
          )}

          {/* Media type badge */}
          <span
            className="
              absolute
              bottom-3
              right-3
              z-10
              rounded-full
              border
              border-white/20
              bg-black/45
              px-2.5
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-white
              backdrop-blur-md
            "
          >
            {isVideo ? "Video" : "Image"}
          </span>
        </div>
      ) : (
        <div
          className="
            relative
            m-4
            grid
            h-64
            place-items-center
            overflow-hidden
            rounded-xl
            border
            border-dashed
            border-stone-200
            bg-stone-50/80
            text-sm
            text-stone-400

            dark:border-white/[0.08]
            dark:bg-white/[0.025]
            dark:text-slate-500
          "
        >
          {/* Empty-state glow */}
          <div
            className="
              pointer-events-none
              absolute
              h-24
              w-24
              rounded-full
              bg-orange-400/[0.05]
              blur-3xl
              dark:bg-orange-500/[0.025]
            "
          />

          <div className="relative text-center">
            <div
              className="
                mx-auto
                mb-3
                grid
                h-11
                w-11
                place-items-center
                rounded-xl
                border
                border-stone-200
                bg-white
                text-lg
                text-stone-400
                shadow-sm

                dark:border-white/[0.08]
                dark:bg-white/[0.035]
                dark:text-slate-500
              "
            >
              ↑
            </div>

            <p
              className="
                text-xs
                font-semibold
                text-stone-500
                dark:text-slate-400
              "
            >
              Your media preview
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-stone-400
                dark:text-slate-600
              "
            >
              Add an image or video to preview it here
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          CAPTION
      ====================================================== */}

      <div className="relative px-4 pt-4">
        <p
          className="
            whitespace-pre-wrap
            break-words
            text-sm
            leading-6
            text-stone-700
            dark:text-slate-300
          "
        >
          {caption || "Your caption will appear here..."}
        </p>
      </div>

      {/* =====================================================
          ACTION BAR
      ====================================================== */}

      <div
        className="
          relative
          mt-2
          flex
          items-center
          justify-between
          border-t
          border-stone-200/70
          px-4
          py-3.5
          text-lg
          text-stone-400

          dark:border-white/[0.06]
          dark:text-slate-500
        "
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Like"
            className="
              transition
              hover:scale-110
              hover:text-stone-700
              dark:hover:text-slate-200
            "
          >
            ♡
          </button>

          <button
            type="button"
            aria-label="Comment"
            className="
              transition
              hover:scale-110
              hover:text-stone-700
              dark:hover:text-slate-200
            "
          >
            ◌
          </button>

          <button
            type="button"
            aria-label="Share"
            className="
              transition
              hover:scale-110
              hover:text-stone-700
              dark:hover:text-slate-200
            "
          >
            ⌁
          </button>
        </div>

        <button
          type="button"
          aria-label="More options"
          className="
            transition
            hover:scale-110
            hover:text-stone-700
            dark:hover:text-slate-200
          "
        >
          ⋯
        </button>
      </div>

      {/* =====================================================
          PREVIEW FOOTER
      ====================================================== */}

      <div
        className="
          border-t
          border-stone-200/60
          bg-stone-50/45
          px-4
          py-2.5
          dark:border-white/[0.05]
          dark:bg-white/[0.015]
        "
      >
        <p
          className="
            text-center
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-stone-400
            dark:text-slate-600
          "
        >
          Live post preview
        </p>
      </div>
    </div>
  );
}