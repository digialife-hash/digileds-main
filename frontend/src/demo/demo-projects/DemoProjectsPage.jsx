import { extendDemo, useEffect, useMemo, useRef, useState } from "react";
import {
  Outlet,
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
  UNSAFE_RouteContext,
  useRoutes,
} from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileArchive,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  Moon,
  MoreVertical,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Settings2,
  Sparkles,
  Sun,
  Trash2,
  UploadCloud,
  Video,
  X,
} from "lucide-react";

import {
  SITE_API,
  PROJECT_TYPES,
  filterUploadableFiles,
  formatDate,
  formatRemaining,
  getProjectType,
  getUploadRelativePath,
} from "./utils.js";

import InlineMessage from "./components/InlineMessage.jsx";
import NotesPage from "./components/NotesPage.jsx";
import CrmSettingsPage from "./components/CrmSettingsPage.jsx";
import ProductsPage from "./components/ProductsPage.jsx";
import PortfolioPage from "./components/PortfolioPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import PageHeader from "./components/PageHeader.jsx";
import DemoRow from "./components/DemoRow.jsx";
import ProjectCard from "./components/ProjectCard.jsx";
import UploadPage from "./components/UploadPage.jsx";
import VisitorAnalyticsPage from "./components/VisitorAnalyticsPage.jsx";
import TeamPage from "./components/TeamPage.jsx";
import SubscriptionsPage from "./components/SubscriptionsPage.jsx";
import ContactEnquiriesPage from "./components/ContactEnquiriesPage.jsx";
import CareerApplicationsPage from "./components/CareerApplicationsPage.jsx";
import CareerSubmissionsPage from "./components/CareerSubmissionsPage.jsx";
import SecurityPage from "./components/SecurityPage.jsx";
import TenantManagementPage from "./components/TenantManagementPage.jsx";
import SocialDashboard from "../../social-post/components/dashboard/Dashboard.jsx";
import SocialCreatePost from "../../social-post/components/dashboard/CreatePost.jsx";
import SocialScheduledPosts from "../../social-post/components/dashboard/ScheduledPosts.jsx";
import SocialMediaLibrary from "../../social-post/components/dashboard/MediaLibrary.jsx";
import SocialPostHistory from "../../social-post/components/dashboard/PostHistory.jsx";
import SocialSocialAccounts from "../../social-post/components/dashboard/SocialAccounts.jsx";
import SocialEngagement from "../../social-post/components/dashboard/Engagement.jsx";
import SocialConnectedPlatforms from "../../social-post/components/dashboard/ConnectedPlatforms.jsx";
import SocialReconnectAccounts from "../../social-post/components/dashboard/ReconnectAccounts.jsx";
import SocialAnalytics from "../../social-post/components/dashboard/Analytics.jsx";
import SocialPlatformPerformance from "../../social-post/components/dashboard/PlatformPerformance.jsx";
import SocialAudience from "../../social-post/components/dashboard/Audience.jsx";
import SocialContentPerformance from "../../social-post/components/dashboard/ContentPerformance.jsx";
import SocialTeam from "../../social-post/components/dashboard/Team.jsx";
import SocialSecurity from "../../social-post/components/dashboard/Security.jsx";
import SocialSettings from "../../social-post/components/dashboard/Settings.jsx";
import SocialContentLibrary from "../../social-post/components/dashboard/ContentLibrary.jsx";
import SocialPublishingQueue from "../../social-post/components/dashboard/PublishingQueue.jsx";
import SocialHashtagResearch from "../../social-post/components/dashboard/HashtagResearch.jsx";
import SocialNotifications from "../../social-post/components/dashboard/Notifications.jsx";
import SocialPostProviders from "../../social-post/SocialPostProviders.jsx";
import EmbeddedCreatePost from "../../social-post/components/dashboard/CreatePost.jsx";
import SystemSuperAdminDashboard from "../../office-management/pages/dashboards/SystemSuperAdminDashboard.jsx";
import { officeRouteObjects } from "../../office-management/routes/officeRouteConfig.jsx";
import { AuthProvider } from "../../office-management/context/AuthContext.jsx";
import AdsManagementPage from "./components/AdsManagementPage.jsx";
import AddAdvertisementPage from "./components/AddAdvertisementPage.jsx";
import {
  EmptyState,
  SectionHeading,
  StatsGrid,
} from "./components/DashboardPrimitives.jsx";

const CREDENTIALS_KEY = "amit.admin.demo-credentials.v1";

const SECTION_IDS = [
  "demos",
  "projects",
  "upload",
  "products",
  "portfolio",
  "notes",
  "settings",
  "security",
  "analytics",
  "team",
  "subscriptions",
  "contact",
  "lead-applications",
  "career-applications",
  "social-overview",
  "social-create-post",
  "social-calendar",
  "social-media",
  "social-all-posts",
  "social-drafts",
  "social-scheduled",
  "social-published",
  "social-failed",
  "social-accounts",
  "social-platforms",
  "social-reconnect",
  "social-engagement",
  "social-analytics",
  "social-platform-performance",
  "social-audience",
  "social-content-performance",
  "social-content-library",
  "social-publishing-queue",
  "social-hashtags",
  "social-notifications",
  "social-settings",
  "social-team",
  "social-security",
  "office-dashboard",
  "tenants",
  "ads",
  "add-ad",
];

const EMBEDDED_OFFICE_BASE = "/admin/dashboard";
const OFFICE_ROUTE_BASE = "/office-management";

function isOfficeGuard(element) {
  const componentName = element?.type?.name;
  return (
    componentName === "OfficeProtectedRoute" ||
    componentName === "ProtectedRoute" ||
    componentName === "RoleProtectedRoute" ||
    componentName === "ProtectedLayout"
  );
}

function toOfficeInternalPath(path) {
  if (typeof path !== "string") return path;

  if (path === OFFICE_ROUTE_BASE) {
    return "/";
  }

  if (path.startsWith(`${OFFICE_ROUTE_BASE}/`)) {
    return path.slice(OFFICE_ROUTE_BASE.length);
  }

  if (path === "/") {
    return "/";
  }

  return path;
}

function prefixOfficeRoutePaths(routes) {
  return routes.map((route) => ({
    ...route,
    path: toOfficeInternalPath(route.path),
    element:
      route.children || isOfficeGuard(route.element) ? (
        <Outlet />
      ) : (
        route.element
      ),
    children: route.children
      ? prefixOfficeRoutePaths(route.children)
      : route.children,
  }));
}

const embeddedOfficeRouteObjects = prefixOfficeRoutePaths(officeRouteObjects);

function EmbeddedOfficeContent() {
  return useRoutes(embeddedOfficeRouteObjects);
}

function EmbeddedOfficeRoutes({ initialPath }) {
  const [location, setLocation] = useState(() => ({
    pathname: initialPath.pathname,
    search: initialPath.search,
    hash: "",
    state: null,
    key: "office-embedded",
  }));

  const updateLocation = (to, replace = false) => {
    const target =
      typeof to === "string"
        ? new URL(
            to,
            `http://office.local${location.pathname}${location.search}`,
          )
        : new URL(
            `${to.pathname || location.pathname}${to.search || ""}${to.hash || ""}`,
            "http://office.local",
          );
    const nextLocation = {
      pathname: toOfficeInternalPath(target.pathname),
      search: target.search,
      hash: target.hash,
      state: null,
      key: `${replace ? "replace" : "push"}-${Date.now()}`,
    };

    setLocation(nextLocation);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#office:${encodeURIComponent(
        `${nextLocation.pathname}${nextLocation.search}`,
      )}`,
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const navigator = useMemo(
    () => ({
      createHref: (to) => {
        if (typeof to === "string") {
          const target = new URL(
            to,
            `http://office.local${location.pathname}${location.search}`,
          );
          return `${toOfficeInternalPath(target.pathname)}${target.search}${target.hash}`;
        }

        return `${toOfficeInternalPath(to.pathname || location.pathname)}${
          to.search || ""
        }${to.hash || ""}`;
      },
      encodeLocation: (to) => to,
      go: () => {},
      push: (to) => updateLocation(to),
      replace: (to) => updateLocation(to, true),
    }),
    [location.pathname, location.search],
  );

  const navigationContext = useMemo(
    () => ({
      basename: "",
      navigator,
      static: false,
      future: {},
    }),
    [navigator],
  );

  const routeContext = useMemo(
    () => ({
      outlet: null,
      matches: [],
      isDataRoute: false,
    }),
    [],
  );

  return (
    <UNSAFE_NavigationContext.Provider value={navigationContext}>
      <UNSAFE_LocationContext.Provider
        value={{ location, navigationType: "PUSH" }}
      >
        <UNSAFE_RouteContext.Provider value={routeContext}>
          <EmbeddedOfficeContent />
        </UNSAFE_RouteContext.Provider>
      </UNSAFE_LocationContext.Provider>
    </UNSAFE_NavigationContext.Provider>
  );
}

function OfficeEmbeddedRoute({ section }) {
  const rawPath = decodeURIComponent(section.slice("office:".length));
  const queryIndex = rawPath.indexOf("?");
  const path = queryIndex === -1 ? rawPath : rawPath.slice(0, queryIndex);
  const search = queryIndex === -1 ? "" : rawPath.slice(queryIndex);

  return (
    <div className="office-embedded-page">
      <AuthProvider>
        <EmbeddedOfficeRoutes
          key={`${path}${search}`}
          initialPath={{
            pathname: toOfficeInternalPath(path),
            search,
          }}
        />
      </AuthProvider>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers       Logout   subscriptions                                                           */
/* -------------------------------------------------------------------------- */

function getSectionFromLocation() {
  if (typeof window === "undefined") {
    return "demos";
  }

  const hashSection = window.location.hash.replace(/^#/, "");

  if (
    SECTION_IDS.includes(hashSection) ||
    hashSection.startsWith("social-edit:") ||
    hashSection.startsWith("office:")
  ) {
    return hashSection;
  }

  try {
    const savedSection = window.localStorage.getItem(
      "amit.admin.selected-section",
    );

    if (
      SECTION_IDS.includes(savedSection) ||
      savedSection?.startsWith("social-edit:")
    ) {
      return savedSection;
    }
  } catch {}

  return "demos";
}

function readCredentials() {
  if (typeof window === "undefined") return {};

  try {
    const value = JSON.parse(
      window.sessionStorage.getItem(CREDENTIALS_KEY) || "{}",
    );
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function saveCredentials(credentials) {
  try {
    window.sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch {}
}

function uploadWithProgress(url, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data);
        } else {
          reject(new Error(data.message || "Upload failed."));
        }
      } catch {
        reject(new Error("Server returned an invalid response."));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error while uploading."));
    };

    xhr.ontimeout = () => {
      reject(new Error("Upload request timed out."));
    };

    xhr.send(formData);
  });
}

function formatDuration(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);

  return `${minutes}m ${String(seconds % 60).padStart(2, "0")}s`;
}

function SocialPostContentView({ section }) {
  if (section.startsWith("social-edit:")) {
    return (
      <EmbeddedCreatePost
        postId={decodeURIComponent(section.slice("social-edit:".length))}
      />
    );
  }

  switch (section) {
    case "social-overview":
      return <SocialDashboard />;
    case "social-create-post":
      return <SocialCreatePost />;
    case "social-calendar":
      return <SocialScheduledPosts />;
    case "social-media":
      return <SocialMediaLibrary />;
    case "social-all-posts":
      return <SocialPostHistory key={section} initialFilter="All" />;
    case "social-drafts":
      return <SocialPostHistory key={section} initialFilter="Draft" />;
    case "social-scheduled":
      return <SocialPostHistory key={section} initialFilter="Scheduled" />;
    case "social-published":
      return <SocialPostHistory key={section} initialFilter="Published" />;
    case "social-failed":
      return <SocialPostHistory key={section} initialFilter="Failed" />;
    case "social-accounts":
      return <SocialSocialAccounts />;
    case "social-platforms":
      return <SocialConnectedPlatforms />;
    case "social-reconnect":
      return <SocialReconnectAccounts />;
    case "social-engagement":
      return <SocialEngagement />;
    case "social-analytics":
      return <SocialAnalytics />;
    case "social-platform-performance":
      return <SocialPlatformPerformance />;
    case "social-audience":
      return <SocialAudience />;
    case "social-content-performance":
      return <SocialContentPerformance />;
    case "social-content-library":
      return <SocialContentLibrary />;
    case "social-publishing-queue":
      return <SocialPublishingQueue />;
    case "social-hashtags":
      return <SocialHashtagResearch />;
    case "social-notifications":
      return <SocialNotifications />;
    case "social-settings":
      return <SocialSettings />;
    case "social-team":
      return <SocialTeam />;
    case "social-security":
      return <SocialSecurity />;
    default:
      return null;
  }
}

function SocialPostContent({ section }) {
  return <EmbeddedSocialContent section={section} />;
}

function socialSectionToPath(section) {
  if (section.startsWith("social-edit:")) {
    return `/dashboard/posts/${encodeURIComponent(
      section.slice("social-edit:".length),
    )}/edit`;
  }

  const paths = {
    "social-overview": "/dashboard",
    "social-create-post": "/dashboard/create-post",
    "social-calendar": "/dashboard/calendar",
    "social-media": "/dashboard/media",
    "social-all-posts": "/dashboard/posts",
    "social-drafts": "/dashboard/posts/drafts",
    "social-scheduled": "/dashboard/posts/scheduled",
    "social-published": "/dashboard/posts/published",
    "social-failed": "/dashboard/posts/failed",
    "social-accounts": "/dashboard/social-accounts",
    "social-platforms": "/dashboard/social-accounts/platforms",
    "social-reconnect": "/dashboard/social-accounts/reconnect",
    "social-engagement": "/dashboard/engagement",
    "social-analytics": "/dashboard/analytics",
    "social-platform-performance": "/dashboard/platform-performance",
    "social-audience": "/dashboard/audience",
    "social-content-performance": "/dashboard/content-performance",
    "social-content-library": "/dashboard/content-library",
    "social-publishing-queue": "/dashboard/publishing-queue",
    "social-hashtags": "/dashboard/hashtags",
    "social-notifications": "/dashboard/notifications",
    "social-settings": "/dashboard/settings",
    "social-team": "/dashboard/team",
    "social-security": "/dashboard/security",
  };
  return paths[section] || "/dashboard";
}

function socialPathToSection(pathname) {
  if (/^\/dashboard\/posts\/[^/]+\/edit$/.test(pathname)) {
    const postId = pathname.split("/")[3];
    return `social-edit:${decodeURIComponent(postId)}`;
  }
  const paths = {
    "/dashboard": "social-overview",
    "/dashboard/create-post": "social-create-post",
    "/dashboard/calendar": "social-calendar",
    "/dashboard/media": "social-media",
    "/dashboard/posts": "social-all-posts",
    "/dashboard/posts/drafts": "social-drafts",
    "/dashboard/posts/scheduled": "social-scheduled",
    "/dashboard/posts/published": "social-published",
    "/dashboard/posts/failed": "social-failed",
    "/dashboard/social-accounts": "social-accounts",
    "/dashboard/social-accounts/platforms": "social-platforms",
    "/dashboard/social-accounts/reconnect": "social-reconnect",
    "/dashboard/engagement": "social-engagement",
    "/dashboard/analytics": "social-analytics",
    "/dashboard/platform-performance": "social-platform-performance",
    "/dashboard/audience": "social-audience",
    "/dashboard/content-performance": "social-content-performance",
    "/dashboard/content-library": "social-content-library",
    "/dashboard/publishing-queue": "social-publishing-queue",
    "/dashboard/hashtags": "social-hashtags",
    "/dashboard/notifications": "social-notifications",
    "/dashboard/settings": "social-settings",
    "/dashboard/team": "social-team",
    "/dashboard/security": "social-security",
  };
  return paths[pathname] || "social-overview";
}

function EmbeddedSocialContent({ section }) {
  const [location, setLocation] = useState(() => ({
    pathname: socialSectionToPath(section),
    search: "",
    hash: "",
    state: null,
    key: "social-embedded",
  }));

  useEffect(() => {
    setLocation((current) => ({
      ...current,
      pathname: socialSectionToPath(section),
    }));
  }, [section]);

  const updateLocation = (to, replace = false) => {
    const target =
      typeof to === "string"
        ? new URL(
            to,
            `http://social.local${location.pathname}${location.search}`,
          )
        : new URL(
            `${to.pathname || location.pathname}${to.search || ""}${to.hash || ""}`,
            "http://social.local",
          );
    const nextPath = target.pathname;
    const nextSection = socialPathToSection(nextPath);
    const nextLocation = {
      pathname: nextPath,
      search: target.search,
      hash: target.hash,
      state: null,
      key: `${replace ? "replace" : "push"}-${Date.now()}`,
    };

    setLocation(nextLocation);
    window.localStorage.setItem("amit.admin.selected-section", nextSection);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${target.search}#${nextSection}`,
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const navigator = useMemo(
    () => ({
      createHref: (to) =>
        typeof to === "string"
          ? to
          : `${to.pathname || location.pathname}${to.search || ""}${to.hash || ""}`,
      encodeLocation: (to) => to,
      go: () => {},
      push: (to) => updateLocation(to),
      replace: (to) => updateLocation(to, true),
    }),
    [location.pathname, location.search],
  );

  const navigationContext = useMemo(
    () => ({ basename: "", navigator, static: false, future: {} }),
    [navigator],
  );
  const routeContext = useMemo(
    () => ({ outlet: null, matches: [], isDataRoute: false }),
    [],
  );
  const content = <SocialPostContentView section={section} />;

  return (
    <UNSAFE_NavigationContext.Provider value={navigationContext}>
      <UNSAFE_LocationContext.Provider
        value={{ location, navigationType: "PUSH" }}
      >
        <UNSAFE_RouteContext.Provider value={routeContext}>
          <SocialPostProviders>{content}</SocialPostProviders>
        </UNSAFE_RouteContext.Provider>
      </UNSAFE_LocationContext.Provider>
    </UNSAFE_NavigationContext.Provider>
  );
}

function setRelativePath(file, relativePath) {
  try {
    Object.defineProperty(file, "webkitRelativePath", {
      configurable: true,
      value: relativePath,
    });
  } catch {}

  return file;
}

function readDroppedEntry(entry, parentPath = "") {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file(
        (file) => {
          resolve([setRelativePath(file, `${parentPath}${entry.name}`)]);
        },
        () => resolve([]),
      );
    });
  }

  if (!entry.isDirectory) {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    const reader = entry.createReader();

    const files = [];

    const readBatch = () => {
      reader.readEntries(
        async (entries) => {
          if (!entries.length) {
            resolve(files);
            return;
          }

          const batch = await Promise.all(
            entries.map((child) =>
              readDroppedEntry(child, `${parentPath}${entry.name}/`),
            ),
          );

          files.push(...batch.flat());

          readBatch();
        },
        () => resolve(files),
      );
    };

    readBatch();
  });
}

function normaliseDemo(demo, credentials) {
  if (!demo?.id || !demo?.url) {
    return null;
  }

  const stored = credentials[demo.id];
  const serverCredentials = demo.credentials;

  const hasPassword =
    typeof stored?.password === "string" && stored.password.length > 0;

  const versionMatches =
    !stored?.credentialVersion ||
    !demo.credentialVersion ||
    Number(stored.credentialVersion) === Number(demo.credentialVersion);

  const usernameMatches =
    !stored?.username ||
    !demo.accessUsername ||
    stored.username === demo.accessUsername;

  return {
    ...demo,
    credentials: serverCredentials?.password
      ? serverCredentials
      : hasPassword && versionMatches && usernameMatches
        ? stored
        : undefined,
  };
}

function getStatusInfo(demo) {
  const health = demo.containerHealth?.health;

  const status =
    health && health !== "unknown"
      ? health
      : demo.containerHealth?.status || demo.status || "unknown";

  if (status === "healthy" || status === "running") {
    return {
      label: status,
      className:
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
      dot: "bg-emerald-500",
    };
  }

  if (
    status === "starting" ||
    status === "created" ||
    status === "restarting"
  ) {
    return {
      label: status,
      className:
        "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
      dot: "bg-amber-500",
    };
  }

  if (status === "stopped" || status === "expired" || status === "error") {
    return {
      label: status,
      className:
        "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/20",
      dot: "bg-red-500",
    };
  }

  return {
    label: status,
    className:
      "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
    dot: "bg-slate-400",
  };
}

function SectionIcon({ section }) {
  if (section === "demos") {
    return <LayoutDashboard size={17} />;
  }

  if (section === "projects") {
    return <Database size={17} />;
  }

  if (section === "upload") {
    return <UploadCloud size={17} />;
  }

  if (section === "settings") {
    return <Settings2 size={17} />;
  }

  return <FileArchive size={17} />;
}

/* -------------------------------------------------------------------------- */
/* Video helpers                                                              */
/* -------------------------------------------------------------------------- */

function normaliseVideoPath(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  return value.trim();
}

function buildVideoCandidates(project) {
  if (!project?.id) {
    return [];
  }

  const video = project.video || {};

  const candidates = [];

  const possibleValues = [
    video.url,
    video.videoUrl,
    video.publicUrl,
    video.path,
    video.filePath,
    video.location,
    video.src,
  ];

  for (const rawValue of possibleValues) {
    const value = normaliseVideoPath(rawValue);

    if (!value) continue;

    if (/^https?:\/\//i.test(value)) {
      candidates.push(value);
      continue;
    }

    if (value.startsWith("/")) {
      candidates.push(`${SITE_API}${value}`);
      continue;
    }

    candidates.push(`${SITE_API}/${value.replace(/^\/+/, "")}`);
  }

  const endpoint = `${SITE_API}/api/demo-proxy/projects/${encodeURIComponent(
    project.id,
  )}/video`;

  candidates.push(endpoint);

  return [...new Set(candidates.filter(Boolean))];
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

function _LegacySidebar({
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  selectSection,
  activeDemos,
  projects,
}) {
  const navItems = [
    {
      id: "demos",
      label: "Live demos",
      count: activeDemos.length,
    },
    {
      id: "projects",
      label: "Projects",
      count: projects.length,
    },
    {
      id: "upload",
      label: "Upload project",
    },
    {
      id: "notes",
      label: "Notes & roles",
      badge: "KB",
    },
    {
      id: "settings",
      label: "CRM settings",
    },
  ];

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm transition md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[285px] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950">
              <Sparkles size={19} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-slate-950 dark:text-white">
                Admin Control
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 md:hidden dark:hover:bg-slate-900 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = activeSection === item.id;

              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(event) => selectSection(event, item.id)}
                  className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active
                        ? "bg-white/10 dark:bg-slate-950/10"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                    }`}
                  >
                    <SectionIcon section={item.id} />
                  </span>

                  <span className="flex-1">{item.label}</span>

                  {typeof item.count === "number" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        active
                          ? "bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        active
                          ? "bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <ShieldCheck size={15} />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Admin API protected
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Passwords are never returned by the server after create or
                  rotate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function _LegacyPageHeader({
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  theme,
  toggleTheme,
  refreshing,
  refreshAll,
}) {
  const title =
    activeSection === "notes"
      ? "Workspace notes"
      : activeSection === "settings"
        ? "CRM settings"
        : activeSection === "projects"
          ? "Project library"
          : activeSection === "upload"
            ? "Upload a project"
            : "Admin control center";

  const subtitle =
    activeSection === "notes"
      ? "Roles, architecture and operating instructions for your team."
      : activeSection === "settings"
        ? "Manage live site configuration, contacts, social links, assets and payments."
        : activeSection === "projects"
          ? "Manage source projects and launch isolated live environments."
          : activeSection === "upload"
            ? "Upload a complete project folder and prepare it for live demos."
            : "Monitor, access and safely clean up every customer demo.";

  return (
    <header className="mb-6">
      {" "}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-950">
        {" "}
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden dark:border-slate-800 dark:text-slate-200"
            aria-expanded={mobileMenuOpen}
          >
            {" "}
            <Menu size={18} />{" "}
          </button>

          <div className="min-w-0">
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              {activeSection === "notes"
                ? "TEAM KNOWLEDGE BASE"
                : "OPERATIONS / LIVE ENVIRONMENTS"}
            </div>

            <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">
              {title}
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}

            <span className="hidden sm:inline">
              {theme === "dark" ? "Light" : "Dark"}
            </span>
          </button>

          <button
            type="button"
            onClick={refreshAll}
            disabled={refreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : undefined}
            />

            <span className="hidden sm:inline">
              {refreshing ? "Refreshing..." : "Refresh all"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                      */
/* -------------------------------------------------------------------------- */

function _LegacyStatsGrid({ activeDemos, healthyDemos, projects }) {
  const stats = [
    {
      title: "Live demos",
      value: activeDemos.length,
      caption: "All active sessions",
      icon: LayoutDashboard,
      iconClass:
        "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    },
    {
      title: "Healthy containers",
      value: healthyDemos.length,
      caption: "Docker runtime status",
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    },
    {
      title: "Projects",
      value: projects.length,
      caption: "Ready to launch",
      icon: Database,
      iconClass:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    },
    {
      title: "Credential policy",
      value: "Safe",
      caption: "Passwords browser-only",
      icon: ShieldCheck,
      iconClass:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${stat.iconClass}`}
              >
                <Icon size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </p>

                <strong className="mt-0.5 block text-xl font-black text-slate-950 dark:text-white">
                  {stat.value}
                </strong>

                <p className="text-[11px] text-slate-400">{stat.caption}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section heading                                                            */
/* -------------------------------------------------------------------------- */

function _LegacySectionHeading({ eyebrow, title, description, count }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      {" "}
      <div>
        {" "}
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          {eyebrow}{" "}
        </p>
        <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
      {count && (
        <div className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {count}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty state                                                                */
/* -------------------------------------------------------------------------- */

function _LegacyEmptyState({ icon: Icon = Search, title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
      {" "}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
        {" "}
        <Icon size={22} />{" "}
      </div>
      <h3 className="mt-5 text-base font-bold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Demo row                                                                   */
/* -------------------------------------------------------------------------- */

function LegacyDemoRow({ demo, onRotate, onDelete, onCopy, onOpen }) {
  const [confirming, setConfirming] = useState(false);

  const [busy, setBusy] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const [now, setNow] = useState(Date.now());

  const menuRef = useRef(null);

  const remaining = Math.max(0, new Date(demo.expiresAt).getTime() - now);

  const status = getStatusInfo(demo);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutside);

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);

      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  async function rotate() {
    setMenuOpen(false);
    setBusy("rotate");

    try {
      await onRotate(demo.id);
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    setBusy("delete");

    try {
      await onDelete(demo.id);
    } finally {
      setBusy("");
      setConfirming(false);
    }
  }

  const username = demo.accessUsername || demo.credentials?.username || "";

  return (
    <article className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:p-5 dark:border-slate-800 dark:bg-slate-950">
      {" "}
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1.35fr_0.9fr_1fr_1.25fr_auto] xl:items-center">
        {" "}
        <div className="min-w-0">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {getProjectType(demo.projectType).icon}{" "}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                {demo.projectName || "Unnamed project"}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  {demo.projectType || "unknown"}
                </span>

                <code className="max-w-full truncate text-[10px] text-slate-400">
                  {demo.id}
                </code>
              </div>
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Live URL
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={demo.url}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 max-w-full truncate text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              title={demo.url}
            >
              {demo.url}
            </a>

            <button
              type="button"
              onClick={() => onCopy(demo.id, demo.url, "link")}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <Copy size={12} />

              {demo.copied === "link" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Health
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${status.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />

            {status.label}
          </span>

          <p className="mt-1 text-[11px] text-slate-400">
            {demo.containerHealth?.running === false
              ? "Container not running"
              : "Container online"}
          </p>
        </div>
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Expiry
          </div>

          <p className="text-sm font-bold text-slate-950 dark:text-white">
            {formatRemaining(remaining)}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Expires {formatDate(demo.expiresAt)}
          </p>

          <p className="text-[11px] text-slate-400">
            Created {formatDate(demo.createdAt)}
          </p>
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Credentials
          </div>

          {demo.credentials?.password ? (
            <div className="space-y-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <code className="max-w-full truncate rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {username || "No username"}
                </code>

                <button
                  type="button"
                  disabled={!username}
                  onClick={() => onCopy(demo.id, username, "username")}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-900 dark:hover:text-white"
                  title="Copy username"
                >
                  <Copy size={12} />
                </button>
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <code className="max-w-full truncate rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {demo.credentials.password}
                </code>

                <button
                  type="button"
                  onClick={() =>
                    onCopy(demo.id, demo.credentials.password, "password")
                  }
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"
                  title="Copy password"
                >
                  <Copy size={12} />
                </button>
              </div>

              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Password available until this page is refreshed
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Password unavailable
              </p>

              <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                This browser did not create this demo's password.
              </p>
            </div>
          )}
        </div>
        <div
          className="relative flex justify-end self-start xl:self-center"
          ref={menuRef}
        >
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            disabled={Boolean(busy)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpen(demo);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <ExternalLink size={14} />
                Open live demo
              </button>

              <button
                type="button"
                onClick={rotate}
                disabled={Boolean(busy)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                <RotateCcw size={14} />

                {busy === "rotate" ? "Rotating..." : "Rotate credentials"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirming(true);
                }}
                disabled={Boolean(busy)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                Delete demo
              </button>
            </div>
          )}
        </div>
      </div>
      {confirming && (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-red-500/20 dark:bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
            />

            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                Delete this demo?
              </p>

              <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                The running demo environment will be removed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-red-500/20 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={remove}
              disabled={busy === "delete"}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {busy === "delete" && (
                <LoaderCircle size={13} className="animate-spin" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Project video                                                              */
/* -------------------------------------------------------------------------- */

function LegacyProjectVideo({ project, projectVideoUrl }) {
  const candidates = useMemo(() => {
    const all = buildVideoCandidates(project);

    if (projectVideoUrl && !all.includes(projectVideoUrl)) {
      return [projectVideoUrl, ...all];
    }

    return all;
  }, [project, projectVideoUrl]);

  const [sourceIndex, setSourceIndex] = useState(0);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSourceIndex(0);
    setLoaded(false);
  }, [project.id, projectVideoUrl]);

  const currentSource = candidates[sourceIndex];

  if (!currentSource) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center bg-slate-50 px-5 text-center dark:bg-slate-900/50">
        {" "}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
          {" "}
          <Video size={21} />{" "}
        </div>
        <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
          Video unavailable
        </p>
        <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
          The project has a video entry, but a valid playback URL could not be
          generated.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden bg-black">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950">
          {" "}
          <LoaderCircle size={24} className="animate-spin text-white/70" />
          <span className="mt-2 text-[11px] font-semibold text-white/60">
            Loading video...
          </span>
        </div>
      )}

      <video
        key={currentSource}
        src={currentSource}
        controls
        preload="metadata"
        playsInline
        className="h-full w-full object-contain"
        onLoadedMetadata={() => setLoaded(true)}
        onCanPlay={() => setLoaded(true)}
        onError={() => {
          setLoaded(false);

          if (sourceIndex < candidates.length - 1) {
            setSourceIndex((value) => value + 1);
          }
        }}
      />

      <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
        Project video
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Project card                                                               */
/* -------------------------------------------------------------------------- */

function _LegacyProjectCard({
  project,
  onCreateDemo,
  creating,
  onChangeType,
  onDownload,
  onDelete,
  onReplaceVideo,
  onDeleteVideo,
  busy,
  error,
  confirming,
  setDeleteProjectId,
  getProjectVideoUrl,
}) {
  const type = getProjectType(project.type);

  const videoUrl = getProjectVideoUrl(project);

  const hasVideo = Boolean(project.video || videoUrl);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-950">
      {/* Card header */}{" "}
      <div className="border-b border-slate-100 p-5 dark:border-slate-900">
        {" "}
        <div className="flex items-start justify-between gap-3">
          {" "}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                type.className ||
                "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {type.icon}{" "}
            </div>

            <div>
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                {type.label}
              </span>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              project.hasDockerfile
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
            }`}
          >
            {project.hasDockerfile ? "Docker ready" : "Auto build"}
          </span>
        </div>
        <h3 className="mt-4 break-words text-lg font-black tracking-tight text-slate-950 dark:text-white">
          {project.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {project.description || "Ready for an isolated live preview."}
        </p>
      </div>
      {/* Video */}
      <div className="bg-slate-50 dark:bg-slate-900/50">
        {hasVideo ? (
          <LegacyProjectVideo project={project} projectVideoUrl={videoUrl} />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
              <Video size={21} />
            </div>

            <p className="mt-3 text-sm font-bold text-slate-600 dark:text-slate-300">
              No video attached
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
              Add a product walkthrough or demo preview.
            </p>
          </div>
        )}
      </div>
      {/* Card body */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Project ID
            </span>

            <code className="mt-1 block truncate text-xs font-semibold text-slate-700 dark:text-slate-300">
              {project.id}
            </code>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Runtime
            </span>

            <strong className="mt-1 block text-xs text-slate-700 dark:text-slate-300">
              {project.hasDockerfile ? "Dockerfile" : "Auto build"}
            </strong>
          </div>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
            Project type
          </span>

          <select
            value={project.typeIsManual ? project.type : "auto"}
            onChange={(event) => onChangeType(project.id, event.target.value)}
            disabled={busy}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            {PROJECT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <div className="mt-3">
            <InlineMessage variant="error">{error}</InlineMessage>
          </div>
        )}

        <button
          type="button"
          onClick={() => onCreateDemo(project.id)}
          disabled={busy}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {creating ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Play size={15} fill="currentColor" />
          )}

          {creating ? "Starting..." : "View live demo"}

          {!creating && <ChevronRight size={15} />}
        </button>

        {/* Video actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              busy
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:bg-slate-50"
            } border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900`}
          >
            {project.video ? "Replace video" : "Add video"}

            <input
              type="file"
              accept="video/*"
              hidden
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  onReplaceVideo(project.id, file);
                }

                event.target.value = "";
              }}
            />
          </label>

          {project.video && (
            <button
              type="button"
              onClick={() => onDeleteVideo(project.id)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              {projectBusyIsVideo(project.id, busy) ? (
                <LoaderCircle size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              Delete video
            </button>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-900">
          <button
            type="button"
            onClick={() => onDownload(project)}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 dark:hover:bg-slate-900 dark:hover:text-white"
          >
            {busy === "download" ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <Download size={13} />
            )}

            {busy === "download" ? "Downloading..." : "Download"}
          </button>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setDeleteProjectId(project.id)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Trash2 size={13} />
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-slate-400">
                Delete?
              </span>

              <button
                type="button"
                onClick={() => onDelete(project)}
                disabled={busy === "delete"}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy === "delete" ? "..." : "Yes"}
              </button>

              <button
                type="button"
                onClick={() => setDeleteProjectId("")}
                className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function projectBusyIsVideo(projectId, busy) {
  return busy === "video" && Boolean(projectId);
}

/* -------------------------------------------------------------------------- */
/* Main                                                                        */
/* -------------------------------------------------------------------------- */

export default function DemoProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [demos, setDemos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [pageError, setPageError] = useState("");

  const [demoError, setDemoError] = useState("");

  const [creating, setCreating] = useState("");

  const [uploading, setUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadFiles, setUploadFiles] = useState([]);

  useEffect(() => {
    // Remove credentials saved by older builds from persistent browser storage.
    window.localStorage.removeItem(CREDENTIALS_KEY);
  }, []);

  const [projectVideo, setProjectVideo] = useState(null);

  const [videoStorage, setVideoStorage] = useState("local");

  const [uploadType, setUploadType] = useState("auto");

  const [selectedFolderName, setSelectedFolderName] = useState("");

  const [selectedFolderSize, setSelectedFolderSize] = useState(0);

  const [uploadMessage, setUploadMessage] = useState({
    type: "",
    text: "",
  });

  const [uploadStage, setUploadStage] = useState("idle");

  const [uploadElapsed, setUploadElapsed] = useState(0);

  const [dragActive, setDragActive] = useState(false);

  const [projectBusy, setProjectBusy] = useState("");

  const [projectError, setProjectError] = useState({});

  const [deleteProjectId, setDeleteProjectId] = useState("");

  const [activeSection, setActiveSection] = useState(getSectionFromLocation);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    return (
      window.localStorage.getItem("theme-mode") ||
      document.documentElement.getAttribute("data-theme") ||
      "light"
    );
  });

  const [searchQuery, setSearchQuery] = useState("");

  const fileInputRef = useRef(null);

  const activeDemos = useMemo(
    () => demos.filter((demo) => demo.status !== "expired"),
    [demos],
  );

  const healthyDemos = activeDemos.filter(
    (demo) =>
      demo.containerHealth?.health === "healthy" ||
      (!demo.containerHealth?.health &&
        demo.containerHealth?.status === "running"),
  );

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) =>
      [project.name, project.id, project.description, project.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [projects, searchQuery]);

  /* ---------------------------------------------------------------------- */
  /* Effects                                                                */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!uploading) {
      return undefined;
    }

    const timer = setInterval(() => {
      setUploadElapsed((elapsed) => elapsed + 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [uploading]);

  useEffect(() => {
    refreshAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initialSection = getSectionFromLocation();

    if (!window.location.hash) {
      window.history.replaceState({}, "", `#${initialSection}`);
    }

    function syncSection() {
      const section = getSectionFromLocation();

      setActiveSection(section);

      try {
        window.localStorage.setItem("amit.admin.selected-section", section);
      } catch {}
    }

    syncSection();

    window.addEventListener("hashchange", syncSection);

    window.addEventListener("popstate", syncSection);

    return () => {
      window.removeEventListener("hashchange", syncSection);

      window.removeEventListener("popstate", syncSection);
    };
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "dark"
          : "light";

      setTheme(nextTheme);

      try {
        window.localStorage.setItem("theme-mode", nextTheme);
      } catch {}
    };

    syncTheme();

    window.addEventListener("themechange", syncTheme);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "data-theme") {
          syncTheme();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();

      window.removeEventListener("themechange", syncTheme);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "";

      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    }

    function closeOnResize() {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    window.addEventListener("resize", closeOnResize);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", closeOnEscape);

      window.removeEventListener("resize", closeOnResize);
    };
  }, [mobileMenuOpen]);

  /* ---------------------------------------------------------------------- */
  /* Navigation/theme                                                       */
  /* ---------------------------------------------------------------------- */

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nextTheme);

    try {
      window.localStorage.setItem("theme-mode", nextTheme);
    } catch {}

    setTheme(nextTheme);

    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: nextTheme,
      }),
    );
  }

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Logout failed.");
      }

      window.sessionStorage.removeItem(CREDENTIALS_KEY);
      window.location.assign("/login");
    } catch (error) {
      setPageError(error.message || "Logout failed.");
    }
  }

  function selectSection(event, section) {
    event.preventDefault();

    setActiveSection(section);
    setMobileMenuOpen(false);

    try {
      window.localStorage.setItem("amit.admin.selected-section", section);
    } catch {}

    if (window.location.hash !== `#${section}`) {
      window.history.pushState({}, "", `#${section}`);

      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Demo helpers                                                           */
  /* ---------------------------------------------------------------------- */

  function mergeDemos(list, stored = readCredentials()) {
    return Array.isArray(list)
      ? list.map((demo) => normaliseDemo(demo, stored)).filter(Boolean)
      : [];
  }

  async function loadProjects() {
    const response = await fetch(`${SITE_API}/api/demo-proxy/projects`);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Projects could not be loaded.");
    }

    if (Array.isArray(data.projects)) {
      setProjects(data.projects);
    }
  }

  async function loadDemos() {
    const response = await fetch(`${SITE_API}/api/demo-proxy/demos`, {
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Live demos could not be loaded.");
    }

    if (Array.isArray(data.demos)) {
      const demosWithCredentials = await Promise.all(
        data.demos.map(async (demo) => {
          try {
            const credentialsResponse = await fetch(
              `${SITE_API}/api/demo-proxy/demo/${encodeURIComponent(demo.id)}/credentials`,
              { credentials: "include" },
            );
            const credentialsData = await credentialsResponse.json();
            return credentialsResponse.ok && credentialsData.success
              ? { ...demo, credentials: credentialsData.credentials }
              : demo;
          } catch {
            return demo;
          }
        }),
      );
      setDemos(mergeDemos(demosWithCredentials));
    }
  }

  async function refreshAll() {
    setRefreshing(true);
    setPageError("");

    const results = await Promise.allSettled([loadProjects(), loadDemos()]);

    const failures = results.filter((result) => result.status === "rejected");

    if (failures.length) {
      const messages = [
        ...new Set(
          failures
            .map((failure) => failure.reason?.message || "Refresh failed")
            .filter(
              (message) =>
                !/Demo service unavailable|Settings service unavailable|Team service unavailable|Product service unavailable|service unavailable/i.test(
                  message,
                ),
            ),
        ),
      ];

      if (messages.length) {
        setPageError(messages.join(" "));
      }
    }

    setRefreshing(false);
    setLoading(false);
  }

  function rememberCredentials(id, value) {
    if (!id || !value?.username || !value?.password) {
      return;
    }

    const next = {
      ...readCredentials(),
      [id]: { ...value },
    };
    saveCredentials(next);

    setDemos((current) =>
      current.map((demo) =>
        demo.id === id
          ? {
              ...demo,
              credentials: value,
            }
          : demo,
      ),
    );
  }

  async function createDemo(projectId, durationMinutes) {
    setCreating(projectId);
    setDemoError("");

    try {
      const response = await fetch(`${SITE_API}/api/demo-proxy/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          durationMinutes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }
        throw new Error(data.message || data.error || "Demo creation failed.");
      }

      if (data.demo?.credentials) {
        rememberCredentials(data.demo.id, {
          ...data.demo.credentials,
          credentialVersion: data.demo.credentialVersion,
        });
      }

      // Keep the Live demos section in sync immediately after launching a demo.
      // The create endpoint is the source of truth, so reload the server list
      // instead of waiting for a full page refresh.
      await loadDemos();
    } catch (error) {
      setDemoError(error.message);
    } finally {
      setCreating("");
    }
  }

  async function rotateCredentials(demoId) {
    setDemoError("");

    const response = await fetch(
      `${SITE_API}/api/demo-proxy/demo/${encodeURIComponent(
        demoId,
      )}/credentials/rotate`,
      {
        method: "POST",
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Credential rotation failed.");
    }

    rememberCredentials(demoId, {
      ...data.credentials,
      credentialVersion: data.credentialVersion,
    });
    await loadDemos();
  }

  async function extendDemo(demoId, durationMinutes) {
    setDemoError("");
    const response = await fetch(
      `${SITE_API}/api/demo-proxy/demo/${encodeURIComponent(demoId)}/duration`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationMinutes }),
      },
    );
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Demo expiry update failed.");
    }
    await loadDemos();
  }

  async function deleteDemo(demoId) {
    setDemoError("");

    const response = await fetch(
      `${SITE_API}/api/demo-proxy/demo/${encodeURIComponent(demoId)}`,
      {
        method: "DELETE",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Demo deletion failed.");
    }

    setDemos((current) => current.filter((item) => item.id !== demoId));
  }

  async function copyValue(demoId, value, kind) {
    try {
      await navigator.clipboard.writeText(value);

      setDemos((current) =>
        current.map((demo) =>
          demo.id === demoId
            ? {
                ...demo,
                copied: kind,
              }
            : demo,
        ),
      );

      setTimeout(() => {
        setDemos((current) =>
          current.map((demo) =>
            demo.id === demoId && demo.copied === kind
              ? {
                  ...demo,
                  copied: "",
                }
              : demo,
          ),
        );
      }, 1800);
    } catch {
      setDemoError("Copy failed. Select the value manually.");
    }
  }

  function openDemo(demo) {
    if (!demo?.url) return;

    window.open(demo.url, "_blank", "noopener,noreferrer");
  }

  /* ---------------------------------------------------------------------- */
  /* Video                                                                   */
  /* ---------------------------------------------------------------------- */

  function getProjectVideoUrl(project) {
    const candidates = buildVideoCandidates(project);

    return candidates[0] || "";
  }

  async function replaceProjectVideo(projectId, file) {
    if (!file) return;

    setProjectBusy(`video:${projectId}`);

    setProjectError((current) => ({
      ...current,
      [projectId]: "",
    }));

    try {
      const formData = new FormData();

      formData.append("projectVideo", file, file.name);

      formData.append("videoStorage", videoStorage);

      const response = await fetch(
        `${SITE_API}/api/demo-proxy/projects/${encodeURIComponent(
          projectId,
        )}/video`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Project video update failed.");
      }

      await loadProjects();
    } catch (error) {
      setProjectError((current) => ({
        ...current,
        [projectId]: error.message,
      }));
    } finally {
      setProjectBusy("");
    }
  }

  async function deleteProjectVideo(projectId) {
    setProjectBusy(`video:${projectId}`);

    setProjectError((current) => ({
      ...current,
      [projectId]: "",
    }));

    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/projects/${encodeURIComponent(
          projectId,
        )}/video`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Project video deletion failed.");
      }

      await loadProjects();
    } catch (error) {
      setProjectError((current) => ({
        ...current,
        [projectId]: error.message,
      }));
    } finally {
      setProjectBusy("");
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Upload                                                                  */
  /* ---------------------------------------------------------------------- */

  function applySelectedFiles(fileList) {
    const selected = filterUploadableFiles(fileList);

    setUploadFiles(selected.kept);

    setUploadProgress(0);

    setUploadStage(selected.kept.length ? "ready" : "idle");

    setUploadMessage(
      selected.skippedCount
        ? {
            type: "info",
            text: `${selected.skippedCount} ignored files were skipped.`,
          }
        : {
            type: "",
            text: "",
          },
    );

    if (selected.kept.length) {
      const path = selected.kept[0].webkitRelativePath || selected.kept[0].name;

      setSelectedFolderName(path.split("/")[0] || "Selected project");

      setSelectedFolderSize(
        selected.kept.reduce((sum, file) => sum + (file.size || 0), 0),
      );
    } else {
      setSelectedFolderName("");
      setSelectedFolderSize(0);
    }
  }

  function handleFileSelect(event) {
    applySelectedFiles(event.target.files);
  }

  async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    if (uploading) return;

    const entries = Array.from(event.dataTransfer.items || [])
      .map((item) => item.webkitGetAsEntry?.())
      .filter(Boolean);

    if (entries.length) {
      const droppedFiles = (
        await Promise.all(entries.map((entry) => readDroppedEntry(entry)))
      ).flat();

      applySelectedFiles(
        droppedFiles.length ? droppedFiles : event.dataTransfer.files,
      );
    } else {
      applySelectedFiles(event.dataTransfer.files);
    }
  }

  function clearUpload() {
    setUploadFiles([]);
    setProjectVideo(null);
    setVideoStorage("local");
    setSelectedFolderName("");
    setSelectedFolderSize(0);
    setUploadType("auto");
    setUploadProgress(0);
    setUploadStage("idle");

    setUploadMessage({
      type: "",
      text: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadProject() {
    if (uploading) return;

    if (!uploadFiles.length) {
      setUploadMessage({
        type: "error",
        text: "Select a project folder first.",
      });

      return;
    }

    const projectName = selectedFolderName;

    const formData = new FormData();

    formData.append("projectName", projectName);

    formData.append("projectType", uploadType);

    formData.append("videoStorage", videoStorage);

    formData.append(
      "relativePaths",
      JSON.stringify(
        uploadFiles.map((file) => getUploadRelativePath(file, projectName)),
      ),
    );

    uploadFiles.forEach((file) => {
      formData.append("files", file, file.name);
    });

    if (projectVideo) {
      formData.append("projectVideo", projectVideo, projectVideo.name);
    }

    setUploading(true);
    setUploadStage("preparing");
    setUploadElapsed(0);
    setUploadProgress(0);
    setUploadMessage({
      type: "",
      text: "",
    });

    try {
      const data = await uploadWithProgress(
        `${SITE_API}/api/demo-proxy/upload`,
        formData,
        (progress) => {
          setUploadStage("uploading");

          setUploadProgress(progress);
        },
      );

      if (!data.success) {
        throw new Error(data.message || "Upload failed.");
      }

      setUploadStage("processing");

      setUploadProgress(100);

      await loadProjects();

      clearUpload();

      setUploadStage("complete");

      setUploadMessage({
        type: "success",
        text: `${projectName} uploaded successfully.`,
      });
    } catch (error) {
      setUploadStage("error");

      setUploadMessage({
        type: "error",
        text: error.message,
      });
    } finally {
      setUploading(false);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Project actions                                                         */
  /* ---------------------------------------------------------------------- */

  async function changeProjectType(projectId, type) {
    setProjectError((current) => ({
      ...current,
      [projectId]: "",
    }));

    setProjectBusy(`type:${projectId}`);

    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/projects/${encodeURIComponent(
          projectId,
        )}/type`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Project type update failed.");
      }

      await loadProjects();
    } catch (error) {
      setProjectError((current) => ({
        ...current,
        [projectId]: error.message,
      }));
    } finally {
      setProjectBusy("");
    }
  }

  async function downloadProject(project) {
    setProjectError((current) => ({
      ...current,
      [project.id]: "",
    }));

    setProjectBusy(`download:${project.id}`);

    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/projects/${encodeURIComponent(
          project.id,
        )}/download`,
      );

      if (!response.ok) {
        let message = "Project download failed.";

        try {
          message = (await response.json()).message || message;
        } catch {}

        throw new Error(message);
      }

      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.download = `${project.folder || project.name}.zip`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      setProjectError((current) => ({
        ...current,
        [project.id]: error.message,
      }));
    } finally {
      setProjectBusy("");
    }
  }

  async function deleteProject(project) {
    setProjectError((current) => ({
      ...current,
      [project.id]: "",
    }));

    setProjectBusy(`delete:${project.id}`);

    try {
      const response = await fetch(
        `${SITE_API}/api/demo-proxy/projects/${encodeURIComponent(project.id)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Project deletion failed.");
      }

      setDeleteProjectId("");

      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );

      setDemos((current) =>
        current.filter((item) => item.projectId !== project.id),
      );

      await Promise.allSettled([loadProjects(), loadDemos()]);
    } catch (error) {
      setProjectError((current) => ({
        ...current,
        [project.id]: error.message,
      }));
    } finally {
      setProjectBusy("");
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Loading     SECTION_IDS                                                              */
  /* ---------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
        {" "}
        <div className="w-full max-w-sm text-center">
          {" "}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl dark:bg-white dark:text-slate-950">
            {" "}
            <LoaderCircle size={28} className="animate-spin" />{" "}
          </div>
          <h2 className="mt-5 text-lg font-black text-slate-950 dark:text-white">
            Loading admin control center...
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Syncing projects and live environments.
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* UI                                                                       */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="dashboard-shell min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      {/* Fixed floating theme toggle button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="dashboard-theme-toggle fixed bottom-5 right-5 z-[120] inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        title={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar
          activeSection={activeSection}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          selectSection={selectSection}
          activeDemos={activeDemos}
          projects={projects}
        />

        <section className="min-w-0 flex-1">
          <div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
            <PageHeader
              activeSection={activeSection}
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              logout={logout}
            />

            {activeSection.startsWith("social-") && (
              <SocialPostContent section={activeSection} />
            )}

            {activeSection === "office-dashboard" && (
              <SystemSuperAdminDashboard />
            )}

            {activeSection.startsWith("office:") && (
              <div className="office-embedded-panel">
                <OfficeEmbeddedRoute section={activeSection} />
              </div>
            )}

            <div className="space-y-4">
              {pageError && (
                <InlineMessage variant="error" onClose={() => setPageError("")}>
                  {pageError} Existing data was kept.
                </InlineMessage>
              )}

              {activeSection === "analytics" && <VisitorAnalyticsPage />}
              {demoError && (
                <InlineMessage variant="error" onClose={() => setDemoError("")}>
                  {demoError}
                </InlineMessage>
              )}
            </div>

            {activeSection === "demos" && (
              <StatsGrid
                activeDemos={activeDemos}
                healthyDemos={healthyDemos}
                projects={projects}
              />
            )}

            {/* ---------------------------------------------------------------- */}
            {/* DEMOS                                                            */}
            {/* ---------------------------------------------------------------- */}

            {activeSection === "demos" && (
              <section>
                <SectionHeading
                  title="Every active demo"
                  description="Credentials, health, expiry and actions stay visible without exposing stored passwords."
                  count={`${activeDemos.length} active`}
                />

                {activeDemos.length ? (
                  <div className="space-y-4">
                    {activeDemos.map((demo) => (
                      <DemoRow
                        key={demo.id}
                        demo={demo}
                        onRotate={rotateCredentials}
                        onDelete={deleteDemo}
                        onCopy={copyValue}
                        onOpen={openDemo}
                        onExtend={extendDemo}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={LayoutDashboard}
                    title="No active demos"
                    description="Launch a demo from a project to see it here."
                  />
                )}
              </section>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* PROJECTS                                                         */}
            {/* ---------------------------------------------------------------- */}

            {activeSection === "projects" && (
              <section>
                <SectionHeading
                  title="Projects"
                  description="Launch a fresh environment or manage the source projects behind your demos."
                  count={`${projects.length} projects`}
                />

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search projects..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                    />
                  </div>

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                      <X size={14} />
                      Clear
                    </button>
                  )}
                </div>

                {filteredProjects.length ? (
                  <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredProjects.map((project) => {
                      const busyKey =
                        projectBusy === `type:${project.id}`
                          ? "type"
                          : projectBusy === `download:${project.id}`
                            ? "download"
                            : projectBusy === `delete:${project.id}`
                              ? "delete"
                              : projectBusy === `video:${project.id}`
                                ? "video"
                                : "";

                      return (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onCreateDemo={createDemo}
                          creating={creating === project.id}
                          onChangeType={changeProjectType}
                          onDownload={downloadProject}
                          onDelete={deleteProject}
                          onReplaceVideo={replaceProjectVideo}
                          onDeleteVideo={deleteProjectVideo}
                          busy={Boolean(busyKey) || creating === project.id}
                          error={projectError[project.id]}
                          confirming={deleteProjectId === project.id}
                          setDeleteProjectId={setDeleteProjectId}
                          getProjectVideoUrl={getProjectVideoUrl}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={searchQuery ? Search : Database}
                    title={
                      searchQuery
                        ? "No projects found"
                        : "No projects available"
                    }
                    description={
                      searchQuery
                        ? "Try another project name, ID or type."
                        : "Upload a project to start creating demos."
                    }
                  />
                )}
              </section>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* UPLOAD                                                           */}
            {/* ---------------------------------------------------------------- */}

            {activeSection === "upload" && (
              <UploadPage
                uploading={uploading}
                uploadProgress={uploadProgress}
                uploadFiles={uploadFiles}
                projectVideo={projectVideo}
                setProjectVideo={setProjectVideo}
                videoStorage={videoStorage}
                setVideoStorage={setVideoStorage}
                uploadType={uploadType}
                setUploadType={setUploadType}
                selectedFolderName={selectedFolderName}
                selectedFolderSize={selectedFolderSize}
                uploadMessage={uploadMessage}
                setUploadMessage={setUploadMessage}
                uploadStage={uploadStage}
                uploadElapsed={uploadElapsed}
                dragActive={dragActive}
                setDragActive={setDragActive}
                fileInputRef={fileInputRef}
                handleFileSelect={handleFileSelect}
                handleDrop={handleDrop}
                clearUpload={clearUpload}
                uploadProject={uploadProject}
              />
            )}

            {activeSection === "settings" && <CrmSettingsPage />}
            {activeSection === "security" && <SecurityPage />}
            {activeSection === "tenants" && <TenantManagementPage />}
            {activeSection === "products" && <ProductsPage />}
            {activeSection === "portfolio" && <PortfolioPage />}
            {activeSection === "team" && <TeamPage />}
            {activeSection === "subscriptions" && <SubscriptionsPage />}
            {activeSection === "contact" && <ContactEnquiriesPage />}
            {activeSection === "ads" && <AdsManagementPage />}
            {activeSection === "add-ad" && <AddAdvertisementPage />}
            {activeSection === "lead-applications" && (
              <CareerApplicationsPage />
            )}
            {activeSection === "career-applications" && (
              <CareerSubmissionsPage />
            )}

            {/* ---------------------------------------------------------------- */}
            {/* NOTES                                                            */}
            {/* ---------------------------------------------------------------- */}

            {activeSection === "notes" && <NotesPage />}
          </div>
        </section>
      </div>
    </main>
  );
}


//LIVE ENVIRONMENTS