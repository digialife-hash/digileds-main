import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";

/* =========================
   SOCIAL ICONS
========================= */

const Facebook = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.017 1.792-4.686 4.533-4.686 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.93-1.956 1.885v2.273h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
  </svg>
);

const Instagram = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id="instagramGradient"
        x1="0%"
        y1="100%"
        x2="100%"
        y2="0%"
      >
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#FCB045" />
        <stop offset="50%" stopColor="#FD1D1D" />
        <stop offset="75%" stopColor="#E1306C" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>

    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="5"
      stroke="url(#instagramGradient)"
      strokeWidth="2"
    />

    <circle
      cx="12"
      cy="12"
      r="4"
      stroke="url(#instagramGradient)"
      strokeWidth="2"
    />

    <circle
      cx="17.5"
      cy="6.5"
      r="1.2"
      fill="#E1306C"
    />
  </svg>
);

const Linkedin = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V8.99h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.3ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.56 20.45h3.56V8.99H3.56v11.46ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46C23.21 24 24 23.23 24 22.27V1.73C24 .77 23.21 0 22.23 0Z" />
  </svg>
);

const Twitter = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.963 6.817H1.684l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const Youtube = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M23.498 6.186a3.01 3.01 0 0 0-2.117-2.128C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.381.513A3.01 3.01 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.01 3.01 0 0 0 2.117 2.128c1.876.513 9.381.513 9.381.513s7.505 0 9.381-.513a3.01 3.01 0 0 0 2.117-2.128C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z" />
  </svg>
);

/* =========================
   WHATSAPP ICON
========================= */

const Whatsapp = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M20.52 3.48A11.82 11.82 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.96L.05 24l6.3-1.65a11.9 11.9 0 0 0 5.7 1.45h.01c6.55 0 11.88-5.34 11.88-11.9 0-3.18-1.24-6.16-3.42-8.42ZM12.06 21.8h-.01a9.88 9.88 0 0 1-5.03-1.37l-.36-.21-3.74.98 1-3.65-.23-.38a9.88 9.88 0 0 1-1.51-5.27c0-5.47 4.45-9.92 9.93-9.92 2.65 0 5.14 1.03 7.01 2.9a9.85 9.85 0 0 1 2.91 7.02c0 5.47-4.45 9.9-9.97 9.9Zm5.44-7.42c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53h-.58c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);

/* =========================
   FOOTER LINKS
========================= */

const columns = [
  {
    title: "Company",
    links: [
      ["About Us", "/about"],
      ["Contact Us", "/contact"],
      ["Why Choose Us", "/why-us"],
      ["Career", "/careers"],
      ["Our Team", "/team"],
      ["Development Process", "/development-process"],
      ["Our Portfolio", "/portfolio"],
    ],
  },
  {
    title: "Services",
    links: [
      ["Web Development", "/services/web-development"],
      ["Mobile App Development", "/services/mobile-app-development"],
      ["e-Commerce Development", "/services/e-commerce"],
      ["Digital Marketing", "/services/digital-marketing"],
      ["Custom Software", "/services/custom-software"],
      ["UI/UX Design", "/services/ui-ux-design"],
      ["Graphic & Branding", "/services/graphics-design"],
    ],
  },
  {
    title: "Hire Resource",
    links: [
      ["PHP Developer", "/hire/php-developer"],
      ["React Developer", "/hire/react-developer"],
      ["UI/UX Designer", "/hire/ui-ux-designer"],
      ["Digital Marketing", "/hire/digital-marketing"],
      ["Content Marketing", "/hire/content-marketing"],
      ["Business Development", "/hire/business-development"],
      ["Software Development", "/hire/software-development"],
    ],
  },
];

/* =========================
   SOCIAL LINKS
========================= */

const socials = [
  {
    icon: Facebook,
    label: "Facebook",
    color: "#1877F2",
    url: "https://www.facebook.com/digitalalifeprivatelimitedd",
  },
  {
    icon: Instagram,
    label: "Instagram",
    color: "#E1306C",
    url: "https://www.instagram.com/digital.alife/",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    color: "#0A66C2",
    url: "https://www.linkedin.com/company/digital-alife-private-limited/",
  },
  {
    icon: Twitter,
    label: "Twitter",
    color: "#000000",
    url: "https://twitter.com/",
  },
  {
    icon: Youtube,
    label: "YouTube",
    color: "#FF0000",
    url: "https://youtube.com/",
  },
];

/* =========================
   CONTACT
========================= */

const contacts = [
  {
    icon: Phone,
    label: "Phone Number",
    value: "9211954915",
    href: "tel:+919211954915",
  },
  {
    icon: Whatsapp,
    label: "WhatsApp",
    value: "9818074558",
    href: "https://wa.me/9818074558",
  },
  {
    icon: Mail,
    label: "Email Address",
    value: "digitalalife@gmail.com",
    href: "mailto:digitalalife@gmail.com",
  },
  {
    icon: MapPin,
    label: "Office Location",
    value:
      "Singhal Tower, Labour chowk, Deepak Vihar, Khora Colony, Sector 58, Noida, Uttar Pradesh 201309",
    href:
      "https://www.google.com/maps/search/?api=1&query=Singhal+Tower+Labour+Chowk+Deepak+Vihar+Khora+Colony+Sector+58+Noida+Uttar+Pradesh+201309",
  },
];

/* =========================
   FOOTER
========================= */

export default function Footer() {

  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark",
  );

  return (
    <footer
      className="
        relative
        overflow-hidden
        bg-white
        text-slate-700
        transition-colors
        duration-300
        dark:bg-[#071D35]
        dark:text-white
      "
    >
      {/* =========================
          BACKGROUND EFFECTS
      ========================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-40
          -top-40
          h-[420px]
          w-[420px]
          rounded-full
          bg-[#2C8566]/10
          blur-[100px]
          dark:bg-[#2C8566]/15
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-40
          h-[450px]
          w-[450px]
          rounded-full
          bg-[#2C8566]/8
          blur-[110px]
          dark:bg-[#2C8566]/10
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[500px]
          w-[500px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#0C2C50]/5
          blur-[120px]
          dark:bg-[#0C2C50]/60
        "
      />

      {/* =========================
          GRID
      ========================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-[0.035]
          dark:opacity-[0.025]
        "
        style={{
          backgroundImage:
            "linear-gradient(rgba(12,44,80,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(12,44,80,.25) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      {/* =========================
          MAIN
      ========================= */}

      <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-14 sm:px-8 sm:pt-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.35fr_1fr_1fr_1fr] lg:gap-10">

          {/* =========================
              BRAND
          ========================= */}

          <div>
            <Link to="/" className="flex w-fit items-center  rounded-2xl gap-3">
              <img  src={!isDark ?  "/images/LightLogo.png":"/images/darkLogo.png"} alt="Digital Alife"
                className="
                  h-auto
                  max-h-20
                  w-auto
                  max-w-full
                  object-contain
                "/>

            </Link>

            <p className="mt-6 text-center max-w-sm text-[14px] leading-7 text-slate-500 dark:text-white/55">
              Everyone wants to{" "}
              <span className="font-semibold text-[#2C8566] dark:text-[#4AAE85]">
                live
              </span>{" "}
              on top of the mountain, but all the happiness and growth occurs
              while you're climbing it.
            </p>

            {/* =========================
                SOCIAL
            ========================= */}

            <div className="mt-7">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-white/35">
                Follow Us
              </p>

              <div className="flex gap-2">
                {socials.map(({ icon: Icon, label, url, color }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="
                      group
                      relative
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:scale-105
                      hover:bg-white
                      dark:border-white/10
                      dark:bg-white/[0.035]
                      dark:hover:bg-white/[0.07]
                    "
                  >
                    <span
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        rounded-xl
                        opacity-0
                        blur-md
                        transition-opacity
                        duration-300
                        group-hover:opacity-30
                      "
                      style={{
                        backgroundColor: color,
                      }}
                    />

                    <span
                      className="
                        relative
                        z-10
                        transition-all
                        duration-300
                        group-hover:scale-110
                      "
                      style={{
                        color: color,
                        filter: `drop-shadow(0 0 0px ${color})`,
                      }}
                    >
                      <Icon size={17} />
                    </span>

                    <span
                      className="
                        absolute
                        bottom-0
                        left-1/2
                        h-[2px]
                        w-0
                        -translate-x-1/2
                        rounded-full
                        transition-all
                        duration-300
                        group-hover:w-6
                      "
                      style={{
                        backgroundColor: color,
                        boxShadow: `0 0 8px ${color}`,
                      }}
                    />
                  </a>
                ))}
              </div>
              
            </div>
            <br />
            <Link
              to="/company-profile"
              className="
                group
                flex
                min-h-[74px]
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[#0C2C50]
                px-5
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-black/10
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#2C8566]
                hover:text-white
                dark:bg-white
                dark:text-[#0C2C50]
                dark:hover:bg-[#2C8566]
                dark:hover:text-white
              "
            >
              Company Profile

              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </div>

          {/* =========================
              LINK COLUMNS
          ========================= */}

          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-6 flex items-center gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0C2C50] dark:text-white/80">
                  {col.title}
                </h3>

                <span className="h-px w-8 bg-[#2C8566]/60" />
              </div>

              <ul className="space-y-3">
                {col.links.map(([label, path]) => (
                  <li key={label}>
                    <Link
                      to={path}
                      className="
                        group
                        flex
                        w-fit
                        items-center
                        gap-1.5
                        text-[14px]
                        text-slate-500
                        transition-all
                        duration-200
                        hover:translate-x-1
                        hover:text-[#0C2C50]
                        dark:text-white/50
                        dark:hover:text-white
                      "
                    >
                      <ChevronRight
                        size={13}
                        className="
                          text-[#2C8566]
                          opacity-0
                          transition-all
                          duration-200
                          group-hover:translate-x-0.5
                          group-hover:opacity-100
                        "
                      />

                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* =========================
            CONTACT
        ========================= */}

        <div className="mt-14 border-t border-slate-200 pt-10 dark:border-white/10">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.6fr_auto]">

            {contacts.map(({ icon: Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                target={
                  label === "Office Location" || label === "WhatsApp"
                    ? "_blank"
                    : undefined
                }
                rel={
                  label === "Office Location" || label === "WhatsApp"
                    ? "noopener noreferrer"
                    : undefined
                }
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  p-4
                  transition-all
                  duration-300
                  hover:border-[#2C8566]/30
                  hover:bg-[#f3f9f6]
                  dark:border-white/[0.07]
                  dark:bg-white/[0.025]
                  dark:hover:border-[#2C8566]/30
                  dark:hover:bg-white/[0.045]
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#2C8566]/10
                      text-[#2C8566]
                      transition-colors
                      duration-300
                      group-hover:bg-[#2C8566]
                      group-hover:text-white
                      dark:text-[#4AAE85]
                    "
                  >
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-white/30">
                      {label}
                    </p>

                    <p className="mt-1.5 break-words text-[13px] font-medium leading-5 text-slate-600 dark:text-white/75">
                      {value}
                    </p>
                  </div>
                </div>
              </a>
            ))}

            {/* =========================
                COMPANY PROFILE
            ========================= */}

          </div>
        </div>
      </div>

      {/* =========================
          BOTTOM BAR
      ========================= */}

      <div className="relative border-t border-slate-200 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">

          <p className="text-center text-[12px] text-slate-400 dark:text-white/35 md:text-left">
            © 2026 DigitalAlife Pvt. Ltd. All Rights Reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-slate-400 dark:text-white/35">
            <Link
              to="/refund-policy"
              className="transition-colors hover:text-[#2C8566] dark:hover:text-[#4AAE85]"
            >
              Refund Policy
            </Link>

            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/15" />

            <Link
              to="/terms"
              className="transition-colors hover:text-[#2C8566] dark:hover:text-[#4AAE85]"
            >
              Terms & Conditions
            </Link>

            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/15" />

            <Link
              to="/privacy-policy"
              className="transition-colors hover:text-[#2C8566] dark:hover:text-[#4AAE85]"
            >
              Privacy Policy
            </Link>

            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/15" />

            <Link
              to="/cookie-policy"
              className="transition-colors hover:text-[#2C8566] dark:hover:text-[#4AAE85]"
            >
              Cookie Policy
            </Link>
          </div>

          <div className="hidden items-center gap-1.5 text-[11px] text-slate-400 dark:text-white/25 lg:flex">
            Made with
            <Heart
              size={11}
              className="fill-[#2C8566] text-[#2C8566]"
            />
            by DigitalAlife
          </div>
        </div>
      </div>
    </footer>
  );
}