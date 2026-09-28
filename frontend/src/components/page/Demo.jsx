import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Eye,
  Globe2,
  KeyRound,
  Link2,
  LockKeyhole,
  Mail,
  MessageCircle,
  Phone,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

/* =========================================================
CONFIG video
========================================================= */

const SITE_API = import.meta.env.VITE_SITE_API_URL || "";

const CONTACT = {
  phoneDisplay: "+91 92119 54915",
  phone: "+919211954915",
  email: import.meta.env.VITE_CONTACT_EMAIL || "",
  whatsappMessage:
    "Hello Digital Alife, I want to know more about your demo projects and website development services.",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=85",
];

/* =========================================================
HELPERS
========================================================= */

function getImageByIndex(name) {
  const seed = Array.from(String(name || "demo")).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );

  return FALLBACK_IMAGES[seed % FALLBACK_IMAGES.length];
}

function formatReadableType(value) {
  if (!value) return "Web Demo";

  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

function getStatusMeta(status) {
  const normalized = String(status || "active").toLowerCase();

  if (
    normalized === "active" ||
    normalized === "running" ||
    normalized === "live"
  ) {
    return {
      label: "Live",
      dot: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    };
  }

  if (
    normalized === "expired" ||
    normalized === "stopped" ||
    normalized === "inactive"
  ) {
    return {
      label: "Unavailable",
      dot: "bg-rose-500",
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    };
  }

  return {
    label: formatReadableType(status || "Active"),
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  };
}

function buildWhatsAppUrl() {
  return (
    "https://wa.me/" +
    CONTACT.phone +
    "?text=" +
    encodeURIComponent(CONTACT.whatsappMessage)
  );
}

/* =========================================================
DOMAIN
========================================================= */

function getProjectDomain(url) {
  if (!url) {
    return "Live Demo";
  }

  try {
    let value = String(url).trim();

    if (!value) {
      return "Live Demo";
    }

    value = value.replace("https://", "");
    value = value.replace("http://", "");

    if (value.toLowerCase().startsWith("www.")) {
      value = value.substring(4);
    }

    const slashIndex = value.indexOf("/");

    if (slashIndex !== -1) {
      value = value.substring(0, slashIndex);
    }

    const questionIndex = value.indexOf("?");

    if (questionIndex !== -1) {
      value = value.substring(0, questionIndex);
    }

    const hashIndex = value.indexOf("#");

    if (hashIndex !== -1) {
      value = value.substring(0, hashIndex);
    }

    return value || "Live Demo";
  } catch {
    return "Live Demo";
  }
}

/* =========================================================
URL HELPERS
========================================================= */

function isAbsoluteUrl(value) {
  const text = String(value || "").trim();

  return text.startsWith("http://") || text.startsWith("https://");
}

function makeAbsoluteApiUrl(value) {
  if (!value) {
    return "";
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return "";
  }

  if (isAbsoluteUrl(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("//")) {
    return window.location.protocol + normalized;
  }

  if (normalized.startsWith("/")) {
    return SITE_API + normalized;
  }

  return "";
}

/* =========================================================
VIDEO HELPERS
========================================================= */

function extractVideoUrl(video) {
  if (!video) {
    return "";
  }

  if (typeof video === "string") {
    const value = video.trim();

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/api/")
    ) {
      return value;
    }

    return "";
  }

  if (typeof video !== "object") {
    return "";
  }

  const urls = [
    video.url,
    video.videoUrl,
    video.publicUrl,
    video.secureUrl,
    video.secure_url,
    video.src,
  ];

  for (const value of urls) {
    if (!value) {
      continue;
    }

    const normalized = String(value).trim();

    if (
      normalized.startsWith("http://") ||
      normalized.startsWith("https://") ||
      normalized.startsWith("/api/")
    ) {
      return normalized;
    }
  }

  return "";
}

function getProjectVideoEndpoint(site) {
  const projectId =
    site?.projectId ||
    site?.project_id ||
    site?.project?.id ||
    site?.project?._id ||
    site?.originalProjectId ||
    "";

  if (!projectId) {
    return "";
  }

  return (
    SITE_API +
    "/api/demo-proxy/projects/" +
    encodeURIComponent(projectId) +
    "/video"
  );
}

function hasConfiguredVideo(site) {
  if (!site) {
    return false;
  }

  const directUrl = extractVideoUrl(site.video);

  if (directUrl) {
    return true;
  }

  if (site.videoUrl) {
    const value = String(site.videoUrl).trim();

    if (
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/api/")
    ) {
      return true;
    }
  }

  if (site.video && typeof site.video === "object") {
    return Boolean(
      site.video.path ||
      site.video.filePath ||
      site.video.location ||
      site.video.filename,
    );
  }

  return false;
}

function getVideoCandidates(site) {
  if (!site) {
    return [];
  }

  const urls = [];

  const directUrl = extractVideoUrl(site.video);

  if (directUrl) {
    urls.push(makeAbsoluteApiUrl(directUrl));
  }

  if (site.videoUrl) {
    const normalized = String(site.videoUrl).trim();

    if (
      normalized.startsWith("http://") ||
      normalized.startsWith("https://") ||
      normalized.startsWith("/api/")
    ) {
      urls.push(makeAbsoluteApiUrl(normalized));
    }
  }

  const endpoint = getProjectVideoEndpoint(site);

  if (endpoint) {
    urls.push(endpoint);
  }

  return [...new Set(urls.filter(Boolean))];
}

function getVideoLabel(video) {
  if (!video) {
    return "Project Walkthrough";
  }

  if (typeof video === "object") {
    if (video.title) {
      return video.title;
    }

    if (video.name) {
      return video.name;
    }

    if (video.filename) {
      return video.filename;
    }
  }

  return "Project Walkthrough";
}

/* =========================================================
CONTACT MODAL
========================================================= */

function ContactModal({ open, onClose }) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="
            fixed inset-0 z-[100]
            flex items-end justify-center
            bg-[#06111f]/60
            p-0 backdrop-blur-sm
            sm:items-center
            sm:p-5
            "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Contact options"
    >
      {" "}
      <div
        className="
            w-full max-w-lg
            overflow-hidden
            rounded-t-[28px]
            border border-white/20
            bg-white
            shadow-[0_-20px_80px_rgba(0,0,0,0.25)]
            dark:border-slate-700
            dark:bg-[#102a43]
            sm:rounded-[28px]
            sm:shadow-[0_30px_100px_rgba(0,0,0,0.3)]
          "
      >
        {" "}
        <div
          className="
            flex items-center
            justify-between
            border-b border-slate-100
            px-5 py-4
            dark:border-slate-700
            sm:px-6
          "
        >
          {" "}
          <div>
            {" "}
            <div
              className="
             flex items-center gap-2
             text-[9px] font-extrabold
             uppercase tracking-[0.16em]
             text-[#2E9E6D]
           "
            >
              {" "}
              <ShieldCheck size={13} />
              Contact Digital Alife{" "}
            </div>
            <h3
              className="
            mt-1 text-lg font-black
            tracking-tight
            text-[#0C2C50]
            dark:text-white
          "
            >
              How would you like to connect?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="
          flex h-9 w-9
          items-center justify-center
          rounded-xl
          border border-slate-200
          text-slate-400
          transition
          hover:border-slate-300
          hover:bg-slate-50
          hover:text-slate-700
          dark:border-slate-700
          dark:hover:bg-slate-800
          dark:hover:text-white
        "
            aria-label="Close contact dialog"
          >
            <X size={17} />
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <p
            className="
          text-xs leading-6
          text-slate-500
          dark:text-slate-400
        "
          >
            Get demo access, discuss your project, or ask us about custom
            website and application development.
          </p>

          <div className="mt-5 grid gap-3">
            <a
              href={"tel:" + CONTACT.phone}
              onClick={onClose}
              className="
            group flex items-center
            gap-4 rounded-2xl
            border border-slate-200
            bg-white p-4
            transition
            hover:-translate-y-0.5
            hover:border-[#0C2C50]/20
            hover:shadow-lg
            dark:border-slate-700
            dark:bg-[#0b2033]
          "
            >
              <div
                className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              bg-[#0C2C50]
              text-white
            "
              >
                <Phone size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#0C2C50] dark:text-white">
                  Call Us
                </p>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {CONTACT.phoneDisplay}
                </p>
              </div>

              <ChevronRight
                size={16}
                className="text-slate-400 transition group-hover:translate-x-0.5"
              />
            </a>

            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="
            group flex items-center
            gap-4 rounded-2xl
            border border-[#25D366]/20
            bg-[#f2fff7] p-4
            transition
            hover:-translate-y-0.5
            hover:shadow-lg
            dark:border-[#25D366]/20
            dark:bg-[#12352f]
          "
            >
              <div
                className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              bg-[#25D366]
              text-white
            "
              >
                <MessageCircle size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#0C2C50] dark:text-white">
                  WhatsApp
                </p>

                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Chat with us and request demo access
                </p>
              </div>

              <ExternalLink size={15} className="text-[#25D366]" />
            </a>

            {CONTACT.email ? (
              <a
                href={"mailto:" + CONTACT.email}
                onClick={onClose}
                className="
              group flex items-center
              gap-4 rounded-2xl
              border border-slate-200
              bg-white p-4
              transition
              hover:-translate-y-0.5
              hover:border-[#2E9E6D]/30
              hover:shadow-lg
              dark:border-slate-700
              dark:bg-[#0b2033]
            "
              >
                <div
                  className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl
                bg-[#eaf7f1]
                text-[#2E9E6D]
                dark:bg-[#173d35]
              "
                >
                  <Mail size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-[#0C2C50] dark:text-white">
                    Email Us
                  </p>

                  <p className="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {CONTACT.email}
                  </p>
                </div>

                <ExternalLink size={15} className="text-[#2E9E6D]" />
              </a>
            ) : (
              <div
                className="
              flex items-center gap-4
              rounded-2xl
              border border-slate-200
              bg-slate-50 p-4
              dark:border-slate-700
              dark:bg-[#0b2033]
            "
              >
                <div
                  className="
                flex h-11 w-11 shrink-0
                items-center justify-center
                rounded-xl
                bg-slate-200
                text-slate-400
                dark:bg-slate-800
              "
                >
                  <Mail size={18} />
                </div>

                <div>
                  <p className="text-xs font-extrabold text-[#0C2C50] dark:text-white">
                    Email
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    Email address will be added soon
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            className="
          mt-5 flex items-center gap-2
          rounded-xl
          bg-slate-50
          px-3.5 py-3
          dark:bg-[#0b2033]
        "
          >
            <LockKeyhole size={14} className="shrink-0 text-[#2E9E6D]" />

            <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
              We can help you with demo access, requirements, pricing and custom
              development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
CONTACT TRIGGER
========================================================= */

function ContactTrigger({ onClick, label = "Contact Us", fullWidth = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0C2C50] px-5 py-3 text-xs font-extrabold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#173d68] dark:bg-white dark:text-[#0C2C50] dark:hover:bg-slate-100 " +
        (fullWidth ? "w-full" : "")
      }
    >
      {" "}
      <MessageCircle size={15} />
      {label}{" "}
    </button>
  );
}

/* =========================================================
BROWSER PREVIEW
========================================================= */

function BrowserPreview({ site, onSelect }) {
  const domain = getProjectDomain(site?.url);

  const status = getStatusMeta(site?.status);

  const handleView = (event) => {
    event.stopPropagation();

    if (site?.id && onSelect) {
      onSelect(site.id);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {" "}
      <div
        className="
       flex items-center gap-1.5
       border-b border-slate-200
       bg-[#E9EDF2]
       px-3 py-2.5
       dark:border-slate-700
       dark:bg-[#182c40]
     "
      >
        {" "}
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />{" "}
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />{" "}
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <div
          className="
        ml-2 flex min-w-0 flex-1
        items-center gap-1.5
        rounded-md bg-white
        px-3 py-1.5
        text-[10px] text-slate-400
        dark:bg-[#0f2235]
        dark:text-slate-500
      "
        >
          <LockKeyhole size={10} className="shrink-0" />

          <span className="truncate">{domain}</span>
        </div>
      </div>
      <div
        className="
      group/preview relative
      aspect-[16/10]
      overflow-hidden
      bg-slate-100
      dark:bg-slate-900
    "
      >
        <img
          src={site?.image || getImageByIndex(site?.name)}
          alt={(site?.name || "Website") + " preview"}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = getImageByIndex(site?.name);
          }}
          className="
        h-full w-full
        object-cover object-top
        transition duration-700
        group-hover/preview:scale-105
      "
        />

        <div
          className="
        pointer-events-none
        absolute inset-0 z-10
        bg-gradient-to-t
        from-[#07111f]/85
        via-transparent
        to-transparent
      "
        />

        <div
          className="
        absolute left-3 top-3 z-20
        inline-flex items-center gap-2
        rounded-full
        border border-white/20
        bg-black/45
        px-2.5 py-1.5
        text-[9px] font-extrabold
        uppercase tracking-[0.12em]
        text-white
        backdrop-blur-md
      "
        >
          <span className={"h-1.5 w-1.5 rounded-full " + status.dot} />

          {status.label}
        </div>

        {site?.video && (
          <div
            className="
          absolute right-3 top-3 z-20
          inline-flex items-center gap-1.5
          rounded-full
          border border-white/20
          bg-black/45
          px-2.5 py-1.5
          text-[8px]
          font-extrabold uppercase
          tracking-[0.1em]
          text-white
          backdrop-blur-md
        "
          >
            <Play size={9} fill="currentColor" />
            Video
          </div>
        )}

        {onSelect && (
          <div
            className="
          absolute inset-0 z-30
          hidden items-center justify-center
          opacity-0 transition duration-300
          group-hover/preview:opacity-100
          sm:flex
        "
          >
            <button
              type="button"
              onClick={handleView}
              className="
            inline-flex items-center gap-2
            rounded-xl bg-white
            px-5 py-3
            text-xs font-extrabold
            text-[#0C2C50]
            shadow-2xl
            transition hover:scale-105
            dark:bg-[#102a43]
            dark:text-white
          "
            >
              <Eye size={15} />
              View Project
            </button>
          </div>
        )}

        <div
          className="
        absolute bottom-3 left-3 z-20
        inline-flex items-center gap-1.5
        rounded-full
        border border-white/20
        bg-black/40
        px-2.5 py-1.5
        text-[8px] font-bold
        uppercase tracking-[0.12em]
        text-white
        backdrop-blur-md
      "
        >
          <Globe2 size={10} />
          Live Demo
        </div>
      </div>
    </div>
  );
}

/* =========================================================
PROJECT VIDEO
========================================================= */

function ProjectVideo({ site }) {
  const candidates = useMemo(() => {
    const result = getVideoCandidates(site);

    console.group("[Demo Video] " + (site?.name || "Unknown Project"));

    console.log("Project ID:", site?.projectId);

    console.log("Demo ID:", site?.id);

    console.log("Video metadata:", site?.video);

    console.log("Video URL:", site?.videoUrl);

    console.log("Candidates:", result);

    console.groupEnd();

    return result;
  }, [site?.name, site?.id, site?.projectId, site?.video, site?.videoUrl]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [failed, setFailed] = useState(false);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setFailed(false);
    setLoaded(false);
  }, [site?.id, site?.projectId, site?.video, site?.videoUrl]);

  useEffect(() => {
    if (!candidates.length) {
      console.warn("[Demo Video] No usable video source.", {
        project: site?.name,
        projectId: site?.projectId,
        demoId: site?.id,
        video: site?.video,
        videoUrl: site?.videoUrl,
      });
    }
  }, [
    candidates,
    site?.name,
    site?.projectId,
    site?.id,
    site?.video,
    site?.videoUrl,
  ]);

  if (!candidates.length || failed) {
    return (
      <div
        className="
       relative aspect-video
       w-full overflow-hidden
       rounded-[22px]
       bg-[#071522]
     "
      >
        <img
          src={site?.image || getImageByIndex(site?.name)}
          alt=""
          className="
absolute inset-0
h-full w-full
object-cover
opacity-20
"
        />

        <div
          className="
        absolute inset-0
        bg-gradient-to-br
        from-[#0C2C50]/95
        via-[#102a43]/90
        to-[#12352f]/95
      "
        />

        <div
          className="
        relative z-10
        flex h-full
        flex-col items-center
        justify-center
        px-6 text-center
        text-white
      "
        >
          <div
            className="
          flex h-16 w-16
          items-center justify-center
          rounded-2xl
          border border-white/10
          bg-white/10
          shadow-2xl
          backdrop-blur-md
        "
          >
            <Play size={25} fill="currentColor" />
          </div>

          <p className="mt-5 text-sm font-black">Project video unavailable</p>

          <p
            className="
          mt-2 max-w-sm
          text-[11px] leading-5
          text-white/60
        "
          >
            Video preview could not be loaded. You can still open the live
            project.
          </p>

          {site?.url && (
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="
            mt-5 inline-flex
            items-center gap-2
            rounded-xl bg-white
            px-4 py-2.5
            text-[10px]
            font-extrabold
            text-[#0C2C50]
            transition
            hover:-translate-y-0.5
          "
            >
              Open Live Project
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    );
  }

  const currentUrl = candidates[currentIndex];

  return (
    <div
      className="
     relative overflow-hidden
     rounded-[22px]
     border border-slate-200
     bg-black
     shadow-[0_20px_60px_rgba(12,44,80,0.14)]
     dark:border-slate-700
   "
    >
      <video
        key={currentUrl}
        src={currentUrl}
        controls
        playsInline
        preload="metadata"
        onLoadStart={() => {
          console.log("[Demo Video] Loading:", currentUrl);

          setLoaded(false);
        }}
        onLoadedMetadata={(event) => {
          console.log("[Demo Video] Metadata loaded:", {
            url: currentUrl,
            duration: event.currentTarget.duration,
            width: event.currentTarget.videoWidth,
            height: event.currentTarget.videoHeight,
          });
        }}
        onCanPlay={() => {
          console.log("[Demo Video] Can play:", currentUrl);

          setLoaded(true);
        }}
        onLoadedData={() => {
          console.log("[Demo Video] Data loaded:", currentUrl);

          setLoaded(true);
        }}
        onError={(event) => {
          const mediaError = event.currentTarget.error;

          console.error("[Demo Video] ERROR:", {
            url: currentUrl,
            code: mediaError?.code,
            message: mediaError?.message || "Browser could not load video.",
          });

          if (currentIndex < candidates.length - 1) {
            const nextUrl = candidates[currentIndex + 1];

            console.warn("[Demo Video] Trying next source:", nextUrl);

            setCurrentIndex((index) => index + 1);

            setLoaded(false);

            return;
          }

          console.error("[Demo Video] Every source failed:", candidates);

          setFailed(true);
        }}
        className="
      block
      aspect-video
      h-full
      w-full
      bg-black
      object-contain
    "
      />

      {!loaded && (
        <div
          className="
        pointer-events-none
        absolute inset-0
        flex items-center
        justify-center
        bg-black/25
      "
        >
          <div
            className="
          inline-flex items-center gap-2
          rounded-full
          border border-white/10
          bg-black/55
          px-4 py-2
          text-[10px]
          font-bold
          text-white
          backdrop-blur-md
        "
          >
            <span
              className="
            h-1.5 w-1.5
            animate-pulse
            rounded-full
            bg-[#2E9E6D]
          "
            />
            Loading project video...
          </div>
        </div>
      )}

      <div
        className="
      absolute left-3 top-3
      inline-flex items-center gap-2
      rounded-full
      border border-white/15
      bg-black/55
      px-3 py-1.5
      text-[9px]
      font-extrabold uppercase
      tracking-[0.14em]
      text-white
      backdrop-blur-md
    "
      >
        <Play size={10} fill="currentColor" />

        {getVideoLabel(site?.video)}
      </div>

      {candidates.length > 1 && (
        <div
          className="
        absolute right-3 top-3
        rounded-full
        border border-white/10
        bg-black/55
        px-2.5 py-1.5
        text-[9px]
        font-bold
        text-white/75
        backdrop-blur-md
      "
        >
          {currentIndex + 1}/{candidates.length}
        </div>
      )}
    </div>
  );
}

/* =========================================================
STAT CARD
========================================================= */

function StatCard({ icon: Icon, value, label, description }) {
  return (
    <div
      className="
     group rounded-2xl
     border border-slate-200
     bg-white/95 p-4
     shadow-sm
     transition duration-300
     hover:-translate-y-1
     hover:shadow-xl
     dark:border-slate-700
     dark:bg-[#102a43]/95
   "
    >
      {" "}
      <div className="flex items-start justify-between gap-3">
        {" "}
        <div className="min-w-0">
          {" "}
          <p
            className="
           text-2xl font-black
           tracking-tight
           text-[#0C2C50]
           dark:text-white
         "
          >
            {formatNumber(value)}{" "}
          </p>
          <p
            className="
          mt-1 text-[10px]
          font-extrabold uppercase
          tracking-[0.12em]
          text-slate-500
          dark:text-slate-400
        "
          >
            {label}
          </p>
        </div>
        <div
          className="
        flex h-10 w-10 shrink-0
        items-center justify-center
        rounded-xl
        bg-[#eaf7f1]
        text-[#2E9E6D]
        transition
        group-hover:scale-110
        dark:bg-[#173d35]
        dark:text-[#72d3aa]
      "
        >
          <Icon size={18} />
        </div>
      </div>
      <p
        className="
      mt-3 text-[10px]
      leading-5
      text-slate-400
      dark:text-slate-500
    "
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================================
CREDENTIAL BOX
========================================================= */

function CredentialBox({ username, password }) {
  const [copied, setCopied] = useState("");

  const copyValue = async (value, type) => {
    if (!value || value === "shared separately") {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      window.setTimeout(() => {
        setCopied("");
      }, 1600);
    } catch {
      setCopied("");
    }
  };

  const passwordAvailable =
    Boolean(password) && password !== "shared separately";

  return (
    <div
      className="
     mt-6 rounded-2xl
     border border-slate-200
     bg-slate-50 p-4
     dark:border-slate-700
     dark:bg-[#0b2033]
   "
    >
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        <div
          className="
         flex h-8 w-8
         items-center justify-center
         rounded-lg
         bg-white
         text-[#2E9E6D]
         shadow-sm
         dark:bg-[#102a43]
       "
        >
          {" "}
          <KeyRound size={15} />{" "}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-[#0C2C50] dark:text-white">
            Demo Access
          </p>

          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Use these credentials to test the demo.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          className="
        rounded-xl
        border border-slate-200
        bg-white p-3
        dark:border-slate-700
        dark:bg-[#102a43]
      "
        >
          <p
            className="
          text-[9px] font-bold
          uppercase tracking-[0.14em]
          text-slate-400
        "
          >
            Username
          </p>

          <div className="mt-1 flex items-center justify-between gap-2">
            <code
              className="
            min-w-0 truncate
            text-xs font-bold
            text-[#0C2C50]
            dark:text-slate-200
          "
            >
              {username || "demo-user"}
            </code>

            <button
              type="button"
              onClick={() => copyValue(username || "demo-user", "username")}
              className="
            shrink-0 rounded-lg
            p-1.5 text-slate-400
            transition
            hover:bg-slate-100
            hover:text-[#2E9E6D]
            dark:hover:bg-slate-700
          "
              aria-label="Copy username"
            >
              {copied === "username" ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div
          className="
        rounded-xl
        border border-slate-200
        bg-white p-3
        dark:border-slate-700
        dark:bg-[#102a43]
      "
        >
          <p
            className="
          text-[9px] font-bold
          uppercase tracking-[0.14em]
          text-slate-400
        "
          >
            Password
          </p>

          <div className="mt-1 flex items-center justify-between gap-2">
            <code
              className="
            min-w-0 truncate
            text-xs font-bold
            text-[#0C2C50]
            dark:text-slate-200
          "
            >
              {passwordAvailable ? password : "Contact us"}
            </code>

            {passwordAvailable && (
              <button
                type="button"
                onClick={() => copyValue(password, "password")}
                className="
              shrink-0 rounded-lg
              p-1.5 text-slate-400
              transition
              hover:bg-slate-100
              hover:text-[#2E9E6D]
              dark:hover:bg-slate-700
            "
                aria-label="Copy password"
              >
                {copied === "password" ? (
                  <Check size={14} />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
FEATURED PROJECT
========================================================= */

function FeaturedProject({ site, onContact, onSelect }) {
  if (!site) {
    return null;
  }

  const status = getStatusMeta(site.status);

  const hasVideo = hasConfiguredVideo(site);

  return (
    <div
      className="
     overflow-hidden
     rounded-[28px]
     border border-slate-200
     bg-white
     shadow-[0_30px_90px_rgba(12,44,80,0.12)]
     dark:border-slate-700
     dark:bg-[#0f2235]
     dark:shadow-[0_30px_90px_rgba(0,0,0,0.3)]
   "
    >
      {" "}
      <div className="grid lg:grid-cols-[1.02fr_0.98fr]">
        {" "}
        <div className="p-6 sm:p-8 lg:p-10">
          {" "}
          <div
            className="
           inline-flex items-center gap-2
           rounded-full
           border border-[#2E9E6D]/20
           bg-[#f1faf6]
           px-3 py-1.5
           text-[9px] font-extrabold
           uppercase tracking-[0.16em]
           text-[#2E9E6D]
           dark:border-[#2E9E6D]/30
           dark:bg-[#12352f]
           dark:text-[#72d3aa]
         "
          >
            {" "}
            <Sparkles size={12} />
            Featured Demo{" "}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className="
            rounded-full
            bg-[#eaf7f1]
            px-2.5 py-1
            text-[9px]
            font-extrabold
            uppercase tracking-wide
            text-[#2E9E6D]
            dark:bg-[#173d35]
            dark:text-[#72d3aa]
          "
            >
              {site.category}
            </span>

            <span
              className={
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold " +
                status.bg +
                " " +
                status.text
              }
            >
              <span className={"h-1.5 w-1.5 rounded-full " + status.dot} />

              {status.label}
            </span>

            {hasVideo && (
              <span
                className="
              inline-flex items-center gap-1.5
              rounded-full
              bg-[#0C2C50]
              px-2.5 py-1
              text-[9px]
              font-extrabold
              text-white
              dark:bg-white
              dark:text-[#0C2C50]
            "
              >
                <Play size={9} fill="currentColor" />
                Video Available
              </span>
            )}
          </div>
          <h2
            className="
          mt-4 max-w-2xl
          break-words
          text-3xl font-black
          leading-[1.05]
          tracking-[-0.04em]
          text-[#0C2C50]
          dark:text-white
          sm:text-4xl
          lg:text-5xl
          xl:text-[54px]
        "
          >
            {site.name}
          </h2>
          <div
            className="
          mt-4 inline-flex max-w-full
          items-center gap-2
          rounded-xl
          border border-slate-200
          bg-slate-50
          px-3 py-2
          dark:border-slate-700
          dark:bg-[#0b2033]
        "
          >
            <Link2 size={13} className="shrink-0 text-[#2E9E6D]" />

            <span
              className="
            truncate text-[10px]
            font-bold text-slate-500
            dark:text-slate-400
          "
            >
              {getProjectDomain(site.url)}
            </span>
          </div>
          <p
            className="
          mt-5 max-w-xl
          text-sm leading-7
          text-slate-500
          dark:text-slate-400
        "
          >
            {site.description ||
              "Explore this live project and experience the application from a real user's perspective."}
          </p>
          <div
            className="
          mt-6 grid gap-3
          sm:flex sm:flex-wrap
        "
          >
            {site.url && (
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="
              inline-flex min-h-[46px]
              items-center justify-center
              gap-2 rounded-xl
              bg-[#2E9E6D]
              px-5 py-3
              text-xs font-extrabold
              text-white
              shadow-lg
              shadow-[#2E9E6D]/20
              transition
              hover:-translate-y-0.5
              hover:bg-[#278a5f]
            "
              >
                <ExternalLink size={15} />
                Open Live Project
              </a>
            )}

            <button
              type="button"
              onClick={onContact}
              className="
            inline-flex min-h-[46px]
            items-center justify-center
            gap-2 rounded-xl
            border border-slate-200
            bg-white
            px-5 py-3
            text-xs font-extrabold
            text-[#0C2C50]
            transition
            hover:-translate-y-0.5
            hover:border-[#2E9E6D]/40
            hover:text-[#2E9E6D]
            dark:border-slate-700
            dark:bg-[#102a43]
            dark:text-white
            dark:hover:border-[#2E9E6D]/50
          "
            >
              <MessageCircle size={15} />
              Contact for Demo Access
            </button>
          </div>
          <CredentialBox username={site.username} password={site.password} />
          <div
            className="
          mt-5 flex flex-col gap-3
          rounded-2xl
          border border-slate-200
          bg-white p-4
          dark:border-slate-700
          dark:bg-[#102a43]
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
          >
            <div>
              <p
                className="
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.15em]
              text-slate-400
            "
              >
                Need help?
              </p>

              <p
                className="
              mt-1 text-xs font-bold
              text-[#0C2C50]
              dark:text-white
            "
              >
                Talk directly with our team.
              </p>
            </div>

            <button
              type="button"
              onClick={onContact}
              className="
            inline-flex w-full
            items-center justify-center
            gap-2 rounded-xl
            bg-[#0C2C50]
            px-4 py-3
            text-xs font-extrabold
            text-white
            transition
            hover:bg-[#2E9E6D]
            sm:w-auto
          "
            >
              Contact Us
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="mt-5 flex items-start gap-2">
            <ShieldCheck
              size={15}
              className="
            mt-0.5 shrink-0
            text-[#2E9E6D]
          "
            />

            <span
              className="
            text-[10px] leading-5
            text-slate-500
            dark:text-slate-400
          "
            >
              Demo environments are meant for review and testing. Do not use
              them as production accounts.
            </span>
          </div>
        </div>
        <div
          className="
        border-t border-slate-200
        bg-slate-50 p-3
        dark:border-slate-700
        dark:bg-[#0b2033]
        lg:border-l
        lg:border-t-0
      "
        >
          <div
            className="
          sticky top-6
          overflow-hidden
          rounded-[22px]
          border border-slate-200
          bg-white
          shadow-[0_20px_60px_rgba(12,44,80,0.12)]
          dark:border-slate-700
          dark:bg-[#102a43]
        "
          >
            {hasVideo ? (
              <div className="p-2 sm:p-3">
                <ProjectVideo site={site} />

                <div className="mt-3 flex items-center justify-between gap-3 px-1 pb-1">
                  <div className="min-w-0">
                    <p
                      className="
                    text-[9px]
                    font-extrabold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                    >
                      Project Preview
                    </p>

                    <p
                      className="
                    mt-1 truncate
                    text-xs font-bold
                    text-[#0C2C50]
                    dark:text-white
                  "
                    >
                      Watch the project walkthrough
                    </p>
                  </div>

                  {site.url && (
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="
                    inline-flex
                    shrink-0
                    items-center gap-1.5
                    rounded-lg
                    bg-[#0C2C50]
                    px-3 py-2
                    text-[9px]
                    font-extrabold
                    text-white
                    transition
                    hover:bg-[#2E9E6D]
                    dark:bg-white
                    dark:text-[#0C2C50]
                  "
                    >
                      Open Site
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <BrowserPreview site={site} onSelect={onSelect} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
PROJECT CARD
========================================================= */

function SiteCard({ site, isSelected, onSelect }) {
  const status = getStatusMeta(site.status);

  const hasVideo = hasConfiguredVideo(site);

  return (
    <article
      className={
        "group overflow-hidden rounded-[24px] border bg-white shadow-[0_8px_30px_rgba(12,44,80,0.06)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(12,44,80,0.13)] dark:bg-[#102a43] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.3)] " +
        (isSelected
          ? "border-[#2E9E6D] ring-2 ring-[#2E9E6D]/10"
          : "border-slate-200 dark:border-slate-700")
      }
    >
      <button
        type="button"
        onClick={() => onSelect(site.id)}
        className="block w-full text-left"
        aria-label={"View " + site.name}
      >
        {" "}
        <BrowserPreview site={site} />{" "}
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
              rounded-full
              bg-[#eaf7f1]
              px-2.5 py-1
              text-[9px]
              font-extrabold
              uppercase
              tracking-wide
              text-[#2E9E6D]
              dark:bg-[#173d35]
              dark:text-[#72d3aa]
            "
              >
                {site.category}
              </span>

              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[8px] font-bold " +
                  status.bg +
                  " " +
                  status.text
                }
              >
                <span className={"h-1.5 w-1.5 rounded-full " + status.dot} />

                {status.label}
              </span>

              {hasVideo && (
                <span
                  className="
                inline-flex items-center gap-1
                rounded-full
                bg-slate-100
                px-2 py-1
                text-[8px]
                font-extrabold
                uppercase
                tracking-wide
                text-slate-500
                dark:bg-slate-800
                dark:text-slate-300
              "
                >
                  <Play size={8} fill="currentColor" />
                  Video
                </span>
              )}
            </div>

            <h3
              className="
            mt-3 break-words
            text-lg font-black
            leading-tight
            tracking-tight
            text-[#0C2C50]
            dark:text-white
          "
            >
              {site.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onSelect(site.id)}
            className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-xl
          border border-slate-200
          text-slate-400
          transition
          hover:border-[#2E9E6D]
          hover:bg-[#eaf7f1]
          hover:text-[#2E9E6D]
          dark:border-slate-700
          dark:hover:bg-[#173d35]
        "
            aria-label={"Open " + site.name}
          >
            <ExternalLink size={15} />
          </button>
        </div>

        <p
          className="
        mt-3 line-clamp-2
        text-[12px]
        leading-5
        text-slate-500
        dark:text-slate-400
      "
        >
          {site.description ||
            "Explore the live project and review the user-facing experience."}
        </p>

        <div className="mt-4 flex min-w-0 items-center gap-2">
          <Link2 size={12} className="shrink-0 text-[#2E9E6D]" />

          <span
            className="
          truncate text-[10px]
          font-semibold
          text-slate-400
          dark:text-slate-500
        "
          >
            {getProjectDomain(site.url)}
          </span>
        </div>

        <div className="my-5 h-px bg-slate-100 dark:bg-slate-700" />

        <div className="flex items-center justify-between gap-3">
          <span
            className="
          text-[10px]
          font-bold uppercase
          tracking-[0.12em]
          text-slate-400
          dark:text-slate-500
        "
          >
            Live Preview
          </span>

          <span
            className="
          inline-flex items-center
          gap-1.5
          text-xs font-extrabold
          text-[#2E9E6D]
          transition
          group-hover:gap-2.5
        "
          >
            View Project
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
SKELETON
========================================================= */

function SkeletonCard() {
  return (
    <div
      className="
     overflow-hidden
     rounded-[24px]
     border border-slate-200
     bg-white
     dark:border-slate-700
     dark:bg-[#102a43]
   "
    >
      {" "}
      <div
        className="
       aspect-[16/10]
       animate-pulse
       bg-slate-200
       dark:bg-slate-700
     "
      />
      <div className="space-y-4 p-5">
        <div
          className="
        h-5 w-24
        animate-pulse
        rounded
        bg-slate-200
        dark:bg-slate-700
      "
        />

        <div
          className="
        h-6 w-3/4
        animate-pulse
        rounded
        bg-slate-200
        dark:bg-slate-700
      "
        />

        <div className="space-y-2">
          <div
            className="
          h-3 w-full
          animate-pulse
          rounded
          bg-slate-200
          dark:bg-slate-700
        "
          />

          <div
            className="
          h-3 w-5/6
          animate-pulse
          rounded
          bg-slate-200
          dark:bg-slate-700
        "
          />
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-700" />

        <div
          className="
        h-4 w-28
        animate-pulse
        rounded
        bg-slate-200
        dark:bg-slate-700
      "
        />
      </div>
    </div>
  );
}

/* =========================================================
MAIN
========================================================= */

export default function Demo() {
  const navigate = useNavigate();

  const location = useLocation();

  const [sites, setSites] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [contactOpen, setContactOpen] = useState(false);

  /* =======================================================
LOAD DEMOS
======================================================= */

  const loadDemos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [demosResponse, projectsResponse] = await Promise.all([
        fetch(SITE_API + "/api/public/demos", {
          headers: {
            Accept: "application/json",
          },
        }),

        fetch(SITE_API + "/api/demo-proxy/projects", {
          headers: {
            Accept: "application/json",
          },
        }).catch(() => null),
      ]);

      if (!demosResponse.ok) {
        throw new Error(
          "Unable to load live demos. Server returned " +
            demosResponse.status +
            ".",
        );
      }

      const data = await demosResponse.json();

      let projectsData = null;

      if (projectsResponse && projectsResponse.ok) {
        try {
          projectsData = await projectsResponse.json();
        } catch {
          projectsData = null;
        }
      }

      console.group("[Demo API]");

      console.log("Demos response:", data);

      console.log("Projects response:", projectsData);

      console.groupEnd();

      const liveDemos = Array.isArray(data?.demos) ? data.demos : [];

      const projects = Array.isArray(projectsData?.projects)
        ? projectsData.projects
        : Array.isArray(projectsData)
          ? projectsData
          : [];

      const mapped = liveDemos
        .filter((demo) => demo && demo.url)
        .map((demo, index) => {
          const projectName =
            demo.projectName || demo.project?.name || `Project ${index + 1}`;

          const projectType = formatReadableType(
            demo.projectType || demo.project?.type || demo.category,
          );

          const projectFromList =
            projects.find((project) => {
              const name = project?.name || project?.projectName || "";

              return (
                String(name).trim().toLowerCase() ===
                String(projectName).trim().toLowerCase()
              );
            }) || null;

          const projectId =
            demo.projectId ||
            demo.project_id ||
            demo.project?.id ||
            demo.project?._id ||
            projectFromList?.id ||
            projectFromList?._id ||
            "";

          const rawVideo =
            demo.video ||
            demo.projectVideo ||
            demo.project?.video ||
            projectFromList?.video ||
            projectFromList?.projectVideo ||
            null;

          const normalizedVideo =
            rawVideo && typeof rawVideo === "object"
              ? {
                  ...rawVideo,
                  url:
                    rawVideo.url ||
                    rawVideo.videoUrl ||
                    rawVideo.publicUrl ||
                    rawVideo.secureUrl ||
                    rawVideo.secure_url ||
                    rawVideo.src ||
                    "",
                }
              : typeof rawVideo === "string"
                ? {
                    url: rawVideo,
                  }
                : null;

          const resolvedVideoUrl =
            demo.videoUrl ||
            demo.projectVideoUrl ||
            normalizedVideo?.url ||
            projectFromList?.videoUrl ||
            projectFromList?.projectVideoUrl ||
            "";

          const finalVideo =
            normalizedVideo ||
            (resolvedVideoUrl
              ? {
                  url: resolvedVideoUrl,
                }
              : null);

          console.log("[Demo Project]", {
            name: projectName,
            demoId: demo.id || `demo-${index}`,
            projectId,
            video: finalVideo,
            projectFromList,
          });

          return {
            id: demo.id || `demo-${index}`,

            projectId,

            name: projectName,

            category: projectType,

            url: demo.url,

            image:
              demo.image ||
              demo.thumbnail ||
              demo.project?.image ||
              projectFromList?.image ||
              projectFromList?.thumbnail ||
              getImageByIndex(projectName),

            video: finalVideo,

            videoUrl: resolvedVideoUrl,

            username:
              demo.accessUsername ||
              demo.credentials?.username ||
              projectFromList?.accessUsername ||
              "demo-user",

            password:
              demo.credentials?.password ||
              projectFromList?.credentials?.password ||
              "shared separately",

            description:
              demo.description ||
              demo.project?.description ||
              projectFromList?.description ||
              `${projectType} demo for live review and testing.`,

            status: demo.status || "active",

            createdAt: demo.createdAt || null,

            expiresAt: demo.expiresAt || null,
          };
        });

      setSites(mapped);
    } catch (loadError) {
      console.error("[Demo API] Failed:", loadError);

      setError(loadError?.message || "Unable to load live demos.");

      setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDemos();
  }, [loadDemos]);

  /* =======================================================
CONTACT
======================================================= */

  const openContact = useCallback(() => {
    setContactOpen(true);
  }, []);

  const closeContact = useCallback(() => {
    setContactOpen(false);
  }, []);

  /* =======================================================
CATEGORIES
======================================================= */

  const categories = useMemo(() => {
    const unique = [
      ...new Set(sites.map((site) => site.category).filter(Boolean)),
    ];

    return ["All", ...unique];
  }, [sites]);

  /* =======================================================
STATS
======================================================= */

  const stats = useMemo(() => {
    const active = sites.filter((site) => {
      const status = String(site.status || "active").toLowerCase();

      return status === "active" || status === "running" || status === "live";
    }).length;

    const categoryCount = new Set(sites.map((site) => site.category)).size;

    return {
      total: sites.length,

      active,

      categories: categoryCount,
    };
  }, [sites]);

  /* =======================================================
SELECTED PROJECT
======================================================= */

  const selectedProjectId = new URLSearchParams(location.search).get("project");

  const selectedSite = useMemo(() => {
    if (!sites.length) {
      return null;
    }

    return sites.find((site) => site.id === selectedProjectId) || sites[0];
  }, [sites, selectedProjectId]);

  /* =======================================================
FILTER
======================================================= */

  const filteredSites = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sites.filter((site) => {
      const matchesCategory =
        activeCategory === "All" || site.category === activeCategory;

      if (!query) {
        return matchesCategory;
      }

      const searchableText = [
        site.name,
        site.category,
        site.description,
        site.url,
        site.videoUrl,
        site.video?.name,
        site.video?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(query);
    });
  }, [sites, activeCategory, searchQuery]);

  /* =======================================================
SELECT PROJECT
======================================================= */

  const handleProjectSelect = useCallback(
    (projectId) => {
      if (!projectId) {
        return;
      }

      const params = new URLSearchParams(location.search);

      params.set("project", projectId);

      const pathname = window.location.pathname;

      const match = pathname.match(/^\/d\/[^/]+/i);

      const basePath = match?.[0] || "";

      const targetPath = basePath + "/demo?" + params.toString();

      navigate(targetPath);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    [location.search, navigate],
  );

  /* =======================================================
CATEGORY
======================================================= */

  const handleCategoryChange = (category) => {
    setActiveCategory(category);

    setMobileFiltersOpen(false);
  };

  /* =======================================================
RESET
======================================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
  };

  /* =======================================================
RENDER
======================================================= */

  return (
    <>
      {" "}
      <main
        className="
       min-h-screen w-full
       overflow-x-hidden
       bg-white
       text-slate-700
       transition-colors
       duration-300
       dark:bg-[#081a2b]
       dark:text-slate-300
     "
      >
        {/* =================================================
                              HERO
        =================================================
        */}

        <section
          className="
          relative overflow-hidden
          border-b
          border-slate-100
          dark:border-slate-800
        "
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className="
              absolute left-1/2
              top-[-170px]
              h-[420px]
              w-[90vw]
              -translate-x-1/2
              rounded-full
              bg-[#2E9E6D]/10
              blur-[110px]
            "
            />

            <div
              className="
              absolute right-[-120px]
              top-[180px]
              h-[300px]
              w-[300px]
              rounded-full
              bg-[#0C2C50]/5
              blur-[100px]
              dark:bg-cyan-300/5
            "
            />

            <div
              className="
              absolute bottom-[-130px]
              left-[-120px]
              h-[300px]
              w-[300px]
              rounded-full
              bg-[#2E9E6D]/5
              blur-[90px]
            "
            />
          </div>

          <div
            className="
            relative mx-auto
            max-w-7xl
            px-5 pb-14 pt-12
            sm:px-10
            sm:pb-20
            sm:pt-16
            lg:px-12
            lg:pb-24
            lg:pt-20
          "
          >
            <div className="mx-auto max-w-4xl text-center">

              {selectedSite ? (
                <>
                  <p
                    className="
                  mt-7
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-[0.25em]
                  text-[#2E9E6D]
                "
                  >
                    {selectedSite.category}
                  </p>

                  <h1
                    className="
                  mx-auto mt-3
                  max-w-4xl
                  break-words
                  text-4xl
                  font-black
                  leading-[1.02]
                  tracking-[-0.05em]
                  text-[#0C2C50]
                  dark:text-white
                  sm:text-5xl
                  lg:text-6xl
                  xl:text-7xl
                "
                  >
                    {selectedSite.name}
                  </h1>

                  <p
                    className="
                  mx-auto mt-4
                  max-w-2xl
                  text-sm
                  leading-7
                  text-slate-500
                  dark:text-slate-400
                  sm:text-base
                "
                  >
                    Explore this project live, understand its user experience,
                    and see how the application works before starting your own.
                  </p>

                  <div
                    className="
                  mt-6
                  flex flex-wrap
                  items-center
                  justify-center
                  gap-2
                "
                  >
                    <span
                      className="
                    inline-flex
                    items-center gap-2
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                    px-3 py-2
                    text-[10px]
                    font-bold
                    text-slate-500
                    shadow-sm
                    dark:border-slate-700
                    dark:bg-[#102a43]
                    dark:text-slate-300
                  "
                    >
                      <Globe2 size={13} className="text-[#2E9E6D]" />

                      {getProjectDomain(selectedSite.url)}
                    </span>

                    {hasConfiguredVideo(selectedSite) && (
                      <span
                        className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-[#0C2C50]
                      px-3 py-2
                      text-[10px]
                      font-extrabold
                      text-white
                      dark:bg-white
                      dark:text-[#0C2C50]
                    "
                      >
                        <Play size={11} fill="currentColor" />
                        Walkthrough Available
                      </span>
                    )}

                    <span
                      className={
                        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-bold " +
                        getStatusMeta(selectedSite.status).bg +
                        " " +
                        getStatusMeta(selectedSite.status).text
                      }
                    >
                      <span
                        className={
                          "h-1.5 w-1.5 rounded-full " +
                          getStatusMeta(selectedSite.status).dot
                        }
                      />

                      {getStatusMeta(selectedSite.status).label}
                    </span>
                  </div>

                  <div
                    className="
                  mx-auto mt-7
                  grid max-w-xl
                  grid-cols-1 gap-3
                  sm:grid-cols-2
                "
                  >
                    {selectedSite.url && (
                      <a
                        href={selectedSite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="
                      inline-flex
                      min-h-[48px]
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#2E9E6D]
                      px-5 py-3
                      text-xs
                      font-extrabold
                      text-white
                      shadow-lg
                      shadow-[#2E9E6D]/20
                      transition
                      hover:-translate-y-0.5
                      hover:bg-[#278a5f]
                    "
                      >
                        <ExternalLink size={15} />
                        Open Live Project
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={openContact}
                      className="
                    inline-flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5 py-3
                    text-xs
                    font-extrabold
                    text-[#0C2C50]
                    shadow-sm
                    transition
                    hover:-translate-y-0.5
                    hover:border-[#2E9E6D]/40
                    hover:text-[#2E9E6D]
                    dark:border-slate-700
                    dark:bg-[#102a43]
                    dark:text-white
                  "
                    >
                      <MessageCircle size={15} />
                      Contact Us
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h1
                    className="
                    p-10
                    mt-6
                    text-4xl
                    font-black
                    leading-[1.02]
                    tracking-[-0.05em]
                    text-[#0C2C50]
                    dark:text-white
                    sm:text-5xl
                    lg:text-6xl
                  "
                  >
                    Explore our
                    <br />
                    <span className="text-[#2E9E6D]">live projects.</span>
                  </h1>

                  <p
                    className="
                  mx-auto mt-5
                  max-w-2xl
                  text-sm leading-7
                  text-slate-500
                  dark:text-slate-400
                  sm:text-base
                "
                  >
                    Browse live demo websites, discover different project
                    categories, and experience each application before starting
                    your own project.
                  </p>

                  <div className="mx-auto mt-7 max-w-sm">
                    <button
                      type="button"
                      onClick={openContact}
                      className="
                    inline-flex
                    min-h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#0C2C50]
                    px-5 py-3
                    text-xs
                    font-extrabold
                    text-white
                    transition
                    hover:bg-[#2E9E6D]
                  "
                    >
                      <MessageCircle size={15} />
                      Contact Our Team
                    </button>
                  </div>
                </>
              )}
            </div>

            <div
              className="
            mx-auto mt-10
            grid max-w-5xl
            grid-cols-1
            gap-3
            sm:grid-cols-3
            sm:gap-4
          "
            >
              <StatCard
                icon={Globe2}
                value={stats.total}
                label="Live Demos"
                description="Currently available demo projects"
              />

              <StatCard
                icon={Activity}
                value={stats.active}
                label="Active Projects"
                description="Demos currently marked as live"
              />

              <StatCard
                icon={Sparkles}
                value={stats.categories}
                label="Categories"
                description="Different project industries"
              />
            </div>

            {selectedSite && (
              <div
                className="
              mt-10 sm:mt-12
            "
              >
                <FeaturedProject
                  site={selectedSite}
                  onContact={openContact}
                  onSelect={handleProjectSelect}
                />
              </div>
            )}
          </div>
        </section>

        {/* =================================================
        PROJECTS
    ================================================= */}

        <section
          className="
        bg-[#f7faf9]
        px-5 py-14
        dark:bg-[#0b2033]
        sm:px-10 sm:py-16
        lg:px-12 lg:py-20
      "
        >
          <div className="mx-auto max-w-7xl">
            <div>

              <div
                className="
                  mt-2
                  flex flex-col gap-3
                  lg:flex-row
                  lg:items-end
                  lg:justify-between
                "
              >
                <div>
                  <h2
                    className="
                      !text-4xl
                      font-black
                      tracking-tight
                      text-[#0C2C50]
                      dark:text-white
                      sm:text-4xl
                    "
                  >
                    Explore our projects
                  </h2>

                  <p
                    className="
                  mt-3 max-w-xl
                  text-sm leading-6
                  text-slate-500
                  dark:text-slate-400
                "
                  >
                    Search a project or choose a category to quickly find the
                    demo you want to explore.
                  </p>
                </div>

                {categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen((value) => !value)}
                    className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4 py-3
                  text-xs
                  font-extrabold
                  text-[#0C2C50]
                  dark:border-slate-700
                  dark:bg-[#102a43]
                  dark:text-white
                  lg:hidden
                "
                  >
                    <ChevronDown
                      size={15}
                      className={
                        mobileFiltersOpen
                          ? "rotate-180 transition"
                          : "transition"
                      }
                    />
                    Browse Categories
                  </button>
                )}
              </div>
            </div>

            <div
              className="
                mt-7
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-3
                shadow-sm
                dark:border-slate-700
                dark:bg-[#102a43]
                sm:p-4
              "
            >
              <div
                className="
                  flex flex-col gap-3
                  lg:flex-row
                  lg:items-center
                "
              >
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="
                      pointer-events-none
                      absolute left-4 top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search projects, categories or technologies..."
                    className="
                      h-12 w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      pl-11 pr-11
                      text-sm
                      font-medium
                      text-[#0C2C50]
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-[#2E9E6D]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#2E9E6D]/10
                      dark:border-slate-700
                      dark:bg-[#0b2033]
                      dark:text-white
                      dark:focus:bg-[#102a43]
                    "
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="
                        absolute right-3 top-1/2
                        -translate-y-1/2
                        rounded-lg
                        p-1.5
                        text-slate-400
                        hover:bg-slate-100
                        hover:text-slate-700
                        dark:hover:bg-slate-700
                      "
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div
                  className="
                    flex items-center
                    justify-between
                    gap-3
                    lg:min-w-[150px]
                  "
                >
                  <div>
                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-slate-400
                      "
                    >
                      Results
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-sm
                        font-black
                        text-[#0C2C50]
                        dark:text-white
                      "
                    >
                      {loading ? "..." : formatNumber(filteredSites.length)}
                    </p>
                  </div>

                  {(searchQuery || activeCategory !== "All") && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="
                        text-[10px]
                        font-extrabold
                        uppercase
                        tracking-[0.1em]
                        text-[#2E9E6D]
                        hover:underline
                      "
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div
                className="
                  mt-3
                  hidden gap-2
                  overflow-x-auto
                  pb-1
                  lg:flex
                "
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryChange(category)}
                    className={`
                    shrink-0
                    whitespace-nowrap
                    rounded-xl
                    px-4 py-2.5
                    text-[10px]
                    font-extrabold
                    transition
                    ${
                      activeCategory === category
                        ? "bg-[#0C2C50] text-white shadow-md dark:bg-[#2E9E6D]"
                        : "border border-slate-200 bg-slate-50 text-slate-500 hover:border-[#2E9E6D]/30 hover:bg-white hover:text-[#2E9E6D] dark:border-slate-700 dark:bg-[#0b2033] dark:text-slate-400"
                    }
                  `}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {mobileFiltersOpen && categories.length > 1 && (
                <div
                  className="
                  mt-3 flex gap-2
                  overflow-x-auto
                  border-t
                  border-slate-100
                  pt-3
                  dark:border-slate-700
                  lg:hidden
                "
                >
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryChange(category)}
                      className={`
                        shrink-0
                        whitespace-nowrap
                        rounded-xl
                        px-4 py-2.5
                        text-[10px]
                        font-extrabold
                        transition
                        ${
                          activeCategory === category
                            ? "bg-[#0C2C50] text-white dark:bg-[#2E9E6D]"
                            : "border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-[#0b2033]"
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading && (
              <div
                className="
              mt-6
              grid grid-cols-1
              gap-5
              sm:grid-cols-2
              lg:grid-cols-3
            "
              >
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {!loading && error && (
              <div
                className="
                mt-8
                rounded-3xl
                border
                border-rose-200
                bg-rose-50
                p-8
                dark:border-rose-900/60
                dark:bg-rose-950/30
              "
              >
                <div className="mx-auto max-w-xl text-center">
                  <div
                    className="
                    mx-auto
                    flex h-12 w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-white
                    text-rose-500
                    shadow-sm
                    dark:bg-[#102a43]
                  "
                  >
                    <RefreshCw size={20} />
                  </div>

                  <h3
                    className="
                    mt-4
                    text-base
                    font-black
                    text-rose-800
                    dark:text-rose-200
                  "
                  >
                    Unable to load demos
                  </h3>

                  <p
                    className="
                    mt-2
                    text-xs
                    leading-6
                    text-rose-600
                    dark:text-rose-300
                  "
                  >
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadDemos}
                    className="
                    mt-5
                    inline-flex
                    items-center gap-2
                    rounded-xl
                    bg-[#0C2C50]
                    px-5 py-3
                    text-xs
                    font-extrabold
                    text-white
                    transition
                    hover:bg-[#2E9E6D]
                  "
                  >
                    <RefreshCw size={14} />
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredSites.length > 0 ? (
                  <>
                    <div
                      className="
                      mt-6
                      flex items-center
                      justify-between
                      gap-3
                    "
                    >
                      <p
                        className="
                        text-xs
                        font-semibold
                        text-slate-500
                        dark:text-slate-400
                      "
                      >
                        Showing{" "}
                        <span
                          className="
                          font-black
                          text-[#0C2C50]
                          dark:text-white
                        "
                        >
                          {formatNumber(filteredSites.length)}
                        </span>{" "}
                        {filteredSites.length === 1 ? "project" : "projects"}
                      </p>

                      {activeCategory !== "All" && (
                        <span
                          className="
                          rounded-full
                          bg-[#eaf7f1]
                          px-2.5 py-1
                          text-[9px]
                          font-extrabold
                          text-[#2E9E6D]
                          dark:bg-[#173d35]
                          dark:text-[#72d3aa]
                        "
                        >
                          {activeCategory}
                        </span>
                      )}
                    </div>

                    <div
                      className="
                      mt-4
                      grid grid-cols-1
                      gap-5
                      sm:grid-cols-2
                      sm:gap-6
                      lg:grid-cols-3
                    "
                    >
                      {filteredSites.map((site) => (
                        <SiteCard
                          key={site.id}
                          site={site}
                          isSelected={selectedSite?.id === site.id}
                          onSelect={handleProjectSelect}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div
                    className="
                    mt-8
                    rounded-3xl
                    border
                    border-dashed
                    border-slate-300
                    bg-white
                    px-6 py-14
                    text-center
                    dark:border-slate-700
                    dark:bg-[#102a43]
                  "
                  >
                    <div
                      className="
                      mx-auto
                      flex h-14 w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-100
                      text-slate-400
                      dark:bg-slate-800
                    "
                    >
                      <Search size={22} />
                    </div>

                    <h3
                      className="
                      mt-5
                      text-lg
                      font-black
                      text-[#0C2C50]
                      dark:text-white
                    "
                    >
                      No projects found
                    </h3>

                    <p
                      className="
                      mx-auto mt-2
                      max-w-md
                      text-xs leading-6
                      text-slate-500
                      dark:text-slate-400
                    "
                    >
                      No demo matches your current search or category. Try
                      another keyword or reset the filters.
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="
                      mt-5
                      inline-flex
                      items-center gap-2
                      rounded-xl
                      bg-[#0C2C50]
                      px-5 py-3
                      text-xs
                      font-extrabold
                      text-white
                      transition
                      hover:bg-[#2E9E6D]
                    "
                    >
                      Reset Filters
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* =================================================
        HOW IT WORKS
    ================================================= */}

        <section
          className="
            bg-white
            px-5 py-16
            dark:bg-[#081a2b]
            sm:px-10 sm:py-20
            lg:px-12 lg:py-24
          "
        >
          <div className="mx-auto max-w-7xl">
            <div
              className="
                mx-auto
                max-w-2xl
                text-center
              "
            >

              <h2
                className="
                  mt-3
                  !text-4xl
                  font-black
                  tracking-tight
                  text-[#0C2C50]
                  dark:text-white
                  sm:text-4xl
                "
              >
                From preview to project
              </h2>

              <p
                className="
                  mt-4
                  text-sm
                  leading-7
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Explore a real demo first, understand the experience, then
                contact us for your own solution.
              </p>
            </div>

            <div
              className="
                mt-10
                grid grid-cols-1
                gap-4
                md:grid-cols-3
                md:gap-5
              "
            >
              {[
                {
                  number: "01",
                  title: "Choose a project",
                  text: "Find a live demo that matches your industry, idea or application requirement.",
                },
                {
                  number: "02",
                  title: "Explore the experience",
                  text: "Review the interface, navigation, features and overall user journey.",
                },
                {
                  number: "03",
                  title: "Contact our team",
                  text: "Call, WhatsApp or email us when you are ready to discuss your own project.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="
                  group relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-6
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  dark:border-slate-700
                  dark:bg-[#102a43]
                "
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="
                      text-4xl
                      font-black
                      text-[#2E9E6D]/20
                      transition
                      group-hover:text-[#2E9E6D]/35
                    "
                    >
                      {item.number}
                    </span>

                    <div
                      className="
                      flex h-9 w-9
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#eaf7f1]
                      text-[#2E9E6D]
                      dark:bg-[#173d35]
                    "
                    >
                      <ArrowRight size={15} />
                    </div>
                  </div>

                  <h3
                    className="
                    mt-5
                    text-base
                    font-black
                    text-[#0C2C50]
                    dark:text-white
                  "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                    mt-2
                    text-xs
                    leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="
                mt-8 overflow-hidden
                rounded-3xl
                border
                border-[#2E9E6D]/20
                bg-[#f1faf6]
                p-6
                dark:border-[#2E9E6D]/20
                dark:bg-[#12352f]
                sm:p-8
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-6
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                <div className="max-w-2xl">

                  <h3
                    className="
                      mt-2
                      !text-3xl
                      font-black
                      text-[#0C2C50]
                      dark:text-white
                    "
                  >
                    Let's discuss your project.
                  </h3>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-6
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    Need a website, dashboard, business application or a custom
                    solution? Contact our team directly.
                  </p>

                  <a
                    href={"tel:" + CONTACT.phone}
                    className="
                      mt-4
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      font-black
                      text-[#0C2C50]
                      hover:text-[#2E9E6D]
                      dark:text-white
                    "
                  >
                    <Phone size={15} className="text-[#2E9E6D]" />

                    {CONTACT.phoneDisplay}
                  </a>
                </div>

                <div className="w-full sm:w-auto">
                  <ContactTrigger
                    onClick={openContact}
                    label="Open Contact Options"
                    fullWidth
                  />
                </div>
              </div>

              <div
                className="
                  mt-6
                  grid gap-3
                  border-t
                  border-[#2E9E6D]/10
                  pt-5
                  sm:grid-cols-3
                "
              >
                <a
                  href={"tel:" + CONTACT.phone}
                  className="
                    rounded-xl
                    border
                    border-[#2E9E6D]/10
                    bg-white/60
                    p-4
                    transition
                    hover:-translate-y-0.5
                    hover:bg-white
                    dark:bg-[#0f302a]/60
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-slate-400
                    "
                  >
                    Phone
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-extrabold
                      text-[#0C2C50]
                      dark:text-slate-200
                    "
                  >
                    {CONTACT.phoneDisplay}
                  </p>
                </a>

                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    rounded-xl
                    border
                    border-[#2E9E6D]/10
                    bg-white/60
                    p-4
                    transition
                    hover:-translate-y-0.5
                    hover:bg-white
                    dark:bg-[#0f302a]/60
                  "
                >
                  <p
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-slate-400
                    "
                  >
                    WhatsApp
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      font-extrabold
                      text-[#0C2C50]
                      dark:text-slate-200
                    "
                  >
                    Start a conversation
                  </p>
                </a>

                {CONTACT.email ? (
                  <a
                    href={"mailto:" + CONTACT.email}
                    className="
                      rounded-xl
                      border
                      border-[#2E9E6D]/10
                      bg-white/60
                      p-4
                      transition
                      hover:-translate-y-0.5
                      hover:bg-white
                      dark:bg-[#0f302a]/60
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-slate-400
                      "
                    >
                      Email
                    </p>

                    <p
                      className="
                        mt-1 truncate
                        text-xs
                        font-extrabold
                        text-[#0C2C50]
                        dark:text-slate-200
                      "
                    >
                      {CONTACT.email}
                    </p>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={openContact}
                    className="
                      rounded-xl
                      border
                      border-[#2E9E6D]/10
                      bg-white/60
                      p-4
                      text-left
                      transition
                      hover:-translate-y-0.5
                      hover:bg-white
                      dark:bg-[#0f302a]/60
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-slate-400
                      "
                    >
                      Email
                    </p>

                    <p
                      className="
                        mt-1 text-xs
                        font-extrabold
                        text-[#0C2C50]
                        dark:text-slate-200
                      "
                    >
                      Contact us for email
                    </p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <ContactModal open={contactOpen} onClose={closeContact} />
    </>
  );
}
