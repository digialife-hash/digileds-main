import React, { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HeartPulse,
  House,
  KeyRound,
  Lightbulb,
  Loader2,
  MapPin,
  MessageCircle,
  Palmtree,
  Rocket,
  Send,
  Sparkles,
  Target,
  Trophy,
  User,
  UserPlus,
  Users,
  UploadCloud,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   BRAND COLORS Culture
========================================================= */

const GREEN = "#10B981";
const GREEN_LIGHT = "#6EE7B7";
const GREEN_DARK = "#059669";
const GREEN_SOFT = "#ECFDF5";
const DARK = "#0F172A";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_SITE_API_URL || ""
).replace(/\/+$/, "");

/* =========================================================
   CUSTOM SOCIAL ICONS
   These do NOT depend on lucide-react exports.
========================================================= */

function LinkedinIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M5.04 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1 .04-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.84v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.84 1.25-1.84 2.55v4.91h-4v-11Z" />
    </svg>
  );
}

function GithubIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .7a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22v3.3c0 .32.22.69.83.57A12 12 0 0 0 12 .7Z" />
    </svg>
  );
}

/* =========================================================
   DATA
========================================================= */

const whyJoinUs = [
  {
    icon: Rocket,
    title: "Career Growth",
    text: "Work on high-impact client projects that stretch your capabilities and build real expertise.",
  },
  {
    icon: Code2,
    title: "Latest Technologies",
    text: "Build with React, Node.js, Laravel, modern cloud platforms, and automated AI pipelines.",
  },
  {
    icon: House,
    title: "Flexible Environment",
    text: "Enjoy hybrid and flexible remote settings designed around outcomes instead of clock-ins.",
  },
  {
    icon: GraduationCap,
    title: "Learning Opportunities",
    text: "Receive reimbursement for certified professional courses, certifications, and developer programs.",
  },
  {
    icon: Users,
    title: "Collaborative Culture",
    text: "Collaborate with supportive developers, designers, leads, and sales teams in a flat structure.",
  },
  {
    icon: Trophy,
    title: "Performance Rewards",
    text: "Unlock competitive incentives, regular appraisal cycles, and milestone project bonuses.",
  },
];

const coreCulture = [
  {
    icon: Lightbulb,
    title: "Innovation",
    text: "Always challenge the status quo and look for modern methods of doing tasks.",
  },
  {
    icon: Target,
    title: "Customer Success",
    text: "Our clients' success is the ultimate scorecard of our software quality.",
  },
  {
    icon: Users,
    title: "Teamwork",
    text: "Great systems are constructed by collaborative coordination, not single efforts.",
  },
  {
    icon: KeyRound,
    title: "Ownership",
    text: "Take responsibility for your commits, releases, tasks, and client relationships.",
  },
  {
    icon: MessageCircle,
    title: "Transparency",
    text: "We encourage honest reporting, clear updates, and open conversations.",
  },
  {
    icon: GraduationCap,
    title: "Continuous Learning",
    text: "Technologies evolve rapidly; we stay ahead by acquiring new skills daily.",
  },
];

const selectionProcess = [
  {
    number: "01",
    icon: FileText,
    title: "Application Submitted",
    text: "Submit your profile details and updated resume through our portal.",
  },
  {
    number: "02",
    icon: Users,
    title: "Resume Screening",
    text: "Our HR team evaluates technical capabilities and experience match.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "HR Discussion",
    text: "A quick introductory call to discuss alignment, location, and salary goals.",
  },
  {
    number: "04",
    icon: Code2,
    title: "Technical Interview",
    text: "Deep dive technical review or assignments assessing hands-on code skills.",
  },
  {
    number: "05",
    icon: Target,
    title: "Final Interview",
    text: "Executive round to align on project scopes, culture fit, and responsibilities.",
  },
  {
    number: "06",
    icon: Rocket,
    title: "Offer & Onboarding",
    text: "Welcome aboard! Receive your offer letter and kickstart onboarding.",
  },
];

const perks = [
  { icon: Clock3, title: "Flexible Working Hours" },
  { icon: Banknote, title: "Performance Bonus" },
  { icon: Palmtree, title: "Paid Holidays & Leave" },
  { icon: GraduationCap, title: "Learning & Certifications" },
  { icon: Rocket, title: "Career Growth Tracks" },
  { icon: Building2, title: "Modern Noida Workspace" },
  { icon: Users, title: "Team Outings & Dinner" },
  { icon: Trophy, title: "Employee Recognition" },
  { icon: HeartPulse, title: "Health & Wellness Perks" },
  { icon: UserPlus, title: "Referral Bonus Program" },
];

const faqs = [
  {
    question: "How does the hiring process work?",
    answer:
      "After you submit your application, our team reviews your profile and contacts shortlisted candidates for the next round.",
  },
  {
    question: "Can I apply for more than one position?",
    answer:
      "Yes. You can submit applications for suitable openings. Make sure your skills and experience match the selected position.",
  },
  {
    question: "Are there any hidden charges or bonds?",
    answer:
      "No. Candidates should never pay recruitment charges to apply for a role through our careers portal.",
  },
  {
    question: "Can I reschedule my interview?",
    answer:
      "Yes. Our recruitment team can coordinate a suitable time if you are unable to attend the original slot.",
  },
  {
    question: "Do salary packages include benefits?",
    answer:
      "Compensation and applicable benefits depend on the role, experience level, and final offer.",
  },
  {
    question: "Can freshers apply?",
    answer:
      "Yes, where a position is marked as suitable for entry-level candidates. Review the requirements of the specific opening before applying.",
  },
];

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto mb-12 w-full max-w-3xl text-center sm:mb-14">
     

      <h2 className="break-words text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-[42px]">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 break-words text-sm font-medium leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({ label, required = false, children, error = "", hint = "" }) {
  return (
    <div className="w-full min-w-0">
      <label className="mb-2 block break-words text-sm font-bold text-slate-700 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-emerald-500">*</span>}

        {hint && (
          <span className="ml-1 font-medium text-slate-400">({hint})</span>
        )}
      </label>

      {children}

      {error && (
        <div
          className="mt-1.5 flex min-w-0 items-start gap-1.5 text-xs font-semibold leading-5 text-red-600"
          role="alert"
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INPUT STYLES
========================================================= */

const inputClasses = `
  box-border block w-full min-w-0 max-w-full
  rounded-xl border px-4 py-3.5
  border-slate-200 bg-slate-50/70
  text-sm text-slate-900
  placeholder:text-slate-400
  outline-none
  transition-all duration-200
  focus:border-emerald-500
  focus:bg-white
  focus:ring-4 focus:ring-emerald-500/10
  dark:border-slate-700
  dark:bg-slate-800/70
  dark:text-slate-100
  dark:placeholder:text-slate-500
`;

const errorInputClasses = `
  border-red-400
  bg-red-50/40
  focus:border-red-500
  focus:ring-red-500/10
`;

/* =========================================================
   HERO
========================================================= */

function Hero() {
  return (
    <section
      className="relative min-h-[680px] overflow-hidden sm:min-h-[740px] lg:min-h-[760px]"
      style={{
        backgroundImage: "url('/uploads/img2.png')",
        backgroundSize: "50%",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right center",
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: `${GREEN_LIGHT}30`,
        }}
      />

      <div
        className="pointer-events-none absolute -bottom-28 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{
          background: `${GREEN}25`,
        }}
      />

      {/* Extra green glow behind glass */}
      <div
        className="pointer-events-none absolute left-[25%] top-[35%] hidden h-72 w-72 rounded-full blur-[120px] lg:block"
        style={{
          background: `${GREEN_LIGHT}12`,
        }}
      />

      {/* Dot pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.9) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      {/* Dark overlay for better readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#071a16]/55 via-[#071a16]/25 to-transparent" />

      {/* Main content */}
      <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 py-20 sm:min-h-[740px] sm:px-6 sm:py-24 lg:min-h-[760px] lg:px-8">
        <div className="w-full lg:w-[58%]">
          {/* Premium Glass Card */}
          <div
            className="
              relative overflow-hidden
              rounded-3xl
              border border-white/20
              bg-white/[0.075]
              p-6
              shadow-[0_30px_90px_rgba(0,0,0,0.35)]
              backdrop-blur-2xl
              sm:p-8
              md:p-10
              lg:p-12
            "
          >
            {/* Glass top shine */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

            {/* Glass left glow */}
            <div
              className="pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full blur-3xl"
              style={{
                background: `${GREEN_LIGHT}18`,
              }}
            />

            {/* Glass corner glow */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full blur-3xl"
              style={{
                background: `${GREEN}18`,
              }}
            />

            {/* Inner glass border */}
            <div className="pointer-events-none absolute inset-[1px] rounded-[23px] border border-white/[0.06]" />

            <div className="relative z-10">
              {/* Breadcrumb */}
              <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 shadow-inner shadow-white/[0.04] backdrop-blur-xl sm:mb-7">
                <span className="text-xs text-white/65 sm:text-sm">
                  Home
                </span>

                <ChevronRight
                  size={13}
                  className="shrink-0 text-white/35"
                />

                <span
                  className="text-xs font-semibold sm:text-sm"
                  style={{ color: GREEN_LIGHT }}
                >
                  Career
                </span>
              </div>

              {/* Heading */}
              <h1 className="mb-5 break-words text-4xl font-bold leading-[1.08] tracking-tight text-white sm:mb-6 sm:text-5xl lg:text-6xl xl:text-[64px]">
                Career and{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(
                      90deg,
                      ${GREEN_LIGHT},
                      #A7F3D0,
                      #ffffff
                    )`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Culture
                </span>
              </h1>

              {/* Description */}
              <p className="mb-8 max-w-2xl break-words text-sm leading-7 text-white/65 sm:mb-10 sm:text-base sm:leading-8 lg:text-lg">
                Gain flexibility, reliability, and trust when working with
                Digital Alife. Build meaningful products, learn modern
                technologies, and grow with a collaborative team.
              </p>

              {/* Buttons */}
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a
                  href="#open-positions"
                  className="
                    group
                    inline-flex w-full items-center justify-center gap-2
                    rounded-full
                    border border-white/10
                    px-6 py-3.5
                    text-sm font-semibold text-white
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:scale-[1.02]
                    sm:w-auto
                    sm:px-7
                  "
                  style={{
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                    boxShadow: `0 12px 35px ${GREEN}45`,
                  }}
                >
                  Explore Openings

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

                <a
                  href="#open-positions"
                  className="
                    group
                    inline-flex w-full items-center justify-center gap-2
                    rounded-full
                    border border-white/15
                    bg-white/[0.06]
                    px-6 py-3.5
                    text-sm font-semibold text-white
                    shadow-inner shadow-white/[0.04]
                    backdrop-blur-xl
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-white/25
                    hover:bg-white/[0.11]
                    sm:w-auto
                    sm:px-7
                  "
                >
                  View Positions

                  <BriefcaseBusiness
                    size={16}
                    className="transition-transform duration-300 group-hover:rotate-[-8deg]"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile background protection */}
      <style>{`
        @media (max-width: 767px) {
          section {
            background-image: none !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          section {
            background-size: 45% !important;
            background-position: right center !important;
          }
        }
      `}</style>
    </section>
  );
}
/* =========================================================
   APPLICATION MODAL
========================================================= */

function ApplicationModal({ opening, onClose }) {
  const [submitState, setSubmitState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const validate = (form) => {
    const data = new FormData(form);
    const errors = {};

    const get = (name) => String(data.get(name) || "").trim();

    const firstName = get("firstName");
    const lastName = get("lastName");
    const email = get("email");
    const phone = get("phone");
    const city = get("city");
    const state = get("state");
    const experience = get("experience");
    const qualification = get("qualification");
    const expectedCtc = get("expectedCtc");
    const noticePeriod = get("noticePeriod");
    const linkedin = get("linkedin");
    const skills = get("skills");
    const motivation = get("motivation");

    if (!firstName) {
      errors.firstName = "First name is required.";
    }

    if (!lastName) {
      errors.lastName = "Last name is required.";
    }

    if (!email) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!phone) {
      errors.phone = "Phone number is required.";
    } else if (phone.replace(/\D/g, "").length < 7) {
      errors.phone = "Please enter a valid phone number.";
    }

    if (!city) {
      errors.city = "City is required.";
    }

    if (!state) {
      errors.state = "State is required.";
    }

    if (!experience) {
      errors.experience = "Experience is required.";
    }

    if (!qualification) {
      errors.qualification = "Highest qualification is required.";
    }

    if (!expectedCtc) {
      errors.expectedCtc = "Expected CTC is required.";
    }

    if (!noticePeriod) {
      errors.noticePeriod = "Notice period is required.";
    }

    if (!linkedin) {
      errors.linkedin = "LinkedIn profile URL is required.";
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(linkedin)) {
      errors.linkedin = "Please enter a valid LinkedIn profile URL.";
    }

    if (!skills) {
      errors.skills = "Please enter your key skills.";
    }

    if (!motivation) {
      errors.motivation = "Please tell us why you would like to join.";
    }

    const resume = data.get("resume");

    if (!resume || !(resume instanceof File) || resume.size === 0) {
      errors.resume = "Please upload your resume.";
    } else {
      const extension = resume.name.split(".").pop()?.toLowerCase();

      if (!["pdf", "doc", "docx"].includes(extension)) {
        errors.resume = "Only PDF, DOC, and DOCX files are allowed.";
      }

      if (resume.size > 5 * 1024 * 1024) {
        errors.resume = "Resume must be 5MB or smaller.";
      }
    }

    if (!data.get("consent")) {
      errors.consent = "Please confirm that the information is accurate.";
    }

    return errors;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.resume;
      return next;
    });

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);

      setFieldErrors((prev) => ({
        ...prev,
        resume: "Resume must be 5MB or smaller.",
      }));

      event.target.value = "";
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "doc", "docx"].includes(extension)) {
      setSelectedFile(null);

      setFieldErrors((prev) => ({
        ...prev,
        resume: "Only PDF, DOC, and DOCX files are allowed.",
      }));

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    setSubmitState({
      loading: false,
      error: "",
      success: "",
    });

    const errors = validate(form);

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      const firstError = Object.keys(errors)[0];

      setTimeout(() => {
        const element = form.querySelector(`[name="${firstError}"]`);

        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 80);

      return;
    }

    setFieldErrors({});

    setSubmitState({
      loading: true,
      error: "",
      success: "",
    });

    try {
      const formData = new FormData(form);

      formData.set("opening", opening?.title || "");

      const response = await fetch(`${API_URL}/api/career-applications`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Unable to submit application.",
        );
      }

      form.reset();
      setSelectedFile(null);

      setSubmitState({
        loading: false,
        error: "",
        success: result.message || "Application submitted successfully.",
      });
    } catch (error) {
      console.error("Career application error:", error);

      setSubmitState({
        loading: false,
        error:
          error?.message ||
          "Something went wrong while submitting your application.",
        success: "",
      });
    }
  };

  /* =======================================================
     SUCCESS
  ======================================================= */

  if (submitState.success) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-md sm:items-center sm:p-5">
        <div className="w-full max-w-xl rounded-t-[28px] bg-white p-6 shadow-2xl dark:bg-slate-900 sm:rounded-[28px] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={32} strokeWidth={2.5} />
          </div>

          <h2 className="mt-6 text-center text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            Application Submitted
          </h2>

          <p className="mx-auto mt-3 max-w-md text-center text-sm leading-7 text-slate-500 dark:text-slate-400">
            {submitState.success}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-7 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-600"
          >
            Close
            <CheckCircle2 size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[97vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl dark:bg-slate-900 sm:max-h-[94vh] sm:rounded-[30px]">
        {/* ===============================================
            MODAL HEADER
        =============================================== */}

        <div
          className="relative shrink-0 overflow-hidden px-5 py-5 sm:px-7 sm:py-6"
          style={{
            background: `linear-gradient(
              135deg,
              #022c22,
              #064e3b,
              #047857
            )`,
          }}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl"
            style={{
              background: `${GREEN_LIGHT}25`,
            }}
          />

          <div className="relative flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-200">
                <BriefcaseBusiness size={14} />
                Job Application
              </div>

              <h2 className="break-words text-xl font-black text-white sm:text-2xl">
                Apply for {opening?.title || "this position"}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {opening?.category && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80">
                    {opening.category}
                  </span>
                )}

                {opening?.employmentType && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80">
                    {opening.employmentType}
                  </span>
                )}

                {opening?.location && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/80">
                    <MapPin size={11} />
                    {opening.location}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close application"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* ===============================================
            MODAL BODY
        =============================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} noValidate className="w-full">
            <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
              {/* =========================================
                  FORM CONTENT
              ========================================= */}

              <div className="min-w-0 p-4 sm:p-7 lg:p-8">
                {submitState.error && (
                  <div className="mb-6 flex min-w-0 items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />

                    <div className="min-w-0">
                      <p className="font-black">Unable to submit</p>

                      <p className="mt-1 break-words text-sm leading-6">
                        {submitState.error}
                      </p>
                    </div>
                  </div>
                )}

                {/* =======================================
                    PERSONAL INFORMATION
                ======================================= */}

                <div>
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                      01
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black text-slate-900 dark:text-white">
                        Personal Information
                      </h3>

                      <p className="text-xs font-medium text-slate-400">
                        Tell us about yourself
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                    <Field
                      label="First Name"
                      required
                      error={fieldErrors.firstName}
                    >
                      <input
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Enter first name"
                        className={`${inputClasses} ${
                          fieldErrors.firstName ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.firstName}
                      />
                    </Field>

                    <Field
                      label="Last Name"
                      required
                      error={fieldErrors.lastName}
                    >
                      <input
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Enter last name"
                        className={`${inputClasses} ${
                          fieldErrors.lastName ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.lastName}
                      />
                    </Field>

                    <Field
                      label="Email Address"
                      required
                      error={fieldErrors.email}
                    >
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={`${inputClasses} ${
                          fieldErrors.email ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.email}
                      />
                    </Field>

                    <Field
                      label="Phone Number"
                      required
                      error={fieldErrors.phone}
                    >
                      <input
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        className={`${inputClasses} ${
                          fieldErrors.phone ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.phone}
                      />
                    </Field>

                    <Field label="City" required error={fieldErrors.city}>
                      <input
                        name="city"
                        type="text"
                        placeholder="Enter city"
                        className={`${inputClasses} ${
                          fieldErrors.city ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.city}
                      />
                    </Field>

                    <Field label="State" required error={fieldErrors.state}>
                      <input
                        name="state"
                        type="text"
                        placeholder="Enter state"
                        className={`${inputClasses} ${
                          fieldErrors.state ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.state}
                      />
                    </Field>
                  </div>
                </div>

                <div className="my-8 h-px bg-emerald-100 dark:bg-slate-800" />

                {/* =======================================
                    EXPERIENCE
                ======================================= */}

                <div>
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                      02
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black text-slate-900 dark:text-white">
                        Experience & Background
                      </h3>

                      <p className="text-xs font-medium text-slate-400">
                        Help us understand your experience
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2">
                    <Field label="Selected Position" required>
                      <input
                        type="text"
                        value={opening?.title || ""}
                        readOnly
                        className={`${inputClasses} cursor-not-allowed border-emerald-200 bg-emerald-50 font-bold text-emerald-800`}
                      />

                      <input
                        type="hidden"
                        name="opening"
                        value={opening?.title || ""}
                      />
                    </Field>

                    <Field
                      label="Years of Experience"
                      required
                      error={fieldErrors.experience}
                    >
                      <input
                        name="experience"
                        type="text"
                        placeholder="e.g. 2 Years"
                        className={`${inputClasses} ${
                          fieldErrors.experience ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.experience}
                      />
                    </Field>

                    <Field
                      label="Highest Qualification"
                      required
                      error={fieldErrors.qualification}
                    >
                      <input
                        name="qualification"
                        type="text"
                        placeholder="e.g. B.Tech CS, MCA"
                        className={`${inputClasses} ${
                          fieldErrors.qualification ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.qualification}
                      />
                    </Field>

                    <Field label="Current Company" hint="Optional">
                      <input
                        name="currentCompany"
                        type="text"
                        placeholder="e.g. Acme Solutions"
                        className={inputClasses}
                      />
                    </Field>

                    <Field label="Current CTC" hint="Optional">
                      <input
                        name="currentCtc"
                        type="text"
                        placeholder="e.g. ₹5,00,000"
                        className={inputClasses}
                      />
                    </Field>

                    <Field
                      label="Expected CTC"
                      required
                      error={fieldErrors.expectedCtc}
                    >
                      <input
                        name="expectedCtc"
                        type="text"
                        placeholder="e.g. ₹7,50,000"
                        className={`${inputClasses} ${
                          fieldErrors.expectedCtc ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.expectedCtc}
                      />
                    </Field>

                    <Field
                      label="Notice Period"
                      required
                      error={fieldErrors.noticePeriod}
                    >
                      <input
                        name="noticePeriod"
                        type="text"
                        placeholder="e.g. 30 Days"
                        className={`${inputClasses} ${
                          fieldErrors.noticePeriod ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.noticePeriod}
                      />
                    </Field>
                  </div>
                </div>

                <div className="my-8 h-px bg-emerald-100 dark:bg-slate-800" />

                {/* =======================================
                    PROFILES
                ======================================= */}

                <div>
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                      03
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black text-slate-900 dark:text-white">
                        Professional Profiles & Skills
                      </h3>

                      <p className="text-xs font-medium text-slate-400">
                        Share your professional links and expertise
                      </p>
                    </div>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">
                    <Field
                      label="LinkedIn Profile URL"
                      required
                      error={fieldErrors.linkedin}
                    >
                      <div className="relative min-w-0">
                        <LinkedinIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />

                        <input
                          name="linkedin"
                          type="url"
                          placeholder="https://linkedin.com/in/username"
                          className={`${inputClasses} pl-11 ${
                            fieldErrors.linkedin ? errorInputClasses : ""
                          }`}
                          aria-invalid={!!fieldErrors.linkedin}
                        />
                      </div>
                    </Field>

                    <Field label="GitHub Profile URL" hint="Optional">
                      <div className="relative min-w-0">
                        <GithubIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                          name="github"
                          type="url"
                          placeholder="https://github.com/username"
                          className={`${inputClasses} pl-11`}
                        />
                      </div>
                    </Field>

                    <Field label="Portfolio URL" hint="Optional">
                      <div className="relative min-w-0">
                        <Globe
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600"
                        />

                        <input
                          name="portfolio"
                          type="url"
                          placeholder="https://portfolio.com"
                          className={`${inputClasses} pl-11`}
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="mt-5">
                    <Field
                      label="Required Skills"
                      required
                      error={fieldErrors.skills}
                    >
                      <input
                        name="skills"
                        type="text"
                        placeholder="e.g. React, Node.js, MongoDB, Laravel"
                        className={`${inputClasses} ${
                          fieldErrors.skills ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.skills}
                      />
                    </Field>
                  </div>
                </div>

                <div className="my-8 h-px bg-emerald-100 dark:bg-slate-800" />

                {/* =======================================
                    RESUME
                ======================================= */}

                <div>
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                      04
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black text-slate-900 dark:text-white">
                        Resume & Message
                      </h3>

                      <p className="text-xs font-medium text-slate-400">
                        Upload your latest resume and introduce yourself
                      </p>
                    </div>
                  </div>

                  <label
                    className={`
                      group block w-full cursor-pointer
                      rounded-3xl border-2 border-dashed
                      p-6 text-center transition
                      sm:p-8
                      ${
                        fieldErrors.resume
                          ? "border-red-300 bg-red-50"
                          : "border-emerald-200 bg-emerald-50/60 hover:border-emerald-400"
                      }
                    `}
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-sm transition group-hover:scale-105">
                      {selectedFile ? (
                        <CheckCircle2 size={26} />
                      ) : (
                        <UploadCloud size={27} />
                      )}
                    </div>

                    <p className="mt-4 break-words text-sm font-black text-slate-800">
                      {selectedFile ? selectedFile.name : "Upload Resume"}
                    </p>

                    <p className="mt-1 break-words text-xs font-medium text-slate-400">
                      {selectedFile
                        ? `${(selectedFile.size / (1024 * 1024)).toFixed(
                            2,
                          )} MB • Click to replace`
                        : "PDF, DOC or DOCX • Maximum 5MB"}
                    </p>

                    <input
                      type="file"
                      name="resume"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  {fieldErrors.resume && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-red-600">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      <span>{fieldErrors.resume}</span>
                    </div>
                  )}

                  <div className="mt-5 space-y-5">
                    <Field label="Cover Letter" hint="Optional">
                      <textarea
                        name="coverLetter"
                        rows={5}
                        placeholder="Write a short introduction..."
                        className={`${inputClasses} resize-none`}
                      />
                    </Field>

                    <Field
                      label="Why would you like to work with our company?"
                      required
                      error={fieldErrors.motivation}
                    >
                      <textarea
                        name="motivation"
                        rows={5}
                        placeholder="Tell us why you would like to join our team..."
                        className={`${inputClasses} resize-none ${
                          fieldErrors.motivation ? errorInputClasses : ""
                        }`}
                        aria-invalid={!!fieldErrors.motivation}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* =========================================
                  RIGHT SIDE
              ========================================= */}

              <aside className="min-w-0 border-t border-emerald-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6 lg:border-l lg:border-t-0">
                <div className="lg:sticky lg:top-0">
                  <div className="mb-4 flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                    <BriefcaseBusiness size={17} className="text-emerald-500" />
                    Position Details
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <h4 className="break-words text-base font-black text-slate-900 dark:text-white">
                      {opening?.title}
                    </h4>

                    <div className="mt-4 space-y-3">
                      {opening?.category && (
                        <div className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <BriefcaseBusiness
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-500"
                          />

                          <span className="break-words">
                            {opening.category}
                          </span>
                        </div>
                      )}

                      {opening?.employmentType && (
                        <div className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <Clock3
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-500"
                          />

                          <span className="break-words">
                            {opening.employmentType}
                          </span>
                        </div>
                      )}

                      {opening?.location && (
                        <div className="flex items-start gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <MapPin
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-500"
                          />

                          <span className="break-words">
                            {opening.location}
                          </span>
                        </div>
                      )}
                    </div>

                    {opening?.description && (
                      <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          About the role
                        </p>

                        <p className="mt-2 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {opening.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-600"
                      />

                      <p className="text-xs font-medium leading-6 text-emerald-800">
                        Please make sure your information and resume are
                        accurate before submitting.
                      </p>
                    </div>
                  </div>

                  <label className="mt-5 flex cursor-pointer items-start gap-3 text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      name="consent"
                      className="mt-1 h-4 w-4 shrink-0 rounded"
                      style={{
                        accentColor: GREEN,
                      }}
                    />

                    <span>
                      I certify that the above information is accurate and
                      complete.
                    </span>
                  </label>

                  {fieldErrors.consent && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-red-600">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />

                      <span>{fieldErrors.consent}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitState.loading}
                    className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
                    style={{
                      background: GREEN,
                      boxShadow: `0 12px 30px ${GREEN}30`,
                    }}
                  >
                    {submitState.loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <Send size={17} />
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-[10px] font-medium leading-5 text-slate-400">
                    Your information will be reviewed by our recruitment team.
                  </p>
                </div>
              </aside>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN CAREERS
========================================================= */

function Careers() {
  const [activeTab, setActiveTab] = useState("All");
  const [openFaq, setOpenFaq] = useState(null);

  const [openings, setOpenings] = useState([]);
  const [loadingOpenings, setLoadingOpenings] = useState(true);

  const [selectedOpening, setSelectedOpening] = useState(null);

  const [openingError, setOpeningError] = useState("");

  const applicationSectionRef = useRef(null);

  /* =======================================================
     LOAD OPENINGS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadOpenings = async () => {
      setLoadingOpenings(true);
      setOpeningError("");

      try {
        const response = await fetch(`${API_URL}/api/career-openings`);

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Career openings could not be loaded.",
          );
        }

        if (mounted) {
          setOpenings(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Career openings error:", error);

        if (mounted) {
          setOpenings([]);
          setOpeningError("Career openings are currently unavailable.");
        }
      } finally {
        if (mounted) {
          setLoadingOpenings(false);
        }
      }
    };

    loadOpenings();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const openingCategories = useMemo(() => {
    const categories = openings
      .map((opening) => opening?.category)
      .filter(Boolean);

    return ["All", ...new Set(categories)];
  }, [openings]);

  /* =======================================================
     FILTER
  ======================================================= */

  const visibleOpenings = useMemo(() => {
    if (activeTab === "All") {
      return openings;
    }

    return openings.filter((opening) => opening?.category === activeTab);
  }, [openings, activeTab]);

  /* =======================================================
     OPEN APPLICATION MODAL
  ======================================================= */

  const handleApply = (opening) => {
    setSelectedOpening(opening);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-slate-900 dark:bg-[#020817] dark:text-slate-100">
      <main className="w-full min-w-0">
        {/* =================================================
            HERO
        ================================================= */}

        <Hero />

        {/* =================================================
            WHY JOIN
        ================================================= */}

        <section className="w-full bg-[#F0FDF4] py-16 dark:bg-[#061A13] sm:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why Digital Alife"
              title="Why Join Us?"
              subtitle="Accelerate your expertise with modern technologies, meaningful projects, and a collaborative team."
            />

            <div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {whyJoinUs.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group relative min-w-0 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_-20px_rgba(16,185,129,.35)] dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div
                      className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border bg-emerald-50 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400"
                      style={{
                        borderColor: `${GREEN_LIGHT}55`,
                      }}
                    >
                      <Icon size={25} />
                    </div>

                    <div
                      className="mb-2 text-[10px] font-black uppercase tracking-[0.18em]"
                      style={{ color: GREEN }}
                    >
                      0{index + 1}
                    </div>

                    <h3 className="break-words text-lg font-black text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 break-words text-sm leading-7 text-slate-500 dark:text-slate-400">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            CULTURE
        ================================================= */}

        <section className="w-full bg-white py-16 dark:bg-[#020817] sm:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Values"
              title="Our Core Culture"
              subtitle="The principles that guide our everyday work, communication, reviews, and decisions."
            />

            <div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {coreCulture.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group min-w-0 rounded-3xl border border-emerald-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-20px_rgba(16,185,129,.3)] dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                        <Icon size={25} />
                      </div>

                      <Heart size={18} className="text-emerald-300" />
                    </div>

                    <h3 className="mt-6 break-words text-lg font-black text-slate-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-3 break-words text-sm leading-7 text-slate-500 dark:text-slate-400">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            OPEN POSITIONS
        ================================================= */}

        <section
          id="open-positions"
          className="w-full bg-[#F0FDF4] py-16 dark:bg-[#061A13] sm:py-20 lg:py-24"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Join The Team"
              title="Open Hiring Positions"
              subtitle="Choose a role and click Apply Now to open its dedicated application form."
            />

            {/* Categories */}
            {openingCategories.length > 1 && (
              <div className="mb-8 flex w-full gap-2 overflow-x-auto pb-2">
                {openingCategories.map((tab) => {
                  const active = activeTab === tab;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`
                        shrink-0 rounded-full border
                        px-4 py-2.5
                        text-xs font-black
                        transition-all
                        ${
                          active
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "border-emerald-100 bg-white text-slate-500 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }
                      `}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading */}
            {loadingOpenings && (
              <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-emerald-100 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <Loader2
                    size={20}
                    className="animate-spin text-emerald-500"
                  />
                  Loading openings...
                </div>
              </div>
            )}

            {/* Error */}
            {!loadingOpenings && openingError && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-7 text-center text-sm font-semibold text-red-600">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                  <AlertCircle size={23} />
                </div>

                {openingError}
              </div>
            )}

            {/* Jobs */}
            {!loadingOpenings &&
              !openingError &&
              visibleOpenings.length > 0 && (
                <div className="grid w-full min-w-0 gap-5">
                  {visibleOpenings.map((opening) => (
                    <article
                      key={opening.id || opening.title}
                      className="group relative w-full min-w-0 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_-25px_rgba(16,185,129,.4)] dark:border-slate-800 dark:bg-slate-900 sm:p-6"
                    >
                      {/* Accent */}
                      <div
                        className="absolute inset-x-0 top-0 h-1"
                        style={{
                          background: `linear-gradient(
                            90deg,
                            ${GREEN_DARK},
                            ${GREEN},
                            ${GREEN_LIGHT}
                          )`,
                        }}
                      />

                      <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            {opening.category && (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                {opening.category}
                              </span>
                            )}

                            {opening.employmentType && (
                              <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                {opening.employmentType}
                              </span>
                            )}
                          </div>

                          <h3 className="break-words text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                            {opening.title}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                            {opening.location && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin
                                  size={14}
                                  className="text-emerald-500"
                                />
                                {opening.location}
                              </span>
                            )}

                            {opening.employmentType && (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3
                                  size={14}
                                  className="text-emerald-500"
                                />
                                {opening.employmentType}
                              </span>
                            )}
                          </div>

                          <p className="mt-4 max-w-4xl break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
                            {opening.description ||
                              "We are looking for talented people to join our team."}
                          </p>
                        </div>

                        {/* Apply Button only */}
                        <div className="w-full shrink-0 lg:w-auto">
                          <button
                            type="button"
                            onClick={() => handleApply(opening)}
                            className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 lg:w-auto"
                            style={{
                              boxShadow: `0 10px 25px ${GREEN}30`,
                            }}
                          >
                            Apply Now
                            <ArrowRight size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

            {/* Empty */}
            {!loadingOpenings &&
              !openingError &&
              visibleOpenings.length === 0 && (
                <div className="rounded-3xl border border-emerald-100 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <BriefcaseBusiness size={28} />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                    No active positions right now
                  </h3>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                    We don't currently have an opening in{" "}
                    <span className="font-black text-emerald-600">
                      {activeTab}
                    </span>
                    .
                  </p>
                </div>
              )}
          </div>
        </section>

        {/* =================================================
            SELECTION PROCESS
        ================================================= */}

        <section className="w-full bg-white py-16 dark:bg-[#020817] sm:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="How It Works"
              title="Our Selection Process"
              subtitle="A transparent recruitment journey from application to onboarding."
            />

            <div className="grid w-full min-w-0 grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {selectionProcess.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="min-w-0 rounded-3xl border border-emerald-100 bg-white p-6 transition hover:-translate-y-1.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black text-white"
                        style={{
                          background: GREEN,
                        }}
                      >
                        {step.number}
                      </div>

                      <Icon size={19} className="text-emerald-400" />
                    </div>

                    <h3 className="mt-7 break-words text-lg font-black text-slate-900 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 break-words text-sm leading-7 text-slate-500 dark:text-slate-400">
                      {step.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            PERKS
        ================================================= */}

        <section className="w-full bg-[#F0FDF4] py-16 dark:bg-[#061A13] sm:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Employee Benefits"
              title="Perks & Benefits"
              subtitle="Everything we do to make your work experience comfortable and growth-focused."
            />

            <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
              {perks.map((perk) => {
                const Icon = perk.icon;

                return (
                  <div
                    key={perk.title}
                    className="group min-w-0 rounded-2xl border border-emerald-100 bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:scale-110 dark:bg-emerald-400/10 dark:text-emerald-400">
                      <Icon size={22} />
                    </div>

                    <h4 className="break-words text-xs font-black leading-5 text-slate-800 dark:text-slate-200 sm:text-sm">
                      {perk.title}
                    </h4>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            FAQ
        ================================================= */}

        <section className="w-full bg-white py-16 dark:bg-[#020817] sm:py-20 lg:py-24">
          <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="FAQ"
              title="Frequently Asked Questions"
              subtitle="Answers to common recruitment questions."
            />

            <div className="space-y-3">
              {faqs.map((item, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-2xl border border-emerald-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full min-w-0 items-center justify-between gap-4 p-4 text-left sm:p-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xs font-black text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="min-w-0 break-words text-sm font-black text-slate-800 dark:text-slate-200 sm:text-base">
                          {item.question}
                        </span>
                      </div>

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        style={{
                          background: isOpen ? GREEN : GREEN_SOFT,
                          color: isOpen ? "#fff" : GREEN_DARK,
                        }}
                      >
                        <ChevronDown size={16} />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-5 sm:pl-[68px]">
                        <p className="break-words text-sm leading-7 text-slate-500 dark:text-slate-400">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}

        <section className="w-full bg-white py-16 dark:bg-[#020817] sm:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div
              className="relative overflow-hidden rounded-[28px] p-7 sm:p-10 lg:p-14"
              style={{
                background: DARK,
              }}
            >
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl"
                style={{
                  background: `${GREEN}30`,
                }}
              />

              <div className="relative flex min-w-0 flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                 

                  <h2 className="break-words text-3xl font-black !text-white sm:text-4xl">
                    Ready to grow with us?
                  </h2>

                  <p className="mt-3 max-w-xl break-words text-sm leading-7 !text-white sm:text-base">
                    Find an open position above and click Apply Now to start
                    your application.
                  </p>
                </div>

                <a
                  href="#open-positions"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-slate-900 transition hover:-translate-y-1 sm:w-auto"
                >
                  View Openings
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =================================================
          APPLICATION MODAL
      ================================================= */}

      {selectedOpening && (
        <ApplicationModal
          opening={selectedOpening}
          onClose={() => setSelectedOpening(null)}
        />
      )}
    </div>
  );
}

export default Careers;
