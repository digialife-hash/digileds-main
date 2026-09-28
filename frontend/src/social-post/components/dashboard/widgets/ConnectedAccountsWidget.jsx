import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Link2,
  Share2,
} from "lucide-react";

import { useSocialAccounts } from "../../../hooks/useSocialAccounts.js";

export default function ConnectedAccountsWidget() {
  const { accounts = [], connectAccount } = useSocialAccounts();

  const connected = Array.isArray(accounts)
    ? accounts.filter(
        (account) => account?.connected === true
      )
    : [];

  const googleBusiness = Array.isArray(accounts)
    ? accounts.find(
        (account) => account?.name === "Google Business"
      )
    : null;

  return (
    <section
      className="
        group relative overflow-hidden rounded-[24px]
        border border-stone-200/80
        bg-white/75
        shadow-[0_18px_55px_rgba(15,23,42,0.06)]
        backdrop-blur-xl
        transition-all duration-300
        hover:border-stone-300/80
        hover:shadow-[0_22px_65px_rgba(15,23,42,0.09)]
        dark:border-white/[0.08]
        dark:bg-[#0d1422]/80
        dark:shadow-[0_20px_65px_rgba(0,0,0,0.28)]
        dark:hover:border-white/[0.13]
        dark:hover:shadow-[0_25px_75px_rgba(0,0,0,0.38)]
      "
    >
      {/* =====================================================
          AMBIENT GLOW
      ====================================================== */}

      {/* <div
        className="
          pointer-events-none absolute -right-20 -top-20
          h-52 w-52 rounded-full
          bg-emerald-400/10 blur-[90px]
          dark:bg-emerald-400/[0.08]
        "
      /> */}

      {/* <div
        className="
          pointer-events-none absolute -bottom-20 -left-16
          h-48 w-48 rounded-full
          bg-cyan-400/[0.06] blur-[80px]
          dark:bg-cyan-400/[0.05]
        "
      /> */}

      {/* <div
        className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent
          via-emerald-400/30
          to-transparent
          dark:via-emerald-400/20
        "
      /> */}

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative flex items-start justify-between gap-4
          border-b border-stone-200/70
          px-5 py-5
          sm:px-6
          dark:border-white/[0.07]
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          {/* ICON */}

          <div
            className="
              relative grid h-10 w-10 shrink-0
              place-items-center overflow-hidden
              rounded-xl
              border border-emerald-200/70
              bg-emerald-50
              text-emerald-600
              shadow-sm
              dark:border-emerald-400/15
              dark:bg-emerald-400/[0.08]
              dark:text-emerald-400
            "
          >
            <div
              className="
                pointer-events-none absolute inset-0
                bg-gradient-to-br
                from-emerald-400/10
                via-transparent
                to-transparent
              "
            />

            <Share2
              size={18}
              strokeWidth={1.8}
              className="relative"
            />
          </div>

          {/* TITLE */}

          <div className="min-w-0">
            <h2
              className="
                truncate text-[15px] font-black tracking-tight
                text-stone-900
                dark:text-white
              "
            >
              Connected accounts
            </h2>

            <p
              className="
                mt-0.5 truncate text-xs
                text-stone-500
                dark:text-slate-400
              "
            >
              Where your content can be published
            </p>
          </div>
        </div>

        {/* MANAGE */}

        <Link
          to="/dashboard/social-accounts"
          className="
            group/manage inline-flex shrink-0
            items-center gap-1
            text-xs font-bold
            text-orange-600
            transition-colors duration-200
            hover:text-orange-700
            dark:text-orange-400
            dark:hover:text-orange-300
          "
        >
          Manage

          <ArrowRight
            size={13}
            strokeWidth={2}
            className="
              transition-transform duration-200
              group-hover/manage:translate-x-0.5
            "
          />
        </Link>
      </div>

      {/* =====================================================
          ACCOUNTS
      ====================================================== */}

      <div className="relative p-4 sm:p-5">
        {connected.length > 0 ? (
          <div className="space-y-2">
            {connected.map((account, index) => (
              <ConnectedAccount
                key={
                  account?.id ??
                  account?._id ??
                  `${account?.name || "account"}-${index}`
                }
                account={account}
              />
            ))}
          </div>
        ) : (
          <EmptyAccounts />
        )}

        <GoogleBusinessDashboardCard
          account={googleBusiness}
          onConnect={connectAccount}
        />
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      {connected.length > 0 && (
        <div
          className="
            border-t border-stone-200/70
            bg-stone-50/30
            px-5 py-3.5
            sm:px-6
            dark:border-white/[0.07]
            dark:bg-white/[0.015]
          "
        >
          <Link
            to="/dashboard/create-post"
            className="
              group/create inline-flex items-center gap-1.5
              text-xs font-bold
              text-stone-500
              transition-colors duration-200
              hover:text-stone-900
              dark:text-slate-400
              dark:hover:text-white
            "
          >
            Create a post

            <ArrowRight
              size={13}
              strokeWidth={2}
              className="
                transition-transform duration-200
                group-hover/create:translate-x-0.5
              "
            />
          </Link>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   GOOGLE BUSINESS DASHBOARD CARD
========================================================= */

function GoogleBusinessDashboardCard({
  account,
  onConnect,
}) {
  const connected = Boolean(account?.connected);

  const location =
    account?.providerData?.locationTitle;

  return (
    <div
      className="
        relative mt-4 overflow-hidden
        rounded-2xl
        border border-blue-200/70
        bg-gradient-to-br
        from-blue-50/90
        via-white/80
        to-white/60
        p-4
        shadow-sm
        transition-all duration-300
        hover:shadow-md
        dark:border-blue-400/15
        dark:from-blue-500/[0.09]
        dark:via-blue-400/[0.04]
        dark:to-white/[0.02]
        dark:shadow-none
      "
    >
      {/* GOOGLE CARD GLOW */}

      <div
        className="
          pointer-events-none absolute
          -right-12 -top-12
          h-32 w-32 rounded-full
          bg-blue-400/10
          blur-[60px]
          dark:bg-blue-400/[0.08]
        "
      />

      <div className="relative flex items-start gap-3">
        {/* GOOGLE ICON */}

        <div
          className="
            relative grid h-10 w-10 shrink-0
            place-items-center
            rounded-xl
            border border-blue-100
            bg-white
            text-lg font-black
            text-blue-600
            shadow-sm
            ring-1 ring-blue-100
            dark:border-blue-400/10
            dark:bg-white/[0.07]
            dark:text-blue-400
            dark:ring-blue-400/10
          "
        >
          G
        </div>

        {/* INFO */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="
                text-sm font-black
                text-stone-900
                dark:text-white
              "
            >
              Google Business Profile
            </h3>

            <span
              className={`
                rounded-full px-2 py-1
                text-[8px] font-black
                uppercase tracking-[0.08em]
                ${
                  connected
                    ? `
                      bg-emerald-100
                      text-emerald-700
                      dark:bg-emerald-400/10
                      dark:text-emerald-400
                    `
                    : `
                      bg-amber-100
                      text-amber-700
                      dark:bg-amber-400/10
                      dark:text-amber-400
                    `
                }
              `}
            >
              {connected
                ? "Connected"
                : "Not connected"}
            </span>
          </div>

          <p
            className="
              mt-1 text-[10px] leading-4
              text-stone-500
              dark:text-slate-400
            "
          >
            Publish local updates and manage customer reviews.
          </p>

          {connected && (
            <p
              className="
                mt-1 truncate
                text-[10px] font-bold
                text-blue-700
                dark:text-blue-400
              "
            >
              {location ||
                account.handle ||
                "Business location connected"}
            </p>
          )}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="relative mt-3 flex flex-wrap gap-2">
        {connected ? (
          <>
            <Link
              to="/dashboard/create-post"
              className="
                rounded-lg
                bg-blue-600
                px-3 py-2
                text-[10px] font-black
                text-white
                shadow-sm
                transition-all duration-200
                hover:-translate-y-0.5
                hover:bg-blue-700
                hover:shadow-md
                dark:bg-blue-500
                dark:hover:bg-blue-400
              "
            >
              Create post
            </Link>

            <Link
              to="/dashboard/engagement"
              className="
                rounded-lg
                border border-blue-200
                bg-white
                px-3 py-2
                text-[10px] font-black
                text-blue-700
                transition-all duration-200
                hover:bg-blue-50
                dark:border-blue-400/15
                dark:bg-white/[0.05]
                dark:text-blue-400
                dark:hover:bg-blue-400/10
              "
            >
              View reviews
            </Link>
          </>
        ) : (
          <button
            type="button"
            onClick={() =>
              onConnect?.("Google Business")
            }
            className="
              rounded-lg
              bg-blue-600
              px-3 py-2
              text-[10px] font-black
              text-white
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-blue-700
              hover:shadow-md
              dark:bg-blue-500
              dark:hover:bg-blue-400
            "
          >
            Connect Google Business
          </button>
        )}

        <Link
          to="/dashboard/social-accounts"
          className="
            rounded-lg
            border border-stone-200
            bg-white
            px-3 py-2
            text-[10px] font-black
            text-stone-600
            transition-all duration-200
            hover:bg-stone-50
            dark:border-white/[0.08]
            dark:bg-white/[0.045]
            dark:text-slate-300
            dark:hover:bg-white/[0.08]
          "
        >
          Manage
        </Link>
      </div>
    </div>
  );
}

/* =========================================================
   CONNECTED ACCOUNT
========================================================= */

function ConnectedAccount({ account }) {
  const name =
    account?.name ||
    account?.platform ||
    "Social account";

  const handle =
    account?.handle ||
    account?.username ||
    account?.email ||
    "Connected account";

  const icon =
    account?.icon ||
    "•";

  const iconColor =
    account?.color ||
    "#78716c";

  return (
    <div
      className="
        group/account relative flex min-w-0
        items-center gap-3 overflow-hidden
        rounded-2xl
        border border-transparent
        bg-stone-50/60
        px-3 py-3
        transition-all duration-200
        hover:border-stone-200/70
        hover:bg-white
        hover:shadow-sm
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.08]
        dark:hover:bg-white/[0.045]
        dark:hover:shadow-none
      "
    >
      {/* ROW GLOW */}

      <div
        className="
          pointer-events-none absolute
          -left-8 top-1/2
          h-16 w-16
          -translate-y-1/2
          rounded-full
          bg-emerald-400/5
          blur-2xl
          opacity-0
          transition-opacity duration-300
          group-hover/account:opacity-100
          dark:bg-emerald-400/[0.07]
        "
      />

      {/* ===================================================
          ACCOUNT ICON
      ==================================================== */}

      <div
        className="
          relative grid h-10 w-10 shrink-0
          place-items-center
          overflow-hidden rounded-xl
          border border-stone-200/70
          bg-white
          text-sm font-black
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.06]
        "
        style={{
          color: iconColor,
        }}
      >
        <span className="relative z-10">
          {icon}
        </span>

        <span
          className="
            pointer-events-none absolute inset-0
            bg-gradient-to-br
            from-white/60
            via-transparent
            to-transparent
            dark:from-white/[0.08]
          "
        />
      </div>

      {/* ===================================================
          ACCOUNT INFO
      ==================================================== */}

      <div className="relative min-w-0 flex-1">
        <p
          className="
            truncate text-xs font-black
            text-stone-800
            transition-colors
            group-hover/account:text-stone-950
            dark:text-slate-100
            dark:group-hover/account:text-white
          "
          title={name}
        >
          {name}
        </p>

        <p
          className="
            mt-0.5 truncate
            text-[10px] font-medium
            text-stone-400
            dark:text-slate-500
          "
          title={handle}
        >
          {handle}
        </p>

        {name === "Google Business" &&
          account?.providerData?.locationTitle && (
            <p
              className="
                mt-0.5 truncate
                text-[9px] font-semibold
                text-blue-600
                dark:text-blue-400
              "
            >
              {account.providerData.locationTitle}
            </p>
          )}
      </div>

      {/* ===================================================
          STATUS
      ==================================================== */}

      <div className="flex shrink-0 items-center gap-2">
        {name === "Google Business" && (
          <Link
            to="/dashboard/engagement"
            className="
              hidden rounded-lg
              border border-blue-100
              bg-blue-50
              px-2 py-1
              text-[8px] font-black
              uppercase tracking-[0.08em]
              text-blue-700
              transition-colors
              hover:bg-blue-100
              sm:inline-flex
              dark:border-blue-400/15
              dark:bg-blue-400/[0.08]
              dark:text-blue-400
              dark:hover:bg-blue-400/[0.13]
            "
          >
            Reviews
          </Link>
        )}

        <div
          className="
            inline-flex shrink-0
            items-center gap-1.5
            rounded-full
            border border-emerald-200/70
            bg-emerald-50/70
            px-2 py-1.5
            text-[8px] font-black
            uppercase tracking-[0.08em]
            text-emerald-600
            sm:px-2.5
            dark:border-emerald-400/15
            dark:bg-emerald-400/[0.08]
            dark:text-emerald-400
          "
        >
          <CheckCircle2
            size={10}
            strokeWidth={2}
          />

          <span className="hidden sm:inline">
            Connected
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyAccounts() {
  return (
    <div
      className="
        flex min-h-[190px]
        flex-col items-center justify-center
        rounded-2xl
        border border-dashed
        border-stone-200
        bg-stone-50/40
        px-5 py-8
        text-center
        dark:border-white/[0.09]
        dark:bg-white/[0.02]
      "
    >
      {/* ICON */}

      <div
        className="
          relative grid h-12 w-12
          place-items-center
          rounded-2xl
          border border-stone-200/80
          bg-white
          text-stone-400
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.045]
          dark:text-slate-500
        "
      >
        <Link2
          size={20}
          strokeWidth={1.7}
          className="relative"
        />

        <span
          className="
            pointer-events-none absolute -inset-2
            rounded-3xl
            bg-emerald-400/5
            blur-xl
            dark:bg-emerald-400/[0.08]
          "
        />
      </div>

      {/* TITLE */}

      <h3
        className="
          mt-4 text-sm font-black
          text-stone-800
          dark:text-white
        "
      >
        No accounts connected
      </h3>

      {/* DESCRIPTION */}

      <p
        className="
          mt-1.5 max-w-[240px]
          text-xs leading-5
          text-stone-400
          dark:text-slate-500
        "
      >
        Connect a social account to start publishing
        your content.
      </p>

      {/* BUTTON */}

      <Link
        to="/dashboard/social-accounts"
        className="
          group/connect mt-5
          inline-flex items-center gap-2
          rounded-xl
          bg-stone-950
          px-4 py-2.5
          text-xs font-bold
          text-white
          shadow-sm
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-stone-800
          hover:shadow-lg
          dark:bg-white
          dark:text-slate-950
          dark:hover:bg-slate-100
        "
      >
        <Link2
          size={13}
          strokeWidth={2}
        />

        Connect account

        <ArrowRight
          size={13}
          className="
            transition-transform duration-200
            group-hover/connect:translate-x-0.5
          "
        />
      </Link>
    </div>
  );
}