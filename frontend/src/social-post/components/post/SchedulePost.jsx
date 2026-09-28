import { CalendarClock, Check } from "lucide-react";

export default function SchedulePost({
  checked,
  onChange,
  date,
  setDate,
}) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-2xl
        border
        p-4
        backdrop-blur-xl
        transition-all
        duration-300

        ${
          checked
            ? `
              border-orange-200/80
              bg-orange-50/55
              shadow-[0_12px_35px_rgba(249,115,22,0.07)]

              dark:border-orange-400/15
              dark:bg-orange-400/[0.035]
              dark:shadow-[0_15px_45px_rgba(0,0,0,0.20)]
            `
            : `
              border-stone-200/80
              bg-white/65
              shadow-[0_10px_30px_rgba(15,23,42,0.03)]

              dark:border-white/[0.08]
              dark:bg-white/[0.025]
              dark:shadow-[0_15px_40px_rgba(0,0,0,0.16)]
            `
        }
      `}
    >
      {/* =====================================================
          AMBIENT GLOW
      ====================================================== */}

      {checked && (
        <>
          <div
            className="
              pointer-events-none
              absolute
              -right-12
              -top-12
              h-28
              w-28
              rounded-full
              bg-orange-400/10
              blur-3xl
              dark:bg-orange-500/[0.05]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-16
              left-1/3
              h-24
              w-24
              rounded-full
              bg-cyan-400/[0.05]
              blur-3xl
              dark:bg-cyan-500/[0.025]
            "
          />
        </>
      )}

      {/* =====================================================
          TOP REFLECTION
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-16
          bg-gradient-to-b
          from-white/35
          to-transparent
          dark:from-white/[0.035]
          dark:to-transparent
        "
      />

      {/* =====================================================
          TOP EDGE
      ====================================================== */}

      <div
        className={`
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          to-transparent
          ${
            checked
              ? "via-orange-400/35 dark:via-orange-400/20"
              : "via-stone-300/40 dark:via-white/[0.10]"
          }
        `}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* ===================================================
            CUSTOM CHECKBOX
        ==================================================== */}

        <button
          type="button"
          role="checkbox"
          aria-checked={checked}
          aria-label="Schedule for later"
          onClick={() => onChange(!checked)}
          className={`
            relative
            grid
            h-11
            w-11
            shrink-0
            place-items-center
            rounded-xl
            border
            transition-all
            duration-200

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-orange-400/40

            ${
              checked
                ? `
                  border-orange-500
                  bg-orange-500
                  text-white
                  shadow-[0_8px_22px_rgba(249,115,22,0.22)]

                  dark:border-orange-400
                  dark:bg-orange-500
                  dark:text-white
                `
                : `
                  border-stone-200
                  bg-white/80
                  text-transparent

                  hover:border-stone-300
                  hover:bg-white

                  dark:border-white/[0.10]
                  dark:bg-white/[0.045]
                  dark:hover:border-white/[0.18]
                  dark:hover:bg-white/[0.07]
                `
            }
          `}
        >
          {checked ? (
            <Check
              size={18}
              strokeWidth={2.8}
            />
          ) : (
            <span
              className="
                h-4
                w-4
                rounded-md
                border
                border-stone-300
                bg-stone-50
                dark:border-white/[0.14]
                dark:bg-white/[0.04]
              "
            />
          )}
        </button>

        {/* ===================================================
            LABEL
        ==================================================== */}

        <label
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => onChange(!checked)}
        >
          <div className="flex items-center gap-2">
            <span
              className={`
                grid
                h-7
                w-7
                shrink-0
                place-items-center
                rounded-lg
                border

                ${
                  checked
                    ? `
                      border-orange-200/80
                      bg-orange-100/70
                      text-orange-600

                      dark:border-orange-400/10
                      dark:bg-orange-400/[0.08]
                      dark:text-orange-400
                    `
                    : `
                      border-stone-200/80
                      bg-stone-50
                      text-stone-400

                      dark:border-white/[0.07]
                      dark:bg-white/[0.035]
                      dark:text-slate-500
                    `
                }
              `}
            >
              <CalendarClock
                size={15}
                strokeWidth={1.9}
              />
            </span>

            <span
              className="
                text-sm
                font-bold
                tracking-tight
                text-stone-800
                dark:text-slate-200
              "
            >
              Schedule for later
            </span>
          </div>

          <span
            className="
              mt-1.5
              block
              text-xs
              leading-5
              text-stone-400
              dark:text-slate-500
            "
          >
            Turn this on to auto-publish the post at the selected
            date and time.
          </span>
        </label>

        {/* ===================================================
            DATE / TIME
        ==================================================== */}

        {checked && (
          <div className="w-full sm:w-auto sm:min-w-[230px]">
            <label
              htmlFor="schedule-date"
              className="sr-only"
            >
              Schedule date and time
            </label>

            <div className="relative">
              <CalendarClock
                size={15}
                strokeWidth={1.8}
                className="
                  pointer-events-none
                  absolute
                  left-3
                  top-1/2
                  z-10
                  -translate-y-1/2
                  text-orange-500
                  dark:text-orange-400
                "
              />

              <input
                id="schedule-date"
                type="datetime-local"
                value={date}
                min={getCurrentDateTime()}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required={checked}
                className="
                  block
                  w-full
                  rounded-xl
                  border
                  border-orange-200/80
                  bg-white/80
                  py-3
                  pl-10
                  pr-3
                  text-xs
                  font-semibold
                  text-stone-800
                  shadow-sm
                  outline-none
                  backdrop-blur-xl
                  transition-all
                  duration-200

                  placeholder:text-stone-400

                  focus:border-orange-400
                  focus:bg-white
                  focus:ring-2
                  focus:ring-orange-500/10

                  dark:border-orange-400/15
                  dark:bg-white/[0.045]
                  dark:text-slate-200
                  dark:focus:border-orange-400/40
                  dark:focus:bg-white/[0.065]
                  dark:focus:ring-orange-400/10
                "
              />
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          HELPER / ACTIVE STATUS
      ====================================================== */}

      {checked && (
        <div
          className="
            relative
            mt-4
            overflow-hidden
            rounded-xl
            border
            border-orange-100/80
            bg-white/50
            px-3
            py-3
            backdrop-blur-lg

            dark:border-orange-400/10
            dark:bg-white/[0.025]
          "
        >
          {/* Status glow */}
          <div
            className="
              pointer-events-none
              absolute
              -right-8
              -top-8
              h-16
              w-16
              rounded-full
              bg-orange-400/[0.06]
              blur-2xl
              dark:bg-orange-500/[0.035]
            "
          />

          <div className="relative flex items-start gap-2.5">
            {/* Status dot */}
            <span
              className="
                mt-1
                h-1.5
                w-1.5
                shrink-0
                rounded-full
                bg-emerald-500
                shadow-[0_0_8px_rgba(16,185,129,0.65)]
                dark:bg-emerald-400
              "
            />

            <div className="min-w-0">
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-orange-600
                  dark:text-orange-400
                "
              >
                Auto-publish enabled
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  font-medium
                  leading-4
                  text-stone-500
                  dark:text-slate-500
                "
              >
                This post will be saved in the publishing queue
                and automatically published at the selected date
                and time. Keep the backend server running.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CURRENT DATE / TIME
========================================================= */

function getCurrentDateTime() {
  const now = new Date();

  const offset = now.getTimezoneOffset();

  const localDate = new Date(
    now.getTime() - offset * 60 * 1000,
  );

  return localDate.toISOString().slice(0, 16);
}