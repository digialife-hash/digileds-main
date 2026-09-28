import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Eye,
  MousePointerClick,
  Target,
  TrendingUp,
  Users,
  Zap,
  Layers3,
  Megaphone,
  Settings2,
  LineChart,
  Sparkles,
  CircleDollarSign,
  Smartphone,
} from "lucide-react";

const NAVY = "#0C2C50";
const GREEN = "#2E9E6D";
const LIGHT_GREEN = "#4CBB8E";
const MIST = "#F5FAF8";

/* =========================================================
   CAMPAIGN SERVICES
========================================================= */

const campaignServices = [
  {
    icon: Target,
    title: "Audience Targeting",
    text: "Reach people based on interests, behavior, demographics and business intent.",
  },
  {
    icon: Megaphone,
    title: "Campaign Creation",
    text: "Build conversion-focused campaigns with the right objective, creative and messaging.",
  },
  {
    icon: Layers3,
    title: "Ad Funnel Strategy",
    text: "Connect awareness, consideration and conversion campaigns into one growth funnel.",
  },
  {
    icon: Settings2,
    title: "Campaign Management",
    text: "Monitor campaigns, control budgets and make regular performance improvements.",
  },
  {
    icon: LineChart,
    title: "Performance Optimization",
    text: "Test audiences, creatives, placements and campaigns to improve overall efficiency.",
  },
  {
    icon: BarChart3,
    title: "Reporting & Analytics",
    text: "Track important metrics and understand where your advertising budget is going.",
  },
];

/* =========================================================
   AD TYPES
========================================================= */

const adTypes = [
  {
    title: "Lead Generation",
    text: "Generate enquiries and potential customers using targeted Meta campaigns.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=85",
  },
  {
    title: "Website Conversions",
    text: "Drive relevant visitors to your website and encourage valuable actions.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=85",
  },
  {
    title: "Product Promotion",
    text: "Put products and offers in front of audiences most likely to buy.",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1000&q=85",
  },
  {
    title: "Brand Awareness",
    text: "Increase visibility and introduce your brand to relevant audiences.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1000&q=85",
  },
];

/* =========================================================
   PROCESS
========================================================= */

const process = [
  {
    number: "01",
    title: "Research",
    text: "Understand your business, audience, competitors and advertising goals.",
  },
  {
    number: "02",
    title: "Plan",
    text: "Define campaign objectives, audiences, funnel structure and budget.",
  },
  {
    number: "03",
    title: "Create",
    text: "Develop ad creatives, copy and landing-page messaging around the campaign.",
  },
  {
    number: "04",
    title: "Launch",
    text: "Launch campaigns with carefully selected audiences, placements and objectives.",
  },
  {
    number: "05",
    title: "Optimize",
    text: "Analyze performance and continuously improve what is working.",
  },
  {
    number: "06",
    title: "Scale",
    text: "Increase investment in winning campaigns while controlling unnecessary spend.",
  },
];

/* =========================================================
   HERO
========================================================= */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#EAF5F2] px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
      {/* Background decoration */}
      <div
        className="absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full blur-3xl"
        style={{ background: `${GREEN}18` }}
      />

      <div
        className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full blur-3xl"
        style={{ background: `${NAVY}08` }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_.95fr]">
          {/* LEFT */}
          <div>
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
              style={{
                borderColor: `${GREEN}35`,
                background: "rgba(255,255,255,.7)",
              }}
            >
              <Sparkles size={14} color={GREEN} />

              <span
                className="text-[10px] font-bold uppercase tracking-[.22em]"
                style={{ color: GREEN }}
              >
                Meta Advertising
              </span>
            </div>

            <h1
              className="max-w-2xl text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-[62px]"
              style={{ color: NAVY }}
            >
              Ads that reach
              <br />
              <span style={{ color: GREEN }}>the right audience.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              We create and manage Meta advertising campaigns designed to
              increase visibility, generate leads, drive website actions and
              turn your advertising budget into measurable business growth.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                as="a"
                variant="unstyled"
                href="/quote"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition duration-300 hover:-translate-y-1"
                style={{
                  background: GREEN,
                  boxShadow: `0 18px 40px ${GREEN}35`,
                }}
              >
                Start advertising
                <ArrowRight size={17} />
              </Button>

              <Button
                as="a"
                variant="unstyled"
                href="#campaigns"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold"
                style={{ color: NAVY }}
              >
                Explore campaigns
                <ChevronRight size={16} />
              </Button>
            </div>

            {/* Mini stats */}
            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white bg-white/80 p-4">
                <Target size={18} color={GREEN} />

                <p className="mt-3 text-lg font-black" style={{ color: NAVY }}>
                  Target
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Right audience
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white/80 p-4">
                <TrendingUp size={18} color={GREEN} />

                <p className="mt-3 text-lg font-black" style={{ color: NAVY }}>
                  Optimize
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  Better results
                </p>
              </div>

              <div className="rounded-2xl border border-white bg-white/80 p-4">
                <BarChart3 size={18} color={GREEN} />

                <p className="mt-3 text-lg font-black" style={{ color: NAVY }}>
                  Measure
                </p>

                <p className="mt-1 text-[10px] text-slate-400">Track growth</p>
              </div>
            </div>
          </div>

          {/* RIGHT - AD DASHBOARD */}
          <div className="relative mx-auto w-full max-w-xl">
            <div
              className="absolute inset-8 rounded-[3rem] blur-3xl"
              style={{ background: `${GREEN}22` }}
            />

            <div className="relative rounded-[2rem] border border-white bg-white p-3 shadow-[0_30px_80px_-25px_rgba(12,44,80,.35)]">
              <div className="rounded-[1.5rem] bg-[#F5F8F7] p-5">
                {/* Dashboard top */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">
                      Campaign dashboard
                    </p>

                    <h3
                      className="mt-1 text-lg font-black"
                      style={{ color: NAVY }}
                    >
                      Growth Campaign
                    </h3>
                  </div>

                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${GREEN}12` }}
                  >
                    <Megaphone size={18} color={GREEN} />
                  </div>
                </div>

                {/* Graph */}
                <div className="relative mt-6 overflow-hidden rounded-2xl bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">
                        Campaign performance
                      </p>

                      <p
                        className="mt-1 text-2xl font-black"
                        style={{ color: NAVY }}
                      >
                        +38.6%
                      </p>
                    </div>

                    <div
                      className="rounded-full px-3 py-1 text-[9px] font-bold"
                      style={{
                        background: `${GREEN}12`,
                        color: GREEN,
                      }}
                    >
                      Growing
                    </div>
                  </div>

                  {/* Fake graph */}
                  <div className="mt-6 flex h-32 items-end gap-2">
                    {[35, 45, 42, 58, 54, 68, 61, 78, 73, 92].map(
                      (height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t-md transition-all duration-300 hover:opacity-70"
                          style={{
                            height: `${height}%`,
                            background: index === 9 ? GREEN : `${GREEN}45`,
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Eye size={15} color={GREEN} />

                      <span className="text-[10px] text-slate-400">Reach</span>
                    </div>

                    <p
                      className="mt-2 text-lg font-black"
                      style={{ color: NAVY }}
                    >
                      48.2K
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-2">
                      <MousePointerClick size={15} color={GREEN} />

                      <span className="text-[10px] text-slate-400">Clicks</span>
                    </div>

                    <p
                      className="mt-2 text-lg font-black"
                      style={{ color: NAVY }}
                    >
                      3.8K
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-2">
                      <Users size={15} color={GREEN} />

                      <span className="text-[10px] text-slate-400">Leads</span>
                    </div>

                    <p
                      className="mt-2 text-lg font-black"
                      style={{ color: NAVY }}
                    >
                      426
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign size={15} color={GREEN} />

                      <span className="text-[10px] text-slate-400">
                        Efficiency
                      </span>
                    </div>

                    <p
                      className="mt-2 text-lg font-black"
                      style={{ color: NAVY }}
                    >
                      +24%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-white bg-white px-4 py-3 shadow-xl sm:block md:-left-8">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${GREEN}12` }}
                >
                  <Zap size={17} color={GREEN} />
                </div>

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Optimization
                  </p>

                  <p
                    className="mt-0.5 text-sm font-black"
                    style={{ color: NAVY }}
                  >
                    Campaign improving
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
    <section className="bg-white px-6 py-20 sm:px-10 lg:px-14">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1557838923-2985c318be48?w=1200&q=85"
              alt="Meta advertising strategy"
              className="h-[430px] w-full object-cover"
            />

            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-[#0C2C50]/80 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
              Smart advertising
            </p>

            <p className="mt-1 text-lg font-bold text-white">
              Don't spend more. Advertise smarter.
            </p>
          </div>
        </div>

        <div>
          <p
            className="text-xs font-bold uppercase tracking-[.25em]"
            style={{ color: GREEN }}
          >
            Why Meta Ads
          </p>

          <h2
            className="mt-4 text-3xl font-black leading-tight sm:text-4xl"
            style={{ color: NAVY }}
          >
            Your advertising budget deserves a strategy.
          </h2>

          <p className="mt-6 leading-8 text-slate-600">
            Running advertisements is easy. Building campaigns that reach the
            right people, communicate the right message and produce useful
            business outcomes requires a proper strategy.
          </p>

          <p className="mt-4 leading-8 text-slate-500">
            We combine audience research, creative testing, campaign management
            and performance analysis to continuously improve your advertising
            efforts.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Audience-focused campaigns",
              "Creative testing",
              "Budget management",
              "Conversion-focused strategy",
              "Performance tracking",
              "Continuous optimization",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#F7FAF9] px-4 py-3"
              >
                <CheckCircle2 size={16} color={GREEN} />

                <span className="text-sm font-semibold" style={{ color: NAVY }}>
                  {item}
                </span>
              </div>
            ))}
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
      id="campaigns"
      className="px-6 py-20 sm:px-10 lg:px-14"
      style={{ background: MIST }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-2xl">
          <p
            className="text-xs font-bold uppercase tracking-[.25em]"
            style={{ color: GREEN }}
          >
            What we manage
          </p>

          <h2
            className="mt-4 text-3xl font-black sm:text-4xl"
            style={{ color: NAVY }}
          >
            Complete Meta advertising management.
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-500">
            From audience research to campaign optimization, we handle the
            important pieces required to build a structured advertising system.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campaignServices.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:shadow-[0_25px_60px_-25px_rgba(12,44,80,.3)]"
              >
                <div
                  className="absolute right-0 top-0 h-28 w-28 rounded-full blur-3xl opacity-0 transition duration-500 group-hover:opacity-100"
                  style={{ background: `${GREEN}18` }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${GREEN}12` }}
                    >
                      <Icon size={21} color={GREEN} />
                    </div>

                    <span className="text-[10px] font-black text-slate-300">
                      0{index + 1}
                    </span>
                  </div>

                  <h3
                    className="mt-7 text-xl font-black"
                    style={{ color: NAVY }}
                  >
                    {service.title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-7 text-slate-500">
                    {service.text}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold">
                    <span style={{ color: GREEN }}>Learn more</span>
                    <ArrowRight size={13} color={GREEN} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   AD TYPES
========================================================= */

function AdTypesSection() {
  return (
    <section className="bg-white px-6 py-20 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p
            className="text-xs font-bold uppercase tracking-[.25em]"
            style={{ color: GREEN }}
          >
            Campaign objectives
          </p>

          <h2
            className="mt-4 text-3xl font-black sm:text-4xl"
            style={{ color: NAVY }}
          >
            Different goals need different campaigns.
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-500">
            We build campaigns around what you actually want to achieve —
            instead of simply chasing clicks or impressions.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {adTypes.map((item) => (
            <div
              key={item.title}
              className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/90 via-[#0C2C50]/20 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-2xl font-black text-white">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm leading-7 text-slate-500">{item.text}</p>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold">
                  <CheckCircle2 size={14} color={GREEN} />
                  Campaign-focused approach
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
   TARGETING
========================================================= */

function TargetingSection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-14"
      style={{ background: NAVY }}
    >
      <div
        className="absolute -right-32 top-0 h-80 w-80 rounded-full blur-3xl"
        style={{ background: `${GREEN}20` }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-[.25em]"
            style={{ color: LIGHT_GREEN }}
          >
            Audience targeting
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
            Reach people who are more likely to care.
          </h2>

          <p className="mt-5 leading-8 text-white/60">
            Effective advertising starts with understanding who your ideal
            customer is and creating campaigns around their needs, interests and
            behavior.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Demographics",
              "Interests",
              "Behaviours",
              "Lookalike Audiences",
              "Custom Audiences",
              "Retargeting",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] p-4"
              >
                <Target size={15} color={LIGHT_GREEN} />

                <span className="text-xs font-bold text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-white/10 bg-white/[.05] p-5 backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.2em] text-slate-400">
                    Audience overview
                  </p>

                  <p
                    className="mt-2 text-xl font-black"
                    style={{ color: NAVY }}
                  >
                    Ideal Customers
                  </p>
                </div>

                <Users size={22} color={GREEN} />
              </div>

              <div className="mt-7 space-y-5">
                {[
                  ["Interest match", "82%"],
                  ["Audience relevance", "91%"],
                  ["Purchase intent", "76%"],
                  ["Retargeting potential", "88%"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mb-2 flex justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        {label}
                      </span>

                      <span
                        className="text-xs font-black"
                        style={{ color: GREEN }}
                      >
                        {value}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: value,
                          background: GREEN,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   OPTIMIZATION
========================================================= */

function OptimizationSection() {
  return (
    <section className="bg-white px-6 py-20 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85"
              alt="Advertising analytics"
              className="h-[450px] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/90 via-transparent to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                Performance optimization
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                Test what works. Improve what doesn't.
              </h3>
            </div>
          </div>

          <div>
            <p
              className="text-xs font-bold uppercase tracking-[.25em]"
              style={{ color: GREEN }}
            >
              Continuous optimization
            </p>

            <h2
              className="mt-4 text-3xl font-black leading-tight sm:text-4xl"
              style={{ color: NAVY }}
            >
              Your campaign should never stay static.
            </h2>

            <p className="mt-5 leading-8 text-slate-500">
              We monitor campaign performance and use the data to identify
              opportunities for improvement. Creative, audience, placement and
              budget decisions can all be tested and refined.
            </p>

            <div className="mt-8 space-y-4">
              {[
                {
                  icon: Eye,
                  title: "Monitor",
                  text: "Keep track of campaign performance and important advertising signals.",
                },
                {
                  icon: Zap,
                  title: "Test",
                  text: "Experiment with different creatives, audiences and campaign approaches.",
                },
                {
                  icon: TrendingUp,
                  title: "Improve",
                  text: "Shift focus toward the strategies producing stronger outcomes.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-[#F7FAF9] p-5"
                  >
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${GREEN}12` }}
                    >
                      <Icon size={18} color={GREEN} />
                    </div>

                    <div>
                      <h3
                        className="text-sm font-black"
                        style={{ color: NAVY }}
                      >
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-6 text-slate-500">
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
   PROCESS
========================================================= */

function ProcessSection() {
  return (
    <section
      className="px-6 py-20 sm:px-10 lg:px-14"
      style={{ background: MIST }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p
            className="text-xs font-bold uppercase tracking-[.25em]"
            style={{ color: GREEN }}
          >
            Our process
          </p>

          <h2
            className="mt-4 text-3xl font-black sm:text-4xl"
            style={{ color: NAVY }}
          >
            From idea to optimized campaign.
          </h2>

          <p className="mt-5 text-sm leading-7 text-slate-500">
            A structured advertising workflow keeps every campaign focused,
            measurable and ready to improve.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {process.map((item) => (
            <div
              key={item.number}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-white"
                  style={{ background: GREEN }}
                >
                  {item.number}
                </span>

                <ArrowRight
                  size={16}
                  className="opacity-30 transition group-hover:translate-x-1 group-hover:opacity-100"
                  color={GREEN}
                />
              </div>

              <h3 className="mt-6 text-lg font-black" style={{ color: NAVY }}>
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FINAL CTA
========================================================= */

function CTASection() {
  return (
    <section className="bg-white px-6 pb-20 pt-6 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0C2C50]">
          <div
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
            style={{ background: `${GREEN}30` }}
          />

          <div
            className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full blur-3xl"
            style={{ background: `${LIGHT_GREEN}15` }}
          />

          <div className="relative grid items-center gap-10 px-8 py-14 md:grid-cols-[1fr_auto] md:px-14 md:py-16">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <Sparkles size={14} color={LIGHT_GREEN} />

                <span className="text-[10px] font-bold uppercase tracking-[.2em] text-white/70">
                  Grow with paid advertising
                </span>
              </div>

              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                Ready to turn Meta Ads into a growth channel?
              </h2>

              <p className="mt-5 text-sm leading-7 text-white/60">
                Let's build campaigns around your audience, business goals and
                measurable outcomes.
              </p>
            </div>

            <a
              href="/quote"
              className="inline-flex w-fit items-center gap-2 rounded-xl px-7 py-4 text-sm font-black text-white transition duration-300 hover:-translate-y-1"
              style={{
                background: GREEN,
                boxShadow: `0 18px 45px ${GREEN}35`,
              }}
            >
              Get started
              <ArrowRight size={17} />
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

export default function MetaAds() {
  return (
    <main className="w-full overflow-x-hidden">
      <HeroSection />

      <IntroSection />

      <ServicesSection />

      <AdTypesSection />

      <TargetingSection />

      <OptimizationSection />

      <ProcessSection />

      <CTASection />
    </main>
  );
}
