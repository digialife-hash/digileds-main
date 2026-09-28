import {
  FaArrowRight,
  FaCheckCircle,
  FaCogs,
  FaCloud,
  FaDatabase,
  FaMobileAlt,
  FaChartLine,
  FaUsers,
  FaRocket,
  FaGlobe,
  FaShieldAlt,
} from "react-icons/fa";
import Button from "../ui/Button";

const solutions = [
  {
    icon: FaCogs,
    title: "Business Automation",
    text: "Automate repetitive work and connect your everyday business processes into one efficient workflow.",
  },
  {
    icon: FaDatabase,
    title: "Management Systems",
    text: "Custom systems for customers, employees, inventory, products, orders and daily operations.",
  },
  {
    icon: FaChartLine,
    title: "Business Dashboards",
    text: "Get useful business insights with dashboards built around the information your team actually needs.",
  },
  {
    icon: FaUsers,
    title: "CRM & Customer Platforms",
    text: "Manage leads, customers, communication, sales and follow-ups from one centralized platform.",
  },
  {
    icon: FaMobileAlt,
    title: "Web & Mobile Applications",
    text: "Responsive applications designed to provide a smooth experience across desktop and mobile devices.",
  },
  {
    icon: FaCloud,
    title: "Cloud Solutions",
    text: "Secure and scalable cloud-based software that your team can access from anywhere.",
  },
];

const features = [
  "Business requirement analysis",
  "UI/UX design",
  "Custom application development",
  "Database architecture",
  "REST API development",
  "Authentication & authorization",
  "Payment gateway integration",
  "Third-party integrations",
  "Admin panels",
  "Cloud deployment",
  "Security implementation",
  "Maintenance & support",
];

const process = [
  {
    number: "01",
    title: "Discover",
    text: "We understand your business, users, workflow and the actual problem your software needs to solve.",
  },
  {
    number: "02",
    title: "Design",
    text: "We create the structure and user experience before development so everything has a clear direction.",
  },
  {
    number: "03",
    title: "Develop",
    text: "Our developers turn the approved concept into secure, scalable and reliable software.",
  },
  {
    number: "04",
    title: "Launch",
    text: "We test, deploy and help you get the new system running smoothly with your team.",
  },
];

const technologies = [
  "React",
  "Node.js",
  "PHP",
  "Laravel",
  "Java",
  "MySQL",
  "MongoDB",
  "REST API",
];

const industries = [
  {
    icon: FaUsers,
    title: "CRM",
    text: "Leads, customers & sales",
  },
  {
    icon: FaDatabase,
    title: "ERP",
    text: "Business operations",
  },
  {
    icon: FaMobileAlt,
    title: "Apps",
    text: "Web & mobile products",
  },
  {
    icon: FaGlobe,
    title: "Platforms",
    text: "Customer-facing systems",
  },
];

export default function CustomSoftware() {
  return (
    <div className="w-full overflow-hidden bg-white text-slate-700 dark:bg-[#020817] dark:text-slate-300">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative isolate min-h-[680px] overflow-hidden bg-white dark:bg-[#020817] sm:min-h-[720px]">
        {/* Full hero background image */}
        <img
          src="/images/custom-software-hero.jpg"
          alt="Custom software development"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Elegant overlay */}
        <div className="absolute inset-0 bg-white/55 dark:bg-[#020817]/75" />

        {/* Left/right subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-white/30 dark:from-[#020817]/95 dark:via-[#020817]/75 dark:to-[#020817]/45" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/30 to-transparent dark:from-[#020817] dark:via-[#020817]/30 dark:to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center justify-center px-6 py-24 text-center sm:min-h-[720px] sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">


            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-[#0C2C50] dark:text-white sm:text-5xl md:text-6xl lg:text-[72px]">
              CUSTOM SOFTWARE
              <span className="block text-[#2E9E6D]">Development</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-700 dark:text-slate-200 sm:text-lg">
              We design and develop custom software that simplifies operations,
              connects your teams and helps your business grow without being
              limited by generic tools.
            </p>

            {/* Buttons */}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                as="a"
                variant="unstyled"
                href="/contact"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#0C2C50] px-7 py-4 font-bold text-white shadow-xl shadow-[#0C2C50]/15 transition duration-300 hover:-translate-y-1 hover:bg-[#123b68] dark:bg-[#2E9E6D] dark:shadow-[#2E9E6D]/20 dark:hover:bg-[#27895f]"
              >
                Start Your Project
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Button>

              <Button
                as="a"
                variant="unstyled"
                href="#solutions"
                className="inline-flex items-center justify-center rounded-xl border border-[#0C2C50]/15 bg-white/80 px-7 py-4 font-bold text-[#0C2C50] shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white dark:border-white/15 dark:bg-slate-900/75 dark:text-white dark:hover:border-white/25 dark:hover:bg-slate-800"
              >
                Explore Solutions
              </Button>
            </div>

            {/* Trust points */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2E9E6D]" />
                Scalable
              </span>

              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2E9E6D]" />
                Secure
              </span>

              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2E9E6D]" />
                Easy to use
              </span>

              <span className="flex items-center gap-2">
                <FaCheckCircle className="text-[#2E9E6D]" />
                Business focused
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ====================================================== */}
      <section className="bg-[#f7faf9] px-6 py-20 dark:bg-[#07141A] sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>

            <h2 className="mt-4 !text-4xl font-bold leading-tight text-[#0C2C50] dark:text-white sm:text-4xl">
              Your business is unique.
              <span className="block">Your software should be too.</span>
            </h2>
          </div>

          <div>
            <p className="leading-8 text-slate-600 dark:text-slate-300">
              Generic software often makes businesses change the way they work.
              Custom software does the opposite. We build technology around your
              processes, customers, team and goals.
            </p>

            <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">
              From a simple internal tool to a complete business platform, every
              part can be designed according to what your organization actually
              needs.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SOLUTIONS
      ====================================================== */}
      <section
        id="solutions"
        className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">

            <h2 className="mt-4 !text-4xl font-bold text-[#0C2C50] dark:text-white sm:text-4xl">
              Software solutions built for real work.
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              We combine technology, design and business thinking to build
              solutions that are practical, reliable and easy to use.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_8px_35px_rgba(15,23,42,0.045)] transition duration-300 hover:-translate-y-1 hover:border-[#2E9E6D]/20 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_8px_35px_rgba(0,0,0,0.18)] dark:hover:border-[#2E9E6D]/40 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E9E6D]/10 text-lg text-[#2E9E6D] transition duration-300 group-hover:bg-[#2E9E6D] group-hover:text-white">
                      <Icon />
                    </div>

                    <FaArrowRight className="text-sm text-slate-200 transition group-hover:translate-x-1 group-hover:text-[#2E9E6D] dark:text-slate-700" />
                  </div>

                  <h3 className="mt-7 text-lg font-bold text-[#0C2C50] dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          VISUAL FEATURE
      ====================================================== */}
      <section className="bg-[#f7faf9] px-6 py-20 dark:bg-[#07141A] sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          {/* Image */}
          <div className="relative">
            <div className="absolute -left-5 -top-5 h-32 w-32 rounded-full bg-[#2E9E6D]/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] shadow-xl dark:shadow-black/30">
              <img
                src="/uploads/a.jpg"
                alt="Software development team"
                className="h-[400px] w-full object-cover sm:h-[450px]"
              />
            </div>

            {/* Floating information */}
            <div className="absolute -bottom-6 right-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 sm:right-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0C2C50] text-white dark:bg-[#2E9E6D]">
                <FaShieldAlt />
              </div>

              <div>
                <p className="text-sm font-bold text-[#0C2C50] dark:text-white">
                  Secure by design
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Built for long-term growth
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="mt-4 !text-3xl font-bold leading-tight text-[#0C2C50] dark:text-white sm:text-4xl">
              From your first idea to a reliable product.
            </h2>

            <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">
              You don't need to manage multiple teams for design, development,
              integration and deployment. We can take care of the complete
              development journey.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <FaCheckCircle className="mt-1 shrink-0 text-[#2E9E6D]" />

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INDUSTRIES / USE CASES
      ====================================================== */}
      <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">

            <h2 className="mt-4 !text-4xl font-bold text-[#0C2C50] dark:text-white sm:text-4xl">
              Technology that adapts to your business.
            </h2>

            <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
              Whether you are improving an internal process or launching a
              customer-facing product, we build around your requirements.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-slate-100 bg-[#f7faf9] p-7 text-center transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:shadow-black/25"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0C2C50] text-lg text-white transition group-hover:bg-[#2E9E6D]">
                    <Icon />
                  </div>

                  <h3 className="mt-5 font-bold text-[#0C2C50] dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          TECHNOLOGY
      ====================================================== */}
      <section className="bg-[#0C2C50] px-6 py-20 dark:bg-[#071D32] sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <h2 className="mt-4 !text-4xl font-bold !text-white sm:text-4xl">
              The right technology for the job.
            </h2>

            <p className="mt-5 leading-7 text-slate-300">
              We select technologies according to your project requirements,
              performance needs, scalability and long-term goals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {technologies.map((tech) => (
              <div
                key={tech}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-5 text-center font-semibold text-white transition hover:bg-white/10"
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ====================================================== */}
      <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">

            <h2 className="mt-4 !text-4xl font-bold text-[#0C2C50] dark:text-white sm:text-4xl">
              A simple process. No unnecessary complexity.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">
              We keep communication clear and the development process structured
              from beginning to launch.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {process.map((item, index) => (
              <div key={item.number} className="relative">
                {index !== process.length - 1 && (
                  <div className="absolute left-12 top-6 hidden h-px w-[calc(100%-20px)] bg-slate-200 dark:bg-slate-700 md:block" />
                )}

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2E9E6D] font-bold text-white shadow-lg shadow-[#2E9E6D]/20">
                    {item.number}
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-[#0C2C50] dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="bg-white px-6 pb-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0C2C50] dark:bg-[#071D32]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2E9E6D]/20 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative grid items-center gap-8 px-7 py-12 sm:px-10 lg:grid-cols-[1fr_auto] lg:px-14 lg:py-16">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E9E6D] text-white">
                <FaRocket />
              </div>

              <h2 className="mt-6 max-w-2xl !text-3xl font-bold !text-white sm:text-4xl">
                Have a software idea?
                <span className="block text-[#65C996]">
                  Let's build it together.
                </span>
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-slate-300">
                Tell us what you want to build, what problem you are trying to
                solve and where you want your business to go.
              </p>
            </div>

            <a
              href="/contact"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#2E9E6D] px-7 py-4 font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#27895f]"
            >
              Discuss Your Project
              <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
