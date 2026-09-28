import React from "react";

const features = [
  {
    icon: "/images/icons/2.png",
    title: (
      <>
        Data
        <br />
        Backup
      </>
    ),
  },
  {
    icon: "/images/icons/3.png",
    title: (
      <>
        Data
        <br />
        Protection
      </>
    ),
  },
  {
    icon: "/images/icons/4.png",
    title: (
      <>
        Quality
        <br />
        Deliverance
      </>
    ),
  },
  {
    icon: "/images/icons/5.png",
    title: (
      <>
        Dedicated
        <br />
        Team
      </>
    ),
  },
  {
    icon: "/images/icons/6.png",
    title: (
      <>
        Professional
        <br />
        Support
      </>
    ),
  },
  {
    icon: "/images/icons/7.png",
    title: (
      <>
        Affordable
        <br />
        Pricing
      </>
    ),
  },
];

/* =========================================================
   AVATAR
========================================================= */

const Avatar = () => (
  <div
    className="
      h-[72px]
      w-[72px]
      shrink-0
      overflow-hidden
      rounded-full
      bg-[#DDEDE6]
      dark:bg-[#18382F]
    "
  >
    <img src="/images/icons/1.png" alt="" />
    {/* <svg
      viewBox="0 0 64 64"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="26"
        r="12"
        fill="#151a18"
      />

      <path
        d="M8 60c2-13 13-20 24-20s22 7 24 20"
        fill="#2C8566"
      />
    </svg> */}
  </div>
);

/* =========================================================
   KEY FEATURES
========================================================= */

export default function KeyFeatures() {
  return (
    
    <section className="
        relative
        overflow-hidden
        bg-blue-900
        py-10
        transition-colors
        duration-300
        dark:bg-[#0B3A2D]
        sm:py-14
        lg:py-18
        
      ">
    <div
      className="
        relative
        overflow-hidden
        bg-[#2C8566]
        py-20
        transition-colors
        duration-300
        dark:bg-[#0B3A2D]
        sm:py-24
        lg:py-28
        
      "
    >
      {/* =====================================================
          ORIGINAL TOP CURVE
      ====================================================== */}

      <img
        src="/images/icons/shap3.png"
        alt=""
        className="
          pointer-events-none
          absolute
          left-100
          top-100
          z-10  
          w-150
          select-none
        "
      />

      {/* =====================================================
          ORIGINAL LEFT LINE
      ====================================================== */}

      <img
        src="/images/icons/shap1.png"
        alt=""
        className="
          pointer-events-none
          absolute
          left-0
          top-16
          z-0
          hidden
          opacity-50
          lg:block
        "
      />

      {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

      <div
        className="
          relative
          z-20
          mx-auto
          w-full
          max-w-[1320px]
          px-5
          sm:px-8
          lg:px-10
          xl:px-12
        "
      >
        {/* ===================================================
            TOP ROW
        ==================================================== */}

        <div
          className="
            flex
            flex-col
            justify-between
            gap-8
            lg:flex-row
            lg:items-start
            p-10
            
          "
        >
          {/* LEFT CONTENT */}

          <div
            className="
              w-full
              text-white
              lg:w-[41.666667%]
            "
          >
            <h2
              className="
                !text-5xl
                font-bold
                leading-tight
                sm:text-5xl
                lg:text-[48px]
                !text-white
              "
            >
              Our Key Features
            </h2>

            <p
              className="
                mt-4
                max-w-[560px]
                text-[15px]
                leading-7
                text-white/85
              "
            >
              We always use the most avant-garde technology to design and
              develop your website and application. We work to unfold your
              success.
            </p>
          </div>

          {/* RIGHT DOT IMAGE */}

          <div
            className="
              hidden
              w-full
              lg:block
              lg:w-[41.666667%]
            "
          >
            <img
              src="/images/icons/shap2.png"
              alt=""
              className="
                ml-auto
                h-auto
                w-[180px]
                opacity-80
                xl:w-[210px]
              "
            />
          </div>
        </div>

        {/* ===================================================
            FEATURE CARDS
            ORIGINAL: index-up
        ==================================================== */}

        <div
          className="
            relative
            z-30
            -mt-1
            lg:-mt-2
          "
        >
          <div className="w-full">
            {/* DESKTOP: ORIGINAL HORIZONTAL ROW */}

            <div
              className="
                hidden
                w-full
                items-stretch
                justify-between
                gap-4
                lg:flex
              "
            >
              {features.map((feature) => (
                <FeatureCard
                  key={feature.icon}
                  {...feature}
                />
              ))}
            </div>

            {/* TABLET */}

            <div
              className="
                hidden
                grid-cols-3
                gap-5
                md:grid
                lg:hidden
              "
            >
              {features.map((feature) => (
                <FeatureCard
                  key={feature.icon}
                  {...feature}
                />
              ))}
            </div>

            {/* MOBILE */}

            <div
              className="
                grid
                grid-cols-2
                gap-4
                md:hidden
              "
            >
              {features.map((feature) => (
                <FeatureCard
                  key={feature.icon}
                  {...feature}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================
            BOTTOM ROW
            ORIGINAL: outerblock
        ==================================================== */}

        <div
          className="
            mt-16
            flex
            flex-col
            justify-between
            gap-10
            lg:mt-[90px]
            lg:flex-row
            lg:items-center
          "
        >
          {/* =================================================
              LEFT HEADING
          ================================================= */}

          <div
            className="
              w-full
              text-white
              lg:w-[41.666667%]
            "
          >
            <h2
              className="
                max-w-[520px]
                !text-3xl
                !font-bold
                !leading-tight
                sm:text-4xl
                lg:text-[42px]
                !text-white
              "
            >
              We're taking brands beyond their competition.
            </h2>
          </div>

          {/* =================================================
              QUOTE BLOCK
          ================================================= */}

          <div
            className="
              w-full
              lg:w-[50%]
            "
          >
            <FeatureTestimonial />
          </div>
        </div>
      </div>

      {/* =====================================================
          ORIGINAL BOTTOM SHAPES
      ====================================================== */}

      <img
        src="/images/shape/shape-1.svg"
        alt=""
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          z-10
          w-full
          select-none
        "
      />

      <img
        src="/images/shape/curve-shape-bottom.svg"
        alt=""
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          z-20
          w-full
          select-none
        "
      />
    </div>
    </section>
  );
}

/* =========================================================
   FEATURE CARD
   ORIGINAL: featurecard swcard
========================================================= */

function FeatureCard({ icon, title }) {
  return (
    <div
      className="
        group
        flex
        min-h-[160px]
        w-full
        flex-1
        flex-col
        items-center
        justify-center
        rounded-[12px]
        border
        border-black/[0.06]
        !bg-white
        px-3
        py-7
        text-center
        shadow-[0_10px_30px_rgba(0,0,0,0.10)]
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-[0_18px_40px_rgba(0,0,0,0.16)]
        dark:border-white/[0.08]
        dark:bg-slate-900
        dark:shadow-[0_12px_35px_rgba(0,0,0,0.28)]
      "
    >
      {/* ICON */}

      <div
        className="
          flex
          h-[58px]
          items-center
          justify-center
          transition-transform
          duration-300
          group-hover:scale-110
        "
      >
        <img
          src={icon}
          alt=""
          className="
            h-[48px]
            w-[48px]
            object-contain
          "
        />
      </div>

      {/* TITLE */}

      <h4
        className="
          mt-4
          text-[16px]
          font-semibold
          leading-[1.25]
          !text-[#0C2C50]
        "
      >
        {title}
      </h4>
    </div>
  );
}

/* =========================================================
   QUOTE BLOCK
   ORIGINAL: quoteblock swcard shadow
========================================================= */

function FeatureTestimonial() {
  return (
    <div
      className="
        rounded-[14px]
        border
        border-black/[0.06]
        bg-white
        p-6
        shadow-[0_15px_40px_rgba(0,0,0,0.12)]
        dark:border-white/[0.08]
        dark:bg-slate-900
        dark:shadow-[0_20px_50px_rgba(0,0,0,0.30)]
        sm:p-7
        lg:p-8
      "
    >
      {/* =================================================
          MEDIA
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-5
        "
      >
        {/* IMAGE */}

        <div className="shrink-0">
          <Avatar />
        </div>

        {/* DATA */}

        <div className="min-w-0">
          <h4
            className="
              text-[17px]
              font-semibold
              leading-[1.4]
              text-[#0C2C50]
              dark:text-white
              sm:text-[18px]
            "
          >
            Our customers never have any problem with competition in their
            business
          </h4>
        </div>
      </div>

      {/* =================================================
          DESCRIPTION
      ================================================== */}

      <p
        className="
          mt-5
          text-[14px]
          leading-7
          text-slate-500
          dark:text-slate-400
        "
      >
        Developing and designing a website application may be harder and more
        competitive for others but not for us. We are beyond the competition
        and suggest you do the same with our services. Our digital marketing
        and app development services give you the courage and wings to fly
        unlimited.
      </p>
    </div>
  );
}