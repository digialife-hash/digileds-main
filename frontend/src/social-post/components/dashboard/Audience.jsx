
import {
  Activity,
  BarChart3,
  Clock3,
  Info,
  RefreshCw,
  Sparkles,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { useState } from "react";

import PageHeader from "../layout/PageHeader.jsx";

export default function Audience() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-blue-400/[0.035] blur-[110px] dark:bg-blue-400/[0.055]" />

        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-violet-400/[0.035] blur-[120px] dark:bg-violet-400/[0.045]" />

        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-orange-400/[0.025] blur-[130px] dark:bg-orange-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <PageHeader
          eyebrow="Analytics"
          title="Audience"
          description="Understand who follows you, when they are active, and how your audience is growing."
          action={
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                inline-flex
                h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-stone-200
                bg-white/80
                px-4
                text-xs
                font-bold
                text-stone-700
                shadow-sm
                backdrop-blur-xl
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-stone-300
                hover:bg-white
                disabled:cursor-not-allowed
                disabled:opacity-50
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-200
                dark:hover:border-white/[0.14]
                dark:hover:bg-white/[0.07]
                sm:w-auto
              "
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          }
        />

        {/* =====================================================
            HERO / PROVIDER STATUS
        ====================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-blue-100/80
            bg-white/[0.68]
            shadow-[0_18px_55px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-blue-400/10
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent dark:via-blue-400/20" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-[100px] dark:bg-blue-400/[0.055]" />

          <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-400/5 blur-[90px] dark:bg-violet-400/[0.045]" />

          <div
            className="
              relative
              flex
              flex-col
              gap-5
              p-4
              sm:p-6
              lg:flex-row
              lg:items-center
              lg:justify-between
              lg:p-7
            "
          >
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div
                className="
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center
                  rounded-2xl
                  border
                  border-blue-100
                  bg-blue-50
                  text-blue-600
                  dark:border-blue-400/15
                  dark:bg-blue-400/10
                  dark:text-blue-300
                  sm:h-12
                  sm:w-12
                "
              >
                <Users size={20} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black tracking-tight text-blue-950 transition-colors duration-300 dark:text-white sm:text-base">
                    Audience analytics
                  </h2>

                  <span
                    className="
                      rounded-full
                      border
                      border-blue-200/70
                      bg-blue-50
                      px-2
                      py-1
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-blue-600
                      dark:border-blue-400/15
                      dark:bg-blue-400/10
                      dark:text-blue-300
                    "
                  >
                    API dependent
                  </span>
                </div>

                <p
                  className="
                    mt-2
                    max-w-4xl
                    text-xs
                    leading-5
                    text-blue-800/75
                    transition-colors
                    duration-300
                    dark:text-slate-400
                    sm:text-sm
                    sm:leading-6
                  "
                >
                  Follower growth, audience demographics, active-time
                  insights and other audience metrics will appear
                  automatically after the official social platform APIs
                  return the required data.
                </p>
              </div>
            </div>

            <div
              className="
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-2
                rounded-full
                border
                border-blue-100
                bg-white/75
                px-3
                py-2
                text-[9px]
                font-bold
                uppercase
                tracking-[0.12em]
                text-blue-500
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-blue-300
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
              Waiting for verified data
            </div>
          </div>
        </section>

        {/* =====================================================
            QUICK OVERVIEW
        ====================================================== */}

        <section className="mt-5 sm:mt-6">
          <div className="mb-3 flex flex-col gap-1 sm:mb-4">
            <div className="flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-orange-500 dark:text-orange-400"
              />

              <h2 className="text-base font-black tracking-tight text-stone-900 dark:text-white">
                Audience overview
              </h2>
            </div>

            <p className="text-xs text-stone-500 dark:text-slate-400">
              Key audience metrics will populate here from connected provider
              APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InsightCard
              icon={Users}
              title="Followers"
              value="—"
              text="Current audience size"
              tone="violet"
            />

            <InsightCard
              icon={Activity}
              title="Growth"
              value="—"
              text="Follower growth trend"
              tone="green"
            />

            <InsightCard
              icon={Clock3}
              title="Active times"
              value="—"
              text="Best time to publish"
              tone="orange"
            />

            <InsightCard
              icon={UserRoundSearch}
              title="Demographics"
              value="—"
              text="Audience characteristics"
              tone="blue"
            />
          </div>
        </section>

        {/* =====================================================
            INSIGHT PANELS
        ====================================================== */}

        <section className="mt-5 grid gap-5 sm:mt-6 xl:grid-cols-2">
          <InsightPanel
            icon={BarChart3}
            title="Audience growth"
            description="Track follower growth and audience changes over time."
            type="growth"
          />

          <InsightPanel
            icon={Clock3}
            title="Audience activity"
            description="Understand when your audience is most active."
            type="activity"
          />
        </section>

        {/* =====================================================
            DEMOGRAPHICS
        ====================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[26px]
            border
            border-white/80
            bg-white/[0.68]
            shadow-[0_18px_55px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent dark:via-cyan-400/15" />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04] dark:to-transparent" />

          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/5 blur-[90px] dark:bg-cyan-400/[0.04]" />

          <div
            className="
              relative
              flex
              flex-col
              gap-3
              border-b
              border-stone-200/70
              px-4
              py-5
              dark:border-white/[0.07]
              sm:px-6
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-xl
                  border
                  border-cyan-100
                  bg-cyan-50
                  text-cyan-600
                  dark:border-cyan-400/15
                  dark:bg-cyan-400/10
                  dark:text-cyan-300
                "
              >
                <UserRoundSearch size={18} strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <h2 className="text-[15px] font-black tracking-tight text-stone-900 dark:text-white">
                  Audience demographics
                </h2>

                <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-slate-400">
                  Age, gender, location and other audience characteristics.
                </p>
              </div>
            </div>

            <span
              className="
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                border-stone-200
                bg-stone-50
                px-2.5
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.1em]
                text-stone-400
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-400
              "
            >
              <Info size={10} />
              No verified data
            </span>
          </div>

          <div className="relative grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-3">
            <DemographicCard
              title="Age groups"
              items={["18–24", "25–34", "35–44"]}
            />

            <DemographicCard
              title="Top locations"
              items={["Country", "City", "Region"]}
            />

            <DemographicCard
              title="Audience split"
              items={["Gender", "Language", "Device"]}
            />
          </div>
        </section>

        {/* =====================================================
            DATA INTEGRITY
        ====================================================== */}

        <section
          className="
            relative
            mt-5
            overflow-hidden
            rounded-[24px]
            border
            border-stone-200/80
            bg-white/[0.68]
            shadow-[0_18px_55px_rgba(15,23,42,0.05)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.24)]
            sm:mt-6
          "
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent dark:via-emerald-400/15" />

          <div
            className="
              relative
              flex
              flex-col
              gap-4
              p-4
              sm:flex-row
              sm:items-center
              sm:p-6
            "
          >
            <div
              className="
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                text-stone-500
                dark:border-white/[0.08]
                dark:bg-white/[0.04]
                dark:text-slate-400
              "
            >
              <Info size={17} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-black text-stone-800 dark:text-white">
                Data integrity notice
              </h2>

              <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-slate-400">
                No follower numbers, demographics, growth percentages,
                activity charts or audience statistics are fabricated. Only
                verified information returned by connected official provider
                APIs will be displayed.
              </p>
            </div>

            <div
              className="
                inline-flex
                w-fit
                shrink-0
                items-center
                gap-1.5
                rounded-full
                border
                border-emerald-100
                bg-emerald-50
                px-2.5
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.1em]
                text-emerald-600
                dark:border-emerald-400/15
                dark:bg-emerald-400/10
                dark:text-emerald-300
                sm:ml-auto
              "
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Verified only
            </div>
          </div>
        </section>

        {/* =====================================================
            COMING SOON / ROADMAP
        ====================================================== */}

        <section className="mt-5 pb-4 sm:mt-6 sm:pb-6">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Sparkles
              size={14}
              className="text-violet-500 dark:text-violet-400"
            />

            <h2 className="text-sm font-black text-stone-800 dark:text-white">
              Audience insights roadmap
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <RoadmapItem
              title="Follower trends"
              description="Daily, weekly and monthly growth."
            />

            <RoadmapItem
              title="Best posting time"
              description="Identify when your audience is active."
            />

            <RoadmapItem
              title="Top locations"
              description="Understand where your audience comes from."
            />

            <RoadmapItem
              title="Audience segments"
              description="Understand audience characteristics."
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   INSIGHT CARD
========================================================= */

function InsightCard({
  icon: Icon,
  title,
  value,
  text,
  tone = "slate",
}) {
  const tones = {
    violet:
      "border-violet-200/70 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",

    green:
      "border-emerald-200/70 bg-emerald-50 text-emerald-600 dark:border-emerald-400/15 dark:bg-emerald-400/10 dark:text-emerald-300",

    orange:
      "border-orange-200/70 bg-orange-50 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",

    blue:
      "border-blue-200/70 bg-blue-50 text-blue-600 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-300",

    slate:
      "border-stone-200 bg-stone-50 text-stone-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400",
  };

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[22px]
        border
        border-white/80
        bg-white/[0.68]
        p-4
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
        dark:hover:border-white/[0.11]
        dark:hover:bg-white/[0.045]
        sm:p-5
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/[0.08]" />

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-28
          w-28
          rounded-full
          bg-violet-400/5
          blur-[45px]
          transition-all
          duration-300
          group-hover:bg-violet-400/10
          dark:bg-violet-400/[0.035]
          dark:group-hover:bg-violet-400/[0.055]
        "
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500 sm:text-[10px]">
            {title}
          </p>

          <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-950 transition-colors duration-300 dark:text-white sm:mt-3">
            {value}
          </p>

          <p className="mt-1 text-xs leading-5 text-stone-400 dark:text-slate-500">
            {text}
          </p>
        </div>

        <div
          className={`
            grid
            h-10
            w-10
            shrink-0
            place-items-center
            rounded-xl
            border
            transition-all
            duration-300
            ${tones[tone] || tones.slate}
          `}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   INSIGHT PANEL
========================================================= */

function InsightPanel({
  icon: Icon,
  title,
  description,
  type,
}) {
  return (
    <section
      className="
        relative
        min-h-[330px]
        overflow-hidden
        rounded-[26px]
        border
        border-white/80
        bg-white/[0.68]
        p-4
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-colors
        duration-300
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
        sm:p-6
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent dark:via-violet-400/15" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04] dark:to-transparent" />

      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-400/5 blur-[80px] dark:bg-violet-400/[0.045]" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div
            className="
              grid
              h-10
              w-10
              shrink-0
              place-items-center
              rounded-xl
              border
              border-stone-200
              bg-stone-50
              text-stone-500
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-slate-400
            "
          >
            <Icon size={17} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-black tracking-tight text-stone-900 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        <div
          className="
            relative
            mt-6
            overflow-hidden
            rounded-2xl
            border
            border-dashed
            border-stone-200
            bg-stone-50/60
            px-4
            py-8
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.02]
            sm:mt-7
            sm:min-h-[210px]
            sm:py-10
          "
        >
          {type === "growth" ? (
            <GrowthPlaceholder />
          ) : (
            <ActivityPlaceholder />
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   GROWTH PLACEHOLDER
========================================================= */

function GrowthPlaceholder() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div
        className="
          grid
          h-11
          w-11
          place-items-center
          rounded-xl
          border
          border-white
          bg-white
          text-violet-300
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.05]
          dark:text-violet-400
        "
      >
        <BarChart3 size={19} strokeWidth={1.6} />
      </div>

      <p className="mt-4 text-sm font-bold text-stone-600 dark:text-slate-200">
        Audience growth data not available
      </p>

      <p className="mt-1.5 max-w-sm text-xs leading-5 text-stone-400 dark:text-slate-500">
        Connect a provider that exposes follower and audience growth metrics
        to populate this chart.
      </p>

      <div className="mt-5 flex w-full max-w-sm items-end gap-2">
        {[24, 38, 31, 52, 44, 64, 58].map(
          (height, index) => (
            <div key={index} className="flex-1">
              <div
                className="
                  mx-auto
                  w-full
                  max-w-6
                  rounded-t-md
                  bg-stone-200/60
                  dark:bg-white/[0.08]
                "
                style={{
                  height: `${height}px`,
                }}
              />
            </div>
          )
        )}
      </div>

      <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-300 dark:text-slate-600">
        Preview only
      </span>
    </div>
  );
}

/* =========================================================
   ACTIVITY PLACEHOLDER
========================================================= */

function ActivityPlaceholder() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div
        className="
          grid
          h-11
          w-11
          place-items-center
          rounded-xl
          border
          border-white
          bg-white
          text-orange-300
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.05]
          dark:text-orange-400
        "
      >
        <Clock3 size={19} strokeWidth={1.6} />
      </div>

      <p className="mt-4 text-sm font-bold text-stone-600 dark:text-slate-200">
        Activity data not available
      </p>

      <p className="mt-1.5 max-w-sm text-xs leading-5 text-stone-400 dark:text-slate-500">
        Once provider audience activity data becomes available, this section
        can show your best publishing windows.
      </p>

      <div className="mt-5 flex w-full max-w-sm items-center gap-1.5">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="h-7 flex-1 rounded-md bg-stone-200/50 dark:bg-white/[0.06]"
          />
        ))}
      </div>

      <span className="mt-3 text-[9px] font-bold uppercase tracking-[0.12em] text-stone-300 dark:text-slate-600">
        Preview only
      </span>
    </div>
  );
}

/* =========================================================
   DEMOGRAPHIC CARD
========================================================= */

function DemographicCard({
  title,
  items,
}) {
  return (
    <article
      className="
        rounded-[20px]
        border
        border-stone-200/80
        bg-white/65
        p-4
        transition-all
        duration-200
        hover:border-stone-300
        hover:shadow-sm
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.1]
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.16)]
      "
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-black text-stone-700 dark:text-slate-200">
          {title}
        </h3>

        <span className="rounded-full bg-stone-100 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-stone-400 dark:bg-white/[0.05] dark:text-slate-500">
          Soon
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="
              flex
              items-center
              justify-between
              gap-3
              rounded-xl
              border
              border-stone-100
              bg-stone-50/70
              px-3
              py-2.5
              dark:border-white/[0.06]
              dark:bg-white/[0.025]
            "
          >
            <span className="text-[10px] font-semibold text-stone-500 dark:text-slate-400">
              {item}
            </span>

            <span className="text-[10px] font-black text-stone-300 dark:text-slate-600">
              —
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

/* =========================================================
   ROADMAP ITEM
========================================================= */

function RoadmapItem({
  title,
  description,
}) {
  return (
    <article
      className="
        relative
        overflow-hidden
        rounded-[18px]
        border
        border-white/80
        bg-white/[0.68]
        p-4
        shadow-[0_12px_35px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-violet-200/80
        hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_16px_45px_rgba(0,0,0,0.2)]
        dark:hover:border-violet-400/15
        dark:hover:bg-white/[0.045]
      "
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/[0.07]" />

      <div className="flex items-start gap-3">
        <div
          className="
            mt-0.5
            h-2
            w-2
            shrink-0
            rounded-full
            bg-violet-400
            shadow-[0_0_0_4px_rgba(167,139,250,0.10)]
            dark:bg-violet-400
          "
        />

        <div className="min-w-0">
          <h3 className="text-xs font-black text-stone-700 dark:text-slate-200">
            {title}
          </h3>

          <p className="mt-1 text-[10px] leading-4 text-stone-400 dark:text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

