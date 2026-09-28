import React, { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const SITE_API = import.meta.env.VITE_SITE_API_URL || "";

function getIsDark() {
  if (typeof document === "undefined") return false;

  return document.documentElement.classList.contains("dark");
}

function portfolioImageUrl(imagePath) {
  const value = String(imagePath || "").trim();

  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `/${value.replace(/^\/+/, "")}`;
}

/* =========================================================
   PROJECT CARD
========================================================= */

function ProjectCard({ project, isDark }) {
  return (
    <div className="group mt-5 w-full">
      {/* IMAGE */}
      <div
        className={`
          relative
          w-full
          overflow-hidden
          rounded-2xl
          ${
            isDark
              ? "bg-slate-900"
              : "bg-white"
          }
        `}
      >
        <a
          href={project.href || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="
            block
            w-full
          "
        >
          {project.image ? (
            <div
              className="
                flex
                h-[90vh]
                w-full
                items-center
                justify-center
                overflow-hidden
              "
            >
              <img
                src={`${SITE_API}${project.image}`}
                alt={project.name || "Project"}
                loading="lazy"
                decoding="async"
                className="
                  h-full
                  w-full
                  object-contain
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.02]
                "
              />
            </div>
          ) : (
            <div
              className={`
                flex
                h-[90vh]
                w-full
                items-center
                justify-center
                ${
                  isDark
                    ? "bg-slate-800 text-slate-500"
                    : "bg-slate-200 text-slate-400"
                }
              `}
            >
              No Image
            </div>
          )}

          {/* HOVER OVERLAY */}
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-[#101E3B]/0
              transition-all
              duration-500
              group-hover:bg-[#101E3B]/55
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                translate-y-4
                items-center
                justify-center
                rounded-full
                bg-white
                text-[#101E3B]
                opacity-0
                shadow-xl
                transition-all
                duration-500
                group-hover:translate-y-0
                group-hover:opacity-100
              "
            >
              <ArrowUpRight size={20} />
            </div>
          </div>
        </a>
      </div>

      {/* PROJECT INFO */}
      <div className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              className="
                !text-xl
                font-bold
                leading-tight
                tracking-tight
                transition-colors
                duration-300
                group-hover:text-[#1E9C6B]
                sm:!text-2xl
              "
              style={{
                color: isDark
                  ? "#f8fafc"
                  : "#101E3B",
              }}
            >
              {project.name}
            </h3>

            <p
              className="
                mt-1.5
                text-sm
                font-medium
              "
              style={{
                color: isDark
                  ? "#cbd5e1"
                  : "#64748b",
              }}
            >
              {project.tag}
            </p>
          </div>

          <a
            href={project.href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex
              h-9
              w-9
              flex-shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              text-[#101E3B]
              transition-all
              duration-300
              hover:-rotate-12
              hover:border-[#1E9C6B]
              hover:bg-[#1E9C6B]
              hover:text-white
              dark:border-slate-700
              dark:text-slate-200
              dark:hover:border-[#1E9C6B]
            "
          >
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DigitalAlifeShowcase() {
  const [isDark, setIsDark] = useState(getIsDark);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     THEME
  ======================================================= */

  useEffect(() => {
    const syncTheme = () => {
      setIsDark(getIsDark());
    };

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

  /* =======================================================
     BACKEND PORTFOLIO
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${SITE_API}/api/portfolio_items`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Portfolio request failed: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data?.tables)) {
          throw new Error(
            "Portfolio response has an invalid format"
          );
        }

        const formattedProjects = data.tables.map((item) => ({
          id: item.id,
          name: item.title,
          tag: item.category,
          href: item.project_link,
          image: portfolioImageUrl(item.image_path),
        }));

        setProjects(formattedProjects);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(
            "Portfolio loading failed:",
            error
          );

          setProjects([]);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, []);

  /* =======================================================
     UI
  ======================================================= */

  return (

    <section
      id="portfolio"
      className={`
        relative
        overflow-hidden
        px-5
        py-20
        transition-colors
        duration-300
        sm:px-8
        lg:px-12
        lg:py-28
        ${
          isDark
            ? "bg-[#020817]"
            : "bg-white "
        }
      `}
    >
      {/* BACKGROUND GLOW */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-20
          h-80
          w-80
          rounded-full
          bg-[#1E9C6B]/10
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
          bg-[#101E3B]/10
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-7xl">
        {/* =================================================
            OUR RECENT WORK HEADER
        ================================================== */}

        <div
          className="
            mb-10
            flex
            flex-col
            justify-between
            gap-6
            md:flex-row
            md:items-end
          "
        >
          <div>
            <h2
              className="
                !text-4xl
                font-bold
                leading-tight
                tracking-tight
                sm:!text-5xl
                lg:!text-6xl
              "
              style={{
                color: isDark
                  ? "#f8fafc"
                  : "#000000",
              }}
            >
              Our Recent{" "}
              <span className="text-[#000000]">
                Work
              </span>
            </h2>
          </div>

          <div>
            <a
              href="/portfolio"
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#101E3B]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#18315C]
                hover:shadow-lg
                dark:bg-[#1E9C6B]
                dark:hover:bg-[#178A5D]
              "
            >
              View All Work

              <ArrowUpRight
                size={17}
                className="
                  transition-transform
                  duration-300
                  group-hover:rotate-45
                "
              />
            </a>
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================== */}

        {loading && (
          <div
            className="
              grid
              grid-cols-1
              gap-x-8
              gap-y-6
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="mt-5"
              >
                <div
                  className={`
                    aspect-[4/3]
                    w-full
                    animate-pulse
                    rounded-2xl
                    ${
                      isDark
                        ? "bg-slate-800"
                        : "bg-slate-200"
                    }
                  `}
                />

                <div className="mt-4 space-y-2">
                  <div
                    className={`
                      h-5
                      w-2/3
                      animate-pulse
                      rounded
                      ${
                        isDark
                          ? "bg-slate-800"
                          : "bg-slate-200"
                      }
                    `}
                  />

                  <div
                    className={`
                      h-3
                      w-1/3
                      animate-pulse
                      rounded
                      ${
                        isDark
                          ? "bg-slate-800"
                          : "bg-slate-200"
                      }
                    `}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =================================================
            BACKEND PROJECTS
        ================================================== */}

        {!loading && projects.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-x-8
              gap-y-6
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id || project.name}
                project={project}
                isDark={isDark}
              />
            ))}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================== */}

        {!loading && projects.length === 0 && (
          <div
            className={`
              rounded-2xl
              border
              px-6
              py-16
              text-center
              ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }
            `}
          >
            <p
              className="
                text-sm
                font-medium
                text-slate-500
                dark:text-slate-400
              "
            >
              No recent work available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}