export default function StatsCard({
  label,
  value,
  change,
  icon,
}) {
  return (
    <article
      className="
        group
        relative
        min-w-0
        overflow-hidden
        rounded-[22px]
        border
        border-stone-200/80
        bg-white/75
        p-4
        shadow-[0_14px_40px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-orange-200/80
        hover:shadow-[0_20px_50px_rgba(249,115,22,0.09)]
        sm:p-5
        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_18px_50px_rgba(0,0,0,0.24)]
        dark:hover:border-orange-400/20
        dark:hover:shadow-[0_22px_60px_rgba(249,115,22,0.08)]
      "
    >
      {/* =====================================================
          AMBIENT GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-24
          w-24
          rounded-full
          bg-orange-400/10
          blur-[45px]
          transition-all
          duration-300
          group-hover:bg-orange-400/15
          dark:bg-orange-500/[0.07]
          dark:group-hover:bg-orange-500/[0.11]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-12
          -left-10
          h-20
          w-20
          rounded-full
          bg-cyan-400/[0.04]
          blur-[40px]
          dark:bg-cyan-400/[0.035]
        "
      />

      {/* =====================================================
          TOP EDGE LIGHT
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
          TOP GLASS REFLECTION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-20
          bg-gradient-to-b
          from-white/45
          to-transparent
          dark:from-white/[0.045]
          dark:to-transparent
        "
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="relative flex min-w-0 items-start gap-3.5 sm:gap-4">
        {/* ===================================================
            ICON
        ==================================================== */}

        <div
          className="
            relative
            grid
            h-11
            w-11
            shrink-0
            place-items-center
            rounded-[14px]
            border
            border-orange-200/70
            bg-orange-50/80
            text-orange-600
            shadow-[0_8px_20px_rgba(249,115,22,0.08)]
            transition-all
            duration-300
            group-hover:scale-[1.04]
            group-hover:shadow-[0_10px_25px_rgba(249,115,22,0.14)]
            dark:border-orange-400/15
            dark:bg-orange-400/[0.08]
            dark:text-orange-400
            dark:shadow-[0_8px_25px_rgba(249,115,22,0.06)]
            dark:group-hover:shadow-[0_12px_30px_rgba(249,115,22,0.1)]
          "
        >
          <span
            className="
              pointer-events-none
              absolute
              -inset-1
              rounded-[16px]
              bg-orange-400/10
              blur-md
              dark:bg-orange-400/[0.08]
            "
          />

          <span className="relative z-10">
            {icon}
          </span>
        </div>

        {/* ===================================================
            TEXT
        ==================================================== */}

        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              text-[11px]
              font-semibold
              leading-5
              text-stone-500
              dark:text-slate-400
              sm:text-xs
            "
            title={label}
          >
            {label}
          </p>

          <div className="mt-1 flex min-w-0 items-baseline gap-2">
            <strong
              className="
                truncate
                text-2xl
                font-black
                leading-none
                tracking-[-0.04em]
                text-stone-950
                dark:text-white
                sm:text-[1.65rem]
              "
              title={String(value)}
            >
              {value}
            </strong>
          </div>

          <p
            className="
              mt-2
              truncate
              text-[10px]
              font-semibold
              leading-4
              text-emerald-600
              dark:text-emerald-400
              sm:text-[11px]
            "
            title={change}
          >
            {change}
          </p>
        </div>
      </div>
    </article>
  );
}