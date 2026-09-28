import {
  FaArrowRight,
  FaCheckCircle,
  FaPalette,
  FaPenNib,
  FaLayerGroup,
  FaImage,
  FaBullhorn,
  FaMobileAlt,
  FaDesktop,
  FaPrint,
  FaLightbulb,
  FaRocket,
} from "react-icons/fa";
import Button from "../ui/Button";

/* =========================================================
   HERO
========================================================= */
function GraphicsHero() {
  return (
    <section className="relative min-h-[620px] overflow-hidden bg-white dark:bg-[#020817]">
      {/* Background Image */}
      <img
        src="/uploads/uiux-design-hero.jpg"
        alt="Graphics Design"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark overlay for readable text */}
      <div className="absolute inset-0 bg-[#061b30]/75 dark:bg-[#020817]/80" />

      {/* Green gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0C2C50]/90 via-[#0C2C50]/65 to-[#2E9E6D]/30 dark:from-[#020817]/95 dark:via-[#071D32]/80 dark:to-[#2E9E6D]/20" />

      {/* Decorative glow */}
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2E9E6D]/15 blur-[120px] dark:bg-[#2E9E6D]/10" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[620px] items-center justify-center px-6 py-24 text-center sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          {/* Heading */}
          <h1
            style={{ letterSpacing: "10px" }}
            className="mx-auto mt-7 max-w-4xl !text-5xl font-black leading-[1.02] tracking-[-0.04em] !text-white sm:text-6xl lg:text-7xl"
          >
            GRAPHICS DESIGN
            <span
              style={{
                wordSpacing: "-10px",
                letterSpacing: "0px",
              }}
              className="block text-[#65C996]"
            >
              Your Brand Stand
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
            Creative graphics that make your brand look professional,
            communicate clearly and stay memorable across every platform.
          </p>

          {/* Features */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm font-medium text-white/80">
            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-[#65C996]" />
              Brand focused
            </span>

            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-[#65C996]" />
              Creative visuals
            </span>

            <span className="flex items-center gap-2">
              <FaCheckCircle className="text-[#65C996]" />
              Professional design
            </span>
          </div>

          {/* CTA */}
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              as="a"
              variant="unstyled"
              href="/contact"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#2E9E6D] px-7 py-4 font-bold text-white shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:bg-[#27895f]"
            >
              Start a Design Project
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              as="a"
              variant="unstyled"
              href="#graphics-services"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20"
            >
              Explore Services
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-[#020817] dark:via-[#020817]/20 dark:to-transparent" />
    </section>
  );
}

/* =========================================================
   SERVICES
========================================================= */
function GraphicsServices() {
  const services = [
    {
      icon: FaPalette,
      title: "Brand Graphics",
      text: "Visual assets that match your brand identity and style.",
    },
    {
      icon: FaImage,
      title: "Social Media Design",
      text: "Eye-catching posts, banners and creatives for social platforms.",
    },
    {
      icon: FaBullhorn,
      title: "Marketing Creatives",
      text: "Promotional graphics designed to communicate and convert.",
    },
    {
      icon: FaLayerGroup,
      title: "Brand Identity",
      text: "Consistent visual systems that make your business recognizable.",
    },
    {
      icon: FaPrint,
      title: "Print Design",
      text: "Professional brochures, flyers, posters and business materials.",
    },
    {
      icon: FaDesktop,
      title: "Digital Graphics",
      text: "Website banners, ads and graphics for digital experiences.",
    },
  ];

  return (
    <section
      id="graphics-services"
      className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">

          <h2 className="mt-4 !text-4xl font-black text-[#0C2C50] dark:text-white sm:text-4xl">
            Graphics for every business need.
          </h2>

          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">
            From social media creatives to complete brand visuals, we keep
            everything polished and consistent.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_8px_35px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:border-[#2E9E6D]/20 hover:shadow-[0_20px_45px_rgba(15,23,42,.08)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_8px_35px_rgba(0,0,0,.2)] dark:hover:border-[#2E9E6D]/40 dark:hover:bg-slate-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E9E6D]/10 text-[#2E9E6D] transition group-hover:bg-[#2E9E6D] group-hover:text-white">
                  <Icon />
                </div>

                <h3 className="mt-6 text-lg font-bold text-[#0C2C50] dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {item.text}
                </p>

                <div className="mt-5 h-1 w-8 rounded-full bg-[#2E9E6D] transition-all group-hover:w-14" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SHOWCASE
========================================================= */
function GraphicsShowcase() {
  return (
    <section className="bg-[#f7faf9] px-6 py-20 dark:bg-[#07141A] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-[#2E9E6D]/10 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-3 shadow-[0_25px_70px_rgba(12,44,80,.1)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-[0_25px_70px_rgba(0,0,0,.3)]">
            <img
              src="/uploads/img1.png"
              alt="Graphics design showcase"
              className="h-[400px] w-full rounded-[1.5rem] object-cover sm:h-[500px]"
            />
          </div>
        </div>

        <div>

          <h2 className="mt-4 !text-4xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-4xl">
            Good graphics should be
            <span className="text-[#2E9E6D]"> instantly understood.</span>
          </h2>

          <p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">
            We combine typography, colors, imagery and layout to create graphics
            that communicate your message without unnecessary noise.
          </p>

          <div className="mt-8 space-y-5">
            {[
              {
                icon: FaLightbulb,
                title: "Clear communication",
                text: "Your message stays simple and easy to understand.",
              },
              {
                icon: FaPalette,
                title: "Strong visual identity",
                text: "Every design feels connected to your brand.",
              },
              {
                icon: FaRocket,
                title: "Made for results",
                text: "Creatives are designed with your audience and goals in mind.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white text-[#2E9E6D] shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
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
   DESIGN TYPES
========================================================= */
function GraphicsTypes() {
  const types = [
    {
      icon: FaMobileAlt,
      title: "Social Media",
      image: "/uploads/graphics-social.jpg",
    },
    {
      icon: FaDesktop,
      title: "Website Graphics",
      image: "/uploads/uiux-mobile.jpg",
    },
    {
      icon: FaPrint,
      title: "Print Materials",
      image: "/uploads/graphics-print.jpg",
    },
    {
      icon: FaLayerGroup,
      title: "Brand Identity",
      image: "/uploads/graphics-brand.jpg",
    },
  ];

  return (
    <section className="bg-white px-6 py-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>

            <h2 className="mt-4 !text-4xl font-black text-[#0C2C50] dark:text-white sm:text-4xl">
              Designs made for your brand.
            </h2>
          </div>

          <p className="max-w-md leading-7 text-slate-500 dark:text-slate-400">
            One visual direction across all the places your customers see your
            business.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {types.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl bg-[#0C2C50]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-[300px] w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50] via-[#0C2C50]/30 to-transparent dark:from-[#020817] dark:via-[#020817]/20" />

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2E9E6D] text-white">
                    <Icon />
                  </div>

                  <h3 className="mt-4 text-xl font-bold text-white">
                    {item.title}
                  </h3>
                </div>
              </article>
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
function GraphicsCTA() {
  return (
    <section className="bg-white px-6 pb-20 dark:bg-[#020817] sm:px-8 lg:px-10 lg:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#0C2C50] dark:bg-[#071D32]">
        <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-[#2E9E6D]/20 blur-3xl" />

        <div className="relative px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="max-w-3xl">

            <h2 className="mt-6 !text-4xl font-black !text-white sm:text-4xl">
              Need graphics that make your brand
              <span className="text-[#65C996]"> look professional?</span>
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-slate-300">
              Tell us what you need and we'll create visuals that fit your brand
              and business goals.
            </p>

            <a
              href="/contact"
              className="group mt-7 inline-flex items-center gap-3 rounded-xl bg-[#2E9E6D] px-7 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-[#27895f]"
            >
              Start a Conversation
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */
export default function GraphicsDesign() {
  return (
    <main className="overflow-hidden bg-white text-slate-700 dark:bg-[#020817] dark:text-slate-300">
      <GraphicsHero />

      <GraphicsServices />

      <GraphicsShowcase />

      <GraphicsTypes />

      <GraphicsCTA />
    </main>
  );
}
