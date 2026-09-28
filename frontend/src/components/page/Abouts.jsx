import React from "react";
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react";

const NAVY = "#101E3B";
const NAVY_SOFT = "#182A50";
const GREEN = "#1E9C6B";
const GREEN_LIGHT = "#3FC98D";
const MIST = "#F5F7FA";

const teamPoints = [
  {
    n: "1",
    text: "Digital Alife has the solution for your every digital needs",
  },
  {
    n: "2",
    text: "Discuss your idea and get consultancy free for your business",
  },
  {
    n: "3",
    text: "We deliver projects based on extensive analytics and data",
  },
  {
    n: "4",
    text: "Our team knows well to rank your website higher on SERPs",
  },
];

/* ---------- Hero ---------- */
function AboutHero() {
  return (
    <div
      className="
        relative overflow-hidden
        bg-[#0A1020]
        dark:bg-[#020817]
        h-[100vh]
      "
      style={{
        backgroundImage:
          "linear-gradient(125deg, rgba(0,0,0,0.95), rgba(16,30,59,0.82)), url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        @keyframes floatBlob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.05);
          }
        }

        .about-blob-a {
          animation: floatBlob 9s ease-in-out infinite;
        }

        .about-blob-b {
          animation: floatBlob 11s ease-in-out infinite reverse;
        }
      `}</style>

      <div
        className="
          about-blob-a
          pointer-events-none absolute -top-24 right-[-6rem]
          h-72 w-72 rounded-full blur-3xl
          opacity-80 dark:opacity-55
        "
        style={{
          background: `radial-gradient(circle, ${GREEN_LIGHT}55, transparent 70%)`,
        }}
      />

      <div
        className="
          about-blob-b
          pointer-events-none absolute bottom-[-8rem] left-[-4rem]
          h-80 w-80 rounded-full blur-3xl
          opacity-80 dark:opacity-60
        "
        style={{
          background: `radial-gradient(circle, ${GREEN}40, transparent 70%)`,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-32">
        <div
          className="
            mb-7 inline-flex items-center gap-2 rounded-full
            border border-white/15 bg-white/[0.06]
            px-4 py-1.5 backdrop-blur-sm
          "
        >
          <span className="text-xs font-medium text-white/70">Home</span>

          <ChevronRight size={12} className="text-white/40" />

          <span
            className="text-xs font-semibold"
            style={{ color: GREEN_LIGHT }}
          >
            About Us
          </span>
        </div>

        <h1 className="mb-6 max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight md:text-6xl">
          <span className="text-white">About </span>

          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${GREEN_LIGHT}, #7EE8B8)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Digital Alife
          </span>
        </h1>

        <p className="mb-10 max-w-lg text-[16px] leading-relaxed text-white/65">
          Opening a door for new possibilities with tremendous skills and market
          knowledge in web app development and digital marketing. We at Digital
          Alife, know what you are exactly struggling from.
        </p>

        <a
          href="/contact"
          className="
            group relative inline-flex items-center gap-2 overflow-hidden
            rounded-full px-7 py-3.5 text-sm font-semibold
            transition-transform duration-300 hover:scale-[1.04]
          "
          style={{
            background: GREEN,
            color: "white",
          }}
        >
          <span
            className="
              absolute inset-0 opacity-0
              transition-opacity duration-300
              group-hover:opacity-100
            "
            style={{
              background: `linear-gradient(90deg, ${GREEN}, ${GREEN_LIGHT})`,
            }}
          />

          <span className="relative">Get started</span>

          <ArrowRight
            size={16}
            className="
              relative transition-transform duration-300
              group-hover:translate-x-1
            "
          />
        </a>
      </div>
    </div>
  );
}

/* ---------- Team ---------- */
function TeamSection() {
  return (
    <section
      className="
        relative overflow-hidden
        bg-white px-6 py-24
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div
        className="
          pointer-events-none absolute left-[-6rem] top-10
          h-72 w-72 rounded-full blur-3xl
          opacity-60 dark:opacity-20
        "
        style={{
          background: `radial-gradient(circle, ${MIST}, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-start gap-14 lg:grid-cols-12">
        {/* Image */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <div className="relative">
              <div
                className="
                  absolute -left-5 -top-5 -z-10
                  h-full w-full rounded-2xl
                  opacity-15 dark:opacity-25
                "
                style={{
                  background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                }}
              />

              <div
                className="
                  overflow-hidden rounded-2xl
                  shadow-[0_24px_60px_-24px_rgba(16,30,59,0.35)]
                  dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]
                "
              >
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                  alt="Digital Alife team meeting"
                  className="h-80 w-full object-cover"
                />
              </div>

              <div
                className="
                  absolute -bottom-6 -right-4
                  flex items-center gap-3 rounded-2xl
                  border border-slate-100
                  bg-white px-5 py-4
                  shadow-[0_16px_40px_-12px_rgba(16,30,59,0.3)]
                  transition-colors duration-300
                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)]
                "
              >
                <div
                  className="
                    flex h-10 w-10 flex-shrink-0 items-center
                    justify-center rounded-full
                    bg-emerald-500/10
                    dark:bg-emerald-400/10
                  "
                >
                  <Sparkles size={18} color={GREEN} />
                </div>

                <div>
                  <p
                    className="
                      text-sm font-bold leading-none
                      text-[#101E3B]
                      dark:text-slate-100
                    "
                  >
                    Expert team
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                    Skilled &amp; qualified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-8">
       

          <h2
            className="
              mb-6 text-3xl font-bold leading-tight tracking-tight
              text-[#101E3B]
              transition-colors duration-300
              dark:text-slate-100
              md:text-[36px]
            "
          >
            Our talented and experienced team is waiting to offer you incredible
            services.
          </h2>

          <p
            className="
              mb-4 text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Digital Alife has developed a team of the most intelligent and
            qualified experts. Everyone has years of experience and industry
            knowledge in their respective fields. It leads to the prosperous
            growth of both Digital Alife and its customers.
          </p>

          <p
            className="
              mb-10 text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Digital Alife is here to deliver the best digital products that
            empower businesses to make their journey easier and faster. Our team
            can amaze you with their tremendous service delivery and polite
            behavior.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {teamPoints.map((p) => (
              <div
                key={p.n}
                className="
                  group flex gap-4 rounded-2xl border
                  border-slate-100 bg-white p-5
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_16px_32px_-16px_rgba(16,30,59,0.18)]
                  dark:border-slate-800
                  dark:bg-slate-900/80
                  dark:hover:shadow-[0_16px_32px_-16px_rgba(0,0,0,0.55)]
                "
                style={{
                  boxShadow: "0 1px 2px rgba(16,30,59,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 16px 32px -16px rgba(16,30,59,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(16,30,59,0.04)";
                }}
              >
                <span
                  className="
                    flex h-10 w-10 flex-shrink-0
                    items-center justify-center rounded-full
                    bg-[#F5F7FA]
                    text-sm font-bold
                    transition-colors duration-300
                    dark:bg-slate-800
                  "
                  style={{ color: GREEN }}
                >
                  {p.n}
                </span>

                <h5
                  className="
                    pt-1.5 text-[14.5px] font-semibold leading-snug
                    text-[#101E3B]
                    dark:text-slate-100
                  "
                >
                  {p.text}
                </h5>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Mission Illustration ---------- */
function MissionIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="mx-auto h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      <circle cx="230" cy="80" r="80" fill={GREEN} opacity="0.12" />

      <rect
        x="30"
        y="150"
        width="46"
        height="40"
        rx="4"
        fill="#DCE1E8"
        className="dark:fill-slate-700"
      />

      <rect
        x="90"
        y="120"
        width="46"
        height="70"
        rx="4"
        fill="#C6CEDA"
        className="dark:fill-slate-600"
      />

      <rect
        x="150"
        y="90"
        width="46"
        height="100"
        rx="4"
        fill={GREEN}
        opacity="0.85"
      />

      <circle
        cx="230"
        cy="60"
        r="16"
        fill="#F5B58A"
        className="dark:opacity-90"
      />

      <rect
        x="214"
        y="76"
        width="32"
        height="46"
        rx="10"
        fill={NAVY}
        className="dark:fill-slate-300"
      />

      <circle
        cx="180"
        cy="72"
        r="14"
        fill="#D98A5F"
        className="dark:opacity-90"
      />

      <rect
        x="166"
        y="86"
        width="28"
        height="42"
        rx="9"
        fill="#3B4CB8"
        className="dark:fill-indigo-400"
      />

      <circle cx="270" cy="40" r="6" fill={GREEN_LIGHT} />
      <circle cx="60" cy="50" r="5" fill={GREEN_LIGHT} opacity="0.7" />
      <circle cx="100" cy="30" r="4" fill={GREEN_LIGHT} opacity="0.5" />
    </svg>
  );
}

/* ---------- Vision Illustration ---------- */
function VisionIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      className="mx-auto h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      <circle cx="110" cy="110" r="90" fill={GREEN} opacity="0.1" />

      <path
        d="M40 190 L110 120 L160 155 L260 60"
        stroke={GREEN}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />

      <polygon points="260,60 230,66 254,86" fill={GREEN} />

      <circle
        cx="150"
        cy="95"
        r="14"
        fill="#F5B58A"
        className="dark:opacity-90"
      />

      <rect
        x="136"
        y="109"
        width="28"
        height="46"
        rx="10"
        fill={NAVY}
        className="dark:fill-slate-300"
      />

      <rect x="150" y="118" width="34" height="8" rx="4" fill={GREEN_LIGHT} />

      <circle cx="70" cy="60" r="5" fill={GREEN_LIGHT} opacity="0.6" />

      <circle cx="280" cy="150" r="6" fill={GREEN_LIGHT} opacity="0.6" />
    </svg>
  );
}

/* ---------- Mission & Vision Row ---------- */
function MissionVisionRow({
  eyebrow,
  heading,
  italic,
  body,
  illustration,
  reverse,
}) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-14 lg:grid-cols-2 ${
        reverse ? "lg:[&>*:first-child]:order-2" : ""
      }`}
    >
      {/* Text */}
      <div>
       

        <h3
          className="
            mb-4 text-3xl font-bold tracking-tight
            text-[#101E3B]
            dark:text-slate-100
            md:text-[32px]
          "
        >
          {heading}
        </h3>

        <p
          className="
            mb-4 text-[16px] font-medium italic leading-relaxed
            text-[#182A50]
            dark:text-slate-300
          "
        >
          {italic}
        </p>

        <p
          className="
            text-[15px] leading-relaxed
            text-slate-500
            dark:text-slate-400
          "
        >
          {body}
        </p>
      </div>

      {/* Illustration */}
      <div className="relative">
        <div
          className="
            pointer-events-none absolute -inset-3
            -z-10 rounded-[2rem] blur-2xl
            opacity-40 dark:opacity-20
          "
          style={{
            background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
          }}
        />

        <div
          className="
            rounded-3xl border p-10
            border-emerald-500/15
            bg-[#F5F7FA]
            transition-colors duration-300
            dark:border-emerald-400/15
            dark:bg-slate-900
          "
        >
          {illustration}
        </div>
      </div>
    </div>
  );
}

/* ---------- Mission & Vision ---------- */
function MissionVisionSection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto max-w-6xl space-y-20">
        <MissionVisionRow
          eyebrow="Our mission"
          heading="Our Mission"
          italic="Our mission is to bring real values and growth to our client's entrepreneurial journey"
          body="Since we started our journey as web-app developers and digital marketers, our mission was absolutely clear in our minds. Through Digital Alife, we are on the mission to develop the best websites and mobile applications which satisfy our clients to the inner core. We build products that really matter to our customers."
          illustration={<MissionIllustration />}
        />

        <MissionVisionRow
          eyebrow="Our vision"
          heading="Our Vision"
          italic="Digital Alife has the natural vision to grow the maximum businesses with its digital skills and experience"
          body="The vision of our company is extremely simple and straightforward. We want to touch the maximum number of businesses to grow their journey. Our skills and experience in website or application development are good enough to make a business profitable in minimum time. Digital Alife is in constant motion concerning its vision."
          illustration={<VisionIllustration />}
          reverse
        />
      </div>
    </section>
  );
}

/* ---------- Main ---------- */
export default function Abouts() {
  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-[#020817]">
      <AboutHero />
      <TeamSection />
      <MissionVisionSection />
    </div>
  );
}
