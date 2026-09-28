import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../layout/PageHeader.jsx";

export default function Security() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f7f7f5] transition-colors duration-300 dark:bg-[#070b14]">
      {/* =========================================================
          AMBIENT BACKGROUND
      ========================================================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-orange-400/[0.035] blur-[110px] dark:bg-orange-400/[0.055]" />
        <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-cyan-400/[0.035] blur-[120px] dark:bg-cyan-400/[0.045]" />
        <div className="absolute bottom-[-160px] left-1/3 h-96 w-96 rounded-full bg-violet-400/[0.025] blur-[130px] dark:bg-violet-400/[0.04]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6 lg:px-7 lg:py-8 xl:px-8 2xl:px-10">
        <PageHeader
          eyebrow="Workspace"
          title="Security"
          description="Keep your admin account protected and manage authentication securely."
        />

        <div className="mt-6 space-y-5">
          {/* =========================================================
              SECURITY STATUS
          ========================================================== */}
          <section
            className="
              relative
              overflow-hidden
              rounded-[30px]
              border
              border-emerald-200/70
              bg-emerald-50/[0.78]
              p-5
              shadow-[0_20px_60px_rgba(16,185,129,0.08)]
              backdrop-blur-xl
              dark:border-emerald-400/[0.12]
              dark:bg-emerald-400/[0.045]
              dark:shadow-[0_22px_65px_rgba(0,0,0,0.25)]
              sm:p-6
              lg:p-7
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/35 to-transparent dark:via-emerald-400/20" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.025] dark:to-transparent" />

            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-400/[0.055]" />

            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/[0.04]" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3.5">
                <div
                  className="
                    grid
                    h-11
                    w-11
                    shrink-0
                    place-items-center
                    rounded-2xl
                    border
                    border-emerald-200
                    bg-white/80
                    text-emerald-600
                    shadow-sm
                    dark:border-emerald-400/15
                    dark:bg-white/[0.055]
                    dark:text-emerald-300
                  "
                >
                  <ShieldCheck size={21} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                      Authentication protected
                    </h2>

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        border
                        border-emerald-200
                        bg-white/70
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        text-emerald-700
                        dark:border-emerald-400/15
                        dark:bg-emerald-400/10
                        dark:text-emerald-300
                      "
                    >
                      <CheckCircle2 size={11} />
                      Active
                    </span>
                  </div>

                  <p className="mt-1 max-w-2xl text-xs leading-5 text-emerald-800/80 dark:text-emerald-200/65">
                    Your admin authentication flow uses protected routes and
                    secure password-reset handling.
                  </p>
                </div>
              </div>

              <div
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-emerald-200
                  bg-white/70
                  px-3
                  py-1.5
                  text-[11px]
                  font-bold
                  text-emerald-700
                  dark:border-emerald-400/15
                  dark:bg-white/[0.035]
                  dark:text-emerald-300
                "
              >
                <Sparkles size={13} />
                Security status
              </div>
            </div>
          </section>

          {/* =========================================================
              SECURITY CARDS
          ========================================================== */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* =======================================================
                AUTHENTICATION
            ======================================================== */}
            <section
              className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/80
                bg-white/[0.72]
                p-5
                shadow-[0_20px_60px_rgba(15,23,42,0.06)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_25px_70px_rgba(15,23,42,0.09)]
                dark:border-white/[0.08]
                dark:bg-white/[0.035]
                dark:shadow-[0_20px_60px_rgba(0,0,0,0.27)]
                dark:hover:border-white/[0.11]
                dark:hover:shadow-[0_25px_70px_rgba(0,0,0,0.34)]
                sm:p-6
              "
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent dark:via-emerald-400/15" />

              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.035] dark:to-transparent" />

              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/[0.055]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      grid
                      h-11
                      w-11
                      place-items-center
                      rounded-2xl
                      border
                      border-emerald-100
                      bg-emerald-50
                      text-emerald-600
                      dark:border-emerald-400/15
                      dark:bg-emerald-400/10
                      dark:text-emerald-300
                    "
                  >
                    <ShieldCheck size={21} />
                  </div>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      text-emerald-700
                      dark:border-emerald-400/15
                      dark:bg-emerald-400/10
                      dark:text-emerald-300
                    "
                  >
                    <CheckCircle2 size={12} />
                    Protected
                  </span>
                </div>

                <h2 className="mt-5 text-base font-black text-slate-900 dark:text-white">
                  Authentication
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Keep your admin area protected with authenticated access and
                  controlled route visibility.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    "Admin-only authentication",
                    "Protected dashboard routes",
                    "Secure password recovery flow",
                  ].map((item) => (
                    <div
                      key={item}
                      className="
                        flex
                        items-center
                        gap-2.5
                        rounded-2xl
                        border
                        border-stone-200/80
                        bg-stone-50/70
                        px-3
                        py-2.5
                        transition-colors
                        duration-200
                        dark:border-white/[0.06]
                        dark:bg-white/[0.025]
                        dark:hover:bg-white/[0.04]
                      "
                    >
                      <CheckCircle2
                        size={15}
                        className="shrink-0 text-emerald-500 dark:text-emerald-400"
                      />

                      <span className="text-xs font-semibold text-stone-600 dark:text-slate-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* =======================================================
                PASSWORD
            ======================================================== */}
            <section
              className="
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                border-white/80
                bg-white/[0.72]
                p-5
                shadow-[0_20px_60px_rgba(15,23,42,0.06)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-[0_25px_70px_rgba(15,23,42,0.09)]
                dark:border-white/[0.08]
                dark:bg-white/[0.035]
                dark:shadow-[0_20px_60px_rgba(0,0,0,0.27)]
                dark:hover:border-white/[0.11]
                dark:hover:shadow-[0_25px_70px_rgba(0,0,0,0.34)]
                sm:p-6
              "
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/25 to-transparent dark:via-violet-400/15" />

              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.035] dark:to-transparent" />

              <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/[0.055]" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      grid
                      h-11
                      w-11
                      place-items-center
                      rounded-2xl
                      border
                      border-violet-100
                      bg-violet-50
                      text-violet-600
                      dark:border-violet-400/15
                      dark:bg-violet-400/10
                      dark:text-violet-300
                    "
                  >
                    <LockKeyhole size={21} />
                  </div>

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-violet-200
                      bg-violet-50
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      text-violet-700
                      dark:border-violet-400/15
                      dark:bg-violet-400/10
                      dark:text-violet-300
                    "
                  >
                    <KeyRound size={12} />
                    Available
                  </span>
                </div>

                <h2 className="mt-5 text-base font-black text-slate-900 dark:text-white">
                  Password management
                </h2>

                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Use the password recovery flow to securely update your admin
                  password without exposing it inside the dashboard.
                </p>

                <Link
                  to="/forgot-password"
                  className="
                    group/link
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-stone-950
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-white
                    shadow-[0_12px_30px_rgba(15,23,42,0.14)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-stone-800
                    hover:shadow-[0_18px_38px_rgba(15,23,42,0.18)]
                    dark:bg-white
                    dark:text-slate-950
                    dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)]
                    dark:hover:bg-slate-100
                    dark:hover:shadow-[0_18px_40px_rgba(0,0,0,0.4)]
                  "
                >
                  <KeyRound size={14} />
                  Reset password

                  <ArrowRight
                    size={14}
                    className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                  />
                </Link>
              </div>
            </section>
          </div>

          {/* =========================================================
              SECURITY CHECKLIST
          ========================================================== */}
          <section
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-white/80
              bg-white/[0.72]
              shadow-[0_20px_60px_rgba(15,23,42,0.06)]
              backdrop-blur-xl
              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:shadow-[0_20px_60px_rgba(0,0,0,0.27)]
            "
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent dark:via-cyan-400/15" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/35 to-transparent dark:from-white/[0.035] dark:to-transparent" />

            <div className="border-b border-stone-200/70 p-5 dark:border-white/[0.06] sm:p-6">
              <div className="flex items-center gap-2">
                <div
                  className="
                    grid
                    h-9
                    w-9
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
                  <LockKeyhole size={18} />
                </div>

                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Security checklist
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                A few simple practices help keep your admin workspace safer.
              </p>
            </div>

            <div
              className="
                grid
                grid-cols-1
                divide-y
                divide-stone-200/70
                dark:divide-white/[0.06]
                sm:grid-cols-2
                sm:divide-y-0
                sm:divide-x
                sm:divide-stone-200/70
                sm:dark:divide-white/[0.06]
                lg:grid-cols-3
              "
            >
              {/* Strong password */}
              <div className="p-5 sm:p-6">
                <div
                  className="
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-2xl
                    border
                    border-stone-200
                    bg-stone-50
                    text-stone-500
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-400
                  "
                >
                  <KeyRound size={18} />
                </div>

                <h3 className="mt-4 text-sm font-black text-stone-800 dark:text-slate-200">
                  Use a strong password
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-500">
                  Keep your admin password unique and difficult to guess.
                </p>
              </div>

              {/* Session */}
              <div className="p-5 sm:p-6">
                <div
                  className="
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-2xl
                    border
                    border-stone-200
                    bg-stone-50
                    text-stone-500
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-400
                  "
                >
                  <ShieldCheck size={18} />
                </div>

                <h3 className="mt-4 text-sm font-black text-stone-800 dark:text-slate-200">
                  Protect your session
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-500">
                  Sign out when using a shared or unfamiliar device.
                </p>
              </div>

              {/* Recovery */}
              <div className="p-5 sm:p-6">
                <div
                  className="
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-2xl
                    border
                    border-stone-200
                    bg-stone-50
                    text-stone-500
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-400
                  "
                >
                  <LockKeyhole size={18} />
                </div>

                <h3 className="mt-4 text-sm font-black text-stone-800 dark:text-slate-200">
                  Keep recovery secure
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-500">
                  Never share password-reset links or authentication
                  credentials.
                </p>
              </div>
            </div>
          </section>

          {/* =========================================================
              FOOTER
          ========================================================== */}
          <div className="flex flex-col gap-2 px-1 pb-5 pt-1 text-xs text-stone-400 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Security management</span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck size={13} />
              Protected workspace
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}