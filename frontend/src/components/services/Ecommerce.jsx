import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  Phone,
  Star,
  Plus,
  ShoppingCart,
  Package,
  CreditCard,
  Boxes,
  Store,
  Smartphone,
  Zap,
  Search,
  Layers,
  Wallet,
  RefreshCw,
  ShieldCheck,
  ClipboardList,
  Palette,
  Code2,
  CheckCircle2,
  Rocket,
} from "lucide-react";

const NAVY = "#0C2C50";
const GREEN = "#2E9E6D";
const GREEN_DEEP = "#146B4D";
const GREEN_LIGHT = "#4CBB8E";
const MIST = "#F7FAF9";

const services = [
  {
    title: "Product Catalog & Storefront",
    icon: Store,
    desc: "A clean, fast storefront that makes browsing effortless — organized categories, rich product pages, and search that actually helps customers find what they want.",
  },
  {
    title: "Secure Payment Integration",
    icon: CreditCard,
    desc: "Cards, UPI, wallets, and net banking wired up with trusted payment gateways, so every checkout feels safe and completes without friction.",
  },
  {
    title: "Cart & Checkout Optimization",
    icon: ShoppingCart,
    desc: "A streamlined cart and a short, distraction-free checkout flow designed to reduce drop-offs and turn more visits into completed orders.",
  },
  {
    title: "Inventory & Order Management",
    icon: Boxes,
    desc: "A dashboard that keeps stock, pricing, and order status in sync in real time, so you're never selling something you don't have.",
  },
  {
    title: "Multi-vendor Marketplace",
    icon: Package,
    desc: "Need more than a single store? We build marketplace platforms with vendor onboarding, commission handling, and separate seller dashboards.",
  },
  {
    title: "Mobile Commerce",
    icon: Smartphone,
    desc: "A fully responsive shopping experience, plus native or hybrid app options for stores that want a dedicated mobile presence.",
  },
];

const highlights = [
  { title: "Fast, distraction-free checkout", icon: Zap },
  { title: "Mobile-first storefront design", icon: Smartphone },
  { title: "SEO-optimized product pages", icon: Search },
  { title: "Scalable, future-proof architecture", icon: Layers },
  { title: "Multiple payment gateway support", icon: Wallet },
  { title: "Real-time inventory sync", icon: RefreshCw },
];

const platforms = [
  "Shopify",
  "WooCommerce",
  "Magento",
  "BigCommerce",
  "PrestaShop",
  "React",
  "Node.js",
  "Razorpay",
  "Stripe",
  "PayPal",
];

const process = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Understand your catalog & customers",
    desc: "We start by learning your products, pricing model, and who you're selling to, so the store is built around real buying behavior.",
  },
  {
    n: "02",
    icon: Palette,
    title: "Design the shopping experience",
    desc: "Wireframes and UI for browsing, cart, and checkout — reviewed with you before a single line of code is written.",
  },
  {
    n: "03",
    icon: Code2,
    title: "Build and integrate",
    desc: "Storefront, payment gateways, and inventory systems are developed and connected end to end.",
  },
  {
    n: "04",
    icon: CheckCircle2,
    title: "Test every transaction path",
    desc: "Checkout, refunds, stock edge cases, and mobile flows are tested thoroughly before anything goes live.",
  },
  {
    n: "05",
    icon: Rocket,
    title: "Launch and support",
    desc: "We go live together, then stay on hand for updates, scaling, and any issues that come up post-launch.",
  },
];

/* =========================================================
   INTRO
========================================================= */

function IntroSection() {
  return (
    <>
      {/* Hero / Intro */}
      <section
        className="
          relative overflow-hidden
          bg-[#EAF5F6]
          px-6 pb-16 pt-10
          transition-colors duration-300
          dark:bg-[#06151D]
          sm:px-10
          lg:px-14 lg:pb-24 lg:pt-36
        "
      >
        {/* Decorative blobs */}
        <div
          className="
            pointer-events-none absolute
            -right-32 top-0
            h-96 w-96 rounded-full
            bg-[#2E9E6D]/10
            blur-3xl
            dark:bg-emerald-400/[0.05]
          "
        />

        <div
          className="
            pointer-events-none absolute
            bottom-0 left-0
            h-72 w-72 rounded-full
            bg-[#0C2C50]/5
            blur-3xl
            dark:bg-sky-400/[0.04]
          "
        />

        <div
          className="
            pointer-events-none absolute
            right-[30%] top-[20%]
            h-48 w-48 rounded-full
            bg-emerald-300/10
            blur-3xl
            dark:bg-emerald-400/[0.04]
          "
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>

            <h1
              className="
                mt-5 max-w-xl
                text-4xl font-black
                leading-[1.05] tracking-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-5xl lg:text-6xl
              "
            >
              Make your online store{" "}
              <span
                className="
                  text-[#2E9E6D]
                  dark:text-emerald-400
                "
              >
                impossible to ignore.
              </span>
            </h1>

            <p
              className="
                mt-6 max-w-lg
                text-base leading-8
                text-slate-600
                dark:text-slate-400
              "
            >
              We turn products, ideas and ambitious business goals into fast,
              beautiful commerce experiences that are built to sell.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                as="a"
                variant="unstyled"
                href="/quote"
                className="
                  group inline-flex items-center gap-2
                  rounded-xl
                  px-5 py-3.5
                  text-sm font-bold text-white
                  shadow-lg
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:shadow-xl
                "
                style={{
                  background: GREEN,
                  boxShadow: `0 10px 25px ${GREEN}25`,
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

              <span
                className="
                  text-sm font-semibold
                  text-[#0C2C50]
                  dark:text-slate-300
                "
              >
                Strategy. Design. Growth.
              </span>
            </div>
          </div>

          {/* Mockup */}
          <div className="relative mx-auto w-full max-w-xl">
            <div
              className="
                pointer-events-none absolute
                inset-8 rounded-[2.5rem]
                bg-white/70 blur-2xl
                dark:bg-emerald-400/[0.05]
              "
            />

            <img
              src="/uploads/app-mockup-2.webp"
              alt="Mobile e-commerce shopping experience"
              className="
                relative z-10 mx-auto h-auto
                max-h-[430px] w-full object-contain
                drop-shadow-[0_28px_30px_rgba(12,44,80,0.18)]
                dark:drop-shadow-[0_28px_30px_rgba(0,0,0,0.45)]
              "
            />

            <div
              className="
                absolute bottom-3 left-2 z-20
                rounded-2xl border
                border-white/70
                bg-white/90
                px-4 py-3
                shadow-xl
                backdrop-blur
                transition-colors duration-300
                dark:border-slate-700
                dark:bg-slate-900/90
                sm:left-8
              "
            >
              <p
                className="
                  text-[10px] font-bold uppercase
                  tracking-[0.18em]
                  text-slate-400
                  dark:text-slate-500
                "
              >
                Designed to convert
              </p>

              <p
                className="
                  mt-1 text-sm font-bold
                  text-[#0C2C50]
                  dark:text-slate-100
                "
              >
                Every tap feels effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 360 Section */}
      <section
        className="
          bg-white px-6 py-20
          transition-colors duration-300
          dark:bg-[#020817]
          sm:px-10
          lg:px-14
        "
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div
            className="
              rounded-[2rem]
              bg-[#F1F7F5]
              p-8
              transition-colors duration-300
              dark:border
              dark:border-slate-800
              dark:bg-slate-900
              sm:p-12
            "
          >
            <p
              className="
                text-7xl font-black
                tracking-[-0.08em]
                text-[#2E9E6D]
                dark:text-emerald-400
              "
            >
              360°
            </p>

            <p
              className="
                mt-3 max-w-xs
                text-lg font-bold leading-snug
                text-[#0C2C50]
                dark:text-slate-100
              "
            >
              A complete commerce system, not just another website.
            </p>

            <div
              className="
                mt-8 grid grid-cols-2
                gap-4 text-sm
                text-slate-500
                dark:text-slate-400
              "
            >
              <span>
                <strong
                  className="
                    block text-2xl
                    text-[#0C2C50]
                    dark:text-slate-200
                  "
                >
                  01
                </strong>
                Clear strategy
              </span>

              <span>
                <strong
                  className="
                    block text-2xl
                    text-[#0C2C50]
                    dark:text-slate-200
                  "
                >
                  02
                </strong>
                Smart design
              </span>

              <span>
                <strong
                  className="
                    block text-2xl
                    text-[#0C2C50]
                    dark:text-slate-200
                  "
                >
                  03
                </strong>
                Reliable build
              </span>

              <span>
                <strong
                  className="
                    block text-2xl
                    text-[#0C2C50]
                    dark:text-slate-200
                  "
                >
                  04
                </strong>
                Ongoing growth
              </span>
            </div>
          </div>

          <div>

            <h2
              className="
                mt-4 max-w-2xl
                !text-4xl !font-bold leading-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-4xl
              "
            >
              Commerce made simple, dependable and ready for what comes next.
            </h2>

            <p
              className="
                mt-5 max-w-2xl
                leading-8
                text-slate-600
                dark:text-slate-400
              "
            >
              From catalog and payments to delivery and retention, we connect
              every part of your customer journey into one smooth experience.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                "Conversion-first UX",
                "Secure checkout",
                "Scalable technology",
                "Real-time insights",
              ].map((item) => (
                <span
                  key={item}
                  className="
                    rounded-full border
                    border-slate-200
                    bg-slate-50
                    px-4 py-2
                    text-sm font-semibold
                    text-[#0C2C50]
                    transition-colors duration-300
                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-slate-200
                  "
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   SERVICES
========================================================= */

function ServicesSection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-wrap justify-between gap-8">
          <h2
            className="
              max-w-md !text-4xl !font-bold
              leading-tight tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              md:text-4xl
            "
          >
            Everything your{" "}
            <span
              className="
                text-[#2E9E6D]
                dark:text-emerald-400
              "
            >
              online store
            </span>{" "}
            needs, in one build
          </h2>

          <p
            className="
              max-w-md text-[19px]
              leading-relaxed
              text-black
              dark:text-slate-400
            "
          >
            From the first product listing to the final delivery update, we
            build the full commerce stack — storefront, payments, inventory, and
            everything in between.
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
                  border
                  border-slate-100
                  bg-white p-7
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-emerald-200
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:border-emerald-800
                "
                style={{
                  boxShadow: "0 1px 2px rgba(12,44,80,0.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px -18px rgba(12,44,80,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(12,44,80,0.05)";
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
                      text-[#2E9E6D]
                      dark:text-emerald-400
                    "
                  />
                </div>

                <h3
                  className="
                    mb-3 text-lg font-bold
                    text-[#0C2C50]
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
   HIGHLIGHTS + PLATFORM MARQUEE
========================================================= */

function HighlightsSection() {
  const track = [...platforms, ...platforms];

  return (
    <section
      className="
        bg-[#F7FAF9] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
      "
    >
      <style>{`
        @keyframes ecommercePlatformMarquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .ecommerce-platform-track {
          animation: ecommercePlatformMarquee 22s linear infinite;
        }

        .ecommerce-platform-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="mx-auto mb-16 grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>

          <h2
            className="
              mb-5 !text-4xl !font-bold
              leading-tight tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              md:text-[32px]
            "
          >
            A store that's fast, trustworthy, and easy to manage
          </h2>

          <p
            className="
              mb-8 text-[15px]
              leading-relaxed
              text-slate-500
              dark:text-slate-400
            "
          >
            Every store we ship is built around the same core: it should be
            effortless for customers to buy and just as effortless for you to
            run.
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
                    transition-colors duration-300
                  "
                >
                  <div
                    className="
                      flex h-9 w-9
                      flex-shrink-0
                      items-center justify-center
                      rounded-lg
                      bg-white
                      dark:bg-slate-800
                    "
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      className="
                        text-[#2E9E6D]
                        dark:text-emerald-400
                      "
                    />
                  </div>

                  <h5
                    className="
                      text-[13.5px] font-semibold
                      text-[#0C2C50]
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

        <div
          className="
            overflow-hidden rounded-2xl
            border border-transparent
            dark:border-slate-800
          "
          style={{
            boxShadow: "0 24px 55px -24px rgba(12,44,80,0.25)",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80"
            alt="Online store product browsing on a laptop"
            className="
              h-[380px] w-full object-cover
              transition-transform duration-700
              hover:scale-[1.02]
            "
          />
        </div>
      </div>

      <div
        className="scale-150 relative"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="relative w-full overflow-hidden">
          <div className="ecommerce-platform-track flex w-max items-center gap-4">
            {track.map((name, i) => {
              let Icon = Wallet;

              if (
                name === "Shopify" ||
                name === "BigCommerce" ||
                name === "PrestaShop"
              ) {
                Icon = Store;
              } else if (name === "WooCommerce") {
                Icon = ShoppingCart;
              } else if (name === "Magento") {
                Icon = Package;
              } else if (name === "React" || name === "Node.js") {
                Icon = Code2;
              } else if (name === "Razorpay" || name === "Stripe") {
                Icon = CreditCard;
              }

              return (
                <span
                  key={`${name}-${i}`}
                  className="
                    inline-flex flex-shrink-0
                    items-center gap-2
                    rounded-full border
                    border-slate-200
                    bg-white
                    px-5 py-2
                    text-sm font-semibold
                    text-[#0C2C50]
                    transition-all duration-300
                    hover:border-emerald-400
                    hover:-translate-y-0.5
                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-slate-200
                    dark:hover:border-emerald-600
                  "
                >
                  <Icon
                    size={20}
                    strokeWidth={2}
                    className="
                      text-[#2E9E6D]
                      dark:text-emerald-400
                    "
                  />

                  {name}
                </span>
              );
            })}
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
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 max-w-xl">
          <h2
            className="
              mb-4 !text-5xl !font-bold
              tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              md:text-4xl
            "
          >
            How we build your store
          </h2>

          <p
            className="
              text-[15px]
              text-slate-500
              dark:text-slate-400
            "
          >
            A clear, five-step process from first conversation to a store that's
            live and selling.
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
                  hover:shadow-[0_20px_40px_-18px_rgba(12,44,80,0.2)]
                  dark:border-slate-800
                  dark:bg-slate-900
                  dark:hover:shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]
                "
                style={{
                  boxShadow: "0 1px 2px rgba(12,44,80,0.05)",
                }}
              >
                <span
                  className="
                    pointer-events-none
                    absolute -right-1 -top-3
                    select-none text-6xl
                    font-extrabold
                    text-slate-100
                    transition-colors duration-300
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
                    transition-all duration-300
                    group-hover:scale-105
                    dark:bg-slate-800
                  "
                >
                  <Icon
                    size={20}
                    strokeWidth={1.75}
                    className="
                      text-[#2E9E6D]
                      dark:text-emerald-400
                    "
                  />
                </div>

                <h3
                  className="
                    relative mb-2 text-[15px]
                    font-bold leading-snug
                    text-[#0C2C50]
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
   TRUST
========================================================= */

function TrustSection() {
  const reviews = [
    {
      name: "AppFutura",
      note: "Reviewed by clients for dependable product and commerce delivery.",
    },
    {
      name: "Upwork",
      note: "Trusted by growing businesses for thoughtful, high-quality builds.",
    },
    {
      name: "GoodFirms",
      note: "Recognized for transparent process and measurable client outcomes.",
    },
  ];

  return (
    <section
      className="
        bg-[#F7FAF9] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-10
        lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">

          <h2
            className="
              mt-4 !text-4xl !font-bold
              leading-tight
              text-[#0C2C50]
              dark:text-slate-100
              sm:text-4xl
            "
          >
            A commerce partner you can count on.
          </h2>

          <p
            className="
              mt-5 leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            Clear communication, careful execution and a digital store that
            keeps getting better after launch.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="
                rounded-2xl border
                border-slate-200
                bg-white p-7
                shadow-sm
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-xl
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="
                    flex items-center gap-1
                    text-sm font-bold
                    text-[#0C2C50]
                    dark:text-slate-200
                  "
                >
                  <Star size={15} fill="#F59E0B" color="#F59E0B" />
                  4.9/5
                </span>

                <span
                  className="
                    text-lg font-black tracking-tight
                    text-[#2E9E6D]
                    dark:text-emerald-400
                  "
                >
                  {review.name}
                </span>
              </div>

              <p
                className="
                  mt-6 text-sm leading-7
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {review.note}
              </p>
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
            rounded-3xl
            px-8 py-12
            md:flex-row md:px-14 md:py-16
          "
          style={{
            background: NAVY,
          }}
        >
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

          <div className="relative max-w-lg">
            <h2
              className="
                mb-4 !text-4xl !font-bold
                leading-snug tracking-tight
                !text-white
                md:text-3xl
              "
            >
              Ready to launch a store that sells itself?
            </h2>

            <p className="text-[15px] text-white/60">
              Tell us about your products and we'll map out the right build for
              your budget and timeline.
            </p>
          </div>

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
                group inline-flex items-center gap-2
                rounded-full px-7 py-3.5
                text-sm font-semibold text-white
                transition-all duration-300
                hover:scale-[1.04]
              "
              style={{
                background: GREEN,
                boxShadow: `0 10px 28px ${GREEN}30`,
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

export default function Ecommerce() {
  return (
    <div
      className="
        min-h-screen
        bg-white
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <IntroSection />
      <ServicesSection />
      <HighlightsSection />
      <ProcessSection />
      <TrustSection />
      <CTASection />
    </div>
  );
}
