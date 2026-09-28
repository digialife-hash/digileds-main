import React from "react";
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
  Search,
  BadgeCheck,
  TrendingUp,
  Smile,
  UsersRound,
  Headset,
  Layers,
  Zap,
  Palette,
  Cpu,
  Phone,
  Plus,
} from "lucide-react";

const NAVY = "#101E3B";
const NAVY_SOFT = "#182A50";
const GREEN = "#1E9C6B";
const GREEN_LIGHT = "#3FC98D";
const MIST = "#F5F7FA";

const features = [
  { title: "Search engine optimized services", icon: Search },
  { title: "No compromise on product quality", icon: BadgeCheck },
  { title: "High customers return ratio", icon: TrendingUp },
  { title: "Work for client satisfaction", icon: Smile },
  { title: "Client-centric approach", icon: UsersRound },
  { title: "Reliability and support system", icon: Headset },
  { title: "Progressive and scalable solution", icon: Layers },
  { title: "Fast and quality work", icon: Zap },
  { title: "Attractive and engaging designing", icon: Palette },
  { title: "Developed with the latest technologies", icon: Cpu },
];

const stats = [
  { value: "900+", label: "Happy Client" },
  { value: "2000+", label: "Project Submitted" },
  { value: "90%", label: "Repeat Customer" },
];

/* ---------- Hero ---------- */
function Hero() {
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
          "linear-gradient(125deg, rgba(0,0,0,0.95), rgba(16,30,59,0.82)), url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        @keyframes whyFloatBlob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, -20px) scale(1.05);
          }
        }

        .why-blob-a {
          animation: whyFloatBlob 9s ease-in-out infinite;
        }

        .why-blob-b {
          animation: whyFloatBlob 11s ease-in-out infinite reverse;
        }
      `}</style>

      <div
        className="
          why-blob-a
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
          why-blob-b
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
            Why choose us?
          </span>
        </div>

        <h1 className="mb-6 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
          <span className="text-white">Why Choose </span>

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
          From the very beginning, we at Digital Alife have associated ourselves
          with the most cutting-edge technology, skills, and methodologies that
          help us in providing the best services to our clients.
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

/* ---------- Illustrations ---------- */
function TeamStoryIllustration() {
  return (
    <svg
      viewBox="0 0 340 260"
      className="mx-auto h-auto w-full max-w-md"
      aria-hidden="true"
    >
      <ellipse
        cx="170"
        cy="230"
        rx="150"
        ry="20"
        fill={MIST}
        className="dark:opacity-25"
      />

      <rect
        x="60"
        y="150"
        width="40"
        height="80"
        rx="4"
        fill="#C6CEDA"
        className="dark:fill-slate-700"
      />

      <rect
        x="150"
        y="110"
        width="40"
        height="120"
        rx="4"
        fill={GREEN}
        opacity="0.85"
      />

      <rect
        x="240"
        y="170"
        width="40"
        height="60"
        rx="4"
        fill="#DCE1E8"
        className="dark:fill-slate-600"
      />

      <circle
        cx="170"
        cy="90"
        r="16"
        fill="#F5B58A"
        className="dark:opacity-90"
      />

      <rect
        x="152"
        y="106"
        width="36"
        height="50"
        rx="12"
        fill={NAVY}
        className="dark:fill-slate-300"
      />

      <line
        x1="170"
        y1="106"
        x2="170"
        y2="40"
        stroke={GREEN}
        strokeWidth="4"
        strokeLinecap="round"
      />

      <polygon points="170,30 160,48 180,48" fill={GREEN_LIGHT} />

      <circle
        cx="90"
        cy="120"
        r="13"
        fill="#D98A5F"
        className="dark:opacity-90"
      />

      <rect
        x="75"
        y="133"
        width="30"
        height="42"
        rx="10"
        fill="#3B4CB8"
        className="dark:fill-indigo-400"
      />

      <circle
        cx="255"
        cy="140"
        r="13"
        fill="#F0C29A"
        className="dark:opacity-90"
      />

      <rect
        x="240"
        y="153"
        width="30"
        height="42"
        rx="10"
        fill="#D65D5D"
        className="dark:fill-rose-400"
      />
    </svg>
  );
}

function GoalsIllustration() {
  return (
    <svg
      viewBox="0 0 320 300"
      className="mx-auto h-auto w-full max-w-sm"
      aria-hidden="true"
    >
      <circle cx="160" cy="150" r="140" fill={GREEN} opacity="0.1" />

      <rect
        x="60"
        y="200"
        width="46"
        height="60"
        rx="4"
        fill="#DCE1E8"
        className="dark:fill-slate-700"
      />

      <rect
        x="120"
        y="160"
        width="46"
        height="100"
        rx="4"
        fill="#C6CEDA"
        className="dark:fill-slate-600"
      />

      <rect
        x="180"
        y="110"
        width="46"
        height="150"
        rx="4"
        fill={GREEN}
        opacity="0.85"
      />

      <circle cx="203" cy="70" r="20" fill={GREEN_LIGHT} opacity="0.5" />

      <path
        d="M195 70 l6 6 12 -12"
        stroke="white"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="90"
        cy="180"
        r="12"
        fill="#F5B58A"
        className="dark:opacity-90"
      />

      <rect
        x="76"
        y="192"
        width="28"
        height="40"
        rx="9"
        fill={NAVY}
        className="dark:fill-slate-300"
      />
    </svg>
  );
}

/* ---------- Story ---------- */
function StorySection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div
          className="
            rounded-3xl border border-transparent
            bg-[#F5F7FA] p-10
            transition-colors duration-300
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <TeamStoryIllustration />
        </div>

        <div>
          

          <h2
            className="
              mb-6 text-3xl font-bold leading-tight tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-[32px]
            "
          >
            Digital Alife is building revolutionary digital solutions for their
            clients
          </h2>

          <p
            className="
              mb-4 text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            In our journey of 8 years, we have completed almost every type of
            project and continuously improved ourselves. The website,
            application, UI, and UX created by us have become the trend of the
            market today.
          </p>

          <p
            className="
              text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Many years of experience and skills make us the best digital
            marketing agency and website design and development agency in the
            market. We at Digital Alife take responsibility to deliver the best
            product.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- Stats / Goals ---------- */
function GoalsSection() {
  return (
    <section
      className="
        bg-[#F5F7FA] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
      "
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
 

          <h2
            className="
              mb-6 text-3xl font-bold leading-tight tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-[32px]
            "
          >
            Accomplish all your goals and mission with the Digital Alife digital
            solution
          </h2>

          <p
            className="
              mb-10 text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Digital Alife design and incredibly develop your website or
            application. We have the solution to your every digital problem.
            Digital Alife has a team of all the different services. Your
            website, application, or marketing campaign will be run only by the
            experts of the department.
          </p>

          <div className="grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <p
                  className="
                    text-3xl font-bold tracking-tight
                    text-[#1E9C6B]
                    md:text-4xl
                  "
                  style={{ color: GREEN }}
                >
                  {s.value}
                </p>

                <p
                  className="
                    mt-1 text-[13px]
                    text-slate-500
                    dark:text-slate-500
                  "
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="
            rounded-3xl border p-10
            border-emerald-500/15
            bg-white
            transition-colors duration-300
            dark:border-emerald-400/15
            dark:bg-slate-900
          "
        >
          <GoalsIllustration />
        </div>
      </div>
    </section>
  );
}

/* ---------- Feature Grid ---------- */
function FeatureGrid() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-xl text-center">


          <h2
            className="
              mb-4 text-3xl font-bold tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-4xl
            "
          >
            We work for our{" "}
            <span style={{ color: GREEN }}>client's satisfaction</span>
          </h2>

          <p
            className="
              text-[15px]
              text-slate-500
              dark:text-slate-400
            "
          >
            Our customers aspire for the best digital services from us and we
            want to satisfy our clients 100%. This cycle goes on continuously.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f) => {
            const Icon = f.icon;

            return (
              <div
                key={f.title}
                className="
                  group rounded-2xl border
                  border-slate-100 bg-white p-6
                  text-center
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_20px_40px_-18px_rgba(16,30,59,0.2)]
                  dark:border-slate-800
                  dark:bg-slate-900/80
                  dark:hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.55)]
                "
                style={{
                  boxShadow: "0 1px 2px rgba(16,30,59,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px -18px rgba(16,30,59,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(16,30,59,0.05)";
                }}
              >
                <div
                  className="
                    mx-auto mb-4 flex h-12 w-12
                    items-center justify-center rounded-xl
                    bg-[#F5F7FA]
                    transition-all duration-300
                    group-hover:scale-105
                    dark:bg-slate-800
                  "
                >
                  <Icon size={20} strokeWidth={1.75} color={GREEN} />
                </div>

                <h5
                  className="
                    text-[13.5px] font-semibold leading-snug
                    text-[#101E3B]
                    dark:text-slate-100
                  "
                >
                  {f.title}
                </h5>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTASection() {
  return (
    <section
      className="
        bg-white px-6 pb-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto max-w-6xl">
        <div
          className="
            relative flex flex-col items-center
            justify-between gap-10 overflow-hidden
            rounded-3xl px-8 py-12
            md:flex-row md:px-14 md:py-16
          "
          style={{
            background: NAVY,
          }}
        >
          {/* Pattern */}
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

          {/* Text */}
          <div className="relative max-w-lg">
            <h2 className="mb-4 text-2xl font-bold leading-snug tracking-tight text-white md:text-3xl">
              Let's start putting an impact on the world with our massive and
              tremendous strategies for your business
            </h2>

            <p className="text-[15px] text-white/60">
              Book your services now and get the opportunity to build real value
              for your customers.
            </p>
          </div>

          {/* Actions */}
          <div className="relative flex flex-shrink-0 flex-col items-start gap-3 md:items-end">
            <a
              href="/contact"
              className="
                inline-flex items-center gap-2
                rounded-full px-7 py-3.5
                text-sm font-semibold
                transition-transform duration-300
                hover:scale-[1.04]
              "
              style={{
                background: GREEN,
                color: "white",
              }}
            >
              Get a free consultation
              <ArrowRight size={16} />
            </a>

            <a
              href="tel:9211954915"
              className="
                flex items-center gap-2
                text-sm text-white/70
                transition-colors
                hover:text-white
              "
            >
              <Phone size={14} />
              Or call us: 9211954915
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Main ---------- */
export default function WhyChooseUs() {
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
      <StorySection />
      <GoalsSection />
      <FeatureGrid />
      <CTASection />
    </div>
  );
}
