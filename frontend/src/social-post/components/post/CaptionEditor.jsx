export default function CaptionEditor({ value, onChange }) {
  return (
    <label className="group relative grid gap-2.5">
      {/* Label */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold tracking-tight text-stone-800 dark:text-slate-200">
          Caption
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
          Social post
        </span>
      </div>

      {/* Editor */}
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
            -right-16 -top-16
            h-32 w-32
            rounded-full
            bg-orange-400/[0.06]
            blur-3xl
            dark:bg-orange-500/[0.035]
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

        <textarea
          className="
            relative z-10
            min-h-[170px]
            w-full
            resize-y
            border-0
            bg-transparent
            px-4 py-4
            text-sm
            leading-6
            text-stone-800
            outline-none
            placeholder:text-stone-400

            dark:text-slate-100
            dark:placeholder:text-slate-600

            sm:min-h-[190px]
            sm:px-5
            sm:py-5
          "
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What do you want to share?"
          rows={7}
          maxLength={2200}
        />

        {/* Character counter */}
        <div
          className="
            relative z-10
            flex items-center
            justify-between
            border-t
            border-stone-200/70
            bg-stone-50/45
            px-4 py-2.5
            dark:border-white/[0.06]
            dark:bg-white/[0.018]
            sm:px-5
          "
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-stone-400 dark:text-slate-500">
            Caption
          </span>

          <small
            className={`
              text-xs font-semibold
              ${
                value.length >= 2000
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-stone-400 dark:text-slate-500"
              }
            `}
          >
            {value.length.toLocaleString()}/2,200 characters
          </small>
        </div>
      </div>
    </label>
  );
}