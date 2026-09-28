import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  Phone,
  Plus,
  LayoutTemplate,
  Globe,
  RefreshCw,
  ShoppingCart,
  Settings2,
  AppWindow,
  Home,
  Luggage,
  GraduationCap,
  Car,
  Calendar,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  PiggyBank,
  UtensilsCrossed,
  Layers,
  ShoppingBasket,
  Palette,
  UsersRound,
  Code2,
  Handshake,
  ShieldCheck,
  BadgeCheck,
  ClipboardList,
  Database,
  Rocket,
  Activity,
  LifeBuoy,
} from "lucide-react";

const NAVY = "#101E3B";
const GREEN = "#1E9C6B";
const GREEN_DEEP = "#146B4D";
const GREEN_LIGHT = "#3FC98D";
const MIST = "#F5F7FA";

const services = [
  {
    title: "Landing Page Development",
    icon: LayoutTemplate,
    desc: "Your landing page on your website should be most attractive, informative, and engaging; only then will you get real growth and success. We ensure all these features while creating landing pages for your website, ads, social media, and businesses.",
  },
  {
    title: "Static Website Development",
    icon: Globe,
    desc: "Your effective online presence is all that matters for your success. Get your static website developed with Digital Alife and feel the speed and performance of your website. Our static website development experts can assist you in the best way possible.",
  },
  {
    title: "Dynamic Website Development",
    icon: RefreshCw,
    desc: "Make your website refreshable with our excellent dynamic website development services. Dynamic websites will show fresh content every time your customers visit your website. It is the best way to keep your customers tied to your business website.",
  },
  {
    title: "E-commerce Development",
    icon: ShoppingCart,
    desc: "Digital Alife has mastered e-commerce website development. The experts behind Digital Alife have created e-commerce websites for almost every type of niche company. The e-commerce website developed by Digital Alife is at the top of many niches of the market today.",
  },
  {
    title: "CMS Web Development",
    icon: Settings2,
    desc: "Build your CMS website now and start managing your digital content. The CMS websites developed by us are incredibly functional and performance-driven. We know how to fulfil your CMS website needs and requirements through our CMS development.",
  },
  {
    title: "Web Portal Development",
    icon: AppWindow,
    desc: "Develop your web portal quickly with Digital Alife portal development services and add every imagined feature to your website. We have several years of experience in web portal design and development, which allow us to fulfil all your needs effortlessly.",
  },
];

const industries = [
  { label: "Real Estate", icon: Home },
  { label: "Transport", icon: Car },
  { label: "Game", icon: Gamepad2 },
  { label: "Restaurant", icon: UtensilsCrossed },
  { label: "Tour & Travels", icon: Luggage },
  { label: "Event", icon: Calendar },
  { label: "Healthcare", icon: HeartPulse },
  { label: "On-Demand", icon: Layers },
  { label: "Education", icon: GraduationCap },
  { label: "eCommerce", icon: ShoppingBag },
  { label: "Finance", icon: PiggyBank },
  { label: "Grocery", icon: ShoppingBasket },
];

const highlights = [
  {
    title: "Attractive and engaging website development",
    icon: Palette,
  },
  {
    title: "Well-skilled and experienced team",
    icon: UsersRound,
  },
  {
    title: "Competent coding and technical ability",
    icon: Code2,
  },
  {
    title: "Respect and gratitude for customers",
    icon: Handshake,
  },
  {
    title: "Trusted by leading entrepreneurs",
    icon: ShieldCheck,
  },
  {
    title: "A responsive and quality website",
    icon: BadgeCheck,
  },
];

const process = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Understand the customer's needs",
    desc: "We strive to understand and analyse the needs of our customers and the service requirements they seek.",
  },
  {
    n: "02",
    icon: Database,
    title: "Collect required data & information",
    desc: "We gather all the information, data, and resources according to the needs of the clients and the requested service.",
  },
  {
    n: "03",
    icon: Rocket,
    title: "Execute the service",
    desc: "Now Digital Alife starts to build and execute your service. It is the most significant step, so it takes the most time.",
  },
  {
    n: "04",
    icon: Activity,
    title: "Check real-time work conditions",
    desc: "After execution, we now do real-time testing of the stability and profitability of your demanded service.",
  },
  {
    n: "05",
    icon: LifeBuoy,
    title: "Future maintenance and support",
    desc: "You'll have access to contact us and ask for your queries even after the completion of services.",
  },
];

/* =========================================================
   HERO DEVICE MOCKUP
========================================================= */

function DeviceMockup() {
  return (
    <div className="relative mx-auto max-w-md">
      {/* Main browser */}
      <div
        className="
          overflow-hidden rounded-2xl
          border border-slate-200
          bg-white
          transition-colors duration-300
          dark:border-slate-700
          dark:bg-slate-900
        "
        style={{
          boxShadow: "0 30px 60px -24px rgba(16,30,59,0.25)",
        }}
      >
        <div
          className="
            flex items-center gap-1.5
            bg-[#EEF1F5]
            px-3 py-2.5
            dark:bg-slate-800
          "
        >
          <span className="h-2 w-2 rounded-full bg-[#FF5F57]" />
          <span className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
          <span className="h-2 w-2 rounded-full bg-[#28C840]" />
        </div>

        <div
          className="
            flex min-h-[220px]
            flex-col justify-center p-8
          "
          style={{
            background: `linear-gradient(
              150deg,
              ${NAVY},
              #1C2C52
            )`,
          }}
        >
          <p className="mb-4 text-xl font-bold leading-snug text-white">
            We craft digital products for business and user goals
          </p>

          <div className="flex gap-3">
            <span
              className="
                rounded-full px-4 py-1.5
                text-xs font-semibold text-white
              "
              style={{ background: GREEN }}
            >
              Get Started
            </span>

            <span
              className="
                rounded-full
                border border-white/30
                px-4 py-1.5
                text-xs font-semibold
                text-white
              "
            >
              Contact Us
            </span>
          </div>
        </div>
      </div>

      {/* Floating mobile card */}
      <div
        className="
          absolute -bottom-8 -right-6
          w-28 overflow-hidden rounded-xl
          border-4 border-white
          dark:border-slate-950
        "
        style={{
          boxShadow: "0 20px 40px -16px rgba(16,30,59,0.3)",
        }}
      >
        <div className="bg-[#EEF1F5] px-2 py-1.5 dark:bg-slate-800" />

        <div
          className="
            min-h-[160px] p-3
            bg-[#F5F7FA]
            dark:bg-slate-900
          "
        >
          <div
            className="mb-2 h-3 w-full rounded-full"
            style={{
              background: GREEN,
              opacity: 0.7,
            }}
          />

          <div
            className="
              mb-1.5 h-2 w-3/4 rounded-full
              bg-slate-300
              dark:bg-slate-700
            "
          />

          <div
            className="
              mb-3 h-2 w-2/3 rounded-full
              bg-slate-300
              dark:bg-slate-700
            "
          />

          <div
            className="
              h-10 w-full rounded-lg
              bg-[#DCE1E8]
              dark:bg-slate-800
            "
          />
        </div>
      </div>
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
              leading-[1.12] tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-[44px]
            "
          >
            Web Solutions To Accelerate Your Brand's Growth
          </h1>

          <p
            className="
              mb-8 max-w-md text-[15px]
              leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Creativity and dependability are firmly woven together at Digital
            Alife to produce high-quality website development services for
            startups, businesses, and entrepreneurs with our customer-first
            approach.
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

        <DeviceMockup />
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
        py-20
        transition-colors duration-300
      "
      style={{
        background: `linear-gradient(
          150deg,
          ${GREEN_DEEP},
          ${GREEN}
        )`,
      }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 flex flex-wrap justify-between gap-8">
          <h2 className="max-w-md !text-4xl font-bold leading-tight tracking-tight !text-white md:text-4xl">
            We offer <span className="text-[#BFF3D9]">web solutions</span> to
            boost your growth and productivity
          </h2>

          <p
            className="
              max-w-md text-[15px] leading-relaxed
              text-white/75
            "
          >
            Digital Alife works extremely hard to develop the most attractive
            and engaging website for your business. We at Digital Alife also
            ensure the continuous development and stability of your business
            with our designed website.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;

            return (
              <div
                key={s.title}
                className="
                  group rounded-2xl
                  border border-transparent
                  bg-white p-7
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.45)]
                  dark:border-slate-700
                  dark:bg-slate-900
                "
                style={{
                  boxShadow: "0 16px 40px -20px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  className="
                    mb-5 flex h-12 w-12
                    items-center justify-center
                    rounded-xl
                    bg-[#F5F7FA]
                    transition-all duration-300
                    group-hover:scale-105
                    dark:bg-slate-800
                  "
                >
                  <Icon
                    size={22}
                    strokeWidth={1.75}
                    className="
                      text-[#1E9C6B]
                      dark:text-emerald-400
                    "
                  />
                </div>

                <h3
                  className="
                    mb-3 text-lg font-bold
                    text-[#101E3B]
                    dark:text-slate-100
                  "
                >
                  {s.title}
                </h3>

                <p
                  className="
                    text-[13.5px] leading-relaxed
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
      </div>
    </section>
  );
}

/* =========================================================
   INDUSTRIES
========================================================= */

function IndustriesSection() {
  return (
    <section
      className="
        relative overflow-hidden
        bg-[#101E3B]
        px-6 py-20
        transition-colors duration-300
        dark:bg-[#06111F]
      "
    >
      {/* Decorative glow */}
      <div
        className="
          pointer-events-none absolute
          -right-24 -top-24
          h-72 w-72 rounded-full blur-3xl
          opacity-20
        "
        style={{
          background: "radial-gradient(circle, #3FC98D, transparent 70%)",
        }}
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-24 -left-24
          h-72 w-72 rounded-full blur-3xl
          opacity-15
        "
        style={{
          background: "radial-gradient(circle, #1E9C6B, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {industries.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="
                  flex flex-col items-center
                  justify-center gap-2
                  rounded-xl border
                  border-white/10
                  bg-white/[0.04]
                  px-3 py-5
                  text-center
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-emerald-400/30
                  hover:bg-white/[0.08]
                "
              >
                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    bg-emerald-400/15
                  "
                >
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    className="text-emerald-300"
                  />
                </div>

                <p className="text-[12px] font-medium text-white/85">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        <div>

          <h2 className="mb-5 !text-5xl font-bold tracking-tight !text-white md:text-4xl">
            Industries We Serve
          </h2>

          <p className="text-[15px] leading-relaxed text-white/60">
            Digital Alife is not limited to any industry. Wherever you need us,
            we are available everywhere. We serve a wide range of industries and
            market specifications with our wide variety of website development
            services and skills.
          </p>

          <div className="my-8 h-px bg-white/15" />

          <p className="mb-8 text-[15px] italic leading-relaxed text-white/80">
            No need to wait longer to design and develop your website; we offer
            a minimum package to ensure that your budget does not stop you from
            flying.
          </p>

          <a
            href="/contact"
            className="
              group inline-flex items-center gap-2
              rounded-full px-7 py-3.5
              text-sm font-semibold text-white
              transition-all duration-300
              hover:scale-[1.04]
            "
            style={{
              background: GREEN,
              boxShadow: `0 10px 30px ${GREEN}30`,
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
          </a>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   HIGHLIGHTS
========================================================= */

function HighlightsSection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
          <h2
            className="
              mb-8 !text-4xl !font-bold
              leading-tight tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-[32px]
            "
          >
            Experience the most scalable and stable website development
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {highlights.map((h) => {
              const Icon = h.icon;

              return (
                <div
                  key={h.title}
                  className="
                    rounded-2xl border
                    border-slate-100
                    bg-white p-5
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:shadow-lg
                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:hover:shadow-[0_15px_35px_rgba(0,0,0,0.45)]
                  "
                  style={{
                    boxShadow: "0 1px 2px rgba(16,30,59,0.04)",
                  }}
                >
                  <div
                    className="
                      mb-3 flex h-10 w-10
                      items-center justify-center
                      rounded-lg
                      bg-[#F5F7FA]
                      dark:bg-slate-800
                    "
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      className="
                        text-[#1E9C6B]
                        dark:text-emerald-400
                      "
                    />
                  </div>

                  <h4
                    className="
                      text-[13.5px] font-semibold
                      leading-snug
                      text-[#101E3B]
                      dark:text-slate-100
                    "
                  >
                    {h.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="
            overflow-hidden rounded-2xl
            border border-slate-100
            dark:border-slate-800
          "
          style={{
            boxShadow: "0 24px 55px -24px rgba(16,30,59,0.3)",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80"
            alt="Digital Alife team planning a project"
            className="
              h-[420px] w-full object-cover
              transition-transform duration-700
              hover:scale-[1.02]
            "
          />
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
        bg-[#F5F7FA] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-xl">
          <h2
            className="
              mb-4 !text-3xl !font-bold tracking-tight
              !text-[#101E3B]
              dark:text-slate-100
              md:text-4xl
            "
          >
            How We Work!
          </h2>

          <p
            className="
              text-[15px]
              text-slate-500
              dark:text-slate-400
            "
          >
            Based on constant team discussion and market analytics, we have
            developed a well-structured process to align the company's mission,
            vision, and customer satisfaction.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {process.map((p) => {
            const Icon = p.icon;

            return (
              <div
                key={p.n}
                className="
                  group relative overflow-hidden
                  rounded-2xl border
                  border-slate-100
                  bg-white p-6
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_20px_40px_-18px_rgba(16,30,59,0.2)]
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]
                "
                style={{
                  boxShadow: "0 1px 2px rgba(16,30,59,0.05)",
                }}
              >
                <span
                  className="
                    pointer-events-none
                    absolute -right-1 -top-3
                    select-none text-6xl
                    font-extrabold
                    text-[#EEF1F5]
                    dark:text-slate-800
                  "
                >
                  {p.n}
                </span>

                <div
                  className="
                    relative mb-4
                    flex h-11 w-11
                    items-center justify-center
                    rounded-xl
                    bg-[#F5F7FA]
                    transition-transform duration-300
                    group-hover:scale-105
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
                    relative mb-2 text-[15px]
                    font-bold leading-snug
                    text-[#101E3B]
                    dark:text-slate-100
                  "
                >
                  {p.title}
                </h3>

                <p
                  className="
                    relative text-[13px]
                    leading-relaxed
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {p.desc}
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
   CTA
========================================================= */

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
            relative flex flex-col
            items-center justify-between
            gap-10 overflow-hidden
            rounded-3xl px-8 py-12
            md:flex-row md:px-14 md:py-16
          "
          style={{
            background: NAVY,
          }}
        >
          {/* Decorative dots */}
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
              backgroundImage: `radial-gradient(
                ${GREEN_LIGHT}88 1px,
                transparent 1px
              )`,
              backgroundSize: "10px 10px",
              width: "70px",
              height: "70px",
            }}
          />

          <Plus
            size={18}
            className="
              absolute right-6 top-6
              text-white/50
            "
          />

          <Plus
            size={18}
            className="
              absolute bottom-6 left-6
              text-white/30
            "
          />

          {/* CTA content */}
          <div className="relative max-w-lg">
            <h2
              className="
                mb-4 text-2xl font-bold
                leading-snug tracking-tight
                text-white md:text-3xl
              "
            >
              Bring the most fabulous and innovative digital transformation to
              your business by hiring a Digital Alife expert.
            </h2>

            <p className="text-[15px] text-white/60">
              Always be in touch with our most polite and understanding experts
              team.
            </p>
          </div>

          {/* Actions */}
          <div
            className="
              relative flex flex-shrink-0
              flex-col items-start gap-3
              md:items-end
            "
          >
            <a
              href="/contact"
              className="
                inline-flex items-center gap-2
                rounded-full px-7 py-3.5
                text-sm font-semibold text-white
                transition-transform duration-300
                hover:scale-[1.04]
              "
              style={{
                background: GREEN,
                boxShadow: `0 10px 28px ${GREEN}30`,
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

/* =========================================================
   MAIN
========================================================= */

export default function WebDevelopment() {
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
      <ServicesSection />
      <IndustriesSection />
      <HighlightsSection />
      <ProcessSection />
      <CTASection />
    </div>
  );
}
