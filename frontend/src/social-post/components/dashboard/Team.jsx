import {
  ArrowRight,
  Check,
  ChevronRight,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import PageHeader from "../layout/PageHeader.jsx";

export default function Team() {
  const handleInvite = () => {
    console.log("Invite member");
  };

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
          title="Team"
          description="Manage collaborators, roles and approval workflows from one place."
          action={
            <button
              type="button"
              onClick={handleInvite}
              className="
                group
                inline-flex
                min-h-11
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-stone-950
                px-4
                py-2.5
                text-xs
                font-extrabold
                text-white
                shadow-[0_12px_30px_rgba(0,0,0,0.13)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-stone-800
                hover:shadow-[0_18px_38px_rgba(0,0,0,0.16)]
                active:translate-y-0
                dark:bg-white
                dark:text-slate-950
                dark:shadow-[0_14px_35px_rgba(0,0,0,0.28)]
                dark:hover:bg-slate-100
                dark:hover:shadow-[0_18px_42px_rgba(0,0,0,0.38)]
                sm:w-auto
              "
            >
              <UserPlus
                size={15}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              Invite member
            </button>
          }
        />

        <div className="mt-6 space-y-5">
          {/* =========================================================
              WORKSPACE HERO
          ========================================================== */}
          <section
            className="
              relative
              overflow-hidden
              rounded-[30px]
              border
              border-white/80
              bg-white/[0.72]
              shadow-[0_24px_80px_rgba(15,23,42,0.06)]
              backdrop-blur-xl
              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]
            "
          >
            {/* premium top edge */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/35 to-transparent dark:via-violet-400/20" />

            {/* reflection */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 to-transparent dark:from-white/[0.045] dark:to-transparent" />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-violet-400/[0.08] via-transparent to-cyan-400/[0.08] dark:from-violet-400/[0.07] dark:to-cyan-400/[0.06]" />

            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-[95px] dark:bg-violet-500/[0.07]" />

            <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-[95px] dark:bg-cyan-400/[0.05]" />

            <div className="relative p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left */}
                <div className="flex min-w-0 items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 rounded-[22px] bg-gradient-to-br from-violet-400/30 to-cyan-400/25 blur-md dark:from-violet-400/20 dark:to-cyan-400/15" />

                    <div
                      className="
                        relative
                        grid
                        h-14
                        w-14
                        place-items-center
                        rounded-[19px]
                        border
                        border-violet-100
                        bg-violet-50
                        text-violet-600
                        shadow-[0_12px_30px_rgba(0,0,0,0.06)]
                        dark:border-violet-400/15
                        dark:bg-violet-400/10
                        dark:text-violet-300
                        dark:shadow-[0_12px_30px_rgba(0,0,0,0.22)]
                      "
                    >
                      <Users size={23} strokeWidth={1.8} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black tracking-tight text-stone-950 transition-colors duration-300 dark:text-white sm:text-xl">
                        Admin workspace
                      </h2>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          border
                          border-emerald-200
                          bg-emerald-50
                          px-2.5
                          py-1
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.13em]
                          text-emerald-600
                          dark:border-emerald-400/15
                          dark:bg-emerald-400/10
                          dark:text-emerald-300
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        Active
                      </span>
                    </div>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500 transition-colors duration-300 dark:text-slate-400">
                      You currently have full workspace ownership. Add
                      collaborators when you are ready to build a shared
                      content and publishing workflow.
                    </p>
                  </div>
                </div>

                {/* Owner badge */}
                <div
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-white/80
                    bg-white/65
                    px-4
                    py-3
                    shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                    backdrop-blur-xl
                    dark:border-white/[0.08]
                    dark:bg-white/[0.035]
                    dark:shadow-[0_12px_35px_rgba(0,0,0,0.2)]
                    sm:w-auto
                    sm:justify-start
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        grid
                        h-10
                        w-10
                        place-items-center
                        rounded-xl
                        border
                        border-emerald-100
                        bg-emerald-50
                        dark:border-emerald-400/15
                        dark:bg-emerald-400/10
                      "
                    >
                      <ShieldCheck
                        size={18}
                        strokeWidth={2}
                        className="text-emerald-600 dark:text-emerald-300"
                      />
                    </div>

                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-stone-400 dark:text-slate-500">
                        Access level
                      </p>

                      <p className="mt-0.5 text-xs font-black text-stone-700 dark:text-slate-200">
                        Owner access
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini stats */}
              <div className="mt-7 grid gap-3 border-t border-stone-200/70 pt-6 dark:border-white/[0.06] sm:grid-cols-3">
                <MiniStat
                  icon={<Users size={15} />}
                  label="Members"
                  value="1"
                  detail="Current workspace"
                />

                <MiniStat
                  icon={<ShieldCheck size={15} />}
                  label="Access"
                  value="Full"
                  detail="Owner permissions"
                />

                <MiniStat
                  icon={<LockKeyhole size={15} />}
                  label="Roles"
                  value="3"
                  detail="Available workflows"
                />
              </div>
            </div>
          </section>

          {/* =========================================================
              MEMBERS
          ========================================================== */}
          <section
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-white/80
              bg-white/[0.72]
              shadow-[0_22px_70px_rgba(15,23,42,0.06)]
              backdrop-blur-xl
              dark:border-white/[0.08]
              dark:bg-white/[0.035]
              dark:shadow-[0_22px_70px_rgba(0,0,0,0.28)]
            "
          >
            <div className="border-b border-stone-200/70 p-5 dark:border-white/[0.06] sm:p-6 lg:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
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
                      <Users size={17} strokeWidth={1.9} />
                    </div>

                    <h2 className="text-base font-black tracking-tight text-stone-950 transition-colors duration-300 dark:text-white">
                      Workspace members
                    </h2>
                  </div>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 dark:text-slate-400">
                    Review who has access and define which responsibilities
                    collaborators can handle.
                  </p>
                </div>

                <span
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-stone-200
                    bg-stone-50
                    px-3
                    py-1.5
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-stone-500
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-400
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  1 owner
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-7">
              <div
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-stone-200/80
                  bg-gradient-to-br
                  from-stone-50/90
                  to-white/80
                  p-4
                  transition-all
                  duration-300
                  hover:border-stone-300/80
                  hover:shadow-[0_15px_40px_rgba(15,23,42,0.05)]
                  dark:border-white/[0.08]
                  dark:from-white/[0.045]
                  dark:to-white/[0.02]
                  dark:hover:border-white/[0.13]
                  dark:hover:bg-white/[0.05]
                  dark:hover:shadow-[0_18px_45px_rgba(0,0,0,0.24)]
                  sm:p-5
                "
              >
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-400/[0.06]" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-violet-400/30 to-cyan-400/20 blur-sm dark:from-violet-400/20 dark:to-cyan-400/15" />

                    <div className="relative grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 text-sm font-black text-white shadow-lg shadow-violet-500/20 dark:border-slate-900">
                      A
                    </div>
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-stone-900 dark:text-white">
                        Workspace owner
                      </p>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          border
                          border-emerald-200
                          bg-emerald-50
                          px-2
                          py-1
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.1em]
                          text-emerald-600
                          dark:border-emerald-400/15
                          dark:bg-emerald-400/10
                          dark:text-emerald-300
                        "
                      >
                        <Check size={10} strokeWidth={3} />
                        Active
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-stone-400 dark:text-slate-500">
                      Full access to workspace settings, content and
                      publishing.
                    </p>
                  </div>

                  {/* Role */}
                  <div className="flex items-center gap-2 sm:ml-auto">
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
                        font-black
                        uppercase
                        tracking-[0.1em]
                        text-violet-600
                        dark:border-violet-400/15
                        dark:bg-violet-400/10
                        dark:text-violet-300
                      "
                    >
                      <ShieldCheck size={12} />
                      Owner
                    </span>

                    <button
                      type="button"
                      className="
                        grid
                        h-9
                        w-9
                        place-items-center
                        rounded-xl
                        border
                        border-stone-200
                        bg-white
                        text-stone-400
                        opacity-0
                        transition-all
                        duration-300
                        hover:border-stone-300
                        hover:text-stone-700
                        group-hover:opacity-100
                        dark:border-white/[0.08]
                        dark:bg-white/[0.04]
                        dark:text-slate-500
                        dark:hover:border-white/[0.14]
                        dark:hover:bg-white/[0.07]
                        dark:hover:text-slate-200
                        sm:opacity-100
                      "
                      aria-label="View member"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================
              EMPTY COLLABORATOR STATE
          ========================================================== */}
          <section
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-dashed
              border-stone-300
              bg-white/[0.72]
              px-5
              py-14
              text-center
              shadow-[0_20px_65px_rgba(15,23,42,0.045)]
              backdrop-blur-xl
              dark:border-white/[0.1]
              dark:bg-white/[0.025]
              dark:shadow-[0_20px_65px_rgba(0,0,0,0.25)]
              sm:px-8
              sm:py-20
            "
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.045] blur-[90px] dark:bg-violet-500/[0.05]" />

            <div className="relative mx-auto max-w-xl">
              <div className="relative mx-auto w-fit">
                <div className="absolute -inset-5 rounded-full bg-gradient-to-br from-violet-400/10 to-cyan-400/10 blur-2xl dark:from-violet-400/[0.08] dark:to-cyan-400/[0.06]" />

                <div
                  className="
                    relative
                    grid
                    h-[76px]
                    w-[76px]
                    place-items-center
                    rounded-[24px]
                    border
                    border-stone-200
                    bg-white
                    text-stone-400
                    shadow-[0_15px_40px_rgba(15,23,42,0.07)]
                    dark:border-white/[0.08]
                    dark:bg-white/[0.04]
                    dark:text-slate-500
                    dark:shadow-[0_18px_45px_rgba(0,0,0,0.25)]
                  "
                >
                  <UserPlus size={30} strokeWidth={1.7} />
                </div>

                <div
                  className="
                    absolute
                    -bottom-1.5
                    -right-1.5
                    grid
                    h-7
                    w-7
                    place-items-center
                    rounded-full
                    border-2
                    border-white
                    bg-violet-500
                    text-white
                    shadow-md
                    dark:border-[#070b14]
                  "
                >
                  <Sparkles size={12} />
                </div>
              </div>

              <h2 className="mt-7 text-xl font-black tracking-tight text-stone-950 dark:text-white">
                No collaborators yet
              </h2>

              <p className="mx-auto mt-2.5 max-w-md text-sm leading-6 text-stone-500 dark:text-slate-400">
                Bring your team into the workflow when you are ready to share
                content creation, reviews and publishing responsibilities.
              </p>

              <button
                type="button"
                onClick={handleInvite}
                className="
                  group
                  relative
                  mt-7
                  inline-flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  overflow-hidden
                  rounded-2xl
                  bg-stone-950
                  px-5
                  text-xs
                  font-extrabold
                  text-white
                  shadow-[0_16px_40px_rgba(0,0,0,0.14)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-stone-800
                  hover:shadow-[0_20px_48px_rgba(0,0,0,0.18)]
                  active:translate-y-0
                  dark:bg-white
                  dark:text-slate-950
                  dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)]
                  dark:hover:bg-slate-100
                  dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.42)]
                  sm:w-auto
                "
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/30 via-transparent to-cyan-400/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-violet-500/20 dark:to-cyan-400/15" />

                <span className="relative z-10 flex items-center gap-2">
                  <UserPlus size={15} />
                  Invite your first member

                  <ArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </button>
            </div>
          </section>

          {/* =========================================================
              ROLES
          ========================================================== */}
          <section
            className="
              rounded-[28px]
              border
              border-white/80
              bg-white/[0.70]
              p-5
              shadow-[0_18px_60px_rgba(15,23,42,0.05)]
              backdrop-blur-xl
              dark:border-white/[0.08]
              dark:bg-white/[0.03]
              dark:shadow-[0_18px_60px_rgba(0,0,0,0.26)]
              sm:p-6
              lg:p-7
            "
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div
                  className="
                    grid
                    h-11
                    w-11
                    shrink-0
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
                  <LockKeyhole size={18} strokeWidth={1.8} />
                </div>

                <div>
                  <h2 className="text-base font-black tracking-tight text-stone-900 dark:text-white">
                    Roles & permissions
                  </h2>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-stone-500 dark:text-slate-400">
                    Define how collaborators participate in the content
                    workflow. These roles are ready for future team access.
                  </p>
                </div>
              </div>

              <span
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-amber-200
                  bg-amber-50
                  px-3
                  py-1.5
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-amber-700
                  dark:border-amber-400/15
                  dark:bg-amber-400/10
                  dark:text-amber-300
                "
              >
                <LockKeyhole size={11} />
                Ready to configure
              </span>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <RoleCard
                title="Creator"
                description="Create drafts, prepare captions and organize content."
                tone="violet"
              />

              <RoleCard
                title="Reviewer"
                description="Review content and approve posts before publishing."
                tone="cyan"
              />

              <RoleCard
                title="Publisher"
                description="Manage approved content and publishing tasks."
                tone="orange"
              />
            </div>
          </section>

          {/* Footer */}
          <div className="flex flex-col gap-2 px-1 pb-5 pt-1 text-xs text-stone-400 dark:text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Team management</span>

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

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({ icon, label, value, detail }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-2xl
        border
        border-stone-200/70
        bg-stone-50/60
        px-4
        py-3.5
        transition-colors
        duration-300
        dark:border-white/[0.06]
        dark:bg-white/[0.025]
      "
    >
      <div
        className="
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-xl
          border
          border-white
          bg-white
          text-stone-500
          shadow-sm
          dark:border-white/[0.08]
          dark:bg-white/[0.04]
          dark:text-slate-400
          dark:shadow-none
        "
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-stone-400 dark:text-slate-500">
          {label}
        </p>

        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-sm font-black text-stone-800 dark:text-slate-200">
            {value}
          </span>

          <span className="truncate text-[10px] text-stone-400 dark:text-slate-500">
            {detail}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ROLE CARD
========================================================= */

function RoleCard({ title, description, tone }) {
  const tones = {
    violet: {
      icon: "border-violet-100 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",
      dot: "bg-violet-500 dark:bg-violet-400",
      badge:
        "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-400/15 dark:bg-violet-400/10 dark:text-violet-300",
    },

    cyan: {
      icon: "border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300",
      dot: "bg-cyan-500 dark:bg-cyan-400",
      badge:
        "border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-400/15 dark:bg-cyan-400/10 dark:text-cyan-300",
    },

    orange: {
      icon: "border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",
      dot: "bg-orange-500 dark:bg-orange-400",
      badge:
        "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-400/15 dark:bg-orange-400/10 dark:text-orange-300",
    },
  };

  const styles = tones[tone] || tones.violet;

  return (
    <div
      className="
        group
        rounded-[22px]
        border
        border-stone-200/75
        bg-stone-50/60
        p-4
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:bg-white
        hover:shadow-[0_14px_35px_rgba(15,23,42,0.05)]
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.11]
        dark:hover:bg-white/[0.05]
        dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.25)]
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl border ${styles.icon}`}
        >
          <Sparkles size={16} strokeWidth={1.8} />
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${styles.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          Role
        </span>
      </div>

      <h3 className="mt-5 text-sm font-black text-stone-800 dark:text-slate-200">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-stone-400 dark:text-slate-500">
        {description}
      </p>
    </div>
  );
}