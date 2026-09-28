import React from "react";
import {
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
} from "lucide-react";

const NAVY = "#101E3B";
const NAVY_SOFT = "#182A50";
const GREEN = "#3FC98D";

const industries = [
  { label: "Real Estate", icon: Home },
  { label: "Tour & travels", icon: Luggage },
  { label: "Education", icon: GraduationCap },
  { label: "Transport", icon: Car },
  { label: "Event", icon: Calendar },
  { label: "eCommerce", icon: ShoppingBag },
  { label: "Game", icon: Gamepad2 },
  { label: "Healthcare", icon: HeartPulse },
  { label: "Finance", icon: PiggyBank },
  { label: "Restaurant", icon: UtensilsCrossed },
  { label: "On-demand", icon: Layers },
  { label: "Grocery", icon: ShoppingBasket },
];

/* -------------------------------------------------------
   Dot Grid
------------------------------------------------------- */

function DotGrid() {
  const dots = Array.from({ length: 8 * 5 });

  return (
    <div
      className="
        absolute
        top-2
        right-0

        hidden
        gap-2.5

        opacity-40

        lg:grid
      "
      style={{
        gridTemplateColumns: "repeat(8, 4px)",
      }}
    >
      {dots.map((_, i) => (
        <span
          key={i}
          className="
            h-1
            w-1
            rounded-full

            bg-[#3FC98D]

            dark:bg-[#3FC98D]
          "
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------
   Industry Pill
------------------------------------------------------- */

function IndustryPill({ label, icon: Icon }) {
  return (
    <div
      className="
        group

        flex
        items-center
        gap-3

        rounded-full

        border

        py-2
        pl-2
        pr-6

        transition-all
        duration-300

        hover:-translate-y-0.5

        /* Light Mode */
        border-slate-200
        bg-white

        hover:border-[#3FC98D]
        hover:shadow-[0_10px_30px_rgba(16,30,59,0.08)]

        /* Dark Mode */
        dark:border-white/[0.08]
        dark:bg-[#182A50]

        dark:hover:border-[#3FC98D]
        dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.25)]
      "
    >
      {/* Icon */}
      <div
        className="
          flex
          h-20
          w-20
          flex-shrink-0
          items-center
          justify-center

          rounded-full

          bg-emerald-500/10

          transition-all
          duration-300

          group-hover:bg-emerald-500/15
          group-hover:scale-105

          dark:bg-emerald-400/10
          dark:group-hover:bg-emerald-400/15
        "
      >
        <Icon
          size={38}
          strokeWidth={1.75}
          className="
            text-[#1E9C6B]

            dark:text-[#3FC98D]
          "
        />
      </div>

      {/* Label */}
      <p
        className="
          whitespace-nowrap

          text-sm
          font-medium

          text-[#101E3B]

          dark:text-white
        "
      >
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   Main Component
------------------------------------------------------- */

export default function IndustriesWeServe() {
  return (
        <section
          className="
            relative
            overflow-hidden
            py-10

            bg-[#6eb054]

            transition-colors
            duration-300

            dark:bg-[#101E3B]
          "
        >
    <div
      className="
        relative
        overflow-hidden

        px-6
        py-20

        bg-[#0c2e52]

        transition-colors
        duration-300

        dark:bg-[#101E3B]
      "
    >
      {/* Decorative Glow - Light */}
      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-10
          h-72
          w-72
          rounded-full
          bg-emerald-400/10
          blur-3xl

          dark:hidden
        "
      />

      {/* Decorative Glow - Dark */}
      <div
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-0
          h-80
          w-80
          rounded-full
          bg-emerald-400/[0.06]
          blur-3xl

          hidden
          dark:block
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-6xl
        "
      >
        {/* Header */}
        <div
          className="
            mb-14

            flex
            flex-wrap
            justify-between

            gap-10
          "
        >
          {/* Heading */}
          <div className="max-w-md">


            <h2
              className="
                mb-4

                !text-5xl
                font-bold
                tracking-tight

                !text-white

                dark:text-white

                md:text-4xl
              "
            >
              Industries we serve
            </h2>

            <p
              className="
                text-[15px]
                leading-relaxed

                text-white

                dark:text-white/60
              "
            >
              We serve you with a broad range of web applications and digital
              marketing services, irrespective of your occupation and industry.
            </p>
          </div>

          {/* Decorative Dots */}
          <div
            className="
              relative
              min-w-[160px]
              flex-1
            "
          >
            <DotGrid />
          </div>
        </div>

        {/* Industries Grid */}
        <div
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {industries.map((item) => (
            <IndustryPill key={item.label} {...item} />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
