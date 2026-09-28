import { AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import PageHeader from "../layout/PageHeader.jsx";
import { useSocialAccounts } from "../../hooks/useSocialAccounts.js";

export default function ReconnectAccounts() {
  const { accounts = [], connectAccount } = useSocialAccounts();

  const disconnected = Array.isArray(accounts)
    ? accounts.filter((account) => !account.connected)
    : [];

  return (
    <div
      className="
        min-h-screen
        bg-[#f6f7fb]
        text-stone-900
        dark:bg-[#070b14]
        dark:text-white
      "
    >
      {/* =====================================================
          PAGE AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-32
            top-20
            h-72
            w-72
            rounded-full
            bg-orange-400/[0.055]
            blur-3xl
            dark:bg-orange-400/[0.035]
          "
        />

        <div
          className="
            absolute
            right-[-120px]
            top-32
            h-80
            w-80
            rounded-full
            bg-cyan-400/[0.045]
            blur-3xl
            dark:bg-cyan-400/[0.03]
          "
        />

        <div
          className="
            absolute
            bottom-[-160px]
            left-1/3
            h-96
            w-96
            rounded-full
            bg-violet-400/[0.035]
            blur-3xl
            dark:bg-violet-400/[0.025]
          "
        />
      </div>

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1500px]
          px-3
          py-4
          sm:px-5
          sm:py-6
          md:px-6
          lg:px-8
          lg:py-9
          xl:px-10
          2xl:px-12
        "
      >
        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <PageHeader
          eyebrow="Social accounts"
          title="Reconnect accounts"
          description="Restore access to platforms that are currently disconnected."
        />

        {/* =====================================================
            TOP INFO BAR
        ====================================================== */}

        <section
          className="
            relative
            mt-6
            overflow-hidden
            rounded-[26px]
            border
            border-stone-200/80
            bg-white/75
            shadow-[0_18px_55px_rgba(15,23,42,0.06)]
            backdrop-blur-xl
            dark:border-white/[0.08]
            dark:bg-[#0d1422]/80
            dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
          "
        >
          {/* Top edge */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              z-20
              h-px
              bg-gradient-to-r
              from-transparent
              via-orange-400/30
              to-transparent
              dark:via-orange-400/20
            "
          />

          {/* Glass reflection */}
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-24
              bg-gradient-to-b
              from-white/45
              to-transparent
              dark:from-white/[0.045]
              dark:to-transparent
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-56
              w-56
              rounded-full
              bg-amber-400/[0.08]
              blur-3xl
              dark:bg-amber-400/[0.045]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              left-1/3
              h-48
              w-48
              rounded-full
              bg-slate-400/[0.055]
              blur-3xl
              dark:bg-slate-400/[0.025]
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              gap-4
              px-4
              py-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-6
              sm:py-6
              lg:px-7
            "
          >
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
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
                  border-amber-200/80
                  bg-amber-50/80
                  text-amber-600
                  shadow-sm
                  dark:border-amber-400/[0.14]
                  dark:bg-amber-400/[0.07]
                  dark:text-amber-400
                "
              >
                <ShieldCheck
                  size={18}
                  strokeWidth={1.9}
                />

                <span
                  className="
                    pointer-events-none
                    absolute
                    -inset-1
                    rounded-[18px]
                    bg-amber-400/[0.08]
                    blur-lg
                    dark:bg-amber-400/[0.05]
                  "
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-sm
                    font-black
                    tracking-tight
                    text-stone-950
                    dark:text-white
                    sm:text-[15px]
                  "
                >
                  Account access needs attention
                </p>

                <p
                  className="
                    mt-1
                    max-w-2xl
                    text-xs
                    leading-5
                    text-stone-500
                    dark:text-slate-400
                    sm:text-sm
                  "
                >
                  Reconnect disconnected accounts before publishing new
                  content to those platforms.
                </p>
              </div>
            </div>

            <div
              className="
                w-fit
                shrink-0
                rounded-full
                border
                border-amber-200/80
                bg-amber-50/80
                px-3
                py-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-amber-700
                shadow-sm
                dark:border-amber-400/[0.15]
                dark:bg-amber-400/[0.07]
                dark:text-amber-300
                sm:text-[10px]
              "
            >
              {disconnected.length}{" "}
              {disconnected.length === 1 ? "account" : "accounts"} need
              attention
            </div>
          </div>
        </section>

        {/* =====================================================
            CONTENT
        ====================================================== */}

        {disconnected.length === 0 ? (
          <EmptyReconnectState />
        ) : (
          <section className="relative mt-6">
            {/* Section heading */}
            <div className="mb-4 sm:mb-5">
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-stone-400
                  dark:text-slate-500
                  sm:text-[10px]
                "
              >
                Action required
              </p>

              <h2
                className="
                  mt-1
                  text-base
                  font-black
                  tracking-tight
                  text-stone-950
                  dark:text-white
                  sm:text-lg
                "
              >
                Accounts needing attention
              </h2>

              <p
                className="
                  mt-1.5
                  max-w-2xl
                  text-xs
                  leading-5
                  text-stone-500
                  dark:text-slate-400
                  sm:text-sm
                "
              >
                Select reconnect to start the platform&apos;s secure OAuth
                authorization flow.
              </p>
            </div>

            {/* Responsive card grid */}
            <div
              className="
                grid
                min-w-0
                grid-cols-1
                gap-3
                sm:gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {disconnected.map((account) => (
                <ReconnectCard
                  key={account?.id ?? account?.name}
                  account={account}
                  onReconnect={() => connectAccount(account.name)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div
          className="
            mt-4
            px-1
            text-[10px]
            leading-5
            text-stone-400
            dark:text-slate-500
          "
        >
          Reconnecting an account does not remove your existing posts or
          publishing history.
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RECONNECT CARD
========================================================= */

function ReconnectCard({ account, onReconnect }) {
  const accountName = account?.name || "Social account";

  return (
    <article
      className="
        group
        relative
        flex
        min-w-0
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-stone-200/80
        bg-white/75
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-stone-300
        hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]
        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
        dark:hover:border-white/[0.13]
        dark:hover:shadow-[0_24px_70px_rgba(0,0,0,0.34)]
      "
    >
      {/* =====================================================
          CARD DECORATION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-16
          -top-16
          h-36
          w-36
          rounded-full
          bg-amber-400/[0.07]
          blur-3xl
          transition-opacity
          duration-300
          group-hover:bg-amber-400/[0.10]
          dark:bg-amber-400/[0.04]
          dark:group-hover:bg-amber-400/[0.055]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -right-16
          h-40
          w-40
          rounded-full
          bg-orange-400/[0.045]
          blur-3xl
          dark:bg-orange-400/[0.025]
        "
      />

      {/* Top edge */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-20
          h-px
          bg-gradient-to-r
          from-transparent
          via-amber-400/30
          to-transparent
          dark:via-amber-400/20
        "
      />

      {/* Glass reflection */}
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
          CARD TOP
      ====================================================== */}

      <div className="relative z-10 flex min-w-0 items-start gap-3 p-4 sm:p-5">
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
            border-amber-200/80
            bg-amber-50/80
            text-amber-600
            shadow-sm
            transition-all
            duration-300
            group-hover:-translate-y-0.5
            group-hover:shadow-[0_12px_28px_rgba(245,158,11,0.10)]
            dark:border-amber-400/[0.14]
            dark:bg-amber-400/[0.07]
            dark:text-amber-400
            dark:group-hover:shadow-[0_12px_30px_rgba(245,158,11,0.08)]
          "
        >
          <AlertCircle
            size={19}
            strokeWidth={1.9}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-start gap-2">
            <h3
              className="
                min-w-0
                max-w-full
                break-words
                text-sm
                font-black
                tracking-tight
                text-stone-950
                dark:text-white
                sm:text-[15px]
              "
              title={accountName}
            >
              {accountName}
            </h3>

            <span
              className="
                shrink-0
                rounded-full
                border
                border-amber-200/80
                bg-amber-50/80
                px-2
                py-1
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-amber-700
                dark:border-amber-400/[0.15]
                dark:bg-amber-400/[0.07]
                dark:text-amber-300
              "
            >
              Disconnected
            </span>
          </div>

          <p
            className="
              mt-1.5
              text-xs
              leading-5
              text-stone-500
              dark:text-slate-400
            "
          >
            This account needs to be authorized again before publishing.
          </p>
        </div>
      </div>

      {/* =====================================================
          STATUS MESSAGE
      ====================================================== */}

      <div className="relative z-10 px-4 sm:px-5">
        <div
          className="
            rounded-2xl
            border
            border-amber-200/70
            bg-amber-50/65
            px-3.5
            py-3
            backdrop-blur-sm
            dark:border-amber-400/[0.14]
            dark:bg-amber-400/[0.055]
          "
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              size={14}
              className="
                mt-0.5
                shrink-0
                text-amber-600
                dark:text-amber-400
              "
              strokeWidth={2}
            />

            <p
              className="
                text-[10px]
                leading-5
                text-amber-900/75
                dark:text-amber-200/75
                sm:text-xs
              "
            >
              Your previous authorization is no longer active. Reconnect to
              restore publishing access.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ACTION
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mt-4
          border-t
          border-stone-200/70
          bg-stone-50/45
          px-4
          py-4
          dark:border-white/[0.07]
          dark:bg-white/[0.025]
          sm:px-5
          sm:py-5
        "
      >
        <button
          type="button"
          onClick={onReconnect}
          className="
            inline-flex
            h-10
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-transparent
            bg-slate-950
            px-4
            text-xs
            font-bold
            text-white
            shadow-[0_8px_22px_rgba(15,23,42,0.10)]
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-slate-800
            hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)]
            focus:outline-none
            focus:ring-2
            focus:ring-slate-900/15
            focus:ring-offset-2
            active:translate-y-0
            dark:bg-white
            dark:text-slate-950
            dark:shadow-[0_8px_24px_rgba(0,0,0,0.20)]
            dark:hover:bg-slate-100
            dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.28)]
            dark:focus:ring-white/20
            dark:focus:ring-offset-[#0d1422]
          "
        >
          <RefreshCw
            size={14}
            strokeWidth={2}
            className="
              transition-transform
              duration-500
              group-hover:rotate-180
            "
          />

          <span className="truncate">
            Reconnect account
          </span>
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyReconnectState() {
  return (
    <section
      className="
        relative
        mt-6
        overflow-hidden
        rounded-[26px]
        border
        border-stone-200/80
        bg-white/75
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
      "
    >
      {/* Top edge */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          z-20
          h-px
          bg-gradient-to-r
          from-transparent
          via-emerald-400/30
          to-transparent
          dark:via-emerald-400/20
        "
      />

      {/* Ambient glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-64
          w-64
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-emerald-400/[0.06]
          blur-3xl
          dark:bg-emerald-400/[0.035]
        "
      />

      {/* Glass reflection */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-24
          bg-gradient-to-b
          from-white/45
          to-transparent
          dark:from-white/[0.045]
          dark:to-transparent
        "
      />

      <div
        className="
          relative
          z-10
          flex
          min-h-[360px]
          flex-col
          items-center
          justify-center
          px-5
          py-16
          text-center
          sm:px-8
        "
      >
        {/* Success icon */}
        <div
          className="
            relative
            grid
            h-16
            w-16
            place-items-center
            rounded-[22px]
            border
            border-emerald-200/80
            bg-emerald-50/80
            text-emerald-600
            shadow-[0_12px_35px_rgba(16,185,129,0.08)]
            dark:border-emerald-400/[0.15]
            dark:bg-emerald-400/[0.07]
            dark:text-emerald-400
            dark:shadow-[0_12px_35px_rgba(16,185,129,0.06)]
          "
        >
          <ShieldCheck
            size={25}
            strokeWidth={1.8}
          />

          <span
            className="
              pointer-events-none
              absolute
              -inset-2
              rounded-[30px]
              bg-emerald-400/[0.08]
              blur-xl
              dark:bg-emerald-400/[0.045]
            "
          />
        </div>

        <h2
          className="
            mt-5
            text-base
            font-black
            tracking-tight
            text-stone-950
            dark:text-white
            sm:text-lg
          "
        >
          All accounts are connected
        </h2>

        <p
          className="
            mt-2
            max-w-md
            text-xs
            leading-6
            text-stone-500
            dark:text-slate-400
            sm:text-sm
          "
        >
          There are currently no disconnected accounts that need to be
          reconnected.
        </p>

        <div
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-emerald-200/80
            bg-emerald-50/80
            px-3
            py-1.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.12em]
            text-emerald-700
            dark:border-emerald-400/[0.15]
            dark:bg-emerald-400/[0.07]
            dark:text-emerald-300
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-500
              text-emerald-400
              shadow-[0_0_9px_currentColor]
              dark:bg-emerald-400
            "
          />

          Everything is connected
        </div>
      </div>
    </section>
  );
}