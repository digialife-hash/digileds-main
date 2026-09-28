export default function HashtagInput({ value, onChange }) {
  return (
    <label className="group relative grid gap-2.5">
      {/* Label */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold tracking-tight text-stone-800 dark:text-slate-200">
          Hashtags
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
          Reach
        </span>
      </div>

      {/* Input wrapper */}
      <div
        className="
          relative overflow-hidden rounded-2xl
          border border-stone-200/80
          bg-white/70
          shadow-[0_12px_35px_rgba(15,23,42,0.04)]
          backdrop-blur-xl
          transition-all duration-200

          focus-within:border-stone-400
          focus-within:shadow-[0_16px_40px_rgba(15,23,42,0.07)]

          dark:border-white/[0.08]
          dark:bg-white/[0.025]
          dark:shadow-[0_15px_45px_rgba(0,0,0,0.18)]
          dark:focus-within:border-white/[0.16]
          dark:focus-within:shadow-[0_18px_50px_rgba(0,0,0,0.24)]
        "
      >
        {/* Ambient glow */}
        <div
          className="
            pointer-events-none absolute
            -right-12 -top-12
            h-24 w-24
            rounded-full
            bg-cyan-400/[0.06]
            blur-3xl
            dark:bg-cyan-500/[0.035]
          "
        />

        {/* Top reflection */}
        <div
          className="
            pointer-events-none absolute
            inset-x-0 top-0 h-12
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
            via-cyan-400/20
            to-transparent
            dark:via-cyan-400/10
          "
        />

        <div className="relative flex items-center">
          {/* Hashtag icon */}
          <span
            className="
              pointer-events-none
              absolute left-4
              text-lg font-bold
              text-stone-300
              dark:text-slate-600
            "
          >
            #
          </span>

          <input
            type="text"
            className="
              relative z-10
              w-full
              border-0
              bg-transparent
              py-3.5
              pl-10
              pr-4
              text-sm
              font-medium
              text-stone-800
              outline-none
              placeholder:text-stone-400

              dark:text-slate-100
              dark:placeholder:text-slate-600

              sm:py-4
            "
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#marketing #creative #socialmedia"
          />
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center gap-2 px-0.5">
        <span
          className="
            h-1.5 w-1.5 rounded-full
            bg-emerald-500
            shadow-[0_0_7px_rgba(16,185,129,0.45)]
            dark:bg-emerald-400
          "
        />

        <small className="text-xs font-medium text-stone-400 dark:text-slate-500">
          Add relevant hashtags to improve reach
        </small>
      </div>
    </label>
  );
}