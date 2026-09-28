import SocialAccountCard from "./SocialAccountCard.jsx";
import { useSocialAccounts } from "../../hooks/useSocialAccounts.js";
import Loader from "../common/Loader.jsx";

export default function ConnectedAccounts() {
  const {
    accounts = [],
    loading,
    error,
    notice,
    connectAccount,
    disconnectAccount,
    selectLocation,
  } = useSocialAccounts();

  if (loading) {
    return (
      <div
        className="
          relative
          flex
          min-h-[220px]
          w-full
          min-w-0
          items-center
          justify-center
          overflow-hidden
          rounded-[22px]
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
        {/* Ambient glow */}
        <div
          className="
            pointer-events-none
            absolute
            -left-16
            -top-16
            h-36
            w-36
            rounded-full
            bg-orange-400/[0.08]
            blur-3xl
            dark:bg-orange-400/[0.06]
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
            bg-cyan-400/[0.07]
            blur-3xl
            dark:bg-cyan-400/[0.05]
          "
        />

        {/* Top glass reflection */}
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

        <div className="relative z-10">
          <Loader />
        </div>
      </div>
    );
  }

  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  return (
    <div className="relative w-full min-w-0 max-w-full">
      {/* =====================================================
          NOTICES
      ====================================================== */}

      {(notice || error) && (
        <div className="relative z-10 w-full min-w-0 space-y-3">
          {notice && (
            <div
              role="status"
              className={`
                relative
                flex
                w-full
                min-w-0
                items-start
                gap-3
                overflow-hidden
                rounded-[18px]
                border
                px-3.5
                py-3
                text-xs
                shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                backdrop-blur-xl
                sm:px-4
                sm:py-3.5
                ${
                  notice.type === "success"
                    ? `
                      border-emerald-200/80
                      bg-emerald-50/80
                      text-emerald-700
                      dark:border-emerald-400/[0.16]
                      dark:bg-emerald-400/[0.07]
                      dark:text-emerald-300
                    `
                    : `
                      border-blue-200/80
                      bg-blue-50/80
                      text-blue-700
                      dark:border-blue-400/[0.16]
                      dark:bg-blue-400/[0.07]
                      dark:text-blue-300
                    `
                }
              `}
            >
              {/* Notice glow */}
              <div
                className={`
                  pointer-events-none
                  absolute
                  -left-8
                  -top-8
                  h-20
                  w-20
                  rounded-full
                  blur-2xl
                  ${
                    notice.type === "success"
                      ? "bg-emerald-400/[0.10] dark:bg-emerald-400/[0.08]"
                      : "bg-blue-400/[0.10] dark:bg-blue-400/[0.08]"
                  }
                `}
              />

              <span
                className={`
                  relative
                  z-10
                  mt-1.5
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  shadow-[0_0_10px_currentColor]
                  ${
                    notice.type === "success"
                      ? "bg-emerald-500 text-emerald-400 dark:bg-emerald-400"
                      : "bg-blue-500 text-blue-400 dark:bg-blue-400"
                  }
                `}
              />

              <p className="relative z-10 min-w-0 flex-1 break-words font-semibold leading-5">
                {notice.message}
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="
                relative
                flex
                w-full
                min-w-0
                items-start
                gap-3
                overflow-hidden
                rounded-[18px]
                border
                border-rose-200/80
                bg-rose-50/80
                px-3.5
                py-3
                text-xs
                text-rose-700
                shadow-[0_10px_30px_rgba(15,23,42,0.04)]
                backdrop-blur-xl
                dark:border-rose-400/[0.16]
                dark:bg-rose-400/[0.07]
                dark:text-rose-300
                sm:px-4
                sm:py-3.5
              "
            >
              {/* Error glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -left-8
                  -top-8
                  h-20
                  w-20
                  rounded-full
                  bg-rose-400/[0.10]
                  blur-2xl
                  dark:bg-rose-400/[0.07]
                "
              />

              <span
                className="
                  relative
                  z-10
                  mt-1.5
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-rose-500
                  text-rose-400
                  shadow-[0_0_10px_currentColor]
                  dark:bg-rose-400
                "
              />

              <p className="relative z-10 min-w-0 flex-1 break-words font-semibold leading-5">
                {error}
              </p>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          ACCOUNTS
      ====================================================== */}

      {safeAccounts.length > 0 ? (
        <div
          className="
            relative
            mt-4
            grid
            w-full
            min-w-0
            max-w-full
            grid-cols-1
            gap-3
            sm:grid-cols-2
            sm:gap-4
            2xl:grid-cols-3
          "
        >
          {safeAccounts.map((account, index) => (
            <div
              key={
                account?.id ??
                account?._id ??
                account?.name ??
                `social-account-${index}`
              }
              className="
                flex
                min-w-0
                w-full
                max-w-full
              "
            >
              <SocialAccountCard
                account={account}
                onConnect={connectAccount}
                onDisconnect={disconnectAccount}
                onReconnect={connectAccount}
                onLocationChange={selectLocation}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyAccounts />
      )}
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
        relative
        mt-4
        flex
        min-h-[230px]
        w-full
        min-w-0
        flex-col
        items-center
        justify-center
        overflow-hidden
        rounded-[22px]
        border
        border-dashed
        border-stone-300/80
        bg-white/65
        px-5
        py-10
        text-center
        shadow-[0_14px_40px_rgba(15,23,42,0.04)]
        backdrop-blur-xl
        transition-all
        duration-300
        sm:min-h-[250px]
        sm:px-8
        dark:border-white/[0.10]
        dark:bg-[#0d1422]/70
        dark:shadow-[0_18px_55px_rgba(0,0,0,0.22)]
      "
    >
      {/* Ambient glows */}
      <div
        className="
          pointer-events-none
          absolute
          -left-16
          -top-16
          h-36
          w-36
          rounded-full
          bg-orange-400/[0.08]
          blur-3xl
          dark:bg-orange-400/[0.055]
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
          bg-violet-400/[0.07]
          blur-3xl
          dark:bg-violet-400/[0.05]
        "
      />

      {/* Top glass reflection */}
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

      {/* Top edge */}
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

      {/* Icon */}
      <div
        className="
          relative
          z-10
          grid
          h-12
          w-12
          shrink-0
          place-items-center
          rounded-2xl
          border
          border-stone-200/80
          bg-white/85
          text-stone-400
          shadow-[0_10px_28px_rgba(15,23,42,0.06)]
          ring-1
          ring-black/[0.02]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-orange-200
          hover:text-orange-500
          hover:shadow-[0_14px_35px_rgba(249,115,22,0.10)]
          dark:border-white/[0.08]
          dark:bg-white/[0.045]
          dark:text-slate-500
          dark:ring-white/[0.03]
          dark:hover:border-orange-400/[0.20]
          dark:hover:bg-orange-400/[0.07]
          dark:hover:text-orange-400
          dark:hover:shadow-[0_14px_35px_rgba(249,115,22,0.08)]
        "
      >
        <span className="text-xl font-light leading-none">+</span>
      </div>

      {/* Content */}
      <h3
        className="
          relative
          z-10
          mt-4
          text-sm
          font-black
          tracking-tight
          text-stone-900
          dark:text-white
        "
      >
        No social accounts connected
      </h3>

      <p
        className="
          relative
          z-10
          mt-1.5
          max-w-sm
          break-words
          text-xs
          leading-5
          text-stone-500
          dark:text-slate-400
          sm:text-sm
        "
      >
        Connect your first social platform to start publishing content from
        one place.
      </p>

      {/* Bottom accent */}
      <div
        className="
          relative
          z-10
          mt-5
          h-px
          w-20
          bg-gradient-to-r
          from-transparent
          via-orange-400/40
          to-transparent
          dark:via-orange-400/30
        "
      />
    </div>
  );
}