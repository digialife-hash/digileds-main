import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Plus,
  Compass,
  Eye,
  Building2,
  Award,
  Trophy,
  Medal,
  BadgeCheck,
//   Linkedin,
  Flag,
  Rocket,
  Globe2,
  Users,
} from "lucide-react";

const NAVY = "#0C2C50";
const GREEN = "#2E9E6D";
const GREEN_LIGHT = "#4CBB8E";

const timeline = [
  {
    year: "2013",
    icon: Flag,
    title: "Founded in a two-person garage office",
    desc: "Started by two engineers solving one client's inventory problem — the first project that taught us how to actually listen to a business.",
  },
  {
    year: "2016",
    icon: Users,
    title: "Crossed 10 team members",
    desc: "Brought on our first design and QA hires, and moved from single projects to full product partnerships.",
  },
  {
    year: "2019",
    icon: Globe2,
    title: "Opened our first international client base",
    desc: "Delivered our first overseas engagement, and haven't stopped working across borders since.",
  },
  {
    year: "2022",
    icon: Building2,
    title: "Moved into our current studio",
    desc: "Consolidated design and engineering under one roof, sharpening how closely the two teams work together.",
  },
  {
    year: "2025",
    icon: Rocket,
    title: "60+ people, 120+ products shipped",
    desc: "Still founder-led, still senior-only — just with a lot more scar tissue and a lot fewer surprises.",
  },
];

const leadership = [
  {
    name: "Aditya Rao",
    role: "Co-Founder & CEO",
    initial: "A",
  },
  {
    name: "Meera Nair",
    role: "Co-Founder & Head of Design",
    initial: "M",
  },
  {
    name: "Karan Bhatt",
    role: "VP of Engineering",
    initial: "K",
  },
  {
    name: "Simran Kaur",
    role: "Head of Client Partnerships",
    initial: "S",
  },
];

const achievements = [
  {
    title: "Top Development Studio 2024",
    org: "Clutch",
    icon: Trophy,
  },
  {
    title: "ISO 27001 Certified",
    org: "Information Security",
    icon: BadgeCheck,
  },
  {
    title: "Great Place to Work",
    org: "2022 – 2024",
    icon: Medal,
  },
  {
    title: "Top 50 Studios in Asia",
    org: "GoodFirms",
    icon: Award,
  },
];

/* =========================================================
   HERO
========================================================= */

function HeroSection() {
  return (
    <section
      className="
        relative overflow-hidden
        bg-[#EAF5F6]
        px-6 pb-16 pt-14
        transition-colors duration-300
        dark:bg-[#06151D]
        sm:px-10
        lg:px-14 lg:pb-24 lg:pt-24
      "
    >
      <div
        className="
          pointer-events-none absolute
          -right-32 top-0
          h-96 w-96 rounded-full
          bg-[#2E9E6D]/10
          blur-3xl
          dark:bg-emerald-400/[0.05]
        "
      />

      <div
        className="
          pointer-events-none absolute
          bottom-0 left-0
          h-72 w-72 rounded-full
          bg-[#0C2C50]/5
          blur-3xl
          dark:bg-sky-400/[0.04]
        "
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div className="flex items-start gap-5">
            <div
              className="
                flex h-16 w-16 shrink-0
                items-center justify-center
                rounded-2xl
                text-2xl font-black
                text-white
              "
              style={{ background: NAVY }}
            >
              N
            </div>

            <div>
              <p
                className="
                  text-xs font-bold uppercase
                  tracking-[0.28em]
                  text-[#2E9E6D]
                  dark:text-emerald-400
                "
              >
                Company Profile
              </p>

              <h1
                className="
                  mt-3 text-4xl font-black
                  leading-tight tracking-tight
                  text-[#0C2C50]
                  dark:text-slate-100
                  sm:text-[42px]
                "
              >
                Digital Alife
              </h1>

              <p
                className="
                  mt-2 max-w-md
                  text-[15px] leading-relaxed
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Product design & engineering studio, building software for
                growing teams since 2013.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              as="a"
              variant="unstyled"
              href="/contact"
              className="
                group inline-flex items-center gap-2
                rounded-xl
                px-5 py-3
                text-sm font-bold text-white
                shadow-lg
                transition-all duration-300
                hover:-translate-y-0.5
                hover:shadow-xl
              "
              style={{
                background: GREEN,
                boxShadow: `0 10px 25px ${GREEN}25`,
              }}
            >
              Get in touch
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          </div>
        </div>

        <dl
          className="
            mt-12 grid grid-cols-2
            gap-y-6 gap-x-6
            border-t border-[#0C2C50]/10
            pt-8
            dark:border-slate-700
            sm:grid-cols-4
          "
        >
          {[
            { label: "Founded", value: "2013" },
            { label: "Headquarters", value: "Bengaluru, India" },
            { label: "Team", value: "60+ people" },
            { label: "Clients served", value: "9 countries" },
          ].map((s) => (
            <div key={s.label}>
              <dt
                className="
                  text-[11px] font-semibold uppercase
                  tracking-wide
                  text-slate-400
                  dark:text-slate-500
                "
              >
                {s.label}
              </dt>
              <dd
                className="
                  mt-1 text-lg font-bold
                  text-[#0C2C50]
                  dark:text-slate-100
                "
              >
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* =========================================================
   MISSION & VISION
========================================================= */

function MissionVisionSection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10
        lg:px-14
      "
    >
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
        <div
          className="
            rounded-2xl border
            border-slate-100
            bg-white p-8
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
          style={{ boxShadow: "0 1px 2px rgba(12,44,80,0.05)" }}
        >
          <div
            className="
              mb-5 flex h-12 w-12
              items-center justify-center
              rounded-xl
              bg-[#F5F7FA]
              dark:bg-slate-800
            "
          >
            <Compass
              size={22}
              strokeWidth={1.75}
              className="text-[#2E9E6D] dark:text-emerald-400"
            />
          </div>

          <h2
            className="
              mb-3 text-xl font-bold
              text-[#0C2C50]
              dark:text-slate-100
            "
          >
            Our mission
          </h2>

          <p
            className="
              text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            To help growing businesses build software that works as hard as
            they do — through honest scoping, senior craft, and a team that
            stays accountable long after launch.
          </p>
        </div>

        <div
          className="
            rounded-2xl border
            border-slate-100
            bg-white p-8
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
          style={{ boxShadow: "0 1px 2px rgba(12,44,80,0.05)" }}
        >
          <div
            className="
              mb-5 flex h-12 w-12
              items-center justify-center
              rounded-xl
              bg-[#F5F7FA]
              dark:bg-slate-800
            "
          >
            <Eye
              size={22}
              strokeWidth={1.75}
              className="text-[#2E9E6D] dark:text-emerald-400"
            />
          </div>

          <h2
            className="
              mb-3 text-xl font-bold
              text-[#0C2C50]
              dark:text-slate-100
            "
          >
            Our vision
          </h2>

          <p
            className="
              text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            To be the studio founders call first — known not for size, but for
            the fact that every product we've touched is still standing, still
            growing, years later.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TIMELINE / HISTORY
========================================================= */

function TimelineSection() {
  return (
    <section
      className="
        bg-[#F7FAF9] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-10
        lg:px-14
      "
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 max-w-xl">
          <p
            className="
              text-xs font-bold uppercase
              tracking-[0.25em]
              text-[#2E9E6D]
              dark:text-emerald-400
            "
          >
            Our journey
          </p>

          <h2
            className="
              mt-4 text-3xl font-bold
              tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              md:text-4xl
            "
          >
            How we got here
          </h2>
        </div>

        <div className="relative">
          <div
            className="
              absolute left-[23px] top-2 bottom-2
              w-px
              bg-slate-200
              dark:bg-slate-700
            "
          />

          <div className="space-y-10">
            {timeline.map((t) => {
              const Icon = t.icon;

              return (
                <div key={t.year} className="relative flex gap-6">
                  <div
                    className="
                      relative z-10 flex h-12 w-12
                      flex-shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-white
                      dark:bg-slate-900
                    "
                    style={{ boxShadow: "0 1px 2px rgba(12,44,80,0.08)" }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.75}
                      className="text-[#2E9E6D] dark:text-emerald-400"
                    />
                  </div>

                  <div className="pb-2">
                    <span
                      className="
                        text-xs font-bold uppercase
                        tracking-wide
                        text-[#2E9E6D]
                        dark:text-emerald-400
                      "
                    >
                      {t.year}
                    </span>

                    <h3
                      className="
                        mt-1 text-lg font-bold
                        text-[#0C2C50]
                        dark:text-slate-100
                      "
                    >
                      {t.title}
                    </h3>

                    <p
                      className="
                        mt-2 max-w-xl text-[14.5px]
                        leading-relaxed
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {t.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   LEADERSHIP
========================================================= */

function LeadershipSection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10
        lg:px-14
      "
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 max-w-xl">
          <p
            className="
              text-xs font-bold uppercase
              tracking-[0.25em]
              text-[#2E9E6D]
              dark:text-emerald-400
            "
          >
            Leadership
          </p>

          <h2
            className="
              mt-4 text-3xl font-bold
              tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              md:text-4xl
            "
          >
            The people steering the studio
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {leadership.map((p) => (
            <div
              key={p.name}
              className="
                group rounded-2xl border
                border-slate-100
                bg-white p-6
                text-center
                transition-all duration-300
                hover:-translate-y-1
                hover:border-emerald-200
                dark:border-slate-800
                dark:bg-slate-900
                dark:hover:border-emerald-800
              "
              style={{ boxShadow: "0 1px 2px rgba(12,44,80,0.05)" }}
            >
              <div
                className="
                  mx-auto mb-4 flex h-16 w-16
                  items-center justify-center
                  rounded-full
                  text-xl font-bold
                  text-white
                "
                style={{ background: NAVY }}
              >
                {p.initial}
              </div>

              <h3
                className="
                  text-[15px] font-bold
                  text-[#0C2C50]
                  dark:text-slate-100
                "
              >
                {p.name}
              </h3>

              <p
                className="
                  mt-1 text-[13px]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {p.role}
              </p>

              <a
                href="#"
                className="
                  mt-3 inline-flex h-8 w-8
                  items-center justify-center
                  rounded-full
                  bg-[#F5F7FA]
                  transition-colors duration-300
                  hover:bg-[#2E9E6D]
                  hover:text-white
                  dark:bg-slate-800
                "
              >
                {/* <Linkedin size={14} strokeWidth={1.75} /> */}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ACHIEVEMENTS
========================================================= */

function AchievementsSection() {
  return (
    <section
      className="
        bg-[#F7FAF9] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-10
        lg:px-14
      "
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 max-w-xl">
          <p
            className="
              text-xs font-bold uppercase
              tracking-[0.25em]
              text-[#2E9E6D]
              dark:text-emerald-400
            "
          >
            Recognition
          </p>

          <h2
            className="
              mt-4 text-3xl font-bold
              tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              md:text-4xl
            "
          >
            Milestones we're proud of
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((a) => {
            const Icon = a.icon;

            return (
              <div
                key={a.title}
                className="
                  rounded-2xl border
                  border-slate-100
                  bg-white p-6
                  transition-all duration-300
                  hover:-translate-y-1
                  dark:border-slate-800
                  dark:bg-slate-900
                "
                style={{ boxShadow: "0 1px 2px rgba(12,44,80,0.05)" }}
              >
                <div
                  className="
                    mb-4 flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-[#F5F7FA]
                    dark:bg-slate-800
                  "
                >
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />
                </div>

                <h3
                  className="
                    text-[14.5px] font-bold leading-snug
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  {a.title}
                </h3>

                <p
                  className="
                    mt-1 text-[13px]
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {a.org}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CONTACT / CTA
========================================================= */

function ContactSection() {
  return (
    <section
      className="
        bg-white px-6 pb-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10
        lg:px-14
      "
    >
      <div className="mx-auto max-w-5xl">
        <div
          className="
            relative flex flex-col
            gap-10 overflow-hidden
            rounded-3xl
            px-8 py-12
            md:flex-row md:items-center md:justify-between
            md:px-14 md:py-16
          "
          style={{ background: NAVY }}
        >
          <div
            className="pointer-events-none absolute right-8 top-6 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "8px 8px",
              width: "90px",
              height: "60px",
            }}
          />

          <div
            className="pointer-events-none absolute bottom-6 left-10 opacity-40"
            style={{
              backgroundImage: `radial-gradient(${GREEN_LIGHT}88 1px, transparent 1px)`,
              backgroundSize: "10px 10px",
              width: "70px",
              height: "70px",
            }}
          />

          <Plus size={18} className="absolute right-6 top-6 text-white/50" />
          <Plus size={18} className="absolute bottom-6 left-6 text-white/30" />

          <div className="relative max-w-md">
            <h2
              className="
                mb-3 text-2xl font-bold
                leading-snug tracking-tight
                text-white
                md:text-3xl
              "
            >
              Let's talk about your next build.
            </h2>

            <p className="text-[15px] text-white/60">
              Reach out directly, or set up a call with our team.
            </p>
          </div>

          <div className="relative space-y-3">
            <a
              href="mailto:hello@northbeam.studio"
              className="flex items-center gap-3 text-sm text-white/80 transition-colors hover:text-white"
            >
              <Mail size={16} />
              hello@northbeam.studio
            </a>

            <a
              href="tel:9211954915"
              className="flex items-center gap-3 text-sm text-white/80 transition-colors hover:text-white"
            >
              <Phone size={16} />
              +91 92119 54915
            </a>

            <p className="flex items-center gap-3 text-sm text-white/80">
              <MapPin size={16} />
              Bengaluru, India
            </p>

            <a
              href="/contact"
              className="
                group mt-4 inline-flex items-center gap-2
                rounded-full px-6 py-3
                text-sm font-semibold text-white
                transition-all duration-300
                hover:scale-[1.04]
              "
              style={{
                background: GREEN,
                boxShadow: `0 10px 28px ${GREEN}30`,
              }}
            >
              Get in touch
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function CompanyProfile() {
  return (
    <div
      className="
        min-h-screen
        bg-white
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <HeroSection />
      <MissionVisionSection />
      <TimelineSection />
      <LeadershipSection />
      <AchievementsSection />
      <ContactSection />
    </div>
  );
}