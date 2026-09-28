import { useRef } from "react";

export default function MediaUploader({ file, onChange }) {
  const ref = useRef();

  return (
    <button
      type="button"
      className="
        group relative grid w-full
        place-items-center gap-3
        overflow-hidden rounded-2xl
        border border-dashed
        border-stone-300/80
        bg-white/65
        px-5 py-10
        text-center
        backdrop-blur-xl
        shadow-[0_14px_40px_rgba(15,23,42,0.04)]
        transition-all duration-200

        hover:-translate-y-0.5
        hover:border-stone-400
        hover:bg-white
        hover:shadow-[0_18px_45px_rgba(15,23,42,0.07)]

        dark:border-white/[0.10]
        dark:bg-white/[0.025]
        dark:shadow-[0_15px_45px_rgba(0,0,0,0.18)]

        dark:hover:border-white/[0.18]
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.24)]

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-orange-400/40
      "
      onClick={() => ref.current?.click()}
    >
      {/* Ambient glow */}
      <div
        className="
          pointer-events-none absolute
          -right-12 -top-12
          h-28 w-28
          rounded-full
          bg-orange-400/[0.07]
          blur-3xl
          dark:bg-orange-500/[0.04]
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-16 -left-10
          h-28 w-28
          rounded-full
          bg-cyan-400/[0.05]
          blur-3xl
          dark:bg-cyan-500/[0.025]
        "
      />

      {/* Top reflection */}
      <div
        className="
          pointer-events-none absolute
          inset-x-0 top-0 h-16
          bg-gradient-to-b
          from-white/35
          to-transparent
          dark:from-white/[0.035]
          dark:to-transparent
        "
      />

      {/* Top edge */}
      <div
        className="
          pointer-events-none absolute
          inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent
          via-orange-400/25
          to-transparent
          dark:via-orange-400/15
        "
      />

      <input
        ref={ref}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={(e) =>
          onChange(e.target.files?.[0])
        }
      />

      {/* Upload icon */}
      <span
        className="
          relative z-10
          grid h-14 w-14
          place-items-center
          rounded-2xl
          border
          border-orange-200/80
          bg-orange-50
          text-xl
          font-bold
          text-orange-600
          shadow-[0_10px_25px_rgba(249,115,22,0.08)]
          transition-all duration-200

          group-hover:scale-105
          group-hover:border-orange-300
          group-hover:bg-orange-100

          dark:border-orange-400/10
          dark:bg-orange-400/[0.07]
          dark:text-orange-400
          dark:shadow-[0_10px_30px_rgba(249,115,22,0.06)]

          dark:group-hover:border-orange-400/20
          dark:group-hover:bg-orange-400/[0.10]
        "
      >
        {file ? "✓" : "↑"}
      </span>

      {/* File name / title */}
      <strong
        className="
          relative z-10
          max-w-full
          truncate
          px-3
          text-sm
          font-bold
          text-stone-800
          transition-colors

          dark:text-slate-200
        "
      >
        {file ? file.name : "Drop your media here"}
      </strong>

      {/* Description */}
      <small
        className="
          relative z-10
          text-xs
          font-medium
          text-stone-400

          dark:text-slate-500
        "
      >
        {file
          ? "Click to choose a different file"
          : "Click to browse or drop your media"}
      </small>

      {/* Supported formats */}
      <span
        className="
          relative z-10
          rounded-full
          border
          border-stone-200/80
          bg-stone-50/80
          px-3 py-1
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.1em]
          text-stone-400

          dark:border-white/[0.07]
          dark:bg-white/[0.035]
          dark:text-slate-500
        "
      >
        JPG · PNG · GIF · MP4 · Up to 10MB
      </span>

      {/* Selected indicator */}
      {file && (
        <span
          className="
            relative z-10
            mt-1
            flex items-center gap-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-emerald-600

            dark:text-emerald-400
          "
        >
          <span
            className="
              h-1.5 w-1.5
              rounded-full
              bg-emerald-500
              shadow-[0_0_8px_rgba(16,185,129,0.65)]
              dark:bg-emerald-400
            "
          />

          Media selected
        </span>
      )}
    </button>
  );
}