import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function getIsDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

const services = [
  {
    title: "Web Development",
    icon: "/images/icons/image1.png",
    description:
      "Get our web application development services and enhance your business reach. We ensure to attract your customers while developing your website. Our web development experts closely work with you and develop your expected product.",
  },
  {
    title: "Mobile App Development",
    icon: "/images/icons/image2.png",
    description:
      "Over the years of experience, Digital Alife has amassed great expertise in Mobile App development services. We have ranked our name among the top app development companies. Our services enable you to develop a promising mobile application.",
  },
  {
    title: "Software Development",
    icon: "/images/icons/image3.png",
    description:
      "Design and develop your own software for your business. Custom software has the strength to solve all your business needs. It can automate your business process and unravel all your customers' cutting-edge problems.",
  },
  {
    title: "UI/UX Design",
    icon: "/images/icons/image4.png",
    description:
      "UI and UX are perhaps the most considerable segment of your business website and application. Compromising on it can bring tremendous business downfall. We at ABC can enrich your UI and UX tremendously. We design and develop your UI and UX in an extensively attractive way.",
  },
  {
    title: "Digital Marketing",
    icon: "/images/icons/image5.png",
    description:
      "Digital marketing is a widespread level of services. It encompasses both paid advertising and organic growth. Digital Alife has accomplished all the industry-specific marketers to serve you better. Hence, We have gotten the title of promising digital marketing agency in India.",
  },
  {
    title: "Graphic & Branding",
    icon: "/images/icons/image6.png",
    description:
      "It is necessary to establish a brand for your business growth. Branding is the technique of establishing an impact on your customers. Our team has gained mastery in graphics and branding. Digital Alife will create stunning and eye-catching graphics for your business.",
  },
];

function Services() {
  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const syncTheme = () => setIsDark(getIsDark());

    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", syncTheme);

    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      className={`
        relative
        overflow-hidden
        px-5
        py-20
        sm:px-8
        lg:px-12
        lg:py-28
        ${isDark ? "bg-slate-950" : "bg-[#f7faf9]"}
      `}
    >
      {/* Background Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-20
          h-80
          w-80
          rounded-full
          bg-[#2f9e6f]/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          bottom-20
          h-80
          w-80
          rounded-full
          bg-[#0c2a4e]/10
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl">

        {/* =========================
            INTRO CONTENT
        ========================= */}

        <div
          className="
            mb-16
            grid
            grid-cols-1
            items-center
            justify-between
            gap-8
            lg:grid-cols-12
          "
        >
          <div className="lg:col-span-5">
            <h2
              className="
                !text-3xl
                font-bold
                leading-tight
                tracking-tight
                sm:!text-4xl
                lg:!text-5xl
              "
              style={{
                color: isDark ? "#f8fafc" : "#0c2a4e",
              }}
            >
              Web Design,{" "}
              <span className="text-[#2f9e6f]">
                App Development
              </span>{" "}
              & Digital Marketing Company in India
            </h2>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <p
              className="
                text-sm
                leading-7
                sm:text-base
              "
              style={{
                color: isDark ? "#cbd5e1" : "#111827",
              }}
            >
              Are you searching for the best web application development
              services? Digital Alife is here for you. We will take
              responsibility to design and develop your website and
              application. Our strategies, Skills, and market experience
              will boost your productivity and performance.
            </p>
          </div>
        </div>

        {/* =========================
            SERVICES CARDS
        ========================= */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className={`
                group
                relative
                rounded-2xl
                h-90
                border
                p-12
                m-8
                ml-0
                transition-all
                duration-500
                hover:-translate-y-2
                ${
                  isDark
                    ? "border-slate-700/80 bg-slate-900/80"
                    : "border-slate-200/80 bg-white"
                }
                hover:border-[#2f9e6f]/40
                hover:shadow-[0_25px_60px_rgba(12,42,78,0.12)]
              `}
            >
              {/* Hover Background */}

              <div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-gradient-to-br
                  from-[#2f9e6f]/[0.06]
                  via-transparent
                  to-[#0c2a4e]/[0.04]
                  opacity-0
                  transition-opacity
                  duration-500
                  group-hover:opacity-100
                "
              />

              <div>

                {/* =========================
                    ORIGINAL ICON
                ========================= */}

                <div
                  className="
                    absolute
                    bottom-75
                    mb-7
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#eaf7f1]
                    transition-all
                    duration-500
                  "
                >
                  <img
                    src={service.icon}
                    alt="img"
                    className="
                      w-auto
                      object-contain
                      transition-all
                      duration-500
                    "
                  />
                </div>

                {/* =========================
                    ORIGINAL TITLE
                ========================= */}

                <h3
                  className="
                    !text-2xl
                    font-bold
                    leading-tight
                    tracking-tight
                    transition-colors
                    duration-300
                    group-hover:text-[#2f9e6f]
                    sm:!text-3xl
                  "
                  style={{
                    color: isDark ? "#f8fafc" : "#0c2a4e",
                  }}
                >
                  {service.title}
                </h3>

                {/* =========================
                    ORIGINAL DESCRIPTION
                ========================= */}

                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                  "
                  style={{
                    color: isDark ? "#cbd5e1" : "#111827",
                  }}
                >
                  {service.description}
                </p>
              </div>

              {/* Bottom Hover Line */}

              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[3px]
                  w-0
                  bg-[#2f9e6f]
                  transition-all
                  duration-500
                  group-hover:w-full
                "
              />
            </article>
          ))}
        </div>

        {/* =========================
            ORIGINAL CTA
        ========================= */}

        <div
          className={`
            relative
            mt-16
            overflow-hidden
            rounded-3xl
            border
            px-6
            py-10
            sm:px-10
            lg:px-14
            lg:py-12
            ${
              isDark
                ? "border-slate-700/80 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >
          {/* CTA Glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20
              h-56
              w-56
              rounded-full
              bg-[#2f9e6f]/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-20
              h-56
              w-56
              rounded-full
              bg-[#0c2a4e]/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              items-start
              justify-between
              gap-8
              lg:flex-row
              lg:items-center
            "
          >
            {/* ORIGINAL CTA TITLE */}

            <h3
              className="
                !text-2xl
                font-bold
                leading-tight
                sm:!text-3xl
              "
              style={{
                color: isDark ? "#f8fafc" : "#0c2a4e",
              }}
            >
              Hire Developers For Custom IT Solutions
            </h3>

            {/* ORIGINAL CTA BUTTONS */}

            <div
              className="
                flex
                w-full
                flex-col
                gap-3
                sm:w-auto
                sm:flex-row
              "
            >
              <Link
                to="/contact"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#2f9e6f]
                  px-6
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-[#2f9e6f]/20
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#25885f]
                  hover:shadow-xl
                  active:scale-95
                "
              >
                Get a Free Consultation
              </Link>

              <Link
                to="/contact"
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-[#2f9e6f]
                  bg-transparent
                  px-6
                  text-sm
                  font-bold
                  text-[#2f9e6f]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#2f9e6f]
                  hover:text-white
                  active:scale-95
                "
              >
                Talk To Our Expert
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Services;