
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Share2,
} from "lucide-react";

import PageHeader from "../layout/PageHeader.jsx";
import { useSocialAccounts } from "../../hooks/useSocialAccounts.js";

export default function ConnectedPlatforms() {
  const { accounts = [] } = useSocialAccounts();

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const connected = safeAccounts.filter(
    (account) => account?.connected
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* =====================================================
          ATMOSPHERIC BACKGROUND
      ====================================================== */}

      {/* <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/[0.035] blur-[110px] dark:bg-orange-400/[0.055]" />
        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-[120px] dark:bg-cyan-400/[0.045]" />
        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.025] blur-[130px] dark:bg-violet-400/[0.04]" />
      </div> */}

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <PageHeader
          title="Connected platforms"
          description="See which platforms are ready to receive your content."
        />

        {/* =====================================================
            TOP STATUS
        ====================================================== */}

        <section
          className="
            relative
            mt-5
            flex
            w-full
            min-w-0
            flex-col
            gap-3
            overflow-hidden
            rounded-[24px]
            border
            border-stone-200/80
            bg-white/[0.72]
            p-4
            shadow-[0_18px_55px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            transition-colors
            duration-300
            dark:border-white/[0.08]
            dark:bg-white/[0.035]
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
            sm:mt-6
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:p-5
          "
        >
          {/* Reflection */}
          {/* <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" /> */}

          {/* Top edge */}
          {/* <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent dark:via-emerald-400/20" /> */}

          <div className="relative flex min-w-0 items-center gap-3">
            {/* <div
              className="
                grid
                h-10
                w-10
                shrink-0
                place-items-center
                rounded-xl
                border
                border-emerald-200/80
                bg-emerald-50
                text-emerald-600
                shadow-sm
                dark:border-emerald-400/15
                dark:bg-emerald-400/[0.08]
                dark:text-emerald-400
              "
            >
              <ShieldCheck size={18} strokeWidth={1.9} />
            </div> */}

            <div className="min-w-0">
              <h2 className="text-sm font-black tracking-tight text-stone-900 dark:text-white">
                Publishing connections
              </h2>

              <p className="mt-0.5 text-xs text-stone-500 dark:text-slate-400">
                {connected.length > 0
                  ? `${connected.length} platform${
                      connected.length === 1 ? "" : "s"
                    } currently connected`
                  : "No platforms are connected yet"}
              </p>
            </div>
          </div>
{/* 
          <div
            className="
              relative
              inline-flex
              w-fit
              shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              border-emerald-200/80
              bg-emerald-50
              px-3
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-emerald-600
              dark:border-emerald-400/15
              dark:bg-emerald-400/[0.08]
              dark:text-emerald-400
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.08)] dark:bg-emerald-400 dark:shadow-[0_0_0_4px_rgba(52,211,153,0.06)]" />
            Ready to publish
          </div> */}
        </section>

        {/* =====================================================
            CONNECTED PLATFORMS
        ====================================================== */}

        {connected.length > 0 ? (
          <div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:mt-6 sm:grid-cols-2 xl:grid-cols-3">
            {connected.map((account) => (
              <ConnectedPlatformCard
                key={account.id}
                account={account}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CONNECTED PLATFORM CARD
========================================================= */

function ConnectedPlatformCard({ account }) {
  return (
    <article
      className="
        group
        relative
        flex
        min-w-0
        w-full
        flex-col
        overflow-hidden
        rounded-[26px]
        border
        border-stone-200/80
        bg-white/[0.74]
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-stone-300/80
        hover:shadow-[0_24px_65px_rgba(15,23,42,0.09)]
        dark:border-white/[0.08]
        dark:bg-white/[0.035]
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
        dark:hover:border-white/[0.13]
        dark:hover:shadow-[0_25px_75px_rgba(0,0,0,0.38)]
      "
    >
      {/* =====================================================
          AMBIENT GLOWS
      ====================================================== */}

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/[0.055] blur-[70px] transition-opacity duration-300 group-hover:opacity-100 dark:bg-emerald-400/[0.07]" />

      <div className="pointer-events-none absolute -bottom-20 -left-16 h-36 w-36 rounded-full bg-cyan-400/[0.035] blur-[65px] dark:bg-cyan-400/[0.045]" />

      {/* Reflection */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04] dark:to-transparent" />

      {/* Top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent dark:via-emerald-400/20" />

      {/* =====================================================
          CARD HEADER
      ====================================================== */}

      <div className="relative min-w-0 p-4 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-3">

          {/* Platform info */}

          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid
                h-12
                w-12
                shrink-0
                place-items-center
                rounded-[15px]
                border
                border-stone-200/80
                bg-gradient-to-br
                from-white
                to-stone-100
                text-sm
                font-black
                shadow-sm
                dark:border-white/[0.08]
                dark:from-white/[0.08]
                dark:to-white/[0.025]
              "
              style={{
                color: account?.color || "#78716c",
              }}
            >
              {account?.icon || "S"}
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-sm
                  font-black
                  tracking-tight
                  text-stone-900
                  transition-colors
                  dark:text-white
                "
                title={account?.name}
              >
                {account?.name || "Platform"}
              </h2>

              <p
                className="
                  mt-1
                  truncate
                  text-xs
                  font-medium
                  text-stone-500
                  transition-colors
                  dark:text-slate-400
                "
                title={account?.handle}
              >
                {account?.handle || "Connected account"}
              </p>
            </div>
          </div>

          {/* Connected badge */}

          <div
            className="
              inline-flex
              shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              border-emerald-200/80
              bg-emerald-50
              px-2.5
              py-1.5
              text-[9px]
              font-black
              uppercase
              tracking-[0.1em]
              text-emerald-600
              dark:border-emerald-400/15
              dark:bg-emerald-400/[0.08]
              dark:text-emerald-400
            "
          >
            <CheckCircle2 size={12} strokeWidth={2.2} />
            Connected
          </div>
        </div>

        {/* ===================================================
            STATUS PANEL
        ==================================================== */}

        <div
          className="
            mt-4
            flex
            min-w-0
            items-center
            gap-3
            rounded-2xl
            border
            border-stone-200/70
            bg-stone-50/70
            px-3.5
            py-3
            transition-colors
            dark:border-white/[0.07]
            dark:bg-white/[0.025]
          "
        >
          <div
            className="
              grid
              h-8
              w-8
              shrink-0
              place-items-center
              rounded-lg
              bg-white
              text-stone-400
              shadow-sm
              dark:bg-white/[0.07]
              dark:text-slate-400
            "
          >
            <Share2 size={14} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-stone-400 dark:text-slate-500">
              Publishing status
            </p>

            <p className="mt-0.5 truncate text-xs font-bold text-stone-700 dark:text-slate-200">
              Ready to receive content
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          CARD FOOTER
      ====================================================== */}

      <div
        className="
          relative
          mt-auto
          flex
          min-w-0
          items-center
          justify-between
          gap-3
          border-t
          border-stone-200/70
          bg-stone-50/50
          px-4
          py-3.5
          transition-colors
          dark:border-white/[0.07]
          dark:bg-white/[0.02]
          sm:px-5
        "
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.08)] dark:bg-emerald-400 dark:shadow-[0_0_0_4px_rgba(52,211,153,0.06)]" />

          <span className="truncate text-[10px] font-semibold text-stone-500 dark:text-slate-400">
            Active connection
          </span>
        </div>

        <span
          className="
            inline-flex
            shrink-0
            items-center
            gap-1
            text-[10px]
            font-bold
            text-stone-400
            dark:text-slate-500
          "
        >
          Secure
          <ExternalLink size={11} />
        </span>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <section
      className="
        relative
        mt-5
        flex
        min-h-[320px]
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-[26px]
        border
        border-dashed
        border-stone-200
        bg-white/[0.6]
        px-5
        py-12
        text-center
        shadow-[0_18px_55px_rgba(15,23,42,0.05)]
        backdrop-blur-xl
        transition-colors
        dark:border-white/[0.1]
        dark:bg-white/[0.025]
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
        sm:mt-6
        sm:px-6
      "
    >
      {/* Ambient glows */}

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/[0.05] blur-[70px] dark:bg-violet-400/[0.07]" />

      <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-orange-400/[0.035] blur-[70px] dark:bg-orange-400/[0.05]" />

      {/* Reflection */}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/40 to-transparent dark:from-white/[0.04] dark:to-transparent" />

      {/* Icon */}

      <div
        className="
          relative
          grid
          h-14
          w-14
          place-items-center
          rounded-2xl
          border
          border-stone-200
          bg-white
          text-stone-300
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.05]
          dark:text-slate-500
        "
      >
        <Share2 size={22} strokeWidth={1.6} />
      </div>

      <h3 className="relative mt-4 text-sm font-black text-stone-800 dark:text-white">
        No connected platforms
      </h3>

      <p
        className="
          relative
          mt-1.5
          max-w-sm
          text-xs
          leading-5
          text-stone-400
          dark:text-slate-500
        "
      >
        Connect your social accounts to start publishing content
        directly from your workspace.
      </p>
    </section>
  );
}

