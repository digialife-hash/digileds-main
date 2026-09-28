import {
  FaArrowRight,
  FaCheckCircle,
  FaSearch,
  FaLightbulb,
  FaPencilRuler,
  FaPalette,
  FaMobileAlt,
  FaDesktop,
  FaLayerGroup,
  FaUsers,
  FaComments,
  FaChartLine,
  FaRocket,
  FaObjectGroup,
  FaRegEye,
  FaPenNib,
} from "react-icons/fa";
import Button from "../ui/Button";

/* =========================================================
   DATA
========================================================= */

const services = [
  {
    icon: FaSearch,
    title: "UX Research",
    text: "Understand users, their goals, frustrations and expectations.",
  },
  {
    icon: FaObjectGroup,
    title: "Information Architecture",
    text: "Create simple structures that make content easy to navigate.",
  },
  {
    icon: FaPencilRuler,
    title: "Wireframing",
    text: "Plan layouts and user journeys before visual design begins.",
  },
  {
    icon: FaPalette,
    title: "UI Design",
    text: "Beautiful interfaces with strong hierarchy, spacing and consistency.",
  },
  {
    icon: FaMobileAlt,
    title: "Responsive Design",
    text: "Experiences that work naturally across every screen size.",
  },
  {
    icon: FaDesktop,
    title: "Web & App Design",
    text: "Complete designs for websites, apps, dashboards and SaaS products.",
  },
];

const deliverables = [
  "User research",
  "User personas",
  "User flows",
  "Wireframes",
  "High-fidelity UI",
  "Interactive prototypes",
  "Design systems",
  "Responsive layouts",
];

const process = [
  {
    number: "01",
    icon: FaSearch,
    title: "Discover",
    text: "Understand your users, goals and product requirements.",
  },
  {
    number: "02",
    icon: FaLightbulb,
    title: "Define",
    text: "Turn research into clear flows and product structure.",
  },
  {
    number: "03",
    icon: FaPencilRuler,
    title: "Design",
    text: "Create wireframes and polished interfaces.",
  },
  {
    number: "04",
    icon: FaComments,
    title: "Refine",
    text: "Test the experience and improve every important detail.",
  },
];

const productTypes = [
  {
    icon: FaDesktop,
    title: "Websites",
    text: "Modern websites designed to communicate clearly.",
    image: "/uploads/uiux-website.jpg",
  },
  {
    icon: FaMobileAlt,
    title: "Mobile Apps",
    text: "Simple and intuitive mobile experiences.",
    image: "/uploads/uiux-mobile.jpg",
  },
  {
    icon: FaChartLine,
    title: "SaaS Products",
    text: "Complex software made easier to understand.",
    image: "/uploads/uiux-saas.jpg",
  },
  {
    icon: FaLayerGroup,
    title: "Dashboards",
    text: "Clear interfaces for information-rich products.",
    image: "/uploads/uiux-dashboard.jpg",
  },
];

/* =========================================================
   HERO
========================================================= */

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7faf9] dark:bg-[#020817]">
      {/* Background decoration */}
      <div
        style={{
          backgroundImage: "url(/uploads/a.jpg)",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
        className="absolute left-1/2 top-[-250px] h-[550px] w-[800px] -translate-x-1/2 rounded-full bg-[#2E9E6D]/10 opacity-30 blur-3xl dark:opacity-10"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 sm:px-8 lg:px-10 lg:pb-24 lg:pt-28">
        {/* Center Hero Content */}
        <div className="mx-auto max-w-4xl text-center">

          <h1 className="mt-7 text-5xl font-black leading-[0.95] tracking-[-0.04em] text-[#0C2C50] dark:text-white sm:text-6xl lg:text-8xl">
            UI / UX Design
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            We create thoughtful digital experiences that look beautiful, feel
            natural and help users get things done.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              as="a"
              variant="unstyled"
              href="/contact"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#0C2C50] px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-[#123b66] dark:bg-[#2E9E6D] dark:hover:bg-[#27895f]"
            >
              Start a Design Project
              <FaArrowRight className="transition group-hover:translate-x-1" />
            </Button>

            <Button
              as="a"
              variant="unstyled"
              href="#services"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 font-bold text-[#0C2C50] transition hover:-translate-y-1 hover:border-[#2E9E6D]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-[#2E9E6D]/50 dark:hover:bg-slate-800"
            >
              Explore Services
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-x-7 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-[#2E9E6D]" />
              User-focused
            </span>

            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-[#2E9E6D]" />
              Responsive
            </span>

            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-[#2E9E6D]" />
              Developer-ready
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative mx-auto mt-14 max-w-6xl lg:mt-18">
          <div className="absolute -inset-4 rounded-[3rem] bg-[#2E9E6D]/10 blur-2xl dark:bg-[#2E9E6D]/5" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-2 shadow-[0_35px_90px_rgba(12,44,80,0.14)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_35px_90px_rgba(0,0,0,0.35)]">
            <div className="relative overflow-hidden rounded-[1.6rem]">
              <img
                src="/uploads/uiux-design-hero.jpg"
                alt="UI UX design"
                className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[520px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/60 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 sm:bottom-7 sm:left-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E9E6D] text-white">
                    <FaPalette />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0C2C50] dark:text-white">
                      Thoughtful design
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Every detail has a purpose.
                    </p>
                  </div>
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
    <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">

        <h2 className="max-w-5xl !text-4xl font-black leading-tight tracking-tight text-[#0C2C50] dark:text-white sm:text-5xl lg:text-6xl">
          Good design is not just about looking good.
          <span className="text-[#2E9E6D]"> It should make things easier.</span>
        </h2>

        <div className="mt-10 grid gap-8 border-t border-slate-200 pt-8 dark:border-slate-800 md:grid-cols-2">
          <p className="leading-8 text-slate-600 dark:text-slate-300">
            A beautiful interface can still be difficult to use. Our UI/UX
            process combines visual design with user behavior, business
            objectives and usability.
          </p>

          <p className="leading-8 text-slate-600 dark:text-slate-300">
            We think about what users see, what they need and what should happen
            next — so the final product feels natural instead of complicated.
          </p>
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
      className="bg-[#0C2C50] px-6 py-20 text-white dark:bg-[#071D32] sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">

          <h2 className="mt-4 !text-4xl font-black !text-white sm:text-5xl">
            Everything your product needs.
          </h2>

          <p className="mt-5 leading-7 text-slate-300">
            From research to final interfaces, we create experiences that are
            simple, useful and visually clear.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2E9E6D] text-white">
                    <Icon />
                  </div>

                  <span className="text-xs font-bold text-white/20">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PHILOSOPHY
========================================================= */

function PhilosophySection() {
  const points = [
    {
      icon: FaRegEye,
      title: "Visual clarity",
      text: "Important information should be easy to notice and understand.",
    },
    {
      icon: FaUsers,
      title: "User-first thinking",
      text: "Design decisions are based on real user needs and behavior.",
    },
    {
      icon: FaLayerGroup,
      title: "Consistent systems",
      text: "Reusable components create a consistent experience.",
    },
  ];

  return (
    <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-[#2E9E6D]/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src="/uploads/uiux-showcase.jpg"
              alt="UI UX showcase"
              className="h-[400px] w-full object-cover sm:h-[500px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/50 to-transparent" />

            <div className="absolute bottom-5 left-5 rounded-xl border border-white/20 bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0C2C50] text-white dark:bg-[#2E9E6D]">
                  <FaUsers />
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Designed around
                  </p>

                  <p className="font-bold text-[#0C2C50] dark:text-white">
                    Real people
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>

          <h2 className="mt-4 !text-4xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-5xl">
            Every screen should have a reason to exist.
          </h2>

          <p className="mt-5 leading-8 text-slate-500 dark:text-slate-400">
            We avoid unnecessary elements and visual noise. Instead, we create
            interfaces where hierarchy, spacing and interactions guide users
            naturally.
          </p>

          <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-800">
            {points.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-4 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2E9E6D]/10 text-[#2E9E6D]">
                    <Icon />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#0C2C50] dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {item.text}
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
   DELIVERABLES
========================================================= */

function DeliverablesSection() {
  return (
    <section className="bg-[#f7faf9] px-6 py-20 dark:bg-[#07141A] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>

            <h2 className="mt-4 !text-4xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-5xl">
              Everything needed to move forward.
            </h2>

            <p className="mt-5 leading-7 text-slate-500 dark:text-slate-400">
              Complete design assets and documentation ready for development.
            </p>
          </div>

          <div className="grid gap-x-8 sm:grid-cols-2">
            {deliverables.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 border-b border-slate-200 py-4 dark:border-slate-700"
              >
                <span className="text-xs font-bold text-[#2E9E6D]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-sm font-semibold text-[#0C2C50] dark:text-slate-200">
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
   PRODUCT TYPES
========================================================= */

function ProductTypesSection() {
  return (
    <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">

          <h2 className="mt-4 !text-4xl font-black text-[#0C2C50] dark:text-white sm:text-5xl">
            Digital products built around people.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {productTypes.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[1.7rem] bg-[#0C2C50]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-[300px] w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50] via-[#0C2C50]/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E9E6D] text-white">
                        <Icon />
                      </div>

                      <h3 className="text-2xl font-black text-white">
                        {item.title}
                      </h3>

                      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-300">
                        {item.text}
                      </p>
                    </div>

                    <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition group-hover:bg-[#2E9E6D] sm:flex">
                      <FaArrowRight />
                    </div>
                  </div>
                </div>

                <span className="absolute right-5 top-5 text-5xl font-black text-white/10">
                  0{index + 1}
                </span>
              </article>
            );
          })}
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
    <section className="bg-[#0C2C50] px-6 py-20 text-white dark:bg-[#071D32] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 !text-4xl font-black !text-white sm:text-5xl">
            From idea to clear experience.
          </h2>

          <p className="mt-5 leading-7 text-slate-300">
            A simple process keeps the project focused on solving the right
            problems.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {process.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.number}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.07]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2E9E6D]">
                    <Icon />
                  </div>

                  <span className="text-3xl font-black text-white/10">
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.text}
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
    <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#f7faf9] dark:bg-[#07141A]">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#2E9E6D]/10 blur-3xl dark:bg-[#2E9E6D]/15" />

        <div className="relative px-7 py-14 text-center sm:px-12 lg:px-20 lg:py-20">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0C2C50] text-white dark:bg-[#2E9E6D]">
            <FaRocket />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#0C2C50]/60 dark:text-slate-400">
            Have a product idea?
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-5xl">
            Let's turn your idea into an experience people love.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-[#0C2C50]/70 dark:text-slate-300">
            Tell us about your website, app or software idea and let's create
            something people enjoy using.
          </p>

          <a
            href="/contact"
            className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#0C2C50] px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-[#123b66] dark:bg-[#2E9E6D] dark:hover:bg-[#27895f]"
          >
            Start a Conversation
            <FaArrowRight className="transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function UIUXDesign() {
  return (
    <main className="overflow-hidden bg-white text-slate-700 dark:bg-[#020817] dark:text-slate-300">
      <HeroSection />
      <IntroSection />
      <ServicesSection />
      <PhilosophySection />
      <DeliverablesSection />
      <ProductTypesSection />
      <ProcessSection />
      <CTASection />
    </main>
  );
}
