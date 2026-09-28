import { Plus, Sparkles, ShieldCheck } from "lucide-react";

export default function ConnectAccount() {
  return (
    <div className="w-full min-w-0 max-w-full">
      <section
        className="
          group
          relative
          w-full
          min-w-0
          max-w-full
          overflow-hidden
          rounded-[22px]
          border
          border-orange-200/80
          bg-gradient-to-br
          from-orange-50
          via-white
          to-amber-50
          shadow-[0_12px_35px_rgba(15,23,42,0.05)]
          backdrop-blur-xl
          transition-all
          duration-300
          hover:-translate-y-0.5
          hover:border-orange-300/80
          hover:shadow-[0_18px_48px_rgba(249,115,22,0.09)]
          dark:border-orange-400/15
          dark:from-orange-500/[0.09]
          dark:via-[#101827]
          dark:to-amber-500/[0.055]
          dark:shadow-[0_16px_45px_rgba(0,0,0,0.22)]
          dark:hover:border-orange-400/25
          dark:hover:shadow-[0_20px_55px_rgba(249,115,22,0.08)]
        "
      >
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
            via-orange-400/40
            to-transparent
            dark:via-orange-400/25
          "
        />

        {/* =====================================================
            DECORATIVE GLOW
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-36
            w-36
            rounded-full
            bg-orange-300/30
            blur-3xl
            transition-transform
            duration-500
            group-hover:scale-125
            dark:bg-orange-500/[0.09]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-14
            h-36
            w-36
            rounded-full
            bg-amber-300/20
            blur-3xl
            dark:bg-amber-500/[0.06]
          "
        />

        {/* =====================================================
            GLASS REFLECTION
        ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-24
            bg-gradient-to-b
            from-white/35
            via-transparent
            to-transparent
            dark:from-white/[0.035]
            dark:via-transparent
          "
        />

        {/* =====================================================
            CONTENT
        ====================================================== */}

        <div className="relative min-w-0 p-4 sm:p-5">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            {/* =================================================
                ICON
            ================================================== */}

            <div
              className="
                relative
                grid
                h-11
                w-11
                shrink-0
                place-items-center
                rounded-2xl
                border
                border-orange-100/80
                bg-white
                text-orange-600
                shadow-sm
                ring-1
                ring-orange-100/70
                transition-all
                duration-300
                group-hover:scale-105
                group-hover:shadow-[0_10px_25px_rgba(249,115,22,0.12)]
                dark:border-orange-400/15
                dark:bg-white/[0.06]
                dark:text-orange-400
                dark:ring-orange-400/10
                dark:group-hover:shadow-[0_10px_30px_rgba(249,115,22,0.08)]
              "
            >
              <span
                className="
                  pointer-events-none
                  absolute
                  -inset-1
                  rounded-2xl
                  bg-orange-400/10
                  blur-md
                  dark:bg-orange-400/[0.08]
                "
              />

              <Plus
                size={20}
                strokeWidth={2.1}
                className="
                  relative
                  z-10
                  transition-transform
                  duration-300
                  group-hover:rotate-90
                "
              />
            </div>

            {/* =================================================
                TEXT
            ================================================== */}

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3
                  className="
                    min-w-0
                    max-w-full
                    break-words
                    text-sm
                    font-black
                    tracking-tight
                    text-slate-950
                    sm:text-[15px]
                    dark:text-white
                  "
                >
                  Connect more platforms
                </h3>

                <span
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    gap-1
                    rounded-full
                    border
                    border-orange-200/80
                    bg-white/80
                    px-2
                    py-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-orange-700
                    backdrop-blur-sm
                    dark:border-orange-400/15
                    dark:bg-orange-400/[0.08]
                    dark:text-orange-400
                  "
                >
                  <Sparkles size={9} />

                  Expand
                </span>
              </div>

              <p
                className="
                  mt-1.5
                  max-w-xl
                  break-words
                  text-xs
                  leading-5
                  text-slate-500
                  sm:text-sm
                  dark:text-slate-400
                "
              >
                Bring your whole content workflow into one place by connecting
                more publishing channels.
              </p>
            </div>
          </div>

          {/* ===================================================
              BOTTOM AREA
          ==================================================== */}

          <div
            className="
              relative
              mt-4
              border-t
              border-orange-100
              pt-4
              dark:border-white/[0.07]
            "
          >
            <div
              className="
                flex
                min-w-0
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* =================================================
                  SECURITY NOTE
              ================================================== */}

              <div className="flex min-w-0 items-start gap-2">
                <ShieldCheck
                  size={13}
                  strokeWidth={2}
                  className="
                    mt-0.5
                    shrink-0
                    text-emerald-600
                    dark:text-emerald-400
                  "
                />

                <p
                  className="
                    min-w-0
                    max-w-xl
                    break-words
                    text-[10px]
                    leading-5
                    text-slate-400
                    sm:text-xs
                    dark:text-slate-500
                  "
                >
                  Secure OAuth authorization keeps your account access
                  protected.
                </p>
              </div>

              {/* =================================================
                  BUTTON
              ================================================== */}

              <button
                type="button"
                className="
                  group/button
                  inline-flex
                  h-10
                  w-full
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-slate-950
                  px-4
                  text-xs
                  font-bold
                  text-white
                  shadow-[0_8px_22px_rgba(15,23,42,0.11)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-slate-800
                  hover:shadow-[0_10px_28px_rgba(15,23,42,0.16)]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-orange-500/20
                  focus:ring-offset-2
                  focus:ring-offset-orange-50
                  active:translate-y-0
                  sm:w-auto
                  dark:bg-white
                  dark:text-slate-950
                  dark:shadow-[0_8px_25px_rgba(0,0,0,0.2)]
                  dark:hover:bg-slate-100
                  dark:focus:ring-orange-400/20
                  dark:focus:ring-offset-[#101827]
                "
              >
                <Plus
                  size={14}
                  strokeWidth={2.2}
                  className="
                    transition-transform
                    duration-300
                    group-hover/button:rotate-90
                  "
                />

                <span className="whitespace-nowrap">
                  Add platform
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}