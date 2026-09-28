import React, { useEffect, useRef, useState } from "react";
import {
  Clapperboard,
  Code2,
  Globe,
  Megaphone,
  Palette,
  PenTool,
  ShoppingBag,
  Smartphone,
  Users,
  UserCircle,
} from "lucide-react";
import Button from "./Button";

const SITE_API = import.meta.env.VITE_SITE_API_URL || "";

function Navbar() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [demoItems, setDemoItems] = useState([]);
  const [demoLoading, setDemoLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [siteLogo, setSiteLogo] = useState(
    "https://digitalalife.com/includes/brand/logo-dark.png?v=1771691019",
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileCompanyOpen, setIsMobileCompanyOpen] = useState(false);
  const [isMobileDemoOpen, setIsMobileDemoOpen] = useState(false);

  /*
   * Navbar theme button nahi rakhta.
   * Ye sirf current <html data-theme=""> state ko observe karta hai.
   */
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark",
  );

  const servicesRef = useRef(null);
  const aboutRef = useRef(null);
  const demoRef = useRef(null);

  const loadAuthUser = async () => {
    try {
      const response = await fetch(`${SITE_API}/api/auth/session`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await response.json().catch(() => ({}));
      setAuthenticatedUser(response.ok && data.success ? data.user : null);
    } catch {
      setAuthenticatedUser(null);
    }
  };

  useEffect(() => {
    loadAuthUser();
    const handleFocus = () => loadAuthUser();
    const handleStorage = () => loadAuthUser();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const isNormalUser = authenticatedUser?.role === "user";

  useEffect(() => {
    fetch(`${SITE_API}/api/site-settings`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Settings request failed: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        const row = result?.data?.find(
          (item) => item.key_name === "site_config",
        );
        const value = row?.value;
        if (!value || typeof value !== "object" || !value.assets?.logo_dark)
          return;
        const logo = value.assets.logo_dark;
        setSiteLogo(
          /^https?:\/\//i.test(logo)
            ? logo
            : logo.startsWith("/uploads/")
              ? `${SITE_API}${logo}`
              : logo,
        );
      })
      .catch((error) => console.error("Navbar settings failed:", error));
  }, []);

  /* =========================================================
     SERVICES DATA
  ========================================================= */

  const services = [
    {
      name: "Web Development",
      icon: Globe,
      bg: "bg-cyan-100 text-cyan-600",
      darkBg: "bg-cyan-500/10 text-cyan-300",
    },
    {
      name: "Mobile App Development",
      icon: Smartphone,
      bg: "bg-red-100 text-red-600",
      darkBg: "bg-red-500/10 text-red-300",
    },
    {
      name: "e-Commerce",
      icon: ShoppingBag,
      bg: "bg-lime-100 text-lime-600",
      darkBg: "bg-lime-500/10 text-lime-300",
    },
    {
      name: "Digital Marketing",
      icon: Megaphone,
      bg: "bg-indigo-100 text-indigo-600",
      darkBg: "bg-indigo-500/10 text-indigo-300",
    },
    {
      name: "Social Media Handling",
      icon: Users,
      bg: "bg-pink-100 text-pink-600",
      darkBg: "bg-pink-500/10 text-pink-300",
    },
    {
      name: "Video Editing",
      icon: Clapperboard,
      bg: "bg-purple-100 text-purple-600",
      darkBg: "bg-purple-500/10 text-purple-300",
    },
    {
      name: "Custom Software",
      icon: Code2,
      bg: "bg-violet-100 text-violet-600",
      darkBg: "bg-violet-500/10 text-violet-300",
    },
    {
      name: "UI UX Design",
      icon: Palette,
      bg: "bg-rose-100 text-rose-600",
      darkBg: "bg-rose-500/10 text-rose-300",
    },
    {
      name: "Graphics Design",
      icon: PenTool,
      bg: "bg-amber-100 text-amber-600",
      darkBg: "bg-amber-500/10 text-amber-300",
    },
  ];

  /* =========================================================
     SYNC WITH GLOBAL THEME
  ========================================================= */

  useEffect(() => {
    const syncTheme = () => {
      const dark =
        document.documentElement.getAttribute("data-theme") === "dark";

      setIsDark(dark);
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("themechange", syncTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("themechange", syncTheme);
    };
  }, []);

  /* =========================================================
     DEMO MENU DATA
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadDemoItems = async () => {
      try {
        setDemoLoading(true);
        const response = await fetch(`${SITE_API}/api/public/demos`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("Demo list unavailable");

        const data = await response.json();
        const demos = Array.isArray(data?.demos) ? data.demos : [];

        if (!isMounted) return;

        setDemoItems(
          demos
            .filter((demo) => demo && demo.url)
            .slice(0, 8)
            .map((demo, index) => ({
              id: demo.id || `demo-${index}`,
              name: demo.projectName || `Project ${index + 1}`,
              url: demo.url,
              projectType: demo.projectType || "web",
            })),
        );
      } catch (error) {
        if (isMounted) setDemoItems([]);
      } finally {
        if (isMounted) setDemoLoading(false);
      }
    };

    loadDemoItems();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     CLOSE DROPDOWNS OUTSIDE
  ========================================================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }

      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        setIsAboutOpen(false);
      }

      if (demoRef.current && !demoRef.current.contains(event.target)) {
        setIsDemoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* =========================================================
     RESIZE + ESCAPE
  ========================================================= */

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
        setIsContactOpen(false);
        setIsServicesOpen(false);
        setIsAboutOpen(false);
        setIsDemoOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =========================================================
     SCROLL
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     TOGGLE FUNCTIONS
  ========================================================= */

  const toggleAbout = () => {
    setIsAboutOpen((prev) => !prev);
    setIsServicesOpen(false);
  };

  const toggleServices = () => {
    setIsServicesOpen((prev) => !prev);
    setIsAboutOpen(false);
    setIsDemoOpen(false);
  };

  const toggleDemo = () => {
    setIsDemoOpen((prev) => !prev);
    setIsAboutOpen(false);
    setIsServicesOpen(false);
  };

  const closeContact = () => {
    setIsContactOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
    setIsMobileCompanyOpen(false);
    setIsMobileDemoOpen(false);
  };

  /* =========================================================
     THEME CLASSES
  ========================================================= */

  const navShellClass = isDark
    ? `
      bg-slate-950/90
      text-slate-100
      shadow-[0_12px_30px_rgba(2,6,23,0.42)]
      ring-1
      ring-slate-700/60
      backdrop-blur-xl
    `
    : `
      border
      border-white/70
      bg-white/90
      text-[#10284A]
      shadow-[0_8px_24px_rgba(0,0,0,0.08)]
      backdrop-blur-sm
    `;

  const navLinkClass = isDark
    ? "text-slate-200 hover:text-emerald-300"
    : "text-[#334155] hover:text-[#2E9E6D]";

  const mobileMenuClass = isDark
    ? `
      border
      border-slate-700/70
      bg-slate-950/95
      text-slate-100
      shadow-[0_24px_80px_rgba(2,6,23,0.78)]
      backdrop-blur-2xl
    `
    : `
      border
      border-white/70
      bg-white/95
      text-[#10284A]
      shadow-[0_20px_60px_rgba(15,23,42,0.18)]
      backdrop-blur-2xl
    `;

  const mobileMenuItemClass = isDark
    ? "text-slate-100 hover:bg-slate-800/80 hover:text-emerald-300"
    : "text-[#334155] hover:bg-[#EAF6F0] hover:text-[#2E9E6D]";

  const mobileMenuSubItemClass = isDark
    ? "text-slate-300 hover:bg-slate-800 hover:text-emerald-300"
    : "text-slate-500 hover:bg-[#EAF6F0] hover:text-[#2E9E6D]";

  const desktopDropdownClass = isDark
    ? `
      border
      border-slate-700/80
      bg-slate-900/95
      text-slate-100
      shadow-[0_18px_40px_rgba(2,6,23,0.48)]
    `
    : `
      border
      border-slate-100
      bg-white
      text-slate-700
      shadow-[0_15px_40px_rgba(15,23,42,0.12)]
    `;

  const dropdownHoverClass = isDark
    ? "hover:bg-slate-800/80 hover:text-emerald-300"
    : "hover:bg-[#EAF6F0] hover:text-[#2E9E6D]";

  const contactSidebarClass = isDark
    ? `
      border-l
      border-slate-700
      bg-gradient-to-br
      from-slate-950
      via-slate-900
      to-slate-950
      shadow-[-30px_0_90px_rgba(2,6,23,0.55)]
      backdrop-blur-[30px]
    `
    : `
      border-l
      border-white
      bg-gradient-to-br
      from-white
      via-white
      to-emerald-50
      shadow-[-30px_0_90px_rgba(15,23,42,0.20)]
      backdrop-blur-[30px]
    `;

  const contactHeaderClass = isDark
    ? `
      border-b
      border-slate-700/80
      bg-slate-950/70
      text-slate-100
      shadow-[0_8px_30px_rgba(2,6,23,0.22)]
      backdrop-blur-[28px]
    `
    : `
      border-b
      border-white/70
      bg-white/55
      text-[#10284A]
      shadow-[0_8px_30px_rgba(15,23,42,0.04)]
      backdrop-blur-[28px]
    `;

  const contactCardClass = isDark
    ? `
      border
      border-slate-700/80
      bg-slate-900/70
      text-slate-100
      shadow-[0_10px_30px_rgba(2,6,23,0.26)]
    `
    : `
      border
      border-white/80
      bg-white/55
      text-[#10284A]
      shadow-[0_8px_30px_rgba(15,23,42,0.06)]
    `;

  const contactBadgeClass = isDark
    ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
    : "border-emerald-200/70 bg-gradient-to-r from-emerald-50/90 to-white/70 text-[#227955]";

  const contactTextClass = isDark ? "text-slate-300" : "text-slate-500";

  const contactHeadingClass = isDark ? "text-slate-100" : "text-[#10284A]";

  const contactAccentClass = isDark ? "text-emerald-300" : "text-[#2E9E6D]";

  return (
    <>
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className={`
          font-bold
          global-nav
          ${isScrolled ? "sticky" : "absolute"}
          top-0
          z-[900]
          w-full
          px-3
          transition-all
          duration-300
        `}
      >
        <div
          className={`
            global-nav-shell
            relative
            flex
            min-h-[76px]
            w-full
            items-center
            justify-between
            gap-2
            rounded-[24px]
            px-3
            py-2.5
            transition-all
            duration-300
            sm:gap-3
            sm:px-6
            sm:py-3
            ${navShellClass}
          `}
          style={{
            border: isDark
              ? "1px solid rgba(148,163,184,0.10)"
              : "1px solid rgba(255,255,255,0.70)",
            boxShadow: isDark
              ? "0 18px 60px rgba(2,6,23,0.78), 0 0 0 1px rgba(148,163,184,0.08), inset 0 1px 0 rgba(148,163,184,0.08)"
              : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.70)",
          }}
        >
          {/* =================================================
              LOGO
          ================================================= */}

          <div className="flex min-w-0 items-center gap-3" style={{ fontFamily: "'Poppins', sans-serif"}}>
            <div
              className="
                flex
                h-10
                w-[120px]
                items-center
                justify-start
                overflow-hidden
                sm:h-12
                sm:w-[160px]
                lg:w-[200px]
                scale-150
              "
            >
              <img
                // src={!isDark ? siteLogo :"/images/darkLogo.png"}
                src={!isDark ?  "/images/LightLogo.png":"/images/darkLogo.png"}
                alt="Digital Alife"
                className="
                  h-auto
                  max-h-10
                  w-auto
                  max-w-full
                  object-contain
                  sm:max-h-12
                "
              />
            </div>
          </div>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <div className="hidden items-center gap-1 lg:flex xl:gap-2 ">
            {/* HOME */}

            <a
              href="/"
              className={`
                rounded-xl
                px-2
                py-2
                text-sm
                font-medium
                whitespace-nowrap
                transition
                xl:px-3
                font-bold
                ${navLinkClass}
              `}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: "bold"}}
            >
              Home
            </a>

            {/* =================================================
                COMPANY
            ================================================= */}

            <div ref={aboutRef} className="relative">
              <Button
                variant="unstyled"
                type="button"
                onClick={toggleAbout}
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  px-2
                  py-2
                  text-sm
                  font-medium
                  whitespace-nowrap
                  transition
                  xl:px-3
                  ${isAboutOpen ? "text-[#2E9E6D]" : navLinkClass}
                `}
              >
                Company
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform duration-300 ${
                    isAboutOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              {/* COMPANY DROPDOWN */}

              <div
                className={`
                  absolute
                  left-1/2
                  top-full
                  mt-3
                  w-[280px]
                  max-w-[calc(100vw-2rem)]
                  -translate-x-1/2
                  origin-top
                  transition-all
                  duration-300
                  ${
                    isAboutOpen
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }
                `}
              >
                <div
                  className={`
                    absolute
                    -top-1.5
                    left-1/2
                    h-3
                    w-3
                    -translate-x-1/2
                    rotate-45
                    ${isDark ? "bg-slate-900" : "bg-white"}
                  `}
                  
                />

                <div
                  className={`
                    relative
                    overflow-hidden
                    rounded-2xl
                    p-2
                    ${desktopDropdownClass}
                  `}
                  
                >
                  <div className="space-y-0.5" >
                    {/* ABOUT */}

                    <a
                      href="/about"
                      onClick={() => setIsAboutOpen(false)}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-2.5
                        py-2
                        transition-all
                        duration-200
                        ${dropdownHoverClass}
                      `}
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-cyan-100
                          text-cyan-500
                          transition-all
                          group-hover:scale-110
                          dark:bg-cyan-500/10
                          dark:text-cyan-300
                        "
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle cx="12" cy="9" r="2.5" fill="currentColor" />
                          <path
                            d="M7.5 18C8.2 15.5 9.8 14 12 14C14.2 14 15.8 15.5 16.5 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <span
                        className={`
                          flex-1
                          text-[14px]
                          font-medium
                          ${isDark ? "text-slate-200" : "text-slate-600"}
                        `}
                      >
                        About Us
                      </span>

                      <span className="text-[#2E9E6D] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                        →
                      </span>
                    </a>

                    {/* WHY CHOOSE US */}

                    <a
                      href="/why-us"
                      onClick={() => setIsAboutOpen(false)}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-2.5
                        py-2
                        transition-all
                        duration-200
                        ${dropdownHoverClass}
                      `}
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-red-100
                          text-red-500
                          transition-all
                          group-hover:scale-110
                          dark:bg-red-500/10
                          dark:text-red-300
                        "
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M7 9V6C7 4.9 7.9 4 9 4H15C16.1 4 17 4.9 17 6V9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <rect
                            x="4"
                            y="8"
                            width="16"
                            height="11"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M9 13H15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <span
                        className={`
                          flex-1
                          text-[14px]
                          font-medium
                          ${isDark ? "text-slate-200" : "text-slate-600"}
                        `}
                      >
                        Why Choose Us
                      </span>

                      <span className="text-[#2E9E6D] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                        →
                      </span>
                    </a>

                    {/* CAREERS */}

                    <a
                      href="/careers"
                      onClick={() => setIsAboutOpen(false)}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-2.5
                        py-2
                        transition-all
                        duration-200
                        ${dropdownHoverClass}
                      `}
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-green-100
                          text-green-600
                          transition-all
                          group-hover:scale-110
                          dark:bg-green-500/10
                          dark:text-green-300
                        "
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M9 12L11 14L15 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <span
                        className={`
                          flex-1
                          text-[14px]
                          font-medium
                          ${isDark ? "text-slate-200" : "text-slate-600"}
                        `}
                      >
                        Digital Alife Career
                      </span>

                      <span className="text-[#2E9E6D] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                        →
                      </span>
                    </a>

                    {/* DEVELOPMENT PROCESS */}

                    <a
                      href="/development-process"
                      onClick={() => setIsAboutOpen(false)}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-2.5
                        py-2
                        transition-all
                        duration-200
                        ${dropdownHoverClass}
                      `}
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-indigo-100
                          text-[#10284A]
                          transition-all
                          group-hover:scale-110
                          dark:bg-indigo-500/10
                          dark:text-indigo-300
                        "
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 4H18V20H6V4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 8H15M9 12H15M9 16H13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <span
                        className={`
                          flex-1
                          text-[14px]
                          font-medium
                          ${isDark ? "text-slate-200" : "text-slate-600"}
                        `}
                      >
                        Development Process
                      </span>

                      <span className="text-[#2E9E6D] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                        →
                      </span>
                    </a>

                      <a
                      href="/team"
                      onClick={() => setIsAboutOpen(false)}
                      className={`
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-2.5
                        py-2
                        transition-all
                        duration-200
                        ${dropdownHoverClass}
                      `}
                    >
                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          bg-indigo-100
                          text-[#10284A]
                          transition-all
                          group-hover:scale-110
                          dark:bg-indigo-500/10
                          dark:text-indigo-300
                        "
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 4H18V20H6V4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 8H15M9 12H15M9 16H13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>

                      <span
                        className={`
                          flex-1
                          text-[14px]
                          font-medium
                          ${isDark ? "text-slate-200" : "text-slate-600"}
                        `}
                      >
                        OurTeam
                      </span>

                      <span className="text-[#2E9E6D] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                SERVICES
            ================================================= */}

            <div ref={servicesRef} className="relative">
              <Button
                variant="unstyled"
                type="button"
                onClick={toggleServices}
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  px-2
                  py-2
                  text-sm
                  font-medium
                  whitespace-nowrap
                  transition
                  xl:px-3
                  ${isServicesOpen ? "text-[#2E9E6D]" : navLinkClass}
                `}
              >
                Services
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform duration-300 ${
                    isServicesOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <div
                className={`
                  absolute
                  left-1/2
                  top-full
                  mt-3
                  w-[300px]
                  max-w-[calc(100vw-2rem)]
                  -translate-x-1/2
                  origin-top
                  transition-all
                  duration-300
                  ${
                    isServicesOpen
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }
                `}
              >
                <div
                  className={`
                    absolute
                    -top-1.5
                    left-1/2
                    h-3
                    w-3
                    -translate-x-1/2
                    rotate-45
                    ${isDark ? "bg-slate-900" : "bg-white"}
                  `}
                />

                <div
                  className={`
                    relative
                    max-h-[470px]
                    overflow-y-auto
                    rounded-2xl
                    p-2
                    ${desktopDropdownClass}
                  `}
                >
                  {services.map((service) => {
                    const Icon = service.icon;

                    return (
                      <a
                        key={service.name}
                        href={`/services/${service.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        onClick={() => setIsServicesOpen(false)}
                        className={`
                          group
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-2.5
                          py-1
                          transition-all
                          duration-200
                          ${dropdownHoverClass}
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            ${isDark ? service.darkBg : service.bg}
                            transition-all
                            duration-200
                            group-hover:scale-105
                          `}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <span
                          className={`
                            flex-1
                            text-[13px]
                            font-medium
                            ${
                              isDark
                                ? "text-slate-200 group-hover:text-emerald-300"
                                : "text-slate-600 group-hover:text-[#2E9E6D]"
                            }
                          `}
                        >
                          {service.name}
                        </span>

                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="
                            -translate-x-1
                            text-[#2E9E6D]
                            opacity-0
                            transition-all
                            duration-200
                            group-hover:translate-x-0
                            group-hover:opacity-100
                          "
                        >
                          <path
                            d="M5 12H19M13 6L19 12L13 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    );
                  })}

                  <div
                    className={`
                      mt-1.5
                      border-t
                      pt-1.5
                      ${isDark ? "border-slate-700" : "border-slate-100"}
                    `}
                  >
                    <a
                      href="/quote"
                      onClick={() => setIsServicesOpen(false)}
                      className={`
                        flex
                        items-center
                        justify-between
                        rounded-lg
                        px-3
                        py-2
                        text-[12px]
                        font-semibold
                        transition
                        ${
                          isDark
                            ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-white"
                            : "bg-[#EAF6F0] text-[#227955] hover:bg-[#2E9E6D] hover:text-white"
                        }
                      `}
                    >
                      <span>Need a custom solution?</span>

                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M5 12H19M13 6L19 12L13 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* SUBCRIPTION */}

            <a
              href="/subcription"
              className={`
                rounded-xl
                px-2
                py-2
                text-sm
                font-medium
                whitespace-nowrap
                transition
                xl:px-3
                ${navLinkClass}
              `}
              style={{ fontFamily: "'Poppins', sans-serif", fontWeight: "bold"}}
            >
              Subcription
            </a>

            {/* DEMO */}

            <div ref={demoRef} className="relative">
              <Button
                variant="unstyled"
                type="button"
                onClick={toggleDemo}
                className={`
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  px-2
                  py-2
                  text-sm
                  font-medium
                  whitespace-nowrap
                  transition
                  xl:px-3
                  ${isDemoOpen ? "text-[#2E9E6D]" : navLinkClass}
                `}
              >
                Demo
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform duration-300 ${isDemoOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <div
                className={`
                  absolute
                  left-1/2
                  top-full
                  mt-3
                  w-[320px]
                  max-w-[calc(100vw-2rem)]
                  -translate-x-1/2
                  origin-top
                  transition-all
                  duration-300
                  ${
                    isDemoOpen
                      ? "visible translate-y-0 scale-100 opacity-100"
                      : "invisible pointer-events-none -translate-y-2 scale-95 opacity-0"
                  }
                `}
              >
                <div
                  className={`
                    absolute
                    -top-1.5
                    left-1/2
                    h-3
                    w-3
                    -translate-x-1/2
                    rotate-45
                    ${isDark ? "bg-slate-900" : "bg-white"}
                  `}
                />

                <div
                  className={`
                    relative
                    max-h-[430px]
                    overflow-hidden
                    rounded-2xl
                    border
                    p-2
                    ${desktopDropdownClass}
                  `}
                >
                  <div className="space-y-1.5">
                    <a
                      href="/demo"
                      onClick={() => setIsDemoOpen(false)}
                      className={`
                        block
                        rounded-xl
                        border
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        ${
                          isDark
                            ? "border-slate-700 bg-slate-800/80 text-emerald-300"
                            : "border-[#dfeee7] bg-[#EAF6F0] text-[#227955]"
                        }
                      `}
                    >
                      View all demos
                    </a>

                    {demoLoading ? (
                      <div
                        className={`rounded-xl px-3 py-2 text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}
                      >
                        Loading demos...
                      </div>
                    ) : demoItems.length === 0 ? (
                      <div
                        className={`rounded-xl px-3 py-2 text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}
                      >
                        No live demos available right now.
                      </div>
                    ) : (
                      demoItems.map((demo) => (
                        <a
                          key={demo.id}
                          href={`/demo?project=${encodeURIComponent(demo.id)}`}
                          onClick={() => setIsDemoOpen(false)}
                          className={`
                            group
                            flex
                            items-center
                            justify-between
                            gap-3
                            rounded-xl
                            px-2.5
                            py-2
                            transition
                            ${dropdownHoverClass}
                          `}
                        >
                          <div className="min-w-0">
                            <p
                              className={`truncate text-[13px] font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}
                            >
                              {demo.name}
                            </p>
                            <p
                              className={`text-[10px] uppercase tracking-[0.12em] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                            >
                              {demo.projectType}
                            </p>
                          </div>

                          <span className="text-[#2E9E6D] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                            →
                          </span>
                        </a>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* LEAD APPLICATION */}

            <a
              href="/quote"
              className="
                rounded-xl
                bg-[#2E9E6D]
                px-3
                py-2.5
                text-sm
                font-semibold
                text-white
                whitespace-nowrap
                shadow-[0_5px_12px_rgba(46,158,109,0.25)]
                transition
                hover:bg-[#227955]
                xl:px-5
              "
            >
              Lead Application
            </a>
          </div>

          {/* =================================================
              MOBILE RIGHT
              NO THEME BUTTON HERE
          ================================================= */}

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Button
              variant="unstyled"
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                transition-all
                duration-300
                active:scale-95
                sm:h-11
                sm:w-11
                ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-emerald-300 shadow-[0_10px_30px_rgba(2,6,23,0.4)] hover:bg-slate-800"
                    : "border-slate-200 bg-white text-[#10284A] shadow-sm hover:bg-[#F3F6FB]"
                }
              `}
            >
              <span
                className={`
                  flex
                  items-center
                  justify-center
                  transition-transform
                  duration-300
                  ${isMobileMenuOpen ? "rotate-90" : "rotate-0"}
                `}
              >
                {isMobileMenuOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6L18 18M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7H20M4 12H20M4 17H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
            </Button>
          </div>

          {/* =================================================
              DESKTOP RIGHT
              NO THEME BUTTON HERE
          ================================================= */}

          <div className="hidden items-center gap-1.5 lg:flex xl:gap-2.5">
            {/* ACCOUNT ACTION */}

            {authenticatedUser && isNormalUser ? (
              <a
                href="/profile"
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  whitespace-nowrap
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  xl:px-4
                  ${
                    isDark
                      ? `
                        border-slate-700
                        bg-slate-900
                        text-slate-100
                        hover:bg-slate-800
                        hover:text-emerald-300
                      `
                      : `
                        border-[#cdd8ea]
                        bg-white
                        text-[#10284A]
                        hover:bg-[#F3F6FB]
                        hover:text-[#2E9E6D]
                      `
                  }
                `}
              >
                <UserCircle
                  size={18}
                  className="shrink-0"
                />

                <span>Profile</span>
              </a>
            ) : (
              <a
                href={authenticatedUser ? "/admin/dashboard" : "/login"}
                className={`
                  rounded-xl
                  border
                  px-3
                  py-2
                  text-sm
                  font-medium
                  whitespace-nowrap
                  shadow-sm
                  transition
                  xl:px-4
                  ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                      : "border-[#cdd8ea] bg-white text-[#10284A] hover:bg-[#F3F6FB]"
                  }
                `}
              >
                {authenticatedUser ? "Dashboard" : "Login"}
              </a>
            )}

            {/* REQUEST FREE QUOTE */}

            <a
              href="/contact"
              className={`
                rounded-xl
                px-3
                py-2
                text-sm
                font-semibold
                whitespace-nowrap
                shadow-[0_5px_12px_rgba(16,40,74,0.25)]
                transition
                xl:px-4
                ${
                  isDark
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    : "bg-[#10284A] text-white hover:bg-[#0B1E38]"
                }
              `}
            >
              Request Free Quote
            </a>

            {/* CONTACT */}

            <Button
              variant="unstyled"
              type="button"
              onClick={() => setIsContactOpen(true)}
              className={`
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                shadow-[0_5px_12px_rgba(16,40,74,0.25)]
                transition-all
                duration-200
                hover:scale-105
                ${
                  isDark
                    ? "bg-emerald-500 hover:bg-emerald-400"
                    : "bg-[#10284A] hover:bg-[#0B1E38]"
                }
              `}
              aria-label="Open Contact"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 10.5C21 15.2 17 19 12 19C10.8 19 9.7 18.8 8.7 18.4L4 20L5.6 15.7C4.6 14.2 4 12.4 4 10.5C4 5.8 8 2 12.5 2C17.5 2 21 5.8 21 10.5Z"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <circle cx="8.5" cy="10.5" r="1" fill="white" />
                <circle cx="12.5" cy="10.5" r="1" fill="white" />
                <circle cx="16.5" cy="10.5" r="1" fill="white" />
              </svg>
            </Button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        <div
          className={`
            absolute
            left-0
            right-0
            top-[calc(100%+8px)]
            z-[1000]
            overflow-hidden
            rounded-[24px]
            origin-top
            transition-all
            duration-500
            lg:hidden
            ${mobileMenuClass}
            ${
              isMobileMenuOpen
                ? "visible translate-y-0 scale-100 opacity-100"
                : "invisible pointer-events-none -translate-y-3 scale-95 opacity-0"
            }
          `}
        >
          <div className="max-h-[calc(100vh-110px)] overflow-y-auto p-3">
            {/* HOME */}

            <a
              href="/"
              onClick={closeMobileMenu}
              className={`
                flex
                items-center
                justify-between
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                transition
                ${mobileMenuItemClass}
              `}
            >
              <span>Home</span>
              <span className="text-[#2E9E6D]">→</span>
            </a>

            {/* COMPANY */}

            <div
              className={
                isDark
                  ? "border-t border-slate-700/80"
                  : "border-t border-slate-100"
              }
            >
              <Button
                variant="unstyled"
                type="button"
                onClick={() => setIsMobileCompanyOpen((prev) => !prev)}
                className={`
                  flex
                  w-full
                  items-center
                  !justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isMobileCompanyOpen
                      ? isDark
                        ? "bg-slate-800/80 text-emerald-300"
                        : "bg-slate-50 text-[#2E9E6D]"
                      : mobileMenuItemClass
                  }
                `}
              >
                <span>Company</span>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform duration-300 ${
                    isMobileCompanyOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-[400ms]
                  ${
                    isMobileCompanyOpen
                      ? "max-h-[400px] opacity-100"
                      : "max-h-0 opacity-0"
                  }
                `}
              >
                <div
                  className={`
                    mb-2
                    ml-2
                    space-y-1
                    border-l-2
                    pl-3
                    ${isDark ? "border-slate-700" : "border-[#EAF6F0]"}
                  `}
                >
                  <a
                    href="/about"
                    onClick={closeMobileMenu}
                    className={`
                      block
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      ${mobileMenuSubItemClass}
                    `}
                  >
                    About Us
                  </a>

                  <a
                    href="/why-us"
                    onClick={closeMobileMenu}
                    className={`
                      block
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      ${mobileMenuSubItemClass}
                    `}
                  >
                    Why Choose Us
                  </a>

                  <a
                    href="/careers"
                    onClick={closeMobileMenu}
                    className={`
                      block
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      ${mobileMenuSubItemClass}
                    `}
                  >
                    Digital Alife Career
                  </a>

                  <a
                    href="/development-process"
                    onClick={closeMobileMenu}
                    className={`
                      block
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      ${mobileMenuSubItemClass}
                    `}
                  >
                    Development Process
                  </a>
                </div>
              </div>
            </div>

            {/* SERVICES */}

            <div
              className={
                isDark
                  ? "border-t border-slate-700/80"
                  : "border-t border-slate-100"
              }
            >
              <Button
                variant="unstyled"
                type="button"
                onClick={() => setIsMobileServicesOpen((prev) => !prev)}
                className={`
                  flex
                  w-full
                  items-center
                  !justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isMobileServicesOpen
                      ? isDark
                        ? "bg-slate-800/80 text-emerald-300"
                        : "bg-slate-50 text-[#2E9E6D]"
                      : mobileMenuItemClass
                  }
                `}
              >
                <span>Services</span>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform duration-300 ${
                    isMobileServicesOpen ? "rotate-180" : ""
                  }`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-[400ms]
                  ${
                    isMobileServicesOpen
                      ? "max-h-[650px] opacity-100"
                      : "max-h-0 opacity-0"
                  }
                `}
              >
                <div
                  className={`
                    mb-2
                    ml-2
                    max-h-[430px]
                    overflow-y-auto
                    border-l-2
                    pl-3
                    ${isDark ? "border-slate-700" : "border-[#EAF6F0]"}
                  `}
                >
                  {services.map((service) => {
                    const Icon = service.icon;

                    return (
                      <a
                        key={service.name}
                        href={`/services/${service.name
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        onClick={closeMobileMenu}
                        className={`
                          flex
                          items-center
                          gap-3
                          rounded-lg
                          px-3
                          py-2.5
                          text-sm
                          transition
                          ${
                            isDark
                              ? "text-slate-200 hover:bg-slate-800 hover:text-emerald-300"
                              : "text-slate-600 hover:bg-[#EAF6F0] hover:text-[#2E9E6D]"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex
                            h-7
                            w-7
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            ${isDark ? service.darkBg : service.bg}
                          `}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>

                        <span>{service.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SUBCRIPTION */}

            <a
              href="/subcription"
              onClick={closeMobileMenu}
              className={`
                flex
                items-center
                justify-between
                border-t
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                transition
                ${
                  isDark
                    ? "border-slate-700/80 text-slate-100 hover:bg-slate-800/80 hover:text-emerald-300"
                    : "border-slate-100 text-[#334155] hover:bg-[#EAF6F0] hover:text-[#2E9E6D]"
                }
              `}
            >
              <span>Subcription</span>
              <span className="text-[#2E9E6D]">→</span>
            </a>

            {/* DEMO */}

            <div
              className={
                isDark
                  ? "border-t border-slate-700/80"
                  : "border-t border-slate-100"
              }
            >
              <Button
                variant="unstyled"
                type="button"
                onClick={() => setIsMobileDemoOpen((prev) => !prev)}
                className={`
                  flex
                  w-full
                  items-center
                  !justify-between
                  rounded-xl
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isMobileDemoOpen
                      ? isDark
                        ? "bg-slate-800/80 text-emerald-300"
                        : "bg-slate-50 text-[#2E9E6D]"
                      : mobileMenuItemClass
                  }
                `}
              >
                <span>Demo</span>

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className={`transition-transform duration-300 ${isMobileDemoOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-[400ms]
                  ${
                    isMobileDemoOpen
                      ? "max-h-[420px] opacity-100"
                      : "max-h-0 opacity-0"
                  }
                `}
              >
                <div
                  className={`
                    mb-2
                    ml-2
                    space-y-1
                    border-l-2
                    pl-3
                    ${isDark ? "border-slate-700" : "border-[#EAF6F0]"}
                  `}
                >
                  <a
                    href="/demo"
                    onClick={closeMobileMenu}
                    className={`
                      block
                      rounded-lg
                      px-3
                      py-2.5
                      text-sm
                      ${isDark ? "text-emerald-300" : "text-[#227955]"}
                    `}
                  >
                    View all demos
                  </a>

                  {demoLoading ? (
                    <div
                      className={`px-3 py-2 text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}
                    >
                      Loading demos...
                    </div>
                  ) : demoItems.length === 0 ? (
                    <div
                      className={`px-3 py-2 text-xs ${isDark ? "text-slate-300" : "text-slate-500"}`}
                    >
                      No live demos available
                    </div>
                  ) : (
                    demoItems.map((demo) => (
                      <a
                        key={demo.id}
                        href={`/demo?project=${encodeURIComponent(demo.id)}`}
                        onClick={closeMobileMenu}
                        className={`
                          block
                          rounded-lg
                          px-3
                          py-2.5
                          text-sm
                          ${mobileMenuSubItemClass}
                        `}
                      >
                        {demo.name}
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* ACCOUNT ACTION */}

            {authenticatedUser && isNormalUser ? (
              <a
                href="/profile"
                onClick={closeMobileMenu}
                className={`
                  mt-2
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  ${
                    isDark
                      ? `
                        border-slate-700
                        bg-slate-900
                        text-slate-100
                        hover:bg-slate-800
                        hover:text-emerald-300
                      `
                      : `
                        border-[#cdd8ea]
                        bg-white
                        text-[#10284A]
                        hover:bg-[#F3F6FB]
                        hover:text-[#2E9E6D]
                      `
                  }
                `}
              >
                <UserCircle
                  size={19}
                  className="shrink-0"
                />

                <span>Profile</span>
              </a>
            ) : (
              <a
                href={authenticatedUser ? "/admin/dashboard" : "/login"}
                onClick={closeMobileMenu}
                className={`
                  mt-2
                  flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  shadow-sm
                  transition
                  ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                      : "border-[#cdd8ea] bg-white text-[#10284A] hover:bg-[#F3F6FB]"
                  }
                `}
              >
                {authenticatedUser ? "Dashboard" : "Login"}
              </a>
            )}

            {/* REQUEST FREE QUOTE */}

            <a
              href="/contact"
              onClick={closeMobileMenu}
              className={`
                mt-2
                flex
                items-center
                justify-center
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                shadow-[0_8px_20px_rgba(16,40,74,0.20)]
                transition
                ${
                  isDark
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    : "bg-[#10284A] text-white hover:bg-[#0B1E38]"
                }
              `}
            >
              Request Free Quote
            </a>

            {/* CONTACT */}

            <Button
              variant="unstyled"
              type="button"
              onClick={() => {
                closeMobileMenu();
                setIsContactOpen(true);
              }}
              className={`
                mt-2
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                px-4
                py-3
                text-sm
                font-semibold
                transition
                ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                    : "border-slate-200 bg-white text-[#10284A] hover:bg-slate-50"
                }
              `}
            >
              Contact Us
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 10.5C21 15.2 17 19 12 19C10.8 19 9.7 18.8 8.7 18.4L4 20L5.6 15.7C4.6 14.2 4 12.4 4 10.5C4 5.8 8 2 12.5 2C17.5 2 21 5.8 21 10.5Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />

                <circle cx="8.5" cy="10.5" r="1" fill="currentColor" />

                <circle cx="12.5" cy="10.5" r="1" fill="currentColor" />

                <circle cx="16.5" cy="10.5" r="1" fill="currentColor" />
              </svg>
            </Button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          CONTACT OVERLAY
      ====================================================== */}

      <div
        onClick={closeContact}
        className={`
          fixed
          inset-0
          z-[9998]
          bg-black/40
          backdrop-blur-[2px]
          transition-all
          duration-500
          ${
            isContactOpen
              ? "visible opacity-100"
              : "invisible pointer-events-none opacity-0"
          }
        `}
      />

      {/* =====================================================
          CONTACT SIDEBAR
      ====================================================== */}

      <aside
        className={`
          fixed
          right-0
          top-0
          z-[9999]
          h-screen
          h-[100dvh]
          w-full
          overflow-hidden
          border-l
          transition-all
          duration-500
          ease-[cubic-bezier(.22,1,.36,1)]
          sm:w-[430px]
          ${contactSidebarClass}
          ${
            isContactOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          }
        `}
      >
        {/* =================================================
            AMBIENT BACKGROUND
        ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            -right-28
            -top-28
            h-80
            w-80
            rounded-full
            bg-emerald-400/20
            blur-[90px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -left-32
            top-[28%]
            h-80
            w-80
            rounded-full
            bg-blue-400/10
            blur-[100px]
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -right-16
            h-72
            w-72
            rounded-full
            bg-emerald-300/20
            blur-[100px]
          "
        />

        <div
          className={`
            pointer-events-none
            absolute
            left-[30%]
            top-[10%]
            h-40
            w-40
            rounded-full
            blur-[80px]
            ${isDark ? "bg-emerald-500/10" : "bg-white/80"}
          `}
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(to_right,#10284A_1px,transparent_1px),linear-gradient(to_bottom,#10284A_1px,transparent_1px)]
            [background-size:32px_32px]
          "
        />

        {/* =================================================
            MAIN SCROLL CONTAINER
        ================================================= */}

        <div
          className="
            relative
            h-full
            overflow-y-auto
            scrollbar-thin
            scrollbar-track-transparent
            scrollbar-thumb-slate-300/40
          "
        >
          {/* HEADER */}

          <div
            className={`
              sticky
              top-0
              z-30
              flex
              items-center
              justify-between
              border-b
              px-5
              py-4
              sm:px-6
              sm:py-5
              ${contactHeaderClass}
            `}
          >
            <div className="flex items-center">
              <img
                src={siteLogo}
                alt="Digital Alife"
                className="
                  h-11
                  w-auto
                  object-contain
                  drop-shadow-[0_4px_10px_rgba(15,23,42,0.08)]
                  transition-all
                  duration-300
                  hover:scale-[1.03]
                  sm:h-14
                "
              />
            </div>

            <Button
              variant="unstyled"
              type="button"
              onClick={closeContact}
              aria-label="Close Contact"
              className={`
                group
                relative
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                backdrop-blur-xl
                transition-all
                duration-500
                hover:rotate-90
                hover:scale-105
                active:scale-95
                sm:h-11
                sm:w-11
                ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-emerald-300 hover:border-emerald-400/50 hover:bg-slate-800 hover:text-emerald-200"
                    : "border-white/80 bg-white/60 text-[#10284A] hover:border-emerald-200 hover:bg-emerald-50/80 hover:text-[#2E9E6D]"
                }
              `}
            >
              <span
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/70
                  to-transparent
                  transition-transform
                  duration-700
                  group-hover:translate-x-full
                "
              />

              <svg
                className="relative"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Button>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="relative px-5 py-6 sm:px-6 sm:py-8">
            {/* INTRO */}

            <div className="mb-9">
              <span
                className={`
                  mb-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-1.5
                  text-xs
                  font-bold
                  shadow-[0_6px_20px_rgba(46,158,109,0.08)]
                  backdrop-blur-xl
                  ${contactBadgeClass}
                `}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="
                      absolute
                      inline-flex
                      h-full
                      w-full
                      animate-ping
                      rounded-full
                      bg-emerald-400
                      opacity-60
                    "
                  />

                  <span
                    className="
                      relative
                      inline-flex
                      h-2
                      w-2
                      rounded-full
                      bg-[#2E9E6D]
                      shadow-[0_0_10px_rgba(46,158,109,0.7)]
                    "
                  />
                </span>
                Contact Us
              </span>

              <h2
                className={`
                  text-2xl
                  font-black
                  tracking-[-0.035em]
                  sm:text-3xl
                  ${contactHeadingClass}
                `}
              >
                Get In{" "}
                <span
                  className="
                    bg-gradient-to-r
                    from-[#2E9E6D]
                    to-emerald-500
                    bg-clip-text
                    text-transparent
                  "
                >
                  Touch
                </span>
              </h2>

              <p
                className={`
                  mt-3
                  max-w-[360px]
                  text-[15px]
                  leading-7
                  ${contactTextClass}
                `}
              >
                For any enquiries, or just to say hello, get in touch and
                contact us.
              </p>

              <div className="mt-5 flex items-center gap-2">
                <span
                  className="
                    h-1
                    w-10
                    rounded-full
                    bg-gradient-to-r
                    from-[#2E9E6D]
                    to-emerald-400
                  "
                />

                <span className="h-1 w-2 rounded-full bg-emerald-300" />
                <span className="h-1 w-1 rounded-full bg-blue-300" />
              </div>
            </div>

            {/* PHONE */}

            <div className="mb-8">
              <p
                className={`
                  mb-4
                  text-[13px]
                  font-semibold
                  ${contactTextClass}
                `}
              >
                We're Available 24/7.{" "}
                <span className={contactAccentClass}>Call Now.</span>
              </p>

              <div className="space-y-3">
                {/* PHONE */}

                <a
                  href="tel:9211954915"
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-4
                    overflow-hidden
                    rounded-2xl
                    border
                    p-3.5
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    ${contactCardClass}
                    ${
                      isDark
                        ? "hover:border-emerald-400/40 hover:bg-slate-800/90"
                        : "hover:border-emerald-200/70 hover:bg-white/80"
                    }
                  `}
                >
                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      shadow-[0_8px_20px_rgba(15,23,42,0.08)]
                      transition-all
                      duration-500
                      group-hover:scale-110
                      group-hover:rotate-6
                      ${
                        isDark
                          ? "border-slate-700 bg-gradient-to-br from-emerald-500/20 via-slate-800 to-sky-500/10 text-emerald-200"
                          : "border-white/80 bg-gradient-to-br from-emerald-50 via-white to-blue-50 text-[#10284A]"
                      }
                    `}
                  >
                    <span className="text-lg">☎</span>
                  </div>

                  <div className="relative z-10">
                    <span
                      className="
                        block
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-slate-400
                      "
                    >
                      Phone
                    </span>

                    <span
                      className={`
                        mt-1
                        block
                        text-[15px]
                        font-bold
                        tracking-wide
                        ${isDark ? "text-slate-100" : "text-[#172033]"}
                      `}
                    >
                      9211954915
                    </span>
                  </div>

                  <svg
                    className="
                      relative
                      z-10
                      ml-auto
                      -translate-x-2
                      text-[#2E9E6D]
                      opacity-0
                      transition-all
                      duration-300
                      group-hover:translate-x-0
                      group-hover:opacity-100
                    "
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12H19M13 6L19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                {/* WHATSAPP */}

                <a
                  href="https://wa.me/917678165464"
                  target="_blank"
                  rel="noreferrer"
                  className={`
                    group
                    relative
                    flex
                    items-center
                    gap-4
                    overflow-hidden
                    rounded-2xl
                    border
                    p-3.5
                    backdrop-blur-xl
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    ${
                      isDark
                        ? "border-slate-700/80 bg-slate-900/70 text-slate-100 hover:border-emerald-400/40 hover:bg-slate-800/90"
                        : "border-white/80 bg-white/55 text-[#10284A] hover:border-emerald-200/70 hover:bg-white/80"
                    }
                  `}
                >
                  <div
                    className={`
                      relative
                      z-10
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      transition-all
                      duration-500
                      group-hover:scale-110
                      group-hover:rotate-6
                      ${
                        isDark
                          ? "border-slate-700 bg-gradient-to-br from-emerald-500/20 via-slate-800 to-sky-500/10 text-emerald-200"
                          : "border-white/80 bg-gradient-to-br from-emerald-50 via-white to-blue-50 text-[#10284A]"
                      }
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.198.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.437-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.002 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.478-8.413" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <span
                      className="
                        block
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-slate-400
                      "
                    >
                      WhatsApp
                    </span>

                    <span
                      className={`
                        mt-1
                        block
                        text-[15px]
                        font-bold
                        tracking-wide
                        ${isDark ? "text-slate-100" : "text-[#172033]"}
                      `}
                    >
                      7678165464
                    </span>
                  </div>

                  <svg
                    className="
                      relative
                      z-10
                      ml-auto
                      -translate-x-2
                      text-[#2E9E6D]
                      opacity-0
                      transition-all
                      duration-300
                      group-hover:translate-x-0
                      group-hover:opacity-100
                    "
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12H19M13 6L19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* EMAIL */}

            <div className="mb-8">
              <p
                className={`mb-4 text-[13px] font-semibold ${contactTextClass}`}
              >
                Send Us an Email:
              </p>

              <a
                href="mailto:info@digitalalife.com"
                className={`
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  p-3.5
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
                      : "border-white/80 bg-white/55 text-[#10284A] hover:bg-white/80"
                  }
                `}
              >
                <div
                  className={`
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-emerald-300"
                        : "border-white/80 bg-white text-[#10284A]"
                    }
                  `}
                >
                  <span className="text-lg">✉</span>
                </div>

                <div className="min-w-0">
                  <span
                    className="
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-slate-400
                    "
                  >
                    Email
                  </span>

                  <span
                    className={`
                      mt-1
                      block
                      truncate
                      text-[15px]
                      font-bold
                      ${isDark ? "text-slate-100" : "text-[#172033]"}
                    `}
                  >
                    info@digitalalife.com
                  </span>
                </div>

                <svg
                  className="
                    relative
                    z-10
                    ml-auto
                    -translate-x-2
                    text-blue-500
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:translate-x-0
                    group-hover:opacity-100
                  "
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            {/* SKYPE */}

            <div className="mb-8">
              <p
                className={`mb-4 text-[13px] font-semibold ${contactTextClass}`}
              >
                Chat on Skype:
              </p>

              <a
                href="skype:live:.cid.f9a5dacb1a15fbc4?chat"
                className={`
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  p-3.5
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  ${
                    isDark
                      ? "border-slate-700/80 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
                      : "border-white/80 bg-white/55 text-[#10284A] hover:bg-white/80"
                  }
                `}
              >
                <div
                  className={`
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-sky-300"
                        : "border-white/80 bg-white text-sky-600"
                    }
                  `}
                >
                  <span className="font-black">S</span>
                </div>

                <div className="min-w-0">
                  <span
                    className="
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-slate-400
                    "
                  >
                    Skype
                  </span>

                  <span
                    className={`
                      mt-1
                      block
                      break-all
                      text-[14px]
                      font-bold
                      ${isDark ? "text-slate-100" : "text-[#172033]"}
                    `}
                  >
                    live:.cid.f9a5dacb1a15fbc4
                  </span>
                </div>

                <svg
                  className="
                    relative
                    z-10
                    ml-auto
                    -translate-x-2
                    text-sky-600
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:translate-x-0
                    group-hover:opacity-100
                  "
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 12H19M13 6L19 12L13 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            {/* SOCIAL MEDIA */}

            <div className="mb-9">
              <p
                className={`mb-4 text-[13px] font-semibold ${contactTextClass}`}
              >
                Follow Us
              </p>

              <div className="flex gap-3">
                {/* FACEBOOK */}

                <a
                  href="https://www.facebook.com/digitalalife"
                  aria-label="Facebook"
                  className={`
                    group
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-105
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500 hover:bg-blue-600 hover:text-white"
                        : "border-white/80 bg-white/55 text-[#10284A] hover:border-[#10284A] hover:bg-[#10284A] hover:text-white"
                    }
                  `}
                >
                  <b className="relative text-lg">f</b>
                </a>

                {/* INSTAGRAM */}

                <a
                  href="https://www.instagram.com/digitalalife"
                  aria-label="Instagram"
                  className={`
                    group
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-105
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-pink-300 hover:border-pink-500 hover:bg-pink-500 hover:text-white"
                        : "border-white/80 bg-white/55 text-[#2E9E6D] hover:border-[#2E9E6D] hover:bg-[#2E9E6D] hover:text-white"
                    }
                  `}
                >
                  <b className="relative text-xl">◎</b>
                </a>

                {/* LINKEDIN */}

                <a
                  href="https://www.linkedin.com/company/digitalalife"
                  aria-label="LinkedIn"
                  className={`
                    group
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-105
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-sky-300 hover:border-sky-500 hover:bg-sky-600 hover:text-white"
                        : "border-white/80 bg-white/55 text-[#10284A] hover:border-[#10284A] hover:bg-[#10284A] hover:text-white"
                    }
                  `}
                >
                  <b className="relative text-sm">in</b>
                </a>

                {/* WHATSAPP */}

                <a
                  href="https://wa.me/917678165464"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className={`
                    group
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    transition-all
                    duration-500
                    hover:-translate-y-2
                    hover:scale-105
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-emerald-300 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
                        : "border-white/80 bg-white/55 text-[#2E9E6D] hover:border-[#2E9E6D] hover:bg-[#2E9E6D] hover:text-white"
                    }
                  `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="relative h-6 w-6"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.198.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.511-5.26c.001-5.45 4.437-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.002 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.304-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.478-8.413" />
                  </svg>
                </a>
              </div>
            </div>

            {/* =================================================
                PREMIUM CTA Profile
            ================================================= */}

            <div
              className={`
                group
                relative
                overflow-hidden
                rounded-[28px]
                border
                p-5
                shadow-[0_20px_60px_rgba(46,158,109,0.12)]
                backdrop-blur-2xl
                transition-all
                duration-500
                hover:-translate-y-1
                sm:p-6
                ${
                  isDark
                    ? "border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/50"
                    : "border-white/70 bg-gradient-to-br from-white/75 via-emerald-50/65 to-emerald-100/40"
                }
              `}
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-10
                  -top-10
                  h-36
                  w-36
                  rounded-full
                  bg-emerald-300/25
                  blur-[45px]
                  transition-transform
                  duration-700
                  group-hover:scale-150
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-12
                  -left-10
                  h-32
                  w-32
                  rounded-full
                  bg-blue-300/15
                  blur-[45px]
                "
              />

              <div className="relative">
                <div
                  className={`
                    mb-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    backdrop-blur-xl
                    ${
                      isDark
                        ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                        : "border-emerald-200/70 bg-white/60 text-[#2E9E6D]"
                    }
                  `}
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#2E9E6D]" />
                  Let's Work Together
                </div>

                <h3
                  className={`
                    text-xl
                    font-black
                    tracking-tight
                    ${isDark ? "text-slate-100" : "text-[#10284A]"}
                  `}
                >
                  Need Help?
                </h3>

                <p
                  className={`
                    mt-2
                    max-w-[320px]
                    text-sm
                    leading-6
                    ${isDark ? "text-slate-400" : "text-slate-500"}
                  `}
                >
                  Our team is ready to help you with your enquiry.
                </p>

                <a
                  href="/quote"
                  className="
                    group/cta
                    relative
                    mt-5
                    inline-flex
                    items-center
                    gap-3
                    overflow-hidden
                    rounded-2xl
                    bg-gradient-to-r
                    from-[#2E9E6D]
                    to-[#227955]
                    px-6
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-[0_10px_25px_rgba(46,158,109,0.25)]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:scale-[1.02]
                    active:scale-[0.98]
                  "
                >
                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      -translate-x-full
                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                      transition-transform
                      duration-700
                      group-hover/cta:translate-x-full
                    "
                  />

                  <span className="relative">Lead Application</span>

                  <svg
                    className="
                      relative
                      transition-transform
                      duration-300
                      group-hover/cta:translate-x-1
                    "
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12H19M13 6L19 12L13 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="h-10" />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Navbar;
