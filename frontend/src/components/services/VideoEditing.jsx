import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  Play,
  Scissors,
  Sparkles,
  Palette,
  Captions,
  Music2,
  Smartphone,
  Check,
} from "lucide-react";

const NAVY = "#0C2C50";
const GREEN = "#2E9E6D";
const LIGHT = "#F5F8F6";
const GREEN_LIGHT = "#4CBB8E";

const services = [
  {
    number: "01",
    title: "Reels & Short Videos",
    description:
      "Fast, engaging and modern short-form videos designed for Instagram, YouTube Shorts and social platforms.",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=90",
    tag: "SHORT FORM",
  },
  {
    number: "02",
    title: "YouTube Video Editing",
    description:
      "Long-form videos with clean storytelling, B-roll, captions, sound design and professional pacing.",
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=1200&q=90",
    tag: "LONG FORM",
  },
  {
    number: "03",
    title: "Video Ads & Promotions",
    description:
      "Attention-grabbing promotional videos that communicate your product or service quickly and clearly.",
    image:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200&q=90",
    tag: "ADVERTISING",
  },
];

const features = [
  {
    icon: Scissors,
    title: "Clean Editing",
    text: "Precise cuts and smooth pacing.",
  },
  {
    icon: Palette,
    title: "Color Grading",
    text: "Professional visual finishing.",
  },
  {
    icon: Captions,
    title: "Captions",
    text: "Readable and engaging subtitles.",
  },
  {
    icon: Music2,
    title: "Sound Design",
    text: "Music, effects and audio polish.",
  },
];

const formats = [
  "Instagram Reels",
  "YouTube Shorts",
  "YouTube Videos",
  "Product Videos",
  "Video Advertisements",
  "Corporate Videos",
];

/* =========================================================
   HERO
========================================================= */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white text-[#0C2C50] dark:bg-[#020817] dark:text-white">
      {/* Soft background decoration */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: `${GREEN}12` }}
      />

      <div
        className="pointer-events-none absolute -left-40 bottom-[-220px] h-[450px] w-[450px] rounded-full blur-3xl"
        style={{ background: `${NAVY}08` }}
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-10 sm:px-10 lg:px-14 lg:pb-28 lg:pt-16">
        {/* Top mini label */}
        <div className="mb-10 flex items-center gap-3">
          <span
            className="h-[2px] w-8 rounded-full"
            style={{ background: GREEN }}
          />

          <span
            className="text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: GREEN }}
          >
            Creative Video Studio
          </span>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ================= LEFT ================= */}
          <div className="relative z-10">
            <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.045em] text-[#0C2C50] dark:text-white sm:text-6xl lg:text-[72px]">
              PROFESSIONAL
              <span className="block" style={{ color: GREEN }}>
                VIDEO EDITING
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-500 dark:text-slate-300 sm:text-lg">
              We transform raw footage into powerful videos that look
              professional, feel engaging and are ready to perform on every
              platform.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                as="a"
                variant="unstyled"
                href="/quote"
                className="group inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-sm font-black text-white shadow-lg transition duration-300 hover:-translate-y-1"
                style={{
                  background: GREEN,
                  boxShadow: `0 14px 35px ${GREEN}30`,
                }}
              >
                Start a project
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-1">
                  <ArrowRight size={15} />
                </span>
              </Button>

              <Button
                as="a"
                variant="unstyled"
                href="#work"
                className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-[#0C2C50] transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    background: `${GREEN}12`,
                    color: GREEN,
                  }}
                >
                  <Play size={13} fill="currentColor" />
                </span>
                Explore our work
              </Button>
            </div>

            {/* Small stats */}
            <div className="mt-10 flex flex-wrap items-center gap-7">
              <div>
                <p className="text-xl font-black text-[#0C2C50] dark:text-white">
                  4K
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Quality
                </p>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

              <div>
                <p className="text-xl font-black text-[#0C2C50] dark:text-white">
                  9:16
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Social Ready
                </p>
              </div>

              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

              <div>
                <p className="text-xl font-black text-[#0C2C50] dark:text-white">
                  Fast
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Delivery
                </p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT VISUAL ================= */}
          <div className="relative min-h-[470px] sm:min-h-[540px]">
            {/* Main editor window */}
            <div className="absolute right-0 top-4 w-full max-w-[650px] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(12,44,80,0.15)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
              {/* Editor top bar */}
              <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                </div>

                <div className="rounded-md bg-slate-50 px-4 py-1.5 text-[9px] font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                  VIDEO_PROJECT.mp4
                </div>

                <div
                  className="rounded-md px-3 py-1.5 text-[9px] font-black text-white"
                  style={{ background: GREEN }}
                >
                  EXPORT
                </div>
              </div>

              {/* Editor body */}
              <div className="grid grid-cols-[72px_1fr] bg-[#F7F9FA] dark:bg-[#0B1220]">
                {/* Tools */}
                <div className="border-r border-slate-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="space-y-3">
                    {[Scissors, Palette, Captions, Music2, Sparkles].map(
                      (Icon, index) => (
                        <div
                          key={index}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                            index === 0
                              ? "bg-[#EAF7F1] dark:bg-emerald-500/10"
                              : "bg-slate-50 dark:bg-slate-800"
                          }`}
                          style={{
                            color: index === 0 ? GREEN : undefined,
                          }}
                        >
                          <Icon
                            size={16}
                            className={
                              index === 0
                                ? ""
                                : "text-slate-400 dark:text-slate-500"
                            }
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Workspace */}
                <div className="p-4 sm:p-5">
                  {/* Preview */}
                  <div className="relative overflow-hidden rounded-xl bg-[#102B44]">
                    <img
                      src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&q=90"
                      alt="Video editing preview"
                      className="h-[245px] w-full object-cover sm:h-[300px]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#071D32]/70 via-transparent to-transparent" />

                    {/* Play */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md">
                        <Play size={19} fill="currentColor" className="ml-1" />
                      </div>
                    </div>

                    {/* Preview info */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/50">
                          Editing Preview
                        </p>

                        <p className="mt-1 text-sm font-black text-white">
                          Brand Campaign
                        </p>
                      </div>

                      <span className="rounded-md bg-white/15 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">
                        00:48
                      </span>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-4 rounded-xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Timeline
                      </span>

                      <span
                        className="text-[8px] font-black"
                        style={{ color: GREEN }}
                      >
                        00:48 / 01:20
                      </span>
                    </div>

                    <div className="relative h-14 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800">
                      {/* Track 1 */}
                      <div
                        className="absolute left-2 top-2 h-4 w-[42%] rounded"
                        style={{ background: `${GREEN}45` }}
                      />

                      <div className="absolute left-[45%] top-2 h-4 w-[25%] rounded bg-slate-200 dark:bg-slate-700" />

                      <div
                        className="absolute left-[73%] top-2 h-4 w-[22%] rounded"
                        style={{ background: `${GREEN}25` }}
                      />

                      {/* Track 2 */}
                      <div className="absolute bottom-2 left-2 h-3 w-[25%] rounded bg-slate-200 dark:bg-slate-700" />

                      <div
                        className="absolute bottom-2 left-[29%] h-3 w-[37%] rounded"
                        style={{
                          background: `${NAVY}18`,
                        }}
                      />

                      <div className="absolute bottom-2 left-[70%] h-3 w-[25%] rounded bg-slate-200 dark:bg-slate-700" />

                      {/* Playhead */}
                      <div
                        className="absolute bottom-0 left-[58%] top-0 w-[2px]"
                        style={{ background: GREEN }}
                      />

                      <div
                        className="absolute left-[calc(58%-4px)] top-0 h-2 w-2 rounded-full"
                        style={{ background: GREEN }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating "AI" card */}
            <div className="absolute -left-3 top-28 hidden w-[170px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(12,44,80,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:block">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: `${GREEN}12`,
                    color: GREEN,
                  }}
                >
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="text-xs font-black text-[#0C2C50] dark:text-white">
                    Smart Editing
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400 dark:text-slate-500">
                    AI powered workflow
                  </p>
                </div>
              </div>
            </div>

            {/* Floating final output card */}
            <div className="absolute -bottom-2 right-3 w-[190px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(12,44,80,0.15)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:right-[-10px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Final Output
                  </p>

                  <p className="mt-1 text-sm font-black text-[#0C2C50] dark:text-white">
                    Ready to publish
                  </p>
                </div>

                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    background: `${GREEN}15`,
                    color: GREEN,
                  }}
                >
                  <Check size={17} />
                </div>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                <div
                  className="h-full w-full rounded-full"
                  style={{ background: GREEN }}
                />
              </div>

              <p className="mt-2 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                Export completed • 4K
              </p>
            </div>

            {/* Decorative green circle */}
            <div
              className="absolute -right-8 bottom-24 -z-10 h-32 w-32 rounded-full border-[18px]"
              style={{ borderColor: `${GREEN}12` }}
            />
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
    <section className="bg-white px-6 py-24 dark:bg-[#020817] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-[.7fr_1.3fr]">
          <div>

            <h2 className="mt-5 !text-4xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-5xl">
              Editing is more than
              <span className="block" style={{ color: GREEN }}>
                cutting clips.
              </span>
            </h2>
          </div>

          <div>
            <p className="max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              We shape raw footage into content that feels intentional,
              professional and easy to watch. Every cut, transition, sound and
              visual has a reason.
            </p>

            <p className="mt-5 max-w-3xl leading-7 text-slate-500 dark:text-slate-400">
              Whether you're building a personal brand, growing a YouTube
              channel or promoting a business, we create videos around the
              platform and audience you're targeting.
            </p>

            <div className="mt-9 h-px w-full bg-slate-100 dark:bg-slate-800" />

            <div className="mt-7 grid gap-6 sm:grid-cols-4">
              {features.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title}>
                    <Icon size={20} color={GREEN} />

                    <h3 className="mt-4 text-sm font-black text-[#0C2C50] dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {item.text}
                    </p>
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
   WORK
========================================================= */

function WorkSection() {
  return (
    <section
      id="work"
      className="bg-[#F5F8F6] px-6 py-24 dark:bg-[#07141A] sm:px-10 lg:px-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>

            <h2 className="mt-4 !text-4xl font-black text-[#0C2C50] dark:text-white sm:text-5xl">
              Videos built for
              <span style={{ color: GREEN }}> every platform.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
            Different content needs different editing. We adapt the style,
            pacing and format to where your video will be published.
          </p>
        </div>

        <div className="space-y-6">
          {services.map((service, index) => (
            <div
              key={service.number}
              className="group grid overflow-hidden rounded-2xl bg-white dark:bg-slate-900 lg:grid-cols-2"
            >
              <div
                className={`relative min-h-[300px] overflow-hidden ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#071D32]/75 to-transparent" />

                <span className="absolute bottom-5 left-6 text-[10px] font-black tracking-[.2em] text-white/60">
                  {service.tag}
                </span>
              </div>

              <div
                className={`flex flex-col justify-center p-8 sm:p-12 lg:p-14 ${
                  index % 2 === 1 ? "lg:order-1" : ""
                }`}
              >
                <span className="text-xs font-black" style={{ color: GREEN }}>
                  {service.number}
                </span>

                <h3 className="mt-4 text-3xl font-black text-[#0C2C50] dark:text-white sm:text-4xl">
                  {service.title}
                </h3>

                <p className="mt-5 max-w-lg leading-7 text-slate-500 dark:text-slate-400">
                  {service.description}
                </p>

                <a
                  href="/quote"
                  className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-black"
                  style={{ color: GREEN }}
                >
                  Get this service
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FORMATS
========================================================= */

function FormatsSection() {
  return (
    <section className="bg-white px-6 py-24 dark:bg-[#020817] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=1200&q=90"
              alt="Social video content"
              className="h-[480px] w-full rounded-2xl object-cover"
            />

            <div className="absolute bottom-6 left-6 rounded-xl border border-slate-100 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <Smartphone size={20} color={GREEN} />

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Optimized for
                  </p>

                  <p className="text-sm font-black text-[#0C2C50] dark:text-white">
                    Mobile-first content
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>

            <h2 className="mt-5 !text-4xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-5xl">
              One video.
              <span className="block" style={{ color: GREEN }}>
                Many possibilities.
              </span>
            </h2>

            <p className="mt-6 leading-8 text-slate-500 dark:text-slate-400">
              We can transform your footage into different formats depending on
              where you want to publish it.
            </p>

            <div className="mt-8 divide-y divide-slate-100 border-y border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {formats.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between py-4"
                >
                  <span className="text-sm font-bold text-[#0C2C50] dark:text-white">
                    {item}
                  </span>

                  <Check size={17} color={GREEN} />
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
   PROCESS
========================================================= */

function ProcessSection() {
  const steps = [
    ["01", "Send your footage"],
    ["02", "We edit & polish"],
    ["03", "You review"],
    ["04", "Final delivery"],
  ];

  return (
    <section className="bg-[#F5F8F6] px-6 py-20 dark:bg-[#07141A] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">

          <h2 className="mt-4 !text-4xl font-black text-[#0C2C50] dark:text-white">
            From footage to final cut.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([number, title]) => (
            <div key={number} className="bg-white p-7 dark:bg-slate-900">
              <span className="text-xs font-black" style={{ color: GREEN }}>
                {number}
              </span>

              <h3 className="mt-8 text-lg font-black text-[#0C2C50] dark:text-white">
                {title}
              </h3>

              <div
                className="mt-6 h-1 w-10 rounded-full"
                style={{ background: GREEN }}
              />
            </div>
          ))}
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
    <section className=" bg-white px-6 py-24 dark:bg-[#020817] sm:px-10 lg:px-14">
      <div className="mx-auto max-w-7xl ">
        <div className="relative  overflow-hidden rounded-3xl bg-[#071D32] px-7 py-16 sm:px-12 lg:px-16">
          <div
            className="absolute  right-[-100px] top-[-150px] h-96 w-96 rounded-full blur-3xl"
            style={{ background: `${GREEN}25` }}
          />

          <div className="relative max-w-3xl">
            <h2 className="mt-5 !text-4xl font-black leading-tight !text-white sm:text-6xl">
              Let's turn your footage into something
              <span className="block" style={{ color: GREEN_LIGHT }}>
                worth watching.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-white/50">
              Send us your footage, idea or project requirements and let's
              create a video that represents your brand properly.
            </p>

            <a
              href="/quote"
              className="mt-8 inline-flex items-center gap-2 rounded-lg px-7 py-4 text-sm font-black text-white transition hover:-translate-y-0.5"
              style={{ background: GREEN }}
            >
              Start your project
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

export default function VideoEditing() {
  return (
    <main className="w-full overflow-x-hidden">
      <HeroSection />
      <IntroSection />
      <WorkSection />
      <FormatsSection />
      <ProcessSection />
      <CTASection />
    </main>
  );
}
