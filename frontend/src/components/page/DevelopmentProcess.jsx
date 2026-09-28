import React from "react";
import {
  ChevronRight,
  ArrowRight,
  Ear,
  Database,
  NotebookPen,
  Code2,
  CheckCircle2,
  Server,
  LifeBuoy,
  Phone,
  Plus,
} from "lucide-react";

const NAVY = "#101E3B";
const GREEN = "#1E9C6B";
const GREEN_LIGHT = "#3FC98D";
const MIST = "#F5F7FA";

const steps = [
  {
    n: "01",
    icon: Ear,
    title: "Listening to your needs and requirements",
    desc: "We begin our work by listening to the needs of our clients. Each business retains its specialties and needs. So, we can not give the same solution to every client. We understand our client's business and ask them about their needs and requirements.",
  },
  {
    n: "02",
    icon: Database,
    title: "Collecting the Information",
    desc: "The team of experts begins with an in-depth exploration of your industry details to establish a strong foundation for your website or mobile application. We collect this information to analyze the UI required and the purposes and goals of your solution.",
  },
  {
    n: "03",
    icon: NotebookPen,
    title: "Creating plans & Strategies",
    desc: "Based on the collected data and information, our team prepares plans and strategies for creating your website and application. All these plans are of course discussed with you and once the confirmation is received, we move ahead.",
  },
  {
    n: "04",
    icon: Code2,
    title: "Start Coding/Implementation",
    desc: "Now that you have given the confirmation, our developer team starts coding to develop your website and application. This step is much more complicated. It takes the most time to complete as this is a very technical step.",
  },
  {
    n: "05",
    icon: CheckCircle2,
    title: "Testing and Quality Check",
    desc: "After your website and application are ready, now its quality is checked by our experts. Inside this, your product is checked for speed and performance. If we see any deficiency during testing, then we correct it again.",
  },
  {
    n: "06",
    icon: Server,
    title: "Server execution",
    desc: "This is the time to host your website and application on your server and experience real-time use. We will execute your application and website on your server and will rectify any problem during real-time testing.",
  },
  {
    n: "07",
    icon: LifeBuoy,
    title: "Post-service Support and Maintenance",
    desc: "Our services do not end here. You know our end-motive is to satisfy you completely. So we also give you a post-service solution. Within this, you can contact us to fix the problems or errors in your product for a limited time.",
  },
];

/* =========================================================
   HERO
========================================================= */

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
          "linear-gradient(125deg, rgba(0,0,0,0.45), rgba(13,25,50,0.82)), url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <style>{`
        @keyframes developmentFloatBlob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }

          50% {
            transform: translate(20px, -20px) scale(1.05);
          }
        }

        .development-blob-a {
          animation: developmentFloatBlob 9s ease-in-out infinite;
        }

        .development-blob-b {
          animation: developmentFloatBlob 11s ease-in-out infinite reverse;
        }
      `}</style>

      {/* Green glow */}
      <div
        className="
          development-blob-a
          pointer-events-none absolute
          -right-24 -top-24
          h-72 w-72 rounded-full blur-3xl
          opacity-80 dark:opacity-50
        "
        style={{
          background: `radial-gradient(
            circle,
            ${GREEN_LIGHT}55,
            transparent 70%
          )`,
        }}
      />

      <div
        className="
          development-blob-b
          pointer-events-none absolute
          -bottom-32 -left-20
          h-80 w-80 rounded-full blur-3xl
          opacity-80 dark:opacity-50
        "
        style={{
          background: `radial-gradient(
            circle,
            ${GREEN}40,
            transparent 70%
          )`,
        }}
      />

      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-32">
        {/* Breadcrumb */}
        <div
          className="
            mb-7 inline-flex items-center gap-2
            rounded-full border
            border-white/15
            bg-white/[0.06]
            px-4 py-1.5
            backdrop-blur-sm
          "
        >
          <span className="text-xs font-medium text-white/70">Home</span>

          <ChevronRight size={12} className="text-white/40" />

          <span
            className="text-xs font-semibold"
            style={{ color: GREEN_LIGHT }}
          >
            How We Work
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-6 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
          <span className="text-white">Our Development </span>

          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(
                90deg,
                ${GREEN_LIGHT},
                #7EE8B8
              )`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Process
          </span>
        </h1>

        <p className="mb-10 max-w-lg text-[16px] leading-relaxed text-white/65">
          We create an adequate plan and strategy before developing your website
          or application. We at Digital Alife make these plans and strategies by
          maintaining the goal, vision, and core integrity of our Digital Alife
          company.
        </p>

        <a
          href="/contact"
          className="
            group relative inline-flex items-center gap-2
            overflow-hidden rounded-full
            px-7 py-3.5
            text-sm font-semibold text-white
            transition-transform duration-300
            hover:scale-[1.04]
          "
          style={{
            background: GREEN,
            boxShadow: `0 12px 35px ${GREEN}30`,
          }}
        >
          <span
            className="
              absolute inset-0 opacity-0
              transition-opacity duration-300
              group-hover:opacity-100
            "
            style={{
              background: `linear-gradient(
                90deg,
                ${GREEN},
                ${GREEN_LIGHT}
              )`,
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

/* =========================================================
   INTRO
========================================================= */

function Intro() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12">
        <h2
          className="
            text-3xl font-bold leading-tight tracking-tight
            text-[#101E3B]
            dark:text-slate-100
            md:text-[32px]
            lg:col-span-5
          "
        >
          We start your project with a deep awareness of your needs and
          requirement
        </h2>

        <div className="lg:col-start-7 lg:col-span-6">
          <p
            className="
              mb-4 text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Our goal is to provide maximum benefit to our customers with our
            services. For this, it is most important that we recognize the
            actual necessities and prerequisites of our customer's journey.
          </p>

          <p
            className="
              text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            We peacefully sit with our clients and ask for their requirements
            and expectations and then start working. We always take suggestions
            and ideas from our clients to produce the best result.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   STEP ROW
========================================================= */

function StepRow({ step, index }) {
  const reverse = index % 2 === 1;
  const isLast = index === steps.length - 1;
  const Icon = step.icon;

  return (
    <div className="relative">
      {/* Timeline */}
      {!isLast && (
        <div
          className="
            absolute left-1/2 top-16 hidden
            h-[calc(100%+2.5rem)] w-px
            -translate-x-1/2
            md:block
          "
          style={{
            background:
              "repeating-linear-gradient(180deg, #CBEBDB 0, #CBEBDB 6px, transparent 6px, transparent 12px)",
          }}
        />
      )}

      <div
        className={`
          relative grid grid-cols-1 items-center
          gap-8 py-10
          md:grid-cols-2 md:gap-16
        `}
      >
        {/* Illustration */}
        <div className={reverse ? "md:order-2" : ""}>
          <div
            className="
              rounded-2xl border
              border-transparent
              bg-[#F5F7FA] p-8
              transition-all duration-300
              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div
              className="
                flex h-full min-h-[180px]
                items-center justify-center
                rounded-2xl
                bg-white
                transition-colors duration-300
                dark:bg-slate-800
              "
              style={{
                boxShadow: "0 12px 30px -14px rgba(16,30,59,0.25)",
              }}
            >
              <Icon
                size={58}
                strokeWidth={1.4}
                className="
                  text-[#1E9C6B]
                  dark:text-emerald-400
                "
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={reverse ? "md:order-1" : ""}>
          <span
            className="
              relative z-10 mb-4
              inline-flex h-10 w-10
              items-center justify-center
              rounded-full
              text-sm font-bold text-white
            "
            style={{
              background: NAVY,
            }}
          >
            {step.n}
          </span>

          <h3
            className="
              mb-3 text-2xl font-bold
              leading-tight tracking-tight
              text-[#101E3B]
              dark:text-slate-100
            "
          >
            {step.title}
          </h3>

          <p
            className="
              text-[15px] leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            {step.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TIMELINE SECTION
========================================================= */

function TimelineSection() {
  return (
    <section
      className="
        bg-[#F5F7FA] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
      "
    >
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-6 max-w-xl text-center">

          <h2
            className="
              mb-4 text-3xl font-bold tracking-tight
              text-[#101E3B]
              dark:text-slate-100
              md:text-4xl
            "
          >
            How do we develop{" "}
            <span style={{ color: GREEN }}>your product?</span>
          </h2>

          <p
            className="
              text-[15px]
              text-slate-500
              dark:text-slate-400
            "
          >
            Digital Alife has created its own systematic plan and strategy to
            serve its clients with digital services.
          </p>
        </div>

        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
          {steps.map((step, i) => (
            <StepRow key={step.n} step={step} index={i} />
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
    <section
      className="
        bg-white px-6 py-20
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
          {/* Dot patterns */}
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

          {/* CTA text */}
          <div className="relative max-w-lg">
            <h3
              className="
                mb-3 text-2xl font-bold
                leading-snug tracking-tight
                text-white
                md:text-3xl
              "
            >
              Hire Developers For Custom IT Solutions
            </h3>

            <p className="text-[15px] text-white/60">
              Always be in touch with our most polite and understanding experts
              team.
            </p>
          </div>

          {/* CTA actions */}
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

export default function DevelopmentProcess() {
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
      <Intro />
      <TimelineSection />
      <CTASection />
    </div>
  );
}
