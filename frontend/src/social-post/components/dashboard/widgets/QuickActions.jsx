import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ImagePlus,
  Link2,
  PenSquare,
  Sparkles,
} from "lucide-react";

const actions = [
  {
    title: "Create a post",
    description: "Share something new",
    to: "/dashboard/create-post",
    icon: PenSquare,
    iconBox:
      "border-orange-200/80 bg-orange-50/80 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/[0.08] dark:text-orange-400",
    glow: "bg-orange-400/10 dark:bg-orange-500/[0.08]",
    arrow:
      "text-orange-500 bg-orange-50/80 group-hover:bg-orange-100 dark:text-orange-400 dark:bg-orange-400/[0.07] dark:group-hover:bg-orange-400/[0.12]",
    badge: "Create",
  },
  {
    title: "Design content",
    description: "Make a visual",
    to: "/dashboard/design",
    icon: ImagePlus,
    iconBox:
      "border-violet-200/80 bg-violet-50/80 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/[0.08] dark:text-violet-400",
    glow: "bg-violet-400/10 dark:bg-violet-500/[0.08]",
    arrow:
      "text-violet-500 bg-violet-50/80 group-hover:bg-violet-100 dark:text-violet-400 dark:bg-violet-400/[0.07] dark:group-hover:bg-violet-400/[0.12]",
    badge: "Creative",
  },
  {
    title: "Connect account",
    description: "Grow your network",
    to: "/dashboard/social-accounts",
    icon: Link2,
    iconBox:
      "border-emerald-200/80 bg-emerald-50/80 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/[0.08] dark:text-emerald-400",
    glow: "bg-emerald-400/10 dark:bg-emerald-500/[0.08]",
    arrow:
      "text-emerald-500 bg-emerald-50/80 group-hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-400/[0.07] dark:group-hover:bg-emerald-400/[0.12]",
    badge: "Connect",
  },
];

export default function QuickActions() {
  return (
    <section className="relative">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              strokeWidth={1.9}
              className="text-orange-500 dark:text-orange-400"
            />

            <h2
              className="
                text-base
                font-black
                tracking-tight
                text-stone-900
                dark:text-white
                sm:text-lg
              "
            >
              Quick actions
            </h2>
          </div>

          <p
            className="
              mt-1
              text-xs
              text-stone-500
              dark:text-slate-400
              sm:text-sm
            "
          >
            Jump into your most common workspace tasks.
          </p>
        </div>
      </div>

      {/* =====================================================
          ACTION GRID
      ====================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.to}
              to={action.to}
              className="
                group
                relative
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
                hover:-translate-y-1
                hover:border-stone-300/80
                hover:bg-white/90
                hover:shadow-[0_20px_50px_rgba(15,23,42,0.09)]
                focus:outline-none
                focus:ring-2
                focus:ring-orange-500/20
                focus:ring-offset-2
                focus:ring-offset-[#f6f7fb]
                dark:border-white/[0.08]
                dark:bg-[#0d1422]/75
                dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]
                dark:hover:border-white/[0.13]
                dark:hover:bg-[#111a2b]/90
                dark:hover:shadow-[0_22px_60px_rgba(0,0,0,0.34)]
                dark:focus:ring-offset-[#070b14]
              "
            >
              {/* =================================================
                  AMBIENT GLOW
              ================================================== */}

              <div
                className={`
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-28
                  w-28
                  rounded-full
                  blur-[45px]
                  transition-all
                  duration-300
                  group-hover:scale-125
                  ${action.glow}
                `}
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-10
                  -left-8
                  h-20
                  w-20
                  rounded-full
                  bg-cyan-400/[0.03]
                  blur-[40px]
                  transition-opacity
                  duration-300
                  group-hover:opacity-100
                  dark:bg-cyan-400/[0.025]
                "
              />

              {/* =================================================
                  TOP EDGE LIGHT
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  h-px
                  bg-gradient-to-r
                  from-transparent
                  via-orange-400/25
                  to-transparent
                  opacity-70
                  dark:via-orange-400/15
                "
              />

              {/* =================================================
                  SHINE
              ================================================== */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-white/35
                  via-transparent
                  to-transparent
                  opacity-80
                  dark:from-white/[0.045]
                  dark:via-transparent
                  dark:to-transparent
                "
              />

              {/* =================================================
                  TOP ROW
              ================================================== */}

              <div className="relative flex items-start justify-between gap-3">
                <div
                  className={`
                    relative
                    grid
                    h-11
                    w-11
                    shrink-0
                    place-items-center
                    rounded-[14px]
                    border
                    shadow-sm
                    transition-all
                    duration-300
                    group-hover:scale-105
                    group-hover:shadow-md
                    ${action.iconBox}
                  `}
                >
                  <span
                    className={`
                      pointer-events-none
                      absolute
                      -inset-1
                      rounded-[16px]
                      opacity-50
                      blur-md
                      transition-opacity
                      duration-300
                      group-hover:opacity-80
                      ${action.glow}
                    `}
                  />

                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className="
                      relative
                      z-10
                      transition-transform
                      duration-300
                      group-hover:scale-105
                    "
                  />
                </div>

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-stone-200/70
                    bg-white/55
                    px-2
                    py-1
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-stone-400
                    backdrop-blur-sm
                    dark:border-white/[0.08]
                    dark:bg-white/[0.045]
                    dark:text-slate-500
                  "
                >
                  {action.badge}
                </span>
              </div>

              {/* =================================================
                  TEXT
              ================================================== */}

              <div className="relative mt-4 pr-8">
                <h3
                  className="
                    text-sm
                    font-black
                    text-stone-900
                    transition-colors
                    group-hover:text-stone-950
                    dark:text-white
                    dark:group-hover:text-white
                  "
                >
                  {action.title}
                </h3>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-stone-500
                    dark:text-slate-400
                  "
                >
                  {action.description}
                </p>
              </div>

              {/* =================================================
                  ARROW
              ================================================== */}

              <span
                className={`
                  absolute
                  bottom-4
                  right-4
                  grid
                  h-8
                  w-8
                  place-items-center
                  rounded-xl
                  transition-all
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:scale-105
                  ${action.arrow}
                `}
              >
                <ArrowUpRight
                  size={15}
                  strokeWidth={2}
                  className="
                    transition-transform
                    duration-300
                    group-hover:rotate-6
                  "
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}