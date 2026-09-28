import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";

import {
  FaLinkedinIn,
  FaTwitter,
  FaInstagram,
  FaArrowRight,
  FaUsers,
  FaCode,
  FaPalette,
  FaBullhorn,
  FaMobileAlt,
  FaLaptopCode,
  FaChartLine,
  FaComments,
  FaLightbulb,
  FaRocket,
  FaCheckCircle,
  FaCrown,
  FaEnvelope,
  FaUserTie,
  FaHandshake,
  FaTimes,
  FaQuoteLeft,
  FaMapMarkerAlt,
  FaBriefcase,
} from "react-icons/fa";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_SITE_API_URL ||
  (import.meta.env.DEV && typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:7000`
    : "")
).replace(/\/+$/, "");

/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(value) {
  const image = String(value || "").trim();

  if (!image) {
    return "";
  }

  // Backend already returned complete URL
  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  // Backend returned /uploads/ceo.jpeg
  if (image.startsWith("/")) {
    return `${API_URL}${image}`;
  }

  // Backend returned uploads/ceo.jpeg
  return `${API_URL}/${image}`;
}

/* =========================================================
   MEMBER NORMALIZER
========================================================= */

function normalizeMember(member) {
  const designation = String(member?.designation || "Team Member").trim();

  const group =
    member?.group === "leadership" || /ceo|founder|director/i.test(designation)
      ? "leadership"
      : "team";

  const email = String(member?.email || "").trim();

  return {
    ...member,

    id: member?.id,

    name: String(member?.name || "Team Member").trim(),

    designation,

    department: String(member?.department || "Team").trim(),

    /*
     * IMPORTANT:
     * Image comes directly from backend member.image
     */
    image: getImageUrl(member?.image),

    description: String(member?.description || "").trim(),

    quote: String(member?.quote || "").trim(),

    bio: String(member?.bio || "").trim(),

    experience: String(member?.experience || "").trim(),

    location: String(member?.location || "").trim(),

    linkedin: String(member?.linkedin || "#").trim(),

    twitter: String(member?.twitter || "#").trim(),

    instagram: String(
      member?.instagram || "https://www.instagram.com/digitalalife",
    ).trim(),

    email: email
      ? email.startsWith("mailto:")
        ? email
        : `mailto:${email}`
      : "#",

    group,
  };
}

/* =========================================================
   ICON
========================================================= */

function getMemberIcon(designation = "") {
  const value = designation.toLowerCase();

  if (/ceo|founder|director/.test(value)) {
    return FaCrown;
  }

  if (/ui|ux|design/.test(value)) {
    return FaPalette;
  }

  if (/marketing|brand|social/.test(value)) {
    return FaBullhorn;
  }

  if (/mobile|app|android|ios/.test(value)) {
    return FaMobileAlt;
  }

  if (/developer|development|engineer|mern|full stack|software/.test(value)) {
    return FaCode;
  }

  if (/seo|growth/.test(value)) {
    return FaChartLine;
  }

  if (/manager|management|project/.test(value)) {
    return FaUsers;
  }

  return FaUsers;
}

/* =========================================================
   FALLBACK TEAM
   Only used when API is unavailable.
========================================================= */

const fallbackTeam = [
  {
    id: "fallback-ceo",
    name: "Ashish Patel",
    designation: "CEO & Founder",
    department: "Leadership",
    image: "/uploads/ceo.jpeg",
    description:
      "Leading our team with a clear vision to build modern digital solutions that help businesses grow.",
    quote:
      "I lead our team with a clear vision to build modern digital products that truly help our clients grow.",
    bio: "Ashish drives the company's overall vision, technology strategy and product direction.",
    experience: "8+ Years",
    location: "Delhi, India",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "leadership",
  },

  {
    id: "fallback-director",
    name: "Rahul Sharma",
    designation: "Co-Founder & Director",
    department: "Management",
    image: "/images/team/director.jpg",
    description:
      "I focus on strategy and relationships, making sure every engagement delivers real value.",
    quote:
      "I focus on strategy and relationships, making sure every engagement delivers real value.",
    bio: "Rahul owns business strategy, operations and client relationships.",
    experience: "7+ Years",
    location: "Delhi, India",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "leadership",
  },

  {
    id: "fallback-uiux",
    name: "Vansh Gupta",
    designation: "UI/UX Designer",
    department: "Design",
    image: "/images/team/uiux.jpg",
    description:
      "I love turning complex problems into interfaces that feel effortless.",
    quote:
      "I love turning complex problems into interfaces that feel effortless.",
    bio: "Vansh designs clean, user-friendly interfaces for modern digital products.",
    experience: "4+ Years",
    location: "Remote",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "team",
  },

  {
    id: "fallback-marketing",
    name: "Rahul Verma",
    designation: "Digital Marketing Specialist",
    department: "Marketing",
    image: "/images/team/marketing.jpg",
    description:
      "I build campaigns that connect the right audience with the right product.",
    quote:
      "I build campaigns that connect the right audience with the right product.",
    bio: "Rahul builds marketing strategies that improve visibility and growth.",
    experience: "5+ Years",
    location: "Delhi, India",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "team",
  },

  {
    id: "fallback-app",
    name: "Aman Singh",
    designation: "Mobile App Developer",
    department: "Development",
    image: "/images/team/app.jpg",
    description: "I build mobile apps that feel fast, native and easy to use.",
    quote: "I build mobile apps that feel fast, native and easy to use.",
    bio: "Aman develops modern mobile applications focused on performance and usability.",
    experience: "4+ Years",
    location: "Remote",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "team",
  },

  {
    id: "fallback-dev",
    name: "Rohit Kumar",
    designation: "MERN Full Stack Developer",
    department: "Development",
    image: "/images/team/developer.jpg",
    description: "I turn ideas into scalable, reliable web applications.",
    quote: "I turn ideas into scalable, reliable web applications.",
    bio: "Rohit builds scalable web applications end-to-end using modern full-stack technologies.",
    experience: "5+ Years",
    location: "Delhi, India",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "team",
  },

  {
    id: "fallback-manager",
    name: "Vikas Yadav",
    designation: "Project Manager",
    department: "Management",
    image: "/images/team/manager.jpg",
    description: "I keep every project moving — on time, on budget, on track.",
    quote: "I keep every project moving — on time, on budget, on track.",
    bio: "Vikas coordinates projects, teams and communication.",
    experience: "6+ Years",
    location: "Delhi, India",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "team",
  },

  {
    id: "fallback-seo",
    name: "Neeraj Singh",
    designation: "SEO Specialist",
    department: "Marketing",
    image: "/images/team/seo.jpg",
    description: "I help businesses get found by the people who need them.",
    quote: "I help businesses get found by the people who need them.",
    bio: "Neeraj helps businesses improve search visibility and organic growth.",
    experience: "3+ Years",
    location: "Remote",
    linkedin: "#",
    twitter: "#",
    email: "mailto:hello@example.com",
    group: "team",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function OurTeam() {
  const [team, setTeam] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teamLoadError, setTeamLoadError] = useState("");

  /* =======================================================
     LOAD TEAM FROM BACKEND
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function loadTeam() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/team`, {
          headers: {
            Accept: "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok || !result?.success || !Array.isArray(result?.data)) {
          throw new Error(result?.message || "Unable to load team.");
        }

        const members = result.data.map(normalizeMember);

        if (!active) return;

        /*
         * Backend data is the primary source.
         */
        setTeam(members);

        setTeamLoadError("");
      } catch (error) {
        console.error("Team API error:", error);

        if (!active) return;

        /*
         * Fallback only if backend unavailable.
         */
        setTeam(fallbackTeam.map(normalizeMember));

        setTeamLoadError(
          "Live team data is unavailable. Showing default information.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTeam();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     LEADERSHIP
  ======================================================= */

  const leadership = useMemo(() => {
    return team.filter((member) => member.group === "leadership");
  }, [team]);

  /* =======================================================
     TEAM MEMBERS
  ======================================================= */

  const members = useMemo(() => {
    return team.filter((member) => member.group !== "leadership");
  }, [team]);

  /* =======================================================
     CEO / HERO
  ======================================================= */

  const heroPerson = useMemo(() => {
    /*
     * First preference:
     * backend CEO / Founder record
     */
    const ceo = team.find((member) =>
      /ceo/i.test(String(member.designation || "")),
    );

    if (ceo) {
      return ceo;
    }

    /*
     * Second preference:
     * Founder / Director
     */
    const leader = team.find((member) =>
      /founder|director/i.test(String(member.designation || "")),
    );

    return leader || team[0] || normalizeMember(fallbackTeam[0]);
  }, [team]);

  /* =======================================================
     ESCAPE MODAL
  ======================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedPerson(null);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* =======================================================
     BODY SCROLL
  ======================================================= */

  useEffect(() => {
    document.body.style.overflow = selectedPerson ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPerson]);

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

  function handleImageError(event) {
    const img = event.currentTarget;

    img.style.display = "none";

    const fallback = img.parentElement?.querySelector("[data-image-fallback]");

    if (fallback) {
      fallback.classList.remove("hidden");

      fallback.classList.add("flex");
    }
  }

  /* =======================================================
     CARD
  ======================================================= */

  function TeamCard({ person }) {
    const Icon = person.icon || getMemberIcon(person.designation);

    return (
      <Button
        variant="unstyled"
        type="button"
        onClick={() => setSelectedPerson(person)}
        className="
          group
          relative
          flex
          min-h-[270px]
          w-full
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-100
          bg-white
          p-6
          text-left
          shadow-sm
          transition
          duration-300
          hover:-translate-y-1
          hover:border-[#2E9E6D]/30
          hover:shadow-xl

          dark:border-slate-700
          dark:bg-[#102a43]
          dark:hover:border-[#2E9E6D]/50
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            -right-10
            -top-10
            h-32
            w-32
            rounded-full
            bg-[#2E9E6D]/5
            blur-3xl
            transition
            group-hover:bg-[#2E9E6D]/10
            dark:bg-[#2E9E6D]/10
          "
        />

        <div className="relative flex items-center gap-4">
          <div
            className="
              relative
              h-16
              w-16
              shrink-0
              overflow-hidden
              rounded-full
              border-2
              border-[#2E9E6D]/30
              bg-[#eaf2ef]
              dark:border-[#72d3aa]/30
              dark:bg-[#173d35]
            "
          >
            {person.image && (
              <img
                src={person.image}
                alt={person.name}
                className="
                  h-full
                  w-full
                  object-cover
                "
                loading="lazy"
                onError={handleImageError}
              />
            )}

            <div
              data-image-fallback
              className={`
                absolute
                inset-0
                items-center
                justify-center
                bg-[#eaf2ef]
                ${person.image ? "hidden" : "flex"}
                dark:bg-[#173d35]
              `}
            >
              <Icon className="text-xl text-[#2E9E6D] dark:text-[#72d3aa]" />
            </div>
          </div>

          <div className="min-w-0">
            <h3
              className="
                truncate
                text-base
                font-black
                text-[#0C2C50]
                dark:text-white
              "
            >
              {person.name}
            </h3>

            <p
              className="
                mt-1
                line-clamp-2
                text-[11px]
                font-bold
                uppercase
                tracking-wider
                text-[#2E9E6D]
                dark:text-[#72d3aa]
              "
            >
              {person.designation}
            </p>
          </div>
        </div>

        <div className="relative mt-5 flex-1">
          <FaQuoteLeft className="mb-2 text-xs text-slate-200 dark:text-slate-600" />

          <p
            className="
              line-clamp-3
              text-[13px]
              leading-6
              text-slate-500
              dark:text-slate-400
            "
          >
            {person.description ||
              person.quote ||
              "Building meaningful digital experiences."}
          </p>
        </div>

        <div
          className="
            relative
            mt-5
            flex
            items-center
            justify-between
            border-t
            border-slate-100
            pt-4
            dark:border-slate-700
          "
        >
          <div className="flex gap-2">
            <a
              href={person.twitter}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-slate-50
                text-slate-500
                hover:bg-[#2E9E6D]
                hover:text-white
                dark:bg-slate-800
                dark:text-slate-400
              "
              aria-label={`${person.name} on X`}
            >
              <FaTwitter size={12} />
            </a>

            <a
              href={
                person.instagram || "https://www.instagram.com/digitalalife"
              }
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-slate-50
                text-slate-500
                hover:bg-[#2E9E6D]
                hover:text-white
                dark:bg-slate-800
                dark:text-slate-400
              "
              aria-label={`${person.name} on Instagram`}
            >
              <FaInstagram size={12} />
            </a>

            <a
              href={person.linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-slate-50
                text-slate-500
                hover:bg-[#2E9E6D]
                hover:text-white
                dark:bg-slate-800
                dark:text-slate-400
              "
              aria-label={`${person.name} on LinkedIn`}
            >
              <FaLinkedinIn size={12} />
            </a>
          </div>

          <span
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-slate-300
              group-hover:text-[#2E9E6D]
              dark:text-slate-600
            "
          >
            View Profile
          </span>
        </div>
      </Button>
    );
  }

  /* =======================================================
     MODAL
  ======================================================= */

  function ProfileModal() {
    if (!selectedPerson) {
      return null;
    }

    const Icon =
      selectedPerson.icon || getMemberIcon(selectedPerson.designation);

    return (
      <div
        className="
          fixed
          inset-0
          z-[100]
          overflow-y-auto
          bg-black/60
          p-3
          backdrop-blur-sm
          sm:p-6
        "
        onClick={() => setSelectedPerson(null)}
      >
        <div className="flex min-h-full items-center justify-center">
          <div
            className="
              relative
              w-full
              max-w-2xl
              overflow-hidden
              rounded-3xl
              bg-white
              shadow-2xl
              dark:bg-[#102a43]
            "
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPerson(null)}
              className="
                absolute
                right-4
                top-4
                z-10
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-white/90
                text-slate-600
                shadow
                hover:bg-[#2E9E6D]
                hover:text-white
                dark:bg-slate-800
                dark:text-slate-300
              "
              aria-label="Close"
            >
              <FaTimes size={13} />
            </button>

            <div
              className="
                relative
                bg-[#f8faf9]
                px-6
                pb-20
                pt-8
                dark:bg-[#0c2439]
              "
            >
              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#2E9E6D]/20
                  bg-white
                  px-3
                  py-1.5
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[.15em]
                  text-[#2E9E6D]
                  dark:bg-[#102a43]
                  dark:text-[#72d3aa]
                "
              >
                {selectedPerson.department}
              </span>
            </div>

            <div
              className="
                relative
                -mt-16
                px-5
                pb-8
                text-center
                sm:px-8
              "
            >
              <div
                className="
                  relative
                  mx-auto
                  h-28
                  w-28
                  overflow-hidden
                  rounded-full
                  border-4
                  border-white
                  bg-[#eaf2ef]
                  shadow-xl
                  dark:border-[#102a43]
                  dark:bg-[#173d35]
                "
              >
                {selectedPerson.image && (
                  <img
                    src={selectedPerson.image}
                    alt={selectedPerson.name}
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                  />
                )}

                <div
                  data-image-fallback
                  className={`
                    absolute
                    inset-0
                    items-center
                    justify-center
                    bg-[#eaf2ef]
                    ${selectedPerson.image ? "hidden" : "flex"}
                    dark:bg-[#173d35]
                  `}
                >
                  <Icon className="text-4xl text-[#2E9E6D] dark:text-[#72d3aa]" />
                </div>
              </div>

              <h3 className="mt-4 text-2xl font-black text-[#0C2C50] dark:text-white">
                {selectedPerson.name}
              </h3>

              <p className="mt-1 text-xs font-bold uppercase tracking-[.15em] text-[#2E9E6D] dark:text-[#72d3aa]">
                {selectedPerson.designation}
              </p>

              {selectedPerson.description && (
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {selectedPerson.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <FaBriefcase size={10} className="text-[#2E9E6D]" />
                  {selectedPerson.experience || "Experience not provided"}
                </span>

                <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <FaMapMarkerAlt size={10} className="text-[#2E9E6D]" />
                  {selectedPerson.location || "Location not provided"}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-[#f8faf9] p-5 text-left dark:border-slate-700 dark:bg-[#0c2439]">
                <FaQuoteLeft className="mb-2 text-sm text-[#2E9E6D]/50" />

                <p className="text-sm italic leading-6 text-slate-600 dark:text-slate-300">
                  {selectedPerson.quote || "No quote provided."}
                </p>
              </div>

              <p className="mt-5 text-left text-sm leading-6 text-slate-500 dark:text-slate-400">
                {selectedPerson.bio || "No biography provided."}
              </p>

              <div className="mt-6 flex flex-col-reverse items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-slate-700 sm:flex-row">
                <div className="flex gap-2">
                  <a
                    href={selectedPerson.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-[#2E9E6D] hover:text-white dark:bg-slate-800"
                  >
                    <FaTwitter size={13} />
                  </a>

                  <a
                    href={selectedPerson.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-[#2E9E6D] hover:text-white dark:bg-slate-800"
                  >
                    <FaInstagram size={13} />
                  </a>

                  <a
                    href={selectedPerson.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-[#2E9E6D] hover:text-white dark:bg-slate-800"
                  >
                    <FaLinkedinIn size={13} />
                  </a>
                </div>

                <a
                  href={selectedPerson.email}
                  className="
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#2E9E6D]
                    px-5
                    py-2.5
                    text-xs
                    font-bold
                    text-white
                    hover:bg-[#27895f]
                    sm:w-auto
                  "
                >
                  <FaEnvelope size={12} />
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     STATIC SECTIONS
  ======================================================= */

  const departments = [
    {
      number: "01",
      icon: FaLaptopCode,
      title: "Web Development",
      text: "Modern websites, web applications and digital platforms.",
    },
    {
      number: "02",
      icon: FaMobileAlt,
      title: "App Development",
      text: "Fast and reliable mobile applications for businesses.",
    },
    {
      number: "03",
      icon: FaPalette,
      title: "UI/UX Design",
      text: "Simple and user-focused digital experiences.",
    },
    {
      number: "04",
      icon: FaChartLine,
      title: "Digital Marketing",
      text: "SEO, social media and growth strategies.",
    },
  ];

  const process = [
    {
      number: "01",
      icon: FaComments,
      title: "Discover",
      text: "We understand your business and goals.",
    },
    {
      number: "02",
      icon: FaLightbulb,
      title: "Plan",
      text: "We create the right strategy for your project.",
    },
    {
      number: "03",
      icon: FaCode,
      title: "Build",
      text: "Our team turns the idea into reality.",
    },
    {
      number: "04",
      icon: FaRocket,
      title: "Grow",
      text: "We continue improving your digital product.",
    },
  ];

  const values = [
    "Clear communication",
    "Quality first",
    "User focused",
    "Honest collaboration",
    "Continuous learning",
    "Long-term relationships",
  ];

  return (
    <main className="overflow-hidden bg-white text-slate-700 dark:bg-[#081a2b] dark:text-slate-300">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-white px-6 py-14 dark:bg-[#081a2b] sm:px-8 lg:px-10 lg:py-20">
        <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#2E9E6D]/10 blur-[100px]" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#65C996]/10 blur-[100px]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_.9fr]">
          {/* LEFT */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2E9E6D]/20 bg-[#2E9E6D]/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[.2em] text-[#2E9E6D] dark:border-[#72d3aa]/20 dark:bg-[#2E9E6D]/10 dark:text-[#72d3aa]">
              <FaUsers />
              Our Team
            </div>

            <h1 className="mx-auto mt-5 max-w-xl text-3xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-4xl lg:mx-0 lg:text-5xl">
              Meet the people
              <span className="text-[#2E9E6D] dark:text-[#72d3aa]">
                {" "}
                behind our work.
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400 lg:mx-0">
              A team of developers, designers and digital specialists working
              together to build better digital experiences.
            </p>

            {/* BACKEND CEO DATA */}
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-100 bg-[#f8faf9] p-5 shadow-sm dark:border-slate-700 dark:bg-[#102a43] lg:mx-0">
              {loading ? (
                <div>
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-3 h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-4 h-12 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#2E9E6D] dark:text-[#72d3aa]">
                      Led By
                    </p>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2E9E6D]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#2E9E6D] dark:text-[#72d3aa]">
                      <FaCrown size={8} />
                      Leadership
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-black text-[#0C2C50] dark:text-white">
                    {heroPerson.name}
                  </h2>

                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {heroPerson.designation}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {heroPerson.description ||
                      heroPerson.bio ||
                      heroPerson.quote}
                  </p>

                  <div className="mt-4 flex justify-center gap-2 lg:justify-start">
                    <a
                      href={heroPerson.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#2E9E6D] hover:bg-[#2E9E6D] hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    >
                      <FaLinkedinIn size={13} />
                    </a>

                    <a
                      href={heroPerson.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#2E9E6D] hover:bg-[#2E9E6D] hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    >
                      <FaTwitter size={13} />
                    </a>

                    <a
                      href={heroPerson.email}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#2E9E6D] hover:bg-[#2E9E6D] hover:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    >
                      <FaEnvelope size={13} />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* =================================================
              HERO IMAGE — BACKEND DATA
          ================================================= */}

          <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:ml-auto">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-[#2E9E6D]/20 via-[#65C996]/10 to-transparent blur-2xl" />

            <div className="absolute inset-3 -rotate-3 rounded-[2.75rem] bg-gradient-to-br from-[#2E9E6D] to-[#65C996]" />

            <div className="relative overflow-hidden rounded-[2.75rem] border border-white/20 bg-[#132646] shadow-[0_30px_80px_rgba(12,44,80,.35)] dark:border-white/5">
              <div className="relative aspect-[4/5] w-full">
                {loading ? (
                  <div className="absolute inset-0 animate-pulse bg-slate-700" />
                ) : (
                  <>
                    {/* Backend CEO image */}
                    {heroPerson.image && (
                      <img
                        src={heroPerson.image}
                        alt={`${heroPerson.name} - ${heroPerson.designation}`}
                        className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 hover:scale-[1.03]"
                        onError={handleImageError}
                      />
                    )}

                    {/* Image fallback */}
                    <div
                      data-image-fallback
                      className={`
                        absolute
                        inset-0
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-[#0C2C50]
                        to-[#132646]
                        ${heroPerson.image ? "hidden" : "flex"}
                      `}
                    >
                      <div className="text-center">
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#65C996]/30 bg-[#2E9E6D]/10">
                          <FaUserTie className="text-5xl text-[#65C996]" />
                        </div>

                        <p className="mt-4 text-sm font-bold text-white">
                          {heroPerson.name}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[.18em] text-[#65C996]">
                          {heroPerson.designation}
                        </p>
                      </div>
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07182a] via-transparent to-transparent" />

                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                      <span className="h-2 w-2 rounded-full bg-[#65C996]" />

                      <span className="text-[9px] font-bold uppercase tracking-wider text-white">
                        Leadership
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 pt-24">
                      <p className="text-xl font-black text-white">
                        {heroPerson.name}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#65C996]" />

                        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#65C996]">
                          {heroPerson.designation}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="absolute -right-2 top-8 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0C1A30]/95 px-3.5 py-2.5 shadow-xl backdrop-blur-xl sm:-right-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2E9E6D]/15">
                <FaCrown size={13} className="text-[#65C996]" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.15em] text-white/40">
                  Role
                </p>

                <p className="text-xs font-black text-white">
                  {heroPerson.designation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="border-y border-slate-100 bg-white px-6 py-12 dark:border-slate-700 dark:bg-[#0b2033] sm:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#2E9E6D] dark:text-[#72d3aa]">
              Behind The Work
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#0C2C50] dark:text-white sm:text-3xl">
              Great work starts with
              <span className="text-[#2E9E6D] dark:text-[#72d3aa]">
                {" "}
                great people.
              </span>
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Our team combines technology, design and marketing to create useful
            and reliable digital solutions.
          </p>
        </div>
      </section>

      {/* =====================================================
          TEAM
      ===================================================== */}

      <section className="relative overflow-hidden bg-white px-6 py-16 dark:bg-[#081a2b] sm:px-8 lg:px-10 lg:py-20">
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#2E9E6D] dark:text-[#72d3aa]">
              Meet The Brains
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#0C2C50] dark:text-white sm:text-3xl">
              The people who make it happen.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Tap any card to see their full profile, experience and how to
              reach them.
            </p>

            {teamLoadError && (
              <p className="mx-auto mt-3 text-xs text-amber-600 dark:text-amber-400">
                {teamLoadError}
              </p>
            )}
          </div>

          {/* Leadership */}
          {leadership.length > 0 && (
            <>
              <h3 className="mt-10 text-center text-lg font-black text-[#0C2C50] dark:text-white">
                Leadership
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {leadership.map((person) => (
                  <TeamCard
                    key={person.id || `${person.name}-${person.designation}`}
                    person={person}
                  />
                ))}
              </div>
            </>
          )}

          {/* Team */}
          {members.length > 0 && (
            <>
              <h3 className="mt-12 text-center text-lg font-black text-[#0C2C50] dark:text-white">
                Our Team
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((person) => (
                  <TeamCard
                    key={person.id || `${person.name}-${person.designation}`}
                    person={person}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <ProfileModal />

      {/* =====================================================
          DEPARTMENTS
      ===================================================== */}

      <section className="bg-white px-6 py-14 dark:bg-[#0b2033] sm:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#2E9E6D] dark:text-[#72d3aa]">
                What We Do
              </p>

              <h2 className="mt-3 text-2xl font-black text-[#0C2C50] dark:text-white sm:text-3xl">
                Different teams.
                <span className="block text-[#2E9E6D] dark:text-[#72d3aa]">
                  One direction.
                </span>
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                Our specialists work together based on what each project needs.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {departments.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.number} className="group flex gap-4 py-5">
                    <span className="text-xs font-black text-[#2E9E6D] dark:text-[#72d3aa]">
                      {item.number}
                    </span>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon
                          size={15}
                          className="text-[#2E9E6D] dark:text-[#72d3aa]"
                        />

                        <h3 className="text-base font-bold text-[#0C2C50] dark:text-white">
                          {item.title}
                        </h3>
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {item.text}
                      </p>
                    </div>

                    <FaArrowRight
                      size={12}
                      className="mt-1 text-[#2E9E6D] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 dark:text-[#72d3aa]"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ===================================================== */}

      <section className="bg-[#f7faf9] px-6 py-14 dark:bg-[#081a2b] sm:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#2E9E6D] dark:text-[#72d3aa]">
              Collaboration
            </p>

            <h2 className="mt-2 text-2xl font-black text-[#0C2C50] dark:text-white sm:text-3xl">
              How we work together.
            </h2>
          </div>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-[#102a43]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2E9E6D] text-white">
                    <Icon size={14} />
                  </div>

                  <p className="mt-4 text-[9px] font-black tracking-widest text-[#2E9E6D] dark:text-[#72d3aa]">
                    STEP {item.number}
                  </p>

                  <h3 className="mt-1 text-lg font-black text-[#0C2C50] dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          CULTURE
      ===================================================== */}

      <section className="border-y border-slate-100 bg-white px-6 py-14 dark:border-slate-700 dark:bg-[#0b2033] sm:px-8 lg:px-10 lg:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#2E9E6D] dark:text-[#72d3aa]">
              Our Culture
            </p>

            <h2 className="mt-3 text-2xl font-black leading-tight text-[#0C2C50] dark:text-white sm:text-3xl">
              The way we work
              <span className="text-[#2E9E6D] dark:text-[#72d3aa]">
                {" "}
                matters.
              </span>
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
              We believe great products come from teams that communicate, take
              ownership and keep learning.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {values.map((value, index) => (
              <div
                key={value}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-[#102a43]"
              >
                <span className="text-[10px] font-black text-[#2E9E6D] dark:text-[#72d3aa]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex-1 text-xs font-bold text-[#0C2C50] dark:text-slate-200">
                  {value}
                </span>

                <FaCheckCircle
                  className="text-[#2E9E6D] dark:text-[#72d3aa]"
                  size={13}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-white px-6 py-12 dark:bg-[#081a2b] sm:px-8 lg:px-10 lg:py-16">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-[#0C2C50] px-6 py-10 text-center sm:px-10">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#2E9E6D]/20 blur-3xl" />

          <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-[#65C996]/10 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#2E9E6D] text-white">
              <FaHandshake size={16} />
            </div>

            <h2 className="mx-auto mt-5 max-w-2xl text-2xl font-black text-white sm:text-3xl">
              Let's create something
              <span className="text-[#65C996]"> great together.</span>
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
              Have an idea or project? Our team is ready to help you turn it
              into a digital solution.
            </p>

            <Link
              to="/contact"
              className="group mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2E9E6D] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#27895f]"
            >
              Talk To Our Team
              <FaArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default OurTeam;
