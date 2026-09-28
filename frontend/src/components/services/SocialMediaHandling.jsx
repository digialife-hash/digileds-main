import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  MousePointerClick,
  PenLine,
  Play,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Video,
  Zap,
} from "lucide-react";

/* =========================================================
   BRAND
========================================================= */

const NAVY = "#0C2C50";
const GREEN = "#2E9E6D";
const GREEN_LIGHT = "#56C894";
const MINT = "#EAF7F1";
const SOFT = "#F5F8F7";

/* =========================================================
   SERVICES
========================================================= */

const services = [
  {
    icon: Target,
    title: "Social Media Strategy",
    text: "Build a clear strategy around your audience, competitors, goals and brand personality.",
    tags: ["Research", "Strategy", "Positioning"],
  },
  {
    icon: CalendarDays,
    title: "Content Planning",
    text: "Create a structured content calendar that keeps your brand active and consistent.",
    tags: ["Calendar", "Campaigns", "Themes"],
  },
  {
    icon: PenLine,
    title: "Content Creation",
    text: "Develop engaging posts, captions, creatives and campaigns that communicate your message.",
    tags: ["Posts", "Captions", "Creatives"],
  },
  {
    icon: Video,
    title: "Reels & Short Videos",
    text: "Create short-form video ideas and content designed for attention, reach and engagement.",
    tags: ["Reels", "Shorts", "Video"],
  },
  {
    icon: MessageCircle,
    title: "Comments & DM Handling",
    text: "Keep conversations active by professionally handling comments, enquiries and messages.",
    tags: ["Comments", "DMs", "Enquiries"],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    text: "Track meaningful social metrics and use performance insights to improve future content.",
    tags: ["Insights", "Reports", "Growth"],
  },
];

/* =========================================================
   PLATFORMS
========================================================= */

const platforms = [
  {
    name: "Instagram",
    short: "IG",
    image:
      "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=900&q=85",
    text: "Reels, Stories, posts, engagement and visual brand building.",
  },
  {
    name: "Facebook",
    short: "FB",
    image:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=900&q=85",
    text: "Page management, community engagement and promotional content.",
  },
  {
    name: "LinkedIn",
    short: "IN",
    image:
      "https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=900&q=85",
    text: "Professional content, B2B communication and authority building.",
  },
  {
    name: "YouTube",
    short: "YT",
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=900&q=85",
    text: "Shorts, videos, channel content and audience development.",
  },
  {
    name: "X / Twitter",
    short: "X",
    image:
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=900&q=85",
    text: "Real-time updates, conversations and brand communication.",
  },
  {
    name: "Pinterest",
    short: "P",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=85",
    text: "Visual discovery, content distribution and traffic generation.",
  },
];

/* =========================================================
   CONTENT
========================================================= */

const contentTypes = [
  "Educational Posts",
  "Product Showcases",
  "Service Highlights",
  "Customer Stories",
  "Behind The Scenes",
  "Reels",
  "Short Videos",
  "Stories",
  "Polls",
  "Questions",
  "Festival Campaigns",
  "Industry Updates",
];

/* =========================================================
   PROCESS
========================================================= */

const process = [
  {
    number: "01",
    title: "Discover",
    text: "Understand your brand, audience, competitors and current social presence.",
  },
  {
    number: "02",
    title: "Plan",
    text: "Create the content direction, calendar, campaigns and communication style.",
  },
  {
    number: "03",
    title: "Create",
    text: "Produce posts, captions, creatives, reels and platform-specific content.",
  },
  {
    number: "04",
    title: "Publish",
    text: "Schedule and publish content consistently at the right time.",
  },
  {
    number: "05",
    title: "Engage",
    text: "Handle comments, DMs, enquiries and conversations with your audience.",
  },
  {
    number: "06",
    title: "Improve",
    text: "Analyze performance and continuously optimize your social strategy.",
  },
];

/* =========================================================
   HERO
========================================================= */

function Hero() {
  return (
    <section
      className="
        relative overflow-hidden
        bg-[#F3F8F6]
        px-5 pb-16 pt-10
        transition-colors duration-300
        dark:bg-[#06151D]
        sm:px-8
        lg:px-12 lg:pb-24 lg:pt-36
      "
    >
      {/* Background decoration */}
      <div
        className="
          pointer-events-none absolute
          -right-40 top-0
          h-[500px] w-[500px]
          rounded-full
          bg-emerald-500/[0.08]
          blur-3xl
          dark:bg-emerald-400/[0.04]
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-40 -left-40
          h-[400px] w-[400px]
          rounded-full
          bg-slate-900/[0.03]
          blur-3xl
          dark:bg-sky-400/[0.03]
        "
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.95fr]">
          {/* LEFT */}
          <div>

            <h1
              className="
                max-w-3xl text-5xl font-black
                leading-[0.98] tracking-[-0.04em]
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-6xl
                lg:text-[72px]
              "
            >
              Social Media
              <br />
              <span className="text-[#2E9E6D] dark:text-emerald-400">
                Handling
              </span>
              <br />
              <span
                className="
                  text-[0.58em] font-bold
                  tracking-[-0.02em]
                  text-slate-500
                  dark:text-slate-400
                "
              >
                that actually feels alive.
              </span>
            </h1>

            <p
              className="
                mt-7 max-w-xl
                text-[15px] leading-8
                text-slate-600
                dark:text-slate-400
                sm:text-lg
              "
            >
              We handle your complete social media presence — strategy, content,
              publishing, engagement, community management and analytics — so
              your brand stays visible and connected.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                as="a"
                variant="unstyled"
                href="/quote"
                className="
                  group inline-flex items-center gap-3
                  rounded-xl px-6 py-3.5
                  text-sm font-bold text-white
                  transition duration-300
                  hover:-translate-y-1
                "
                style={{
                  background: GREEN,
                  boxShadow: `0 18px 40px ${GREEN}30`,
                }}
              >
                Grow my social presence
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Button>

              <Button
                as="a"
                variant="unstyled"
                href="#services"
                className="
                  inline-flex items-center gap-2
                  rounded-xl border
                  border-slate-200
                  bg-white px-6 py-3.5
                  text-sm font-bold
                  text-[#0C2C50]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:border-emerald-500
                "
              >
                See what we handle
                <ChevronRight size={16} />
              </Button>
            </div>

            {/* Small stats */}
            <div
              className="
                mt-10 flex flex-wrap gap-8
                border-t
                border-slate-200
                pt-6
                dark:border-slate-800
              "
            >
              <div>
                <p
                  className="
                    text-xl font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Strategy
                </p>

                <p
                  className="
                    mt-1 text-[10px] uppercase
                    tracking-wider text-slate-400
                    dark:text-slate-500
                  "
                >
                  Before posting
                </p>
              </div>

              <div>
                <p
                  className="
                    text-xl font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Content
                </p>

                <p
                  className="
                    mt-1 text-[10px] uppercase
                    tracking-wider text-slate-400
                    dark:text-slate-500
                  "
                >
                  That communicates
                </p>
              </div>

              <div>
                <p
                  className="
                    text-xl font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Growth
                </p>

                <p
                  className="
                    mt-1 text-[10px] uppercase
                    tracking-wider text-slate-400
                    dark:text-slate-500
                  "
                >
                  Through data
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative mx-auto w-full max-w-[590px]">
            {/* Glow */}
            <div
              className="
                pointer-events-none absolute inset-10
                rounded-full blur-3xl
                bg-emerald-500/[0.12]
                dark:bg-emerald-400/[0.05]
              "
            />

            {/* Main dashboard */}
            <div
              className="
                relative rounded-[2rem]
                border border-white/80
                bg-white p-3
                shadow-[0_35px_90px_-35px_rgba(12,44,80,.35)]
                transition-colors duration-300
                dark:border-slate-700
                dark:bg-slate-900
                dark:shadow-[0_35px_90px_-35px_rgba(0,0,0,.6)]
                sm:p-5
              "
            >
              {/* Top browser */}
              <div
                className="
                  flex items-center
                  justify-between rounded-xl
                  bg-[#F4F7F6]
                  px-4 py-3
                  dark:bg-slate-800
                "
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>

                <div
                  className="
                    flex items-center gap-2
                    text-[10px] font-bold
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  <Settings2 size={12} />
                  Social Dashboard
                </div>

                <MoreHorizontal
                  size={16}
                  className="text-slate-400 dark:text-slate-500"
                />
              </div>

              {/* Profile header */}
              <div
                className="
                  mt-4 flex items-center
                  justify-between rounded-2xl
                  bg-[#F7FAF9] p-4
                  dark:bg-slate-800
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-12 w-12
                      items-center justify-center
                      rounded-2xl
                      text-sm font-black text-white
                    "
                    style={{ background: NAVY }}
                  >
                    DA
                  </div>

                  <div>
                    <p
                      className="
                        text-sm font-black
                        text-[#0C2C50]
                        dark:text-slate-100
                      "
                    >
                      Your Brand
                    </p>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      @yourbrand • Business
                    </p>
                  </div>
                </div>

                <div
                  className="
                    rounded-lg px-3 py-1.5
                    text-[9px] font-bold text-white
                  "
                  style={{ background: GREEN }}
                >
                  ACTIVE
                </div>
              </div>

              {/* Image */}
              <div className="relative mt-4 overflow-hidden rounded-2xl">
                <img
                  src="/uploads/h1.jpg"
                  alt="Social media content"
                  className="h-[270px] w-full object-cover sm:h-[310px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/80 via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white/70">
                    <Play size={13} fill="currentColor" />

                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      New content
                    </span>
                  </div>

                  <p className="mt-1 max-w-sm text-xl font-black text-white">
                    Create content people want to stop and see.
                  </p>
                </div>
              </div>

              {/* Engagement row */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div
                  className="
                    rounded-xl border
                    border-slate-100 p-3
                    dark:border-slate-700
                    dark:bg-slate-800/60
                  "
                >
                  <Heart
                    size={15}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />

                  <p
                    className="
                      mt-2 text-base font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    8.4K
                  </p>

                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    Engagement
                  </p>
                </div>

                <div
                  className="
                    rounded-xl border
                    border-slate-100 p-3
                    dark:border-slate-700
                    dark:bg-slate-800/60
                  "
                >
                  <Eye
                    size={15}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />

                  <p
                    className="
                      mt-2 text-base font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    42K
                  </p>

                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    Reach
                  </p>
                </div>

                <div
                  className="
                    rounded-xl border
                    border-slate-100 p-3
                    dark:border-slate-700
                    dark:bg-slate-800/60
                  "
                >
                  <TrendingUp
                    size={15}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />

                  <p
                    className="
                      mt-2 text-base font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    +28%
                  </p>

                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    Growth
                  </p>
                </div>
              </div>
            </div>

            {/* Floating notification */}
            <div
              className="
                absolute -left-3 top-24 hidden w-48
                rounded-2xl border
                border-white
                bg-white p-3
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
                sm:block lg:-left-10
              "
            >
              <div className="flex gap-3">
                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    bg-emerald-500/10
                    dark:bg-emerald-400/10
                  "
                >
                  <MessageCircle
                    size={16}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                    NEW MESSAGE
                  </p>

                  <p
                    className="
                      mt-1 text-xs font-bold
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    Can I know more?
                  </p>
                </div>
              </div>
            </div>

            {/* Floating growth */}
            <div
              className="
                absolute -bottom-5 right-0 hidden
                rounded-2xl border
                border-white
                bg-white px-4 py-3
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
                lg:-right-7
                sm:block
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-emerald-500/10
                    dark:bg-emerald-400/10
                  "
                >
                  <TrendingUp
                    size={18}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Monthly growth
                  </p>

                  <p
                    className="
                      text-sm font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    +28.6%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   INTRO
========================================================= */

function IntroSection() {
  return (
    <section
      className="
        bg-white px-5 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-8
        lg:px-12 lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Visual */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=85"
                alt="Social media planning"
                className="h-[470px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/90 via-[#0C2C50]/10 to-transparent" />

              <div className="absolute bottom-7 left-7 right-7">
                <span className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                  The real job
                </span>

                <h3 className="mt-2 max-w-md text-2xl font-black text-white sm:text-3xl">
                  Not just posting. Building relationships.
                </h3>
              </div>
            </div>

            {/* Side card */}
            <div
              className="
                absolute -bottom-7 -right-3
                rounded-2xl border
                border-slate-100
                bg-white p-4
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
                sm:-right-7
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-emerald-500/10
                    dark:bg-emerald-400/10
                  "
                >
                  <Users
                    size={20}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    Real people
                  </p>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Real conversations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>

            <h2
              className="
                mt-5 max-w-2xl
                !text-4xl !font-black
                leading-tight tracking-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-5xl
              "
            >
              Your audience is already online.
              <span className="text-[#2E9E6D] dark:text-emerald-400">
                {" "}
                Be there properly.
              </span>
            </h2>

            <p
              className="
                mt-6 max-w-2xl
                text-[15px] leading-8
                text-slate-500
                dark:text-slate-400
              "
            >
              A social media profile is often the first place people check
              before trusting a business. An inactive profile, inconsistent
              content or unanswered messages can quietly cost opportunities.
            </p>

            <p
              className="
                mt-4 max-w-2xl
                text-[15px] leading-8
                text-slate-500
                dark:text-slate-400
              "
            >
              Our job is to make your brand look active, professional,
              approachable and useful — every day.
            </p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              {[
                "Consistent brand presence",
                "Professional profile management",
                "Better audience engagement",
                "Faster customer responses",
                "Relevant content planning",
                "Performance-driven decisions",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    flex items-center gap-3
                    rounded-xl border
                    border-slate-100
                    bg-[#F7FAF9]
                    p-4
                    transition-colors duration-300
                    dark:border-slate-800
                    dark:bg-slate-900
                  "
                >
                  <div
                    className="
                      flex h-7 w-7
                      flex-shrink-0
                      items-center justify-center
                      rounded-lg
                      bg-emerald-500/10
                      dark:bg-emerald-400/10
                    "
                  >
                    <Check
                      size={14}
                      className="text-[#2E9E6D] dark:text-emerald-400"
                    />
                  </div>

                  <span
                    className="
                      text-xs font-bold
                      text-[#0C2C50]
                      dark:text-slate-200
                    "
                  >
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICES
========================================================= */

function ServicesSection() {
  return (
    <section
      id="services"
      className="
        relative overflow-hidden
        bg-[#F5F8F7]
        px-5 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-8
        lg:px-12 lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">

            <h2
              className="
                mt-5 !text-4xl !font-black
                tracking-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-5xl
              "
            >
              Everything your social presence needs.
            </h2>
          </div>

          <p
            className="
              max-w-md text-sm leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            From the first strategy meeting to daily community interactions, we
            manage the moving parts behind your social media presence.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="
                  group relative overflow-hidden
                  rounded-[1.5rem]
                  border
                  border-slate-200
                  bg-white p-7
                  transition duration-500
                  hover:-translate-y-2
                  hover:border-emerald-300
                  hover:shadow-[0_30px_70px_-35px_rgba(12,44,80,.35)]
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:border-emerald-800
                  dark:hover:shadow-[0_30px_70px_-35px_rgba(0,0,0,.65)]
                "
              >
                <div className="flex items-start justify-between">
                  <div
                    className="
                      flex h-12 w-12
                      items-center justify-center
                      rounded-2xl
                      bg-[#EAF7F1]
                      transition duration-300
                      group-hover:scale-110
                      dark:bg-emerald-400/10
                    "
                  >
                    <Icon
                      size={21}
                      className="text-[#2E9E6D] dark:text-emerald-400"
                    />
                  </div>

                  <span
                    className="
                      text-[10px] font-black
                      text-slate-200
                      dark:text-slate-700
                    "
                  >
                    0{index + 1}
                  </span>
                </div>

                <h3
                  className="
                    mt-7 text-xl font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  {service.title}
                </h3>

                <p
                  className="
                    mt-3 text-[13px] leading-7
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {service.text}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        rounded-full
                        bg-[#F5F8F7]
                        px-3 py-1.5
                        text-[9px] font-bold
                        text-slate-500
                        dark:bg-slate-800
                        dark:text-slate-400
                      "
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div
                  className="
                    pointer-events-none absolute
                    -bottom-12 -right-12
                    h-28 w-28 rounded-full
                    opacity-0 blur-2xl
                    transition duration-500
                    group-hover:opacity-30
                  "
                  style={{ background: GREEN }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PLATFORMS
========================================================= */

function PlatformsSection() {
  return (
    <section
      className="
        bg-white px-5 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-8
        lg:px-12 lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>

            <h2
              className="
                mt-4 !text-4xl !font-black
                tracking-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-5xl
              "
            >
              Be present where
              <br />
              your audience is.
            </h2>
          </div>

          <p
            className="
              max-w-md text-sm leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            We don't believe every business needs every platform. We focus on
            the channels where your audience and opportunities actually exist.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="
                group relative min-h-[290px]
                overflow-hidden rounded-[1.5rem]
              "
            >
              <img
                src={platform.image}
                alt={platform.name}
                className="
                  absolute inset-0
                  h-full w-full object-cover
                  transition duration-700
                  group-hover:scale-110
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#061B31] via-[#0C2C50]/40 to-transparent" />

              <div
                className="
                  absolute left-5 top-5
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl border
                  border-white/20
                  bg-white/10
                  text-xs font-black
                  text-white
                  backdrop-blur-md
                "
              >
                {platform.short}
              </div>

              <div className="absolute bottom-5 left-5 right-5">
                <h3 className="text-xl font-black text-white">
                  {platform.name}
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-5 text-white/65">
                  {platform.text}
                </p>

                <div className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-white/70">
                  Explore strategy
                  <ArrowRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CONTENT PLANNER
========================================================= */

function ContentSection() {
  return (
    <section
      className="
        overflow-hidden
        bg-[#EEF6F3]
        px-5 py-20
        transition-colors duration-300
        dark:bg-[#071A15]
        sm:px-8
        lg:px-12 lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>

            <h2
              className="
                mt-5 !text-4xl !font-black
                leading-tight tracking-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-5xl
              "
            >
              Every post has
              <br />
              <span className="text-[#2E9E6D] dark:text-emerald-400">
                a purpose.
              </span>
            </h2>

            <p
              className="
                mt-6 max-w-xl
                text-[15px] leading-8
                text-slate-500
                dark:text-slate-400
              "
            >
              Your social feed shouldn't feel like a random collection of posts.
              We create a balanced content mix that informs, entertains, builds
              trust and moves people closer to your business.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {contentTypes.map((item) => (
                <span
                  key={item}
                  className="
                    rounded-full border
                    border-white
                    bg-white
                    px-4 py-2
                    text-[10px] font-bold
                    text-slate-600
                    shadow-sm
                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-slate-300
                  "
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Content mockup */}
          <div className="relative">
            <div
              className="
                rounded-[2rem] border
                border-white
                bg-white p-4
                shadow-[0_30px_80px_-35px_rgba(12,44,80,.3)]
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <div
                className="
                  flex items-center justify-between
                  border-b
                  border-slate-100
                  pb-4
                  dark:border-slate-800
                "
              >
                <div>
                  <p
                    className="
                      text-sm font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    Content Planner
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400 dark:text-slate-500">
                    September content calendar
                  </p>
                </div>

                <div
                  className="
                    rounded-lg
                    bg-emerald-500/10
                    p-2
                    dark:bg-emerald-400/10
                  "
                >
                  <CalendarDays
                    size={16}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-7 gap-1">
                {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                  <div
                    key={`${day}-${i}`}
                    className="
                      py-2 text-center text-[8px]
                      font-bold text-slate-400
                      dark:text-slate-500
                    "
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, index) => {
                  const active = [2, 5, 8, 12, 15, 18, 22, 25].includes(index);

                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square rounded-lg border p-1
                        ${
                          active
                            ? "border-[#2E9E6D]/20 bg-[#EAF7F1] dark:border-emerald-400/20 dark:bg-emerald-400/10"
                            : "border-slate-50 dark:border-slate-800"
                        }
                      `}
                    >
                      <span className="text-[7px] text-slate-300 dark:text-slate-600">
                        {index + 1}
                      </span>

                      {active && (
                        <div
                          className="mt-1 h-1.5 w-full rounded-full"
                          style={{ background: GREEN }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className="
                    rounded-xl
                    bg-[#F7FAF9]
                    p-3
                    dark:bg-slate-800
                  "
                >
                  <ImageIcon
                    size={14}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />

                  <p
                    className="
                      mt-2 text-xl font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    18
                  </p>

                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    Posts
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    bg-[#F7FAF9]
                    p-3
                    dark:bg-slate-800
                  "
                >
                  <Video
                    size={14}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />

                  <p
                    className="
                      mt-2 text-xl font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    08
                  </p>

                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    Reels
                  </p>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div
              className="
                absolute -bottom-5 -left-3 hidden
                rounded-2xl border
                border-white
                bg-white p-3
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
                sm:block lg:-left-8
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-emerald-500/10
                    dark:bg-emerald-400/10
                  "
                >
                  <CheckCircle2
                    size={17}
                    className="text-[#2E9E6D] dark:text-emerald-400"
                  />
                </div>

                <div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500">
                    CONTENT STATUS
                  </p>

                  <p
                    className="
                      text-xs font-black
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    All scheduled
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COMMUNITY
========================================================= */

function CommunitySection() {
  return (
    <section
      className="
        bg-white px-5 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-8
        lg:px-12 lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* PHONE MOCKUP */}
          <div className="relative mx-auto w-full max-w-[440px]">
            <div
              className="
                pointer-events-none absolute
                inset-12 rounded-full
                bg-emerald-500/[0.08]
                blur-3xl
                dark:bg-emerald-400/[0.04]
              "
            />

            <div
              className="
                relative mx-auto
                max-w-[340px]
                rounded-[2.5rem]
                border-[8px]
                border-[#102F4E]
                bg-white p-3
                shadow-2xl
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-[#102F4E] dark:bg-slate-700" />

              <div
                className="
                  rounded-2xl
                  bg-[#EAF7F1] p-5
                  dark:bg-emerald-400/10
                "
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                      text-xs font-black text-white
                    "
                    style={{ background: NAVY }}
                  >
                    DA
                  </div>

                  <div>
                    <p
                      className="
                        text-xs font-black
                        text-[#0C2C50]
                        dark:text-slate-100
                      "
                    >
                      Your Brand
                    </p>

                    <p className="text-[9px] text-slate-400 dark:text-slate-500">
                      Customer Support
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div
                  className="
                    ml-auto max-w-[80%]
                    rounded-2xl rounded-br-md
                    bg-[#F1F4F3]
                    p-3
                    dark:bg-slate-800
                  "
                >
                  <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                    Hi! I wanted to know more about your service.
                  </p>
                </div>

                <div
                  className="
                    max-w-[80%]
                    rounded-2xl rounded-bl-md
                    bg-[#EAF7F1] p-3
                    dark:bg-emerald-400/10
                  "
                >
                  <p
                    className="
                      text-[10px] leading-5
                      text-[#0C2C50]
                      dark:text-slate-200
                    "
                  >
                    Absolutely! We'd be happy to help. Let us share the details
                    with you.
                  </p>
                </div>

                <div
                  className="
                    ml-auto max-w-[65%]
                    rounded-2xl rounded-br-md
                    bg-[#F1F4F3] p-3
                    dark:bg-slate-800
                  "
                >
                  <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
                    Perfect, thank you!
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-8 flex items-center gap-2
                  rounded-xl border
                  border-slate-100 p-2
                  dark:border-slate-700
                "
              >
                <div className="flex-1 px-2 text-[9px] text-slate-300 dark:text-slate-600">
                  Type a message...
                </div>

                <div
                  className="
                    flex h-8 w-8
                    items-center justify-center
                    rounded-lg
                  "
                  style={{ background: GREEN }}
                >
                  <Send size={13} color="white" />
                </div>
              </div>
            </div>

            <div
              className="
                absolute -right-2 top-20 hidden
                rounded-2xl border
                border-white
                bg-white p-3
                shadow-xl
                dark:border-slate-700
                dark:bg-slate-900
                sm:block
              "
            >
              <div className="flex items-center gap-2">
                <Bell
                  size={15}
                  className="text-[#2E9E6D] dark:text-emerald-400"
                />

                <span
                  className="
                    text-[10px] font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Fast replies
                </span>
              </div>
            </div>
          </div>

          {/* TEXT */}
          <div>

            <h2
              className="
                mt-5 !text-4xl !font-black
                leading-tight tracking-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-5xl
              "
            >
              Don't let your
              <br />
              audience wait.
            </h2>

            <p
              className="
                mt-6 max-w-xl
                text-[15px] leading-8
                text-slate-500
                dark:text-slate-400
              "
            >
              Social media is a two-way conversation. When people comment,
              message or ask questions, your brand needs to respond.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: MessageCircle,
                  title: "Comments & Conversations",
                  text: "Keep your community active and your brand voice consistent.",
                },
                {
                  icon: Send,
                  title: "Direct Messages",
                  text: "Handle enquiries and potential customer conversations professionally.",
                },
                {
                  icon: Users,
                  title: "Audience Engagement",
                  text: "Interact with people instead of simply waiting for likes.",
                },
                {
                  icon: ShieldCheck,
                  title: "Brand Reputation",
                  text: "Monitor conversations and maintain a professional presence.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="
                      flex gap-4 rounded-2xl
                      border border-slate-100 p-4
                      transition-all
                      hover:border-[#2E9E6D]/20
                      hover:bg-[#F7FAF9]
                      dark:border-slate-800
                      dark:hover:bg-slate-900
                    "
                  >
                    <div
                      className="
                        flex h-11 w-11
                        flex-shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-emerald-500/10
                        dark:bg-emerald-400/10
                      "
                    >
                      <Icon
                        size={18}
                        className="text-[#2E9E6D] dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <h3
                        className="
                          text-sm font-black
                          text-[#0C2C50]
                          dark:text-slate-100
                        "
                      >
                        {item.title}
                      </h3>

                      <p
                        className="
                          mt-1 text-xs leading-5
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        {item.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsSection() {
  return (
    <section
      className="
        overflow-hidden
        bg-[#0C2C50] px-5 py-20
        transition-colors duration-300
        dark:bg-[#06111F]
        sm:px-8
        lg:px-12 lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <div>

            <h2 className="mt-5 !text-4xl !font-black leading-tight tracking-tight !text-white sm:text-5xl">
              We don't just post.
              <br />
              <span className="text-emerald-300">We measure what happens.</span>
            </h2>

            <p className="mt-6 max-w-xl text-[15px] leading-8 text-white/55">
              Likes are only one part of the picture. We look at reach,
              engagement, audience growth, content performance, traffic and
              leads to understand what is actually working.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                "Reach",
                "Engagement",
                "Audience Growth",
                "Content Performance",
                "Website Traffic",
                "Lead Generation",
              ].map((item) => (
                <div
                  key={item}
                  className="
                    rounded-xl border
                    border-white/10
                    bg-white/[0.04]
                    p-4
                  "
                >
                  <CheckCircle2 size={14} color={GREEN_LIGHT} />

                  <p className="mt-3 text-[10px] font-bold text-white">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ANALYTICS DASHBOARD */}
          <div className="relative">
            <div
              className="
                rounded-[2rem]
                border
                border-white/10
                bg-white p-4
                shadow-2xl
                dark:border-slate-700
                sm:p-6
              "
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="
                      text-sm font-black
                      text-[#0C2C50]
                    "
                  >
                    Social Performance
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">Last 30 days</p>
                </div>

                <div
                  className="
                    rounded-xl px-3 py-2
                    text-[9px] font-bold
                    bg-emerald-500/10
                    text-[#2E9E6D]
                  "
                >
                  +28.6%
                </div>
              </div>

              {/* Chart */}
              <div
                className="
                  mt-7 flex h-52
                  items-end gap-2
                  rounded-2xl
                  bg-[#F7FAF9] p-5
                  dark:bg-slate-800
                "
              >
                {[35, 48, 42, 60, 55, 72, 64, 82, 76, 92, 86, 100].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="group relative flex h-full flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-lg transition duration-300 group-hover:opacity-70"
                        style={{
                          height: `${height}%`,
                          background: index > 8 ? GREEN : `${GREEN}65`,
                        }}
                      />
                    </div>
                  ),
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div
                  className="
                    rounded-xl border
                    border-slate-100 p-4
                    dark:border-slate-700
                  "
                >
                  <Eye size={15} className="text-[#2E9E6D]" />

                  <p
                    className="
                      mt-2 text-xl font-black
                      text-[#0C2C50]
                    "
                  >
                    42K
                  </p>

                  <p className="text-[9px] text-slate-400">Reach</p>
                </div>

                <div
                  className="
                    rounded-xl border
                    border-slate-100 p-4
                    dark:border-slate-700
                  "
                >
                  <Heart size={15} className="text-[#2E9E6D]" />

                  <p
                    className="
                      mt-2 text-xl font-black
                      text-[#0C2C50]
                    "
                  >
                    8.4K
                  </p>

                  <p className="text-[9px] text-slate-400">Engagement</p>
                </div>

                <div
                  className="
                    rounded-xl border
                    border-slate-100 p-4
                    dark:border-slate-700
                  "
                >
                  <MousePointerClick size={15} className="text-[#2E9E6D]" />

                  <p
                    className="
                      mt-2 text-xl font-black
                      text-[#0C2C50]
                    "
                  >
                    3.8K
                  </p>

                  <p className="text-[9px] text-slate-400">Clicks</p>
                </div>
              </div>
            </div>

            <div
              className="
                absolute -bottom-5 -left-5 hidden
                rounded-2xl border
                border-white/10
                bg-[#173B5D]
                px-4 py-3
                shadow-xl
                sm:block
              "
            >
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className="text-emerald-300" />

                <div>
                  <p className="text-[9px] text-white/40">PERFORMANCE</p>

                  <p className="text-xs font-black text-white">
                    Moving in the right direction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PROCESS
========================================================= */

function ProcessSection() {
  return (
    <section
      className="
        bg-[#F5F8F7] px-5 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-8
        lg:px-12 lg:py-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center"> 

          <h2
            className="
              mt-5 !text-4xl !font-black
              tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              sm:text-5xl
            "
          >
            From idea to impact.
          </h2>

          <p
            className="
              mt-5 text-sm leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            A simple but structured workflow keeps your social media consistent,
            purposeful and continuously improving.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Line */}
          <div
            className="
              absolute left-[9%] right-[9%]
              top-8 hidden h-px
              bg-slate-200
              dark:bg-slate-800
              lg:block
            "
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {process.map((item) => (
              <div key={item.number} className="relative text-center">
                <div
                  className="
                    relative mx-auto flex h-16 w-16
                    items-center justify-center
                    rounded-2xl border-4
                    border-white
                    text-xs font-black text-white
                    shadow-lg
                    dark:border-[#07111F]
                  "
                  style={{
                    background: GREEN,
                  }}
                >
                  {item.number}
                </div>

                <h3
                  className="
                    mt-5 text-sm font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-2 text-[11px] leading-5
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CTA
========================================================= */

function CTASection() {
  return (
    <section
      className="
        bg-white px-5 pb-20 pt-4
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-8
        lg:px-12 lg:pb-28
      "
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="
            relative overflow-hidden
            rounded-[2rem]
            bg-[#0C2C50]
            dark:bg-[#06111F]
          "
        >
          {/* Background glow */}
          <div
            className="
              pointer-events-none absolute
              -right-24 -top-24
              h-72 w-72 rounded-full
              blur-3xl
            "
            style={{
              background: `${GREEN}35`,
            }}
          />

          <div
            className="
              pointer-events-none absolute
              -bottom-24 -left-24
              h-64 w-64 rounded-full
              blur-3xl
            "
            style={{
              background: `${GREEN}18`,
            }}
          />

          <div className="relative px-7 py-12 sm:px-12 sm:py-16 lg:px-16">
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
              <div className="max-w-xl">

                <h2 className="!text-4xl font-black leading-tight tracking-tight !text-white sm:text-5xl">
                  Your brand deserves a social presence
                  <span className="text-emerald-300"> people remember.</span>
                </h2>

                <p className="mt-5 text-sm leading-7 text-white/55">
                  Let's create a social media system that keeps your brand
                  visible, your audience engaged and your content moving in the
                  right direction.
                </p>
              </div>

              <div>
                <a
                  href="/quote"
                  className="
                    group inline-flex items-center gap-3
                    rounded-xl px-7 py-4
                    text-sm font-black text-white
                    transition duration-300
                    hover:-translate-y-1
                  "
                  style={{
                    background: GREEN,
                    boxShadow: `0 18px 45px ${GREEN}30`,
                  }}
                >
                  Start Social Media Handling
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

                <div className="mt-4 flex items-center gap-2 text-[9px] font-bold text-white/30">
                  <CheckCircle2 size={12} className="text-emerald-300" />
                  Strategy
                  <span>•</span>
                  Content
                  <span>•</span>
                  Engagement
                  <span>•</span>
                  Analytics
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function SocialMediaHandling() {
  return (
    <main
      className="
        w-full overflow-x-hidden
        bg-white
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <Hero />
      <IntroSection />
      <ServicesSection />
      <PlatformsSection />
      <ContentSection />
      <CommunitySection />
      <AnalyticsSection />
      <ProcessSection />
      <CTASection />
    </main>
  );
}
