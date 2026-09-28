
import { useSocialAccounts } from "../../hooks/useSocialAccounts.js";

export default function PlatformSelector({
  selected = [],
  onChange,
}) {
  const { accounts = [] } = useSocialAccounts();

  const connectedAccounts = accounts.filter(
    (account) => account?.connected,
  );

  /* =========================================================
     NO CONNECTED ACCOUNT
  ========================================================== */

  if (!connectedAccounts.length) {
    return (
      <div
        className="
          relative overflow-hidden rounded-2xl
          border border-dashed
          border-stone-300/80
          bg-stone-50/80
          px-4 py-4
          text-sm text-stone-500
          backdrop-blur-xl
          dark:border-white/[0.10]
          dark:bg-white/[0.025]
          dark:text-slate-400
        "
      >
        {/* Ambient glow */}
        <div
          className="
            pointer-events-none absolute
            -right-8 -top-8 h-20 w-20
            rounded-full bg-orange-400/10
            blur-2xl
            dark:bg-orange-500/[0.05]
          "
        />

        <div className="relative flex items-start gap-3">
          <div
            className="
              grid h-9 w-9 shrink-0
              place-items-center rounded-xl
              border border-stone-200
              bg-white
              text-stone-500
              shadow-sm
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-slate-400
            "
          >
            <span className="text-base">+</span>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-stone-700 dark:text-slate-200">
              No connected accounts
            </p>

            <p className="mt-1 text-xs leading-5 text-stone-500 dark:text-slate-400">
              Connect a social account before selecting a
              publishing platform.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     CONNECTED ACCOUNTS
  ========================================================== */

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {connectedAccounts.map((account) => {
        const isSelected = selected.includes(
          account.name,
        );

        return (
          <button
            key={account.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() =>
              onChange(
                isSelected
                  ? selected.filter(
                      (item) => item !== account.name,
                    )
                  : [
                      ...selected,
                      account.name,
                    ],
              )
            }
            className={`
              group relative min-w-0
              overflow-hidden rounded-2xl
              border p-3.5 text-left
              transition-all duration-200
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-orange-400/50
              ${
                isSelected
                  ? `
                    border-stone-900
                    bg-stone-900
                    text-white
                    shadow-[0_12px_30px_rgba(15,23,42,0.14)]
                    dark:border-white
                    dark:bg-white
                    dark:text-slate-950
                    dark:shadow-[0_12px_30px_rgba(255,255,255,0.08)]
                  `
                  : `
                    border-stone-200/80
                    bg-white/65
                    text-stone-800
                    hover:-translate-y-0.5
                    hover:border-stone-300
                    hover:bg-white
                    hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]
                    dark:border-white/[0.08]
                    dark:bg-white/[0.025]
                    dark:text-slate-200
                    dark:hover:border-white/[0.14]
                    dark:hover:bg-white/[0.055]
                    dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.18)]
                  `
              }
            `}
          >
            {/* Selected glow */}
            {isSelected && (
              <div
                className="
                  pointer-events-none absolute
                  -right-8 -top-8 h-24 w-24
                  rounded-full bg-orange-400/20
                  blur-2xl
                  dark:bg-orange-500/10
                "
              />
            )}

            {/* Top reflection */}
            <div
              className={`
                pointer-events-none absolute
                inset-x-0 top-0 h-10
                bg-gradient-to-b
                from-white/20 to-transparent
                ${
                  isSelected
                    ? "dark:from-white/[0.08]"
                    : "dark:from-white/[0.035]"
                }
              `}
            />

            <div className="relative flex min-w-0 items-center gap-3">
              {/* Platform Icon */}
              <span
                className={`
                  grid h-10 w-10 shrink-0
                  place-items-center
                  rounded-xl border
                  text-xl
                  transition-transform duration-200
                  group-hover:scale-105
                  ${
                    isSelected
                      ? `
                        border-white/15
                        bg-white/10
                        dark:border-slate-900/10
                        dark:bg-slate-950/[0.06]
                      `
                      : `
                        border-stone-200/80
                        bg-stone-50
                        dark:border-white/[0.07]
                        dark:bg-white/[0.045]
                      `
                  }
                `}
                style={{
                  color: account.color,
                }}
              >
                {account.icon}
              </span>

              {/* Account Info */}
              <span className="min-w-0 flex-1">
                <span
                  className={`
                    block truncate
                    text-sm font-bold
                    ${
                      isSelected
                        ? "text-white dark:text-slate-950"
                        : "text-stone-800 dark:text-slate-200"
                    }
                  `}
                >
                  {account.name}
                </span>

                {account.handle && (
                  <small
                    className={`
                      mt-0.5 block truncate
                      text-[11px] font-medium
                      ${
                        isSelected
                          ? "text-white/65 dark:text-slate-500"
                          : "text-stone-400 dark:text-slate-500"
                      }
                    `}
                  >
                    {account.handle}
                  </small>
                )}
              </span>

              {/* Selection Indicator */}
              <span
                className={`
                  grid h-7 w-7 shrink-0
                  place-items-center
                  rounded-full border
                  text-sm font-black
                  transition-all duration-200
                  ${
                    isSelected
                      ? `
                        border-white/20
                        bg-white/15
                        text-white
                        dark:border-slate-900/10
                        dark:bg-slate-950/[0.08]
                        dark:text-slate-950
                      `
                      : `
                        border-stone-200
                        bg-white
                        text-stone-400
                        group-hover:border-stone-300
                        group-hover:text-stone-700
                        dark:border-white/[0.08]
                        dark:bg-white/[0.04]
                        dark:text-slate-500
                        dark:group-hover:border-white/[0.14]
                        dark:group-hover:text-white
                      `
                  }
                `}
              >
                {isSelected ? "✓" : "+"}
              </span>
            </div>

            {/* Selected status */}
            {isSelected && (
              <div
                className="
                  relative mt-3 flex items-center
                  gap-1.5 text-[9px]
                  font-black uppercase
                  tracking-[0.12em]
                  text-white/60
                  dark:text-slate-500
                "
              >
                <span
                  className="
                    h-1.5 w-1.5 rounded-full
                    bg-emerald-400
                    shadow-[0_0_7px_rgba(52,211,153,0.8)]
                    dark:bg-emerald-500
                  "
                />

                Selected for publishing
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

