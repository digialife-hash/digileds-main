import React, { useEffect, useState } from "react";
import {
  Star,
  RefreshCw,
  PiggyBank,
  Sunrise,
  Building2,
  Music,
} from "lucide-react";

function getIsDark() {
  if (typeof document === "undefined") return false;

  return document.documentElement.getAttribute("data-theme") === "dark";
}

const NAVY = "#101E3B";
const GREEN = "#1E9C6B";

const clients = [
  {
    name: "App Store",
    sub: "Review us on",
    icon: Star,
    iconColor: "#1E9C6B",
    textColor: NAVY,
  },
  {
    name: "Clutch Review",
    sub: null,
    icon: RefreshCw,
    iconColor: "#1F2937",
    textColor: "#1F2937",
  },
  {
    name: "Fino Finance",
    sub: null,
    icon: PiggyBank,
    iconColor: "#C2694F",
    textColor: "#C2694F",
  },
  {
    name: "Manu Sunrise",
    sub: null,
    icon: Sunrise,
    iconColor: "#3B4CB8",
    textColor: "#3B4CB8",
  },
  {
    name: "Nuvoko",
    sub: "Interior Designs",
    icon: Building2,
    iconColor: "#9333EA",
    textColor: "#9333EA",
  },
  {
    name: "Rockstar",
    sub: "Music Band",
    icon: Music,
    iconColor: "#F5A524",
    textColor: "#F5A524",
  },
];

function LogoBadge({ name, sub, icon: Icon, iconColor, textColor, isDark }) {
  return (
    <div className="flex shrink-0 items-center gap-3 px-8">
      <Icon
        size={26}
        strokeWidth={1.75}
        color={iconColor}
        className="shrink-0"
      />

      <div className="whitespace-nowrap">
        {sub && (
          <p
            className={`
              mb-0.5
              text-[10px]
              font-medium
              leading-none
              ${isDark ? "text-slate-500" : "text-slate-400"}
            `}
          >
            {sub}
          </p>
        )}

        <p
          className={`
            text-lg
            font-bold
            leading-none
            tracking-tight
            ${isDark ? "text-slate-100" : ""}
          `}
          style={!isDark ? { color: textColor } : undefined}
        >
          {name}
        </p>
      </div>
    </div>
  );
}

export default function OurClients() {
  const track = [...clients, ...clients, ...clients];

  const [isDark, setIsDark] = useState(getIsDark);

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(getIsDark());
    };

    syncTheme();

    /*
     * Theme toggle kisi bhi component se ho sakta hai.
     * data-theme attribute change ko observe karenge.
     */
    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    /*
     * Optional custom event support.
     */
    window.addEventListener("themechange", syncTheme);

    /*
     * Storage support.
     */
    window.addEventListener("storage", syncTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return (
    <section
      className={`
        overflow-hidden
        px-6
        py-16
        transition-colors
        duration-300
        ${isDark ? "bg-[#020817]" : "bg-white"}
      `}
    >
      <style>{`
        @keyframes clientMarquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-33.3333%);
          }
        }

        .client-track {
          animation: clientMarquee 22s linear infinite;
          will-change: transform;
        }

        .client-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .client-track {
            animation: none;
          }
        }
      `}</style>

      <div
        className="
          mx-auto
          flex
          max-w-6xl
          flex-col
          gap-8
          lg:flex-row
          lg:items-center
        "
      >
        {/* =================================================
            SECTION TITLE
        ================================================= */}

        <div className="w-full shrink-0 lg:w-56">
          <h2
            className={`
              !text-4xl
              font-bold
              tracking-tight
              md:text-4xl
              ${isDark ? "text-slate-100" : "text-[#101E3B]"}
            `}
          >
            Our clients
          </h2>

          <span
            className="
              mt-3
              inline-block
              h-1
              w-10
              rounded-full
            "
            style={{
              background: GREEN,
            }}
          />
        </div>

        {/* =================================================
            MARQUEE
        ================================================= */}

        <div
          className="
            relative
            flex-1
            overflow-hidden
          "
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="client-track flex w-max items-center">
            {track.map((client, index) => (
              <LogoBadge
                key={`${client.name}-${index}`}
                {...client}
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
