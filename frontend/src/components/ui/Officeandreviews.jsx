import React, { useEffect, useState } from "react";
import {
  MapPin,
  Star,
  ArrowLeft,
  ArrowRight,
  Quote,
  Users,
} from "lucide-react";
import Button from "./Button";
import { SiGoogle, SiFacebook } from "react-icons/si";
const NAVY = "#101E3B";
const GREEN = "#1E9C6B";
const MIST = "#F5F7FA";

const testimonials = [
  {
    quote:
      "Developing and designing a website application may be harder and more competitive for others but not for us. We are beyond the competition and suggest you do the same with our services. Our digital marketing and app development services give you the courage and wings to fly unlimited.",
    name: "Mayank Goshwami",
    location: "Jaipur, Rajasthan",
  },
  {
    quote:
      "Digital Alife understood our brand from the first call and delivered a website that actually reflects what we do. Communication stayed clear through every stage, and the after-launch support has been just as reliable.",
    name: "Priya Sharma",
    location: "Noida, Uttar Pradesh",
  },
  {
    quote:
      "We came in with a tight deadline and an even tighter budget, and the team still managed to ship a clean, fast site without cutting corners. Would recommend them to any small business owner.",
    name: "Rohit Verma",
    location: "Delhi NCR",
  },
  {
    quote:
      "What stood out was how easily they explained technical decisions in plain language, so we always knew what we were paying for. The end product loads fast and looks great on mobile.",
    name: "Anjali Mehta",
    location: "Gurugram, Haryana",
  },
];

function getIsDark() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.getAttribute("data-theme") === "dark";
}

/* =========================================================
   RATING BADGE
========================================================= */


function RatingBadge({
  platform,
  rating,
  color,
  isDark,
  reviewCount = "100+",
  href = "#",
}) {
  const isGoogle = platform?.toLowerCase() === "google";
  const isFacebook = platform?.toLowerCase() === "facebook";

  const PlatformIcon = isGoogle
    ? SiGoogle
    : isFacebook
      ? SiFacebook
      : null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        group relative flex min-w-0 items-center gap-3.5
        overflow-hidden rounded-2xl border
        px-4 py-3.5
        transition-all duration-300
        hover:-translate-y-1
        ${
          isDark
            ? "border-slate-700/70 bg-slate-900/90 text-white hover:border-slate-600 hover:bg-slate-800"
            : "border-slate-200/80 bg-white text-[#101E3B] hover:border-slate-300"
        }
      `}
      style={{
        boxShadow: isDark
          ? "0 12px 30px rgba(0,0,0,0.22)"
          : "0 8px 24px rgba(16,30,59,0.07)",
      }}
    >
      {/* Soft hover glow */}
      <div
        className="
          pointer-events-none absolute -right-8 -top-8
          h-20 w-20 rounded-full
          opacity-0 blur-2xl
          transition-opacity duration-300
          group-hover:opacity-30
        "
        style={{ backgroundColor: color }}
      />

      {/* Platform Icon */}
      <div
        className="
          relative flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-xl border
        "
        style={{
          backgroundColor: `${color}12`,
          borderColor: `${color}30`,
        }}
      >
        {PlatformIcon ? (
          <PlatformIcon
            size={22}
            className="transition-transform duration-300 group-hover:scale-110"
            style={{
              color: isGoogle ? undefined : color,
            }}
          />
        ) : (
          <span
            className="text-sm font-black"
            style={{ color }}
          >
            {platform?.charAt(0)?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`
              truncate text-sm font-bold leading-tight
              ${isDark ? "text-white" : "text-[#101E3B]"}
            `}
          >
            {platform}
          </p>

          <span
            className="
              hidden rounded-full px-1.5 py-0.5
              text-[8px] font-bold uppercase tracking-wide
              sm:inline-flex
            "
            style={{
              backgroundColor: `${color}12`,
              color: color,
            }}
          >
            Verified
          </span>
        </div>

        <div className="mt-1.5 flex items-center gap-2">
          {/* Rating Stars */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className="text-[11px] leading-none"
                style={{ color }}
              >
                ★
              </span>
            ))}
          </div>

          {/* Rating */}
          <span
            className={`
              text-xs font-extrabold
              ${isDark ? "text-slate-100" : "text-[#101E3B]"}
            `}
          >
            {rating}
          </span>
        </div>

        <p
          className={`
            mt-0.5 text-[10px] font-medium
            ${isDark ? "text-slate-500" : "text-slate-400"}
          `}
        >
          Based on {reviewCount} reviews
        </p>
      </div>

      {/* Arrow */}
      <div
        className={`
          relative flex h-8 w-8 shrink-0
          items-center justify-center
          rounded-full
          transition-all duration-300
          group-hover:translate-x-0.5
          ${
            isDark
              ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
              : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-[#101E3B]"
          }
        `}
      >
        <ArrowRight
          size={15}
          strokeWidth={2.2}
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </div>

      {/* Bottom accent */}
      <div
        className="
          absolute bottom-0 left-4 right-4
          h-[2px] origin-left scale-x-0
          rounded-full
          transition-transform duration-300
          group-hover:scale-x-100
        "
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </a>
  );
}

/* =========================================================
   OFFICE LOCATION
   ========================================================= */

function OurOfficeLocation({ isDark }) {
  const address =
    "Singhal Tower, Labour Chowk, Deepak Vihar, Khora Colony, Sector 58, Noida, Uttar Pradesh 201309";

  const mapQuery = encodeURIComponent(address);

  return (
    <section
      className={`
        relative overflow-hidden
        px-5 py-16
        sm:px-6 sm:py-20
        lg:px-8 lg:py-24
        transition-colors duration-500
        ${isDark ? "bg-[#020817]" : "bg-white"}
      `}
    >
      <div
        className={`
          pointer-events-none absolute
          -left-32 top-20
          h-72 w-72
          rounded-full
          blur-3xl
          ${isDark ? "bg-emerald-500/10" : "bg-emerald-100/60"}
        `}
      />

      <div
        className={`
          pointer-events-none absolute
          -right-32 bottom-0
          h-80 w-80
          rounded-full
          blur-3xl
          ${isDark ? "bg-cyan-500/10" : "bg-blue-50"}
        `}
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
         

          <h2
            className={`
              !text-5xl
              font-black
              leading-[1.05]
              tracking-[-0.04em]
              sm:text-5xl
              lg:text-6xl
              ${isDark ? "text-white" : "text-[#101E3B]"}
            `}
          >
            Our office{" "}
            <span className="text-[#1E9C6B] dark:text-emerald-400">
              location
            </span>
          </h2>

          <p
            className={`
              mt-5
              max-w-xl
              text-[15px]
              leading-7
              sm:text-base
              ${isDark ? "text-slate-400" : "text-slate-500"}
            `}
          >
            You are warmly welcome to visit our office and discuss your
            business ideas, website, application and digital growth
            requirements with our team.
          </p>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-center">
            <div
              className={`
                relative overflow-hidden
                rounded-3xl
                border
                p-6
                sm:p-8
                ${
                  isDark
                    ? "border-slate-700/70 bg-slate-900/80"
                    : "border-slate-200 bg-white"
                }
              `}
              style={{
                boxShadow: isDark
                  ? "0 25px 70px -35px rgba(0,0,0,0.75)"
                  : "0 25px 70px -35px rgba(16,30,59,0.22)",
              }}
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-emerald-400/10
                  blur-3xl
                "
              />

              <div
                className="
                  relative mb-6 flex h-14 w-14
                  items-center justify-center rounded-2xl
                  bg-[#1E9C6B]/10 ring-1 ring-[#1E9C6B]/20
                  dark:bg-emerald-400/10 dark:ring-emerald-400/20
                "
              >
                <MapPin
                  size={26}
                  strokeWidth={2}
                  className="text-[#1E9C6B] dark:text-emerald-400"
                />
              </div>

              <div className="relative">
                <p
                  className={`
                    mb-2 text-xs font-bold uppercase tracking-[0.18em]
                    ${isDark ? "text-emerald-400" : "text-[#1E9C6B]"}
                  `}
                >
                  Digital Alife
                </p>

                <h3
                  className={`
                    text-2xl font-bold tracking-tight sm:text-3xl
                    ${isDark ? "text-white" : "text-[#101E3B]"}
                  `}
                >
                  Come meet us
                </h3>

                <p
                  className={`
                    mt-3 text-sm leading-6
                    ${isDark ? "text-slate-400" : "text-slate-500"}
                  `}
                >
                  Visit our office to discuss your next digital project,
                  business requirements or growth strategy with our team.
                </p>

                <div
                  className={`
                    mt-7 rounded-2xl border p-4
                    ${
                      isDark
                        ? "border-slate-700/70 bg-slate-950/60"
                        : "border-slate-100 bg-[#F8FAFC]"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        mt-0.5 flex h-9 w-9 shrink-0
                        items-center justify-center rounded-xl
                        bg-[#1E9C6B]/10
                      "
                    >
                      <MapPin
                        size={17}
                        className="text-[#1E9C6B] dark:text-emerald-400"
                      />
                    </div>

                    <div>
                      <p
                        className={`
                          mb-1 text-xs font-semibold uppercase tracking-wider
                          ${isDark ? "text-slate-500" : "text-slate-400"}
                        `}
                      >
                        Office Address
                      </p>

                      <p
                        className={`
                          text-sm leading-6
                          ${isDark ? "text-slate-200" : "text-[#101E3B]"}
                        `}
                      >
                        {address}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`
                    mt-4 flex items-center gap-3 rounded-xl px-4 py-3
                    ${isDark ? "bg-emerald-400/5" : "bg-emerald-50"}
                  `}
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className="
                        absolute inline-flex h-full w-full animate-ping
                        rounded-full bg-[#1E9C6B] opacity-60
                      "
                    />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1E9C6B]" />
                  </span>

                  <span
                    className={`
                      text-xs font-medium
                      ${isDark ? "text-emerald-300" : "text-emerald-700"}
                    `}
                  >
                    Our office is located in Noida, Uttar Pradesh
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-6 flex w-full items-center justify-center gap-2
                    rounded-xl bg-[#101E3B] px-5 py-3.5
                    text-sm font-semibold text-white transition-all duration-300
                    hover:-translate-y-0.5 hover:bg-[#0B1E38] hover:shadow-lg
                    dark:bg-emerald-500 dark:text-slate-950
                    dark:hover:bg-emerald-400
                  "
                >
                  <MapPin size={17} />
                  Get Directions
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>

          <div
            className={`
              relative min-h-[420px] overflow-hidden rounded-3xl border
              ${
                isDark
                  ? "border-slate-700/70 bg-slate-900"
                  : "border-slate-200 bg-slate-100"
              }
            `}
            style={{
              boxShadow: isDark
                ? "0 30px 80px -35px rgba(0,0,0,0.8)"
                : "0 30px 80px -35px rgba(16,30,59,0.25)",
            }}
          >
            <iframe
              title="Digital Alife Office Location"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />

            <div
              className="
                absolute left-4 top-4 flex items-center gap-3
                rounded-2xl border border-white/20 bg-slate-950/80
                px-4 py-3 text-white shadow-2xl backdrop-blur-xl
              "
            >
              <div
                className="
                  flex h-9 w-9 items-center justify-center rounded-xl
                  bg-emerald-500 text-slate-950
                "
              >
                <MapPin size={18} />
              </div>

              <div>
                <p className="text-xs font-semibold text-white">Digital Alife</p>
                <p className="text-[11px] text-slate-300">
                  Noida, Uttar Pradesh
                </p>
              </div>
            </div>

            <div
              className="
                absolute bottom-4 left-4 right-4 rounded-2xl
                border border-white/20 bg-slate-950/85 p-4
                text-white shadow-2xl backdrop-blur-xl
              "
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-400"
                  />

                  <div>
                    <p className="text-xs font-semibold text-white">
                      Our Office
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-300">
                      {address}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open location in Google Maps"
                  className="
                    hidden shrink-0 rounded-xl bg-emerald-500 p-2.5
                    text-slate-950 transition hover:bg-emerald-400 sm:flex
                  "
                >
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DOT BACKDROP
   =========================================================

========================================================= */

function DotBackdrop() {
  const cols = 7;
  const rows = 6;

  const dots = Array.from({
    length: cols * rows,
  });

  return (
    <div
      className="
        absolute
        -left-6
        -top-6
        z-0
        grid
        gap-2
        opacity-60
      "
      style={{
        gridTemplateColumns: `repeat(${cols}, 5px)`,
      }}
    >
      {dots.map((_, index) => (
        <span
          key={index}
          className="
            h-1
            w-1
            rounded-full
          "
          style={{
            background: GREEN,
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   REVIEWS
========================================================= */

function ReadMoreReviews({ isDark }) {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const total = testimonials.length;
  const current = testimonials[index];
  const canCycle = total > 1;

  const go = (direction) => {
    if (!canCycle || fading) {
      return;
    }

    setFading(true);

    window.setTimeout(() => {
      setIndex((currentIndex) => (currentIndex + direction + total) % total);

      setFading(false);
    }, 180);
  };

  return (
    <section
      className={`
        px-6
        py-20
        transition-colors
        duration-300
        ${isDark ? "bg-[#0b1220]" : "bg-[#F5F7FA]"}
      `}
    >
      <div
        className="
          mx-auto
          grid
          max-w-6xl
          grid-cols-1
          items-center
          gap-12
          lg:grid-cols-2
        "
      >
        {/* LEFT */}

        <div>
          <h2
            className={`
              mb-4
              !text-5xl
              font-bold
              tracking-tight
              md:text-4xl
              ${isDark ? "text-slate-100" : "text-[#101E3B]"}
            `}
          >
            Read more{" "}
            <span className="text-[#1E9C6B] dark:text-emerald-400">
              reviews
            </span>
          </h2>

          <p
            className={`
              mb-8
              text-[15px]
              ${isDark ? "text-slate-400" : "text-slate-500"}
            `}
          >
            Read our reviews from all over the world.
          </p>

          <div className="flex flex-wrap gap-4">
            <RatingBadge
              platform="Google"
              rating="4.9"
              color="#4285F4"
              isDark={isDark}
            />

            <RatingBadge
              platform="Facebook"
              rating="4.7"
              color="#1877F2"
              isDark={isDark}
            />
          </div>
        </div>

        {/* RIGHT */}

        <div className="relative">
          <DotBackdrop />

          <div
            className={`
              relative
              rounded-2xl
              border
              p-8
              transition-all
              duration-300
              ${
                isDark
                  ? "border-slate-700/70 bg-slate-900"
                  : "border-slate-100 bg-white"
              }
            `}
            style={{
              boxShadow: isDark
                ? "0 18px 45px -16px rgba(0,0,0,0.45)"
                : "0 12px 32px -16px rgba(16,30,59,0.20)",
              opacity: fading ? 0 : 1,
            }}
          >
            {/* QUOTE ICON */}

            <div
              className="
                mb-5
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[rgba(30,156,107,0.12)]
              "
            >
              <Quote size={20} color={GREEN} />
            </div>

            {/* QUOTE */}

            <p
              className={`
                mb-8
                text-[15px]
                leading-relaxed
                ${isDark ? "text-slate-300" : "text-slate-500"}
              `}
            >
              {current.quote}
            </p>

            {/* PERSON */}

            <div
              className={`
                flex
                items-center
                gap-3
                border-t
                pt-5
                ${isDark ? "border-slate-700" : "border-slate-100"}
              `}
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[rgba(30,156,107,0.12)]
                "
              >
                <Users size={18} color={GREEN} />
              </div>

              <div>
                <p
                  className={`
                    text-sm
                    font-semibold
                    ${isDark ? "text-slate-100" : "text-[#101E3B]"}
                  `}
                >
                  {current.name}
                </p>

                <p
                  className={`
                    text-[13px]
                    ${isDark ? "text-slate-500" : "text-slate-400"}
                  `}
                >
                  {current.location}
                </p>
              </div>
            </div>
          </div>

          {/* CONTROLS */}

          <div className="mt-6 flex items-center justify-between">
            {/* DOTS */}

            <div className="flex items-center gap-1.5">
              {testimonials.map((_, dotIndex) => (
                <span
                  key={dotIndex}
                  className="
                    h-1.5
                    rounded-full
                    transition-all
                    duration-300
                  "
                  style={{
                    width: dotIndex === index ? 20 : 6,
                    background:
                      dotIndex === index
                        ? GREEN
                        : isDark
                          ? "#475569"
                          : "#D9DEE6",
                  }}
                />
              ))}
            </div>

            {/* ARROWS */}

            <div className="flex items-center gap-3">
              <Button
                variant="unstyled"
                onClick={() => go(-1)}
                disabled={!canCycle || fading}
                aria-label="Previous review"
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  border
                  transition-all
                  duration-300
                  ${
                    isDark
                      ? "border-slate-700 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }
                  ${canCycle ? "hover:scale-105" : "cursor-not-allowed"}
                `}
                style={{
                  borderColor: canCycle
                    ? undefined
                    : isDark
                      ? "#263244"
                      : "#EEF0F3",
                  color: canCycle
                    ? isDark
                      ? "#E2E8F0"
                      : NAVY
                    : isDark
                      ? "#475569"
                      : "#C7CCD6",
                }}
              >
                <ArrowLeft size={16} />
              </Button>

              <Button
                variant="unstyled"
                onClick={() => go(1)}
                disabled={!canCycle || fading}
                aria-label="Next review"
                className={`
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  transition-all
                  duration-300
                  ${
                    canCycle
                      ? isDark
                        ? "bg-emerald-500 text-slate-950 hover:scale-105 hover:bg-emerald-400"
                        : "bg-[#101E3B] text-white hover:scale-105 hover:bg-[#0B1E38]"
                      : isDark
                        ? "bg-slate-800 text-slate-500"
                        : "bg-[#DDE3EA] text-white"
                  }
                `}
              >
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function OfficeAndReviews() {
  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(getIsDark());
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("themechange", syncTheme);

    window.addEventListener("storage", syncTheme);

    return () => {
      observer.disconnect();

      window.removeEventListener("themechange", syncTheme);

      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return (
    <div>
      <OurOfficeLocation isDark={isDark} />

      <ReadMoreReviews isDark={isDark} />
    </div>
  );
}