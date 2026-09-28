import React from "react";
import { ArrowDown } from "lucide-react";

export default function QuoteHero({
  setQuetsOpen,
  onGetQuotes,
  onGenerateLeads,
}) {
  return (
    <section
      className="
        relative
        flex
        min-h-[100svh]
        items-center
        overflow-hidden
        bg-[#0C2C50]
        px-4
        py-20
        text-white
        sm:min-h-[85svh]
        sm:px-6
        sm:py-20
        lg:min-h-[78vh]
        lg:px-12
        lg:py-24
      "
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/images/abcd.jpg')",
        }}
      />

      {/* DARK OVERLAY */}
      <div
        className="
          absolute
          inset-0
          bg-[#0C2C50]/20
          sm:bg-[#0C2C50]/15
        "
      />

      {/* BOTTOM WHITE FADE */}
      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-24
          bg-gradient-to-t
          from-white
          via-white/50
          to-transparent
          sm:h-32
          lg:h-40
        "
      />

      {/* CONTENT */}
      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-4xl
          py-6
          text-center
          sm:py-8
          lg:py-10
        "
      >
        {/* HEADING */}
        <h1
          className="
            mt-0
            !text-4xl
            font-bold
            leading-tight
            tracking-tight
            !text-white
            xs:!text-5xl
            sm:!text-5xl
            md:!text-6xl
            lg:!text-7xl
          "
        >
          Request a Quote
        </h1>

        {/* DESCRIPTION */}
        <p
          className="
            mx-auto
            mt-4
            max-w-2xl
            !text-base
            font-bold
            leading-6
            text-white
            sm:mt-5
            sm:!text-lg
            sm:leading-8
            lg:!text-xl
          "
        >
          Tell us what you are looking to build, improve or launch. Share a
          few details about your requirements and our team will get back to
          you with the right solution.
        </p>

        {/* SERVICES */}
        <div
          className="
            mx-auto
            mt-6
            flex
            max-w-2xl
            flex-wrap
            items-center
            justify-center
            gap-x-4
            gap-y-2
            text-sm
            font-medium
            text-white
            sm:mt-8
            sm:gap-x-5
            sm:text-base
            lg:text-lg
          "
        >
          <span>Web & Mobile</span>

          <span className="hidden h-1 w-1 rounded-full bg-white sm:block" />

          <span>Business Solutions</span>

          <span className="hidden h-1 w-1 rounded-full bg-white sm:block" />

          <span>Custom Development</span>
        </div>

        {/* PROJECT TEXT */}
        <div
          className="
            mt-7
            flex
            flex-col
            items-center
            text-white
            sm:mt-9
          "
        >
          <span
            className="
              text-[11px]
              font-medium
              uppercase
              tracking-[0.16em]
              sm:text-xs
              sm:tracking-[0.2em]
              md:text-sm
            "
          >
            Tell us about your project
          </span>

          <ArrowDown
            size={28}
            strokeWidth={2}
            className="
              mt-2
              sm:h-8
              sm:w-8
              lg:h-[35px]
              lg:w-[35px]
            "
          />
        </div>

        {/* BUTTONS */}
        <div
          className="
            mt-7
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-3
            mt-8
            !flex-row
            sm:flex-wrap
            sm:gap-3
          "
        >
          {/* =====================================================
              GET QUOTES
          ====================================================== */}
          <button
            type="button"
            onClick={() => {
              setQuetsOpen?.(true);
              onGetQuotes?.();
            }}
            className="
              group
              relative
              inline-flex
              h-[54px]
              w-full
              max-w-[260px]
              items-center
              justify-center
              overflow-hidden
              rounded-lg
              px-8
              text-sm
              font-semibold
              text-white
              transition
              duration-200
              hover:scale-[1.02]
              focus:outline-none
              active:scale-95
              sm:h-[58px]
              sm:w-auto
              sm:min-w-[190px]
              sm:px-10
              lg:h-[60px]
              lg:min-w-[200px]
              lg:px-14
            "
            style={{
              background: "url(/images/button.png)",
              backgroundSize: "110%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <span
              className="
                absolute
                inset-0
                rounded-2xl
                bg-[#0C2C50]
                origin-center
                scale-100
                transition-all
                duration-500
                ease-[cubic-bezier(0.65,0,0.35,1)]
                group-hover:scale-0
                group-hover:opacity-0
                group-hover:origin-left
                group-hover:scale-x-0
                group-hover:skew-x-6
              "
            />

            <span className="relative z-10">
              Get Quotes
            </span>
          </button>

          {/* =====================================================
              GENERATE LEADS
          ====================================================== */}
          <button
            type="button"
            onClick={() => {
              setQuetsOpen?.(true);
              onGenerateLeads?.();
            }}
            className="
              inline-flex
              h-[54px]
              w-full
              max-w-[260px]
              items-center
              justify-center
              rounded-lg
              border
              border-[#2E9E6D]
              bg-transparent
              px-8
              text-sm
              font-semibold
              text-white
              transition
              duration-200
              hover:bg-[#2E9E6D]/50
              hover:text-white
              focus:outline-none
              focus:ring-2
              focus:ring-[#2E9E6D]/30
              active:scale-95
              sm:h-[58px]
              sm:w-auto
              sm:min-w-[190px]
              sm:px-10
              lg:h-[60px]
              lg:min-w-[200px]
              lg:px-10
            "
          >
            Generate Leads
          </button>
        </div>
      </div>

      {/* BOTTOM BORDER */}
      <div
        className="
          absolute
          bottom-0
          left-0
          right-0
          h-px
          bg-white
        "
      />
    </section>
  );
}