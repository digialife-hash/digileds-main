import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  Star,
  DollarSign,
  Trophy,
  Factory,
  ShieldCheck,
  Lightbulb,
  Gauge,
  Apple,
  Smartphone,
  Globe,
  Layers,
  Atom,
  Server,
  Feather,
  Triangle,
  Coffee,
  Terminal,
  Flame,
  Cloud,
  PenTool,
  PenSquare,
  Bird,
} from "lucide-react";

const NAVY = "#101E3B";
const NAVY_SOFT = "#182A50";
const GREEN = "#1E9C6B";
const GREEN_LIGHT = "#3FC98D";
const MIST = "#F5F7FA";

const highlights = [
  { title: "Reduce the development cost", icon: DollarSign },
  { title: "Future-proof mobile apps", icon: ShieldCheck },
  { title: "Talent and skill overwhelmed", icon: Trophy },
  { title: "Creativity and innovative design", icon: Lightbulb },
  { title: "Quality and sustainable resources", icon: Factory },
  { title: "Efficient and performance-driven", icon: Gauge },
];

const techStack = [
  { name: "React", icon: Atom },
  { name: "Node.js", icon: Server },
  { name: "Flutter", icon: Feather },
  { name: "Swift", icon: Bird },
  { name: "Kotlin", icon: Triangle },
  { name: "Java", icon: Coffee },
  { name: "Python", icon: Terminal },
  { name: "Firebase", icon: Flame },
  { name: "AWS", icon: Cloud },
  { name: "Figma", icon: PenTool },
  { name: "Sketch", icon: PenSquare },
  { name: "Android", icon: Smartphone },
];

const services = [
  {
    title: "iOS App",
    icon: Apple,
    desc: "Irrespective of your business complications, we have accumulated the best technologies and resources to build your iOS application. Security, stability, and performance are the major points we focus on while building your most unique and creative iPhone app.",
  },
  {
    title: "Android App",
    icon: Smartphone,
    desc: "Are you searching for a robust Android app development agency? Digital Alife is here for you. We have built several Android apps successfully. All our customers are pretty happy and satisfied with our work. Allow us to bring a smile to your face too.",
  },
  {
    title: "Web App",
    icon: Globe,
    desc: "Digital Alife builds stunning and robust web apps which function just like an Android one. No need to make an application necessary for Android or iOS. Just develop an app that runs on the web and enjoys the same performance.",
  },
  {
    title: "Hybrid-Native App",
    icon: Layers,
    desc: "Digital Alife has years of experience and skills in developing hybrid-native apps. Hybrid-native apps are the best option for those with a relatively fixed budget. It works almost like a native application and uses a camera, notifications, etc., to work well.",
  },
];

const awards = [
  { platform: "AppFutura", rating: "4.9/5" },
  { platform: "Upwork", rating: "4.9/5" },
  { platform: "GoodFirms", rating: "4.9/5" },
];

/* =========================================================
   APP MOCKUP IMAGE
========================================================= */

function AppMockupImage({ src, alt, badge, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow */}
      <div
        className="
          pointer-events-none absolute
          -inset-8 -z-10
          rounded-full blur-3xl
          opacity-40 dark:opacity-25
        "
        style={{
          background: `radial-gradient(
            circle,
            ${GREEN_LIGHT},
            transparent 70%
          )`,
        }}
      />

      <img
        src={src}
        alt={alt}
        className="
          relative mx-auto w-full max-w-sm
          drop-shadow-2xl
          transition-transform duration-500
          hover:-translate-y-1
        "
      />

      {badge && (
        <div
          className="
            absolute -bottom-4 -left-4
            flex items-center gap-2
            rounded-2xl border
            border-slate-100
            bg-white px-4 py-3
            transition-colors duration-300
            dark:border-slate-700
            dark:bg-slate-900
          "
          style={{
            boxShadow: "0 16px 40px -14px rgba(16,30,59,0.3)",
          }}
        >
          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-full
              bg-emerald-500/10
              dark:bg-emerald-400/10
            "
          >
            <Star size={16} color={GREEN} fill={GREEN} />
          </div>

          <div>
            <p
              className="
                text-sm font-bold leading-none
                text-[#101E3B]
                dark:text-slate-100
              "
            >
              {badge}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   HERO
========================================================= */

function Hero() {
  return (
    <section
      className="
        overflow-hidden
        bg-white
        px-6 py-40
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div>
          <h1
            className="
              mb-6 text-4xl font-bold
              leading-[1.14] tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-[42px]
            "
          >
            We Develop Amazing iOS and Android Apps
          </h1>

          <p
            className="
              mb-8 max-w-md text-[15px]
              leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Make your every idea come true with the industry's best mobile app
            development company. We work for client satisfaction, and our
            clients work with us for a secure and trusted platform.
          </p>

          <Button
            as="a"
            variant="unstyled"
            href="/contact"
            className="
              group inline-flex items-center gap-2
              rounded-full px-7 py-3.5
              text-sm font-semibold text-white
              transition-all duration-300
              hover:scale-[1.04]
              hover:shadow-lg
            "
            style={{
              background: GREEN,
            }}
          >
            Get a free consultation
            <ArrowRight
              size={16}
              className="
                transition-transform duration-300
                group-hover:translate-x-1
              "
            />
          </Button>
        </div>

        <div className="flex justify-center">
          <AppMockupImage
            src="/uploads/app-mockup.webp"
            alt="Digital Alife mobile app screens"
            badge="4.9/5 rated"
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   RATINGS
========================================================= */

function RatingsSection() {
  return (
    <section
      className="
        bg-[#101E3B] px-6 py-20
        transition-colors duration-300
        dark:bg-[#06111F]
      "
    >
      <div className="mx-auto mb-14 max-w-5xl text-center">

        <h2 className="mb-4 !text-4xl !font-bold tracking-tight !text-white md:text-4xl">
          We have acquired everything to build your application
        </h2>

        <p className="mx-auto max-w-2xl text-[15px] text-white/60">
          You will tell us your need, and we will make it a reality based on our
          skills, knowledge, experience, and teamwork.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
        {awards.map((a) => (
          <div
            key={a.platform}
            className="
              rounded-2xl border
              border-slate-100
              bg-white p-7
              text-center
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.35)]
              dark:border-slate-700
              dark:bg-slate-900
            "
          >
            <div className="mb-3 flex items-center justify-center gap-1.5">
              <Star size={16} fill="#F5A524" color="#F5A524" />

              <span
                className="
                  text-lg font-bold
                  text-[#101E3B]
                  dark:text-slate-100
                "
              >
                {a.rating}
              </span>
            </div>

            <p
              className="
                mb-3 text-base font-bold
              "
              style={{ color: GREEN }}
            >
              {a.platform}
            </p>

            <p
              className="
                text-[13px] leading-relaxed
                text-slate-500
                dark:text-slate-400
              "
            >
              Reviewed by Goodfirms with 4.9/5 ratings based upon client
              reviews.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   FEATURE + TECH STACK
========================================================= */

function FeatureSection() {
  const track = [...techStack, ...techStack];

  return (
    <section
      className="
        overflow-hidden
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <style>{`
        @keyframes mobileTechMarquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .mobile-tech-track {
          animation: mobileTechMarquee 20s linear infinite;
        }

        .mobile-tech-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto mb-16 grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div className="flex justify-center">
          <AppMockupImage
            src="/uploads/app-mockup-2.webp"
            alt="Digital Alife shopping app screens"
          />
        </div>

        <div>
          <h2
            className="
              mb-5 !text-4xl !font-bold
              leading-tight tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-[32px]
            "
          >
            Your business needs a robust and fully functional mobile app to grow
            business
          </h2>

          <p
            className="
              mb-8 text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            We create all our mobile applications based on your creative ideas.
            We aim to present even the most complicated work by making it
            accessible through our application development.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {highlights.map((h) => {
              const Icon = h.icon;

              return (
                <div
                  key={h.title}
                  className="
                    flex items-center gap-3
                    rounded-xl
                    p-1
                    transition-colors duration-300
                  "
                >
                  <div
                    className="
                      flex h-9 w-9
                      flex-shrink-0
                      items-center justify-center
                      rounded-lg
                      bg-[#F5F7FA]
                      dark:bg-slate-800
                    "
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      className="
                        text-[#1E9C6B]
                        dark:text-emerald-400
                      "
                    />
                  </div>

                  <h5
                    className="
                      text-[13.5px] font-semibold
                      text-[#182A50]
                      dark:text-slate-200
                    "
                  >
                    {h.title}
                  </h5>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tech Marquee */}
      <div
        className="scale-150  relative"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="mobile-tech-track flex w-max items-center gap-4">
          {track.map((t, i) => {
            const Icon = t.icon;

            return (
              <span
                key={`${t.name}-${i}`}
                className="
                  flex flex-shrink-0
                  items-center gap-2.5
                  rounded-full border
                  border-slate-200
                  bg-white
                  py-2 pl-3 pr-5
                  text-[#182A50]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:border-emerald-400
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-200
                  dark:hover:border-emerald-500
                "
              >
                <span
                  className="
                    flex h-7 w-7
                    items-center justify-center
                    rounded-full
                    bg-[#F5F7FA]
                    dark:bg-slate-800
                  "
                >
                  <Icon
                    size={20}
                    className="
                      text-[#1E9C6B]
                      dark:text-emerald-400
                    "
                    strokeWidth={1.75}
                  />
                </span>

                <span className="text-sm font-semibold">{t.name}</span>
              </span>
            );
          })}
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
      className="
        bg-[#F5F7FA] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-wrap justify-between gap-8">
          <div className="max-w-md">
            <h2
              className="
                !text-4xl !font-bold
                leading-tight tracking-tight
                text-[#101E3B]
                dark:text-slate-100
                md:text-4xl
              "
            >
              We serve every kind of{" "}
              <span style={{ color: GREEN }}>mobile app development</span>{" "}
              services
            </h2>
          </div>

          <p
            className="
              max-w-md text-[15px]
              leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Now you do not need to wander separately for different mobile app
            development services. We develop every type of mobile application,
            whether it is Android, iOS, or something other. Build your mobile
            application now and enjoy continuous growth.
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => {
            const Icon = s.icon;

            return (
              <div
                key={s.title}
                className="
                  rounded-2xl border
                  border-slate-100
                  bg-white p-6
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-emerald-200
                  hover:shadow-[0_20px_40px_-18px_rgba(16,30,59,0.2)]
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:border-emerald-900
                  dark:hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.55)]
                "
                style={{
                  boxShadow: "0 1px 2px rgba(16,30,59,0.05)",
                }}
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
                    className="
                      text-[#1E9C6B]
                      dark:text-emerald-400
                    "
                  />
                </div>

                <h3
                  className="
                    mb-2 text-base font-bold
                    text-[#101E3B]
                    dark:text-slate-100
                  "
                >
                  {s.title}
                </h3>

                <p
                  className="
                    text-[13px] leading-relaxed
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className="
            flex flex-col items-center
            justify-between gap-6
            rounded-3xl border
            bg-white px-8 py-10
            transition-colors duration-300
            border-emerald-100
            dark:border-slate-800
            dark:bg-slate-900
            md:flex-row md:px-12
          "
          style={{
            boxShadow: "0 20px 50px -24px rgba(16,30,59,0.2)",
          }}
        >
          <h3
            className="
              text-center text-xl
              font-bold tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-left
              md:text-2xl
            "
          >
            Hire Developers For Custom IT Solutions
          </h3>

          <div className="flex flex-wrap justify-center gap-3 md:justify-end">
            <Button
              as="a"
              variant="unstyled"
              href="/contact"
              className="
                inline-flex items-center gap-2
                rounded-full px-6 py-3
                text-sm font-semibold text-white
                transition-all duration-300
                hover:scale-[1.04]
              "
              style={{
                background: GREEN,
              }}
            >
              Get a free consultation
              <ArrowRight size={15} />
            </Button>

            <Button
              as="a"
              variant="unstyled"
              href="/contact"
              className="
                inline-flex items-center gap-2
                rounded-full border
                border-[#101E3B]
                px-6 py-3
                text-sm font-semibold
                text-[#101E3B]
                transition-all duration-300
                hover:bg-[#101E3B]
                hover:text-white
                dark:border-slate-500
                dark:text-slate-200
                dark:hover:border-emerald-500
                dark:hover:bg-emerald-600
                dark:hover:text-white
              "
            >
              Talk to our expert
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function MobileAppDevelopment() {
  return (
    <div
      className="
        min-h-screen
        bg-white
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <Hero />
      <FeatureSection />
      <RatingsSection />
      <ServicesSection />
    </div>
  );
}
