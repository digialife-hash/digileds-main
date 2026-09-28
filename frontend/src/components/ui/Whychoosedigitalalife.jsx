import React from "react";
import {
  ClipboardList,
  Wallet,
  Hourglass,
  UsersRound,
  AppWindow,
  Headset,
} from "lucide-react";

const GREEN = "#1E9C6B";

const features = [
  {
    title: "Streamlined project management",
    icon: ClipboardList,
    offset: false,
  },
  {
    title: "Pocket friendly IT solutions",
    icon: Wallet,
    offset: true,
  },
  {
    title: "Project completion in given time",
    icon: Hourglass,
    offset: false,
  },
  {
    title: "Best experts are co-working",
    icon: UsersRound,
    offset: true,
  },
  {
    title: "User-friendly custom made apps",
    icon: AppWindow,
    offset: false,
  },
  {
    title: "24*7 customer support",
    icon: Headset,
    offset: true,
  },
];

function FeatureCard({ title, icon: Icon, offset }) {
  return (
    <div
      className={`
        group
        rounded-2xl
        border
        border-slate-100
        bg-white
        p-6
        text-center
        transition-all
        duration-300
        hover:-translate-y-1

        dark:border-slate-700/70
        dark:bg-slate-900
        dark:hover:border-slate-600

        ${offset ? "md:mt-8" : ""}
      `}
      style={{
        boxShadow: "0 1px 2px rgba(16,30,59,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 20px 40px -18px rgba(16,30,59,0.20)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(16,30,59,0.05)";
      }}
    >
      {/* Icon */}

      <div
        className="
          mx-auto
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl

          bg-[#F5F7FA]

          transition-all
          duration-300

          dark:bg-slate-800
          dark:group-hover:bg-emerald-500/10
        "
      >
        <Icon
          size={22}
          strokeWidth={1.75}
          color={GREEN}
          className="
            transition-transform
            duration-300
            group-hover:scale-110
          "
        />
      </div>

      {/* Title */}

      <h5
        className="
          text-[14px]
          font-semibold
          leading-snug

          text-[#101E3B]

          dark:text-slate-100
        "
      >
        {title}
      </h5>
    </div>
  );
}

export default function WhyChooseDigitalAlife() {
  return (
    <section
      className="
        bg-white
        px-6
        py-20

        transition-colors
        duration-300

        dark:bg-[#020817]
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-6xl
          grid-cols-1
          items-center
          gap-14
          lg:grid-cols-12
        "
      >
        {/* =================================================
            LEFT CONTENT
        ================================================= */}

        <div className="lg:col-span-5">
          <h2
            className="
              mb-5
              !text-5xl
              font-bold
              tracking-tight

              text-[#101E3B]

              dark:text-slate-100

              md:text-4xl
            "
          >
            Why{" "}
            <span className="text-[#1E9C6B] dark:text-emerald-400">choose</span>{" "}
            Digital Alife?
          </h2>

          <h4
            className="
              mb-5
              text-lg
              font-semibold
              leading-relaxed

              text-[#101E3B]

              dark:text-slate-200
            "
          >
            Digital Alife not only works as a web developer and digital marketer
            for you, but it also acts as your lifelong partner.
          </h4>

          <p
            className="
              text-[15px]
              leading-relaxed

              text-slate-500

              dark:text-slate-400
            "
          >
            Digital Alife is the synonym of quality and excellence. We have made
            an extensive partnerships with renowned web-app development and
            digital marketing agencies in India. Our services are exclusive to
            empower you with the most advanced technologies. We work until our
            clients do not get complete satisfaction. Let us bring endless
            growth into your business with our website and application design
            and development services.
          </p>
        </div>

        {/* =================================================
            FEATURE CARDS
        ================================================= */}

        <div className="lg:col-span-7">
          <div
            className="
              grid
              grid-cols-2
              gap-5

              sm:grid-cols-3
            "
          >
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
