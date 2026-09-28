
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Image,
  LayoutDashboard,
  Library,
  Link2,
  LogOut,
  Mail,
  MessageCircle,
  PlusSquare,
  RefreshCw,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import {
  NavLink,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { usePost } from "../../hooks/usePost.js";

/* =========================================================
   NAVIGATION CONFIG
========================================================= */

const POST_LINKS = [
  {
    icon: FileText,
    label: "All posts",
    to: "/dashboard/posts",
    exact: true,
    countKey: "all",
  },
  {
    icon: FileText,
    label: "Drafts",
    to: "/dashboard/posts/drafts",
    exact: true,
    countKey: "drafts",
  },
  {
    icon: Clock3,
    label: "Scheduled",
    to: "/dashboard/posts/scheduled",
    exact: true,
    countKey: "scheduled",
  },
  {
    icon: CheckCircle2,
    label: "Published",
    to: "/dashboard/posts/published",
    exact: true,
    countKey: "published",
  },
  {
    icon: XCircle,
    label: "Failed",
    to: "/dashboard/posts/failed",
    exact: true,
    countKey: "failed",
  },
];

const SOCIAL_LINKS = [
  {
    icon: Link2,
    label: "All accounts",
    to: "/dashboard/social-accounts",
    exact: true,
  },
  {
    icon: Share2,
    label: "Connected platforms",
    to: "/dashboard/social-accounts/platforms",
    exact: true,
  },
  {
    icon: RefreshCw,
    label: "Reconnect accounts",
    to: "/dashboard/social-accounts/reconnect",
    exact: true,
  },
];

const ANALYTICS_LINKS = [
  {
    icon: BarChart3,
    label: "Overview",
    to: "/dashboard/analytics",
    exact: true,
  },
  {
    icon: Share2,
    label: "Platform performance",
    to: "/dashboard/analytics/platforms",
    exact: true,
  },
  {
    icon: Users,
    label: "Audience",
    to: "/dashboard/analytics/audience",
    exact: true,
  },
  {
    icon: Search,
    label: "Content performance",
    to: "/dashboard/analytics/content",
    exact: true,
  },
];

const TOOLS_LINKS = [
  {
    icon: Library,
    label: "Content library",
    to: "/dashboard/content-library",
  },
  {
    icon: RefreshCw,
    label: "Publishing queue",
    to: "/dashboard/publishing-queue",
  },
  {
    icon: Search,
    label: "Hashtag research",
    to: "/dashboard/hashtags",
  },
  {
    icon: Mail,
    label: "Notifications",
    to: "/dashboard/notifications",
  },
];

const SETTINGS_LINKS = [
  {
    icon: Settings,
    label: "General settings",
    to: "/dashboard/settings",
    exact: true,
  },
  {
    icon: Users,
    label: "Team",
    to: "/dashboard/team",
    exact: true,
  },
  {
    icon: ShieldCheck,
    label: "Security",
    to: "/dashboard/security",
    exact: true,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function normalizePath(pathname = "") {
  if (!pathname) return "/";

  const normalized =
    pathname.length > 1
      ? pathname.replace(/\/+$/, "")
      : pathname;

  return normalized || "/";
}

function isExactRoute(
  pathname,
  target
) {
  return (
    normalizePath(pathname) ===
    normalizePath(target)
  );
}

function isRouteInside(
  pathname,
  target
) {
  const current =
    normalizePath(pathname);

  const route =
    normalizePath(target);

  return (
    current === route ||
    current.startsWith(`${route}/`)
  );
}

function isChildActive(
  pathname,
  items
) {
  return items.some((item) => {
    if (item.exact) {
      return isExactRoute(
        pathname,
        item.to
      );
    }

    return isRouteInside(
      pathname,
      item.to
    );
  });
}

function getPostStatus(post) {
  return String(
    post?.status || ""
  ).toLowerCase();
}

/* =========================================================
   POST COUNTS
========================================================= */

function getPostCounts(posts) {
  const safePosts = Array.isArray(posts)
    ? posts
    : [];

  return {
    all: safePosts.length,

    drafts: safePosts.filter(
      (post) =>
        getPostStatus(post) ===
        "draft"
    ).length,

    scheduled: safePosts.filter(
      (post) =>
        getPostStatus(post) ===
        "scheduled"
    ).length,

    published: safePosts.filter(
      (post) =>
        getPostStatus(post) ===
        "published"
    ).length,

    failed: safePosts.filter(
      (post) =>
        getPostStatus(post) ===
        "failed"
    ).length,
  };
}

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar() {
  const location = useLocation();

  const {
    user,
    logout,
  } = useAuth();

  const {
    posts = [],
  } = usePost();

  const pathname =
    location.pathname;

  /* =======================================================
     COUNTS
  ======================================================== */

  const postCounts = useMemo(
    () => getPostCounts(posts),
    [posts]
  );

  /* =======================================================
     ACTIVE SECTIONS
  ======================================================== */

  const postsActive = useMemo(
    () =>
      isChildActive(
        pathname,
        POST_LINKS
      ),
    [pathname]
  );

  const socialActive = useMemo(
    () =>
      isChildActive(
        pathname,
        SOCIAL_LINKS
      ),
    [pathname]
  );

  const analyticsActive = useMemo(
    () =>
      isChildActive(
        pathname,
        ANALYTICS_LINKS
      ),
    [pathname]
  );

  const settingsActive = useMemo(
    () =>
      isChildActive(
        pathname,
        SETTINGS_LINKS
      ),
    [pathname]
  );

  /* =======================================================
     DROPDOWN STATE
  ======================================================== */

  const [
    openSections,
    setOpenSections,
  ] = useState({
    posts: postsActive,
    social: socialActive,
    analytics: analyticsActive,
    settings: settingsActive,
  });

  /* =======================================================
     KEEP ACTIVE SECTION OPEN
  ======================================================== */

  useEffect(() => {
    setOpenSections(
      (current) => ({
        ...current,

        ...(postsActive
          ? { posts: true }
          : {}),

        ...(socialActive
          ? { social: true }
          : {}),

        ...(analyticsActive
          ? { analytics: true }
          : {}),

        ...(settingsActive
          ? { settings: true }
          : {}),
      })
    );
  }, [
    postsActive,
    socialActive,
    analyticsActive,
    settingsActive,
  ]);

  /* =======================================================
     TOGGLE
  ======================================================== */

  function toggleSection(key) {
    setOpenSections(
      (current) => ({
        ...current,
        [key]: !current[key],
      })
    );
  }

  /* =======================================================
     USER
  ======================================================== */

  const displayName =
    user?.name?.trim() ||
    user?.fullName?.trim() ||
    "Admin";

  const email =
    user?.email?.trim() ||
    "";

  const firstLetter =
    displayName
      .charAt(0)
      .toUpperCase() ||
    "A";

  /* =======================================================
     LOGOUT
  ======================================================== */

  async function handleLogout() {
    try {
      await logout?.();
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }

  return (
    <aside
      aria-label="Dashboard sidebar"
      className="
        fixed inset-y-0 left-0 z-40 hidden
        w-[270px]
        flex-col
        border-r border-stone-200/80
        bg-[#faf9f7]/95
        text-stone-500
        backdrop-blur-xl
        lg:flex
      "
    >
      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="shrink-0 px-4 pb-4 pt-5">
        <NavLink
          to="/dashboard"
          end
          className="
            group
            flex items-center gap-3
            rounded-2xl
            px-2 py-1.5
            outline-none
            transition-colors
            hover:bg-white/70
            focus-visible:ring-2
            focus-visible:ring-orange-500/20
          "
        >
          <div
            className="
              relative
              grid h-11 w-11
              shrink-0
              place-items-center
              overflow-hidden
              rounded-[15px]
              bg-stone-950
              text-white
              shadow-[0_10px_30px_rgba(0,0,0,0.12)]
              transition-transform
              duration-200
              group-hover:scale-[1.025]
            "
          >
            <span
              className="
                pointer-events-none
                absolute inset-0
                bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.45),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.20),transparent_55%)]
              "
            />

            <span className="relative z-10 text-lg font-black italic">
              S
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[15px] font-black tracking-tight text-stone-900">
                Socially
              </p>

              <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.12em] text-stone-400">
                Pro
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.65)]" />

              <p className="truncate text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Workspace active
              </p>
            </div>
          </div>
        </NavLink>
      </div>

      {/* =====================================================
          CREATE POST
      ====================================================== */}

      <div className="shrink-0 px-3">
        <NavLink
          to="/dashboard/create-post"
          className={({ isActive }) =>
            `
              group relative flex
              items-center justify-center
              gap-2 overflow-hidden
              rounded-2xl
              px-4 py-3
              text-sm font-extrabold
              text-white
              outline-none
              transition-all
              duration-300
              focus-visible:ring-2
              focus-visible:ring-orange-500/25
              ${
                isActive
                  ? "bg-orange-600 shadow-[0_14px_35px_rgba(234,88,12,0.18)]"
                  : "bg-stone-950 shadow-[0_12px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:bg-stone-900 hover:shadow-[0_16px_35px_rgba(249,115,22,0.16)]"
              }
            `
          }
        >
          <span
            className="
              pointer-events-none
              absolute inset-0
              bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.32),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(34,211,238,0.16),transparent_48%)]
              opacity-70
            "
          />

          <PlusSquare
            size={17}
            strokeWidth={2}
            className="relative z-10"
          />

          <span className="relative z-10">
            Create post
          </span>

          <Sparkles
            size={13}
            className="relative z-10 text-orange-300"
          />
        </NavLink>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-3
          pb-4
          pt-6

          [scrollbar-width:thin]
          [scrollbar-color:#d6d3d1_transparent]

          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-stone-300
          [&::-webkit-scrollbar-track]:bg-transparent
        "
      >
        {/* ===================================================
            WORKSPACE
        ==================================================== */}

        <SidebarSectionTitle>
          Workspace
        </SidebarSectionTitle>

        <nav
          aria-label="Workspace navigation"
          className="space-y-1"
        >
          <SidebarLink
            icon={LayoutDashboard}
            label="Overview"
            to="/dashboard"
            exact
          />

          <SidebarLink
            icon={PlusSquare}
            label="Create post"
            to="/dashboard/create-post"
            featured
          />

          <SidebarLink
            icon={CalendarDays}
            label="Content calendar"
            to="/dashboard/calendar"
          />

          <SidebarDropdown
            icon={FileText}
            label="Posts"
            items={POST_LINKS}
            open={openSections.posts}
            active={postsActive}
            counts={postCounts}
            sectionKey="posts"
            onToggle={toggleSection}
          />

          <SidebarLink
            icon={Image}
            label="Media library"
            to="/dashboard/media"
          />
        </nav>

        {/* ===================================================
            MANAGEMENT
        ==================================================== */}

        <div className="mt-7">
          <SidebarSectionTitle>
            Management
          </SidebarSectionTitle>

          <nav
            aria-label="Management navigation"
            className="space-y-1"
          >
            <SidebarDropdown
              icon={Share2}
              label="Social accounts"
              items={SOCIAL_LINKS}
              open={openSections.social}
              active={socialActive}
              sectionKey="social"
              onToggle={toggleSection}
            />

            <SidebarLink
              icon={MessageCircle}
              label="Engagement"
              to="/dashboard/engagement"
            />

            <SidebarDropdown
              icon={BarChart3}
              label="Analytics"
              items={ANALYTICS_LINKS}
              open={
                openSections.analytics
              }
              active={analyticsActive}
              sectionKey="analytics"
              onToggle={toggleSection}
            />
          </nav>
        </div>

        {/* ===================================================
            TOOLS
        ==================================================== */}

        <div className="mt-7">
          <SidebarSectionTitle>
            Tools
          </SidebarSectionTitle>

          <nav
            aria-label="Tools navigation"
            className="space-y-1"
          >
            {TOOLS_LINKS.map(
              (item) => (
                <SidebarLink
                  key={item.to}
                  {...item}
                />
              )
            )}
          </nav>
        </div>

        {/* ===================================================
            SYSTEM
        ==================================================== */}

        <div className="mt-7">
          <SidebarSectionTitle>
            System
          </SidebarSectionTitle>

          <nav
            aria-label="System navigation"
            className="space-y-1"
          >
            <SidebarDropdown
              icon={Settings}
              label="Settings"
              items={SETTINGS_LINKS}
              open={
                openSections.settings
              }
              active={settingsActive}
              sectionKey="settings"
              onToggle={toggleSection}
            />

            {/* =================================================
                DIGITAL ALIFE ADMIN
            ================================================== */}

            <a
              href="https://digitalalife.in/admin/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="
                group relative flex w-full
                items-center gap-3
                rounded-[13px] px-3 py-2.5
                text-sm outline-none
                text-stone-500
                transition-all duration-200
                hover:bg-white/75
                hover:text-stone-900
                focus-visible:ring-2
                focus-visible:ring-orange-500/15
              "
            >
              {/* ICON */}

              <span
                className="
                  grid h-8 w-8 shrink-0
                  place-items-center
                  rounded-[10px]
                  text-stone-400
                  transition-all duration-200
                  group-hover:bg-orange-50
                  group-hover:text-orange-600
                "
              >
                <LayoutDashboard
                  size={17}
                  strokeWidth={1.8}
                />
              </span>

              {/* LABEL */}

              <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
                Digital Alife Admin
              </span>

              {/* EXTERNAL LINK ICON */}

              <ExternalLink
                size={14}
                strokeWidth={1.8}
                className="
                  shrink-0
                  text-stone-300
                  transition-colors
                  group-hover:text-orange-500
                "
              />
            </a>
          </nav>
        </div>
      </div>

      {/* =====================================================
          ACCOUNT FOOTER
      ====================================================== */}

      <div className="shrink-0 border-t border-stone-200/80 bg-[#faf9f7] p-3">
        <div
          className="
            rounded-2xl
            border border-stone-200/80
            bg-white/80
            p-3
            shadow-[0_8px_25px_rgba(0,0,0,0.035)]
          "
        >
          <div className="flex items-center gap-3">
            {/* AVATAR */}

            <div
              className="
                relative
                grid h-10 w-10
                shrink-0
                place-items-center
                rounded-xl
                bg-stone-900
                text-xs font-black
                text-white
              "
            >
              <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.35),transparent_55%)]" />

              <span className="relative z-10">
                {firstLetter}
              </span>

              <span
                className="
                  absolute
                  -bottom-0.5
                  -right-0.5
                  h-2.5 w-2.5
                  rounded-full
                  border-2
                  border-white
                  bg-emerald-500
                "
              />
            </div>

            {/* USER */}

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-stone-800">
                {displayName}
              </p>

              <p className="truncate text-[10px] text-stone-400">
                {email ||
                  "Admin workspace"}
              </p>
            </div>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              aria-label={`Log out ${displayName}`}
              className="
                grid h-8 w-8
                shrink-0
                place-items-center
                rounded-lg
                text-stone-400
                outline-none
                transition-all
                duration-200
                hover:bg-red-50
                hover:text-red-500
                focus-visible:ring-2
                focus-visible:ring-red-500/15
              "
            >
              <LogOut
                size={15}
                strokeWidth={1.8}
              />
            </button>
          </div>

          {/* STATUS */}

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.7)]" />

              <span className="truncate text-[9px] font-medium text-stone-400">
                All systems operational
              </span>
            </div>

            <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[8px] font-bold text-stone-400">
              v1.0
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   SECTION TITLE
========================================================= */

function SidebarSectionTitle({
  children,
}) {
  return (
    <div className="mb-2.5 px-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
        {children}
      </p>
    </div>
  );
}

/* =========================================================
   NORMAL LINK
========================================================= */

function SidebarLink({
  icon: Icon,
  label,
  to,
  exact = false,
  featured = false,
}) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) => {
        const active =
          isActive;

        return [
          "group relative flex items-center gap-3",
          "rounded-[13px] px-3 py-2.5",
          "text-sm outline-none",
          "transition-all duration-200",

          "focus-visible:ring-2",
          "focus-visible:ring-orange-500/15",

          active
            ? "bg-white text-stone-900 shadow-[0_4px_18px_rgba(0,0,0,0.05)] ring-1 ring-stone-200/80"
            : "text-stone-500 hover:bg-white/75 hover:text-stone-900",

          featured
            ? active
              ? "ring-orange-200"
              : ""
            : "",
        ].join(" ");
      }}
    >
      {({ isActive }) => (
        <>
          {/* ACTIVE BAR */}

          {isActive && (
            <span
              aria-hidden="true"
              className="
                absolute left-0
                top-1/2
                h-5 w-[3px]
                -translate-y-1/2
                rounded-r-full
                bg-gradient-to-b
                from-orange-500
                to-violet-500
              "
            />
          )}

          {/* ICON */}

          <span
            className={[
              "grid h-8 w-8 shrink-0",
              "place-items-center rounded-[10px]",
              "transition-all duration-200",

              isActive
                ? "bg-orange-50 text-orange-600"
                : "text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-700",
            ].join(" ")}
          >
            <Icon
              size={17}
              strokeWidth={1.8}
            />
          </span>

          {/* LABEL */}

          <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
            {label}
          </span>

          {/* FEATURED */}

          {featured && (
            <span
              className="
                rounded-full
                border border-orange-200/70
                bg-orange-50
                px-1.5 py-0.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-orange-600
              "
            >
              New
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

/* =========================================================
   DROPDOWN
========================================================= */

function SidebarDropdown({
  icon: Icon,
  label,
  items,
  open,
  active,
  counts,
  sectionKey,
  onToggle,
}) {
  return (
    <div>
      {/* MAIN BUTTON */}

      <button
        type="button"
        onClick={() =>
          onToggle(sectionKey)
        }
        aria-expanded={open}
        className={[
          "group relative flex w-full items-center gap-3",
          "rounded-[13px] px-3 py-2.5",
          "text-left text-sm outline-none",
          "transition-all duration-200",

          "focus-visible:ring-2",
          "focus-visible:ring-orange-500/15",

          active || open
            ? "bg-white/85 text-stone-900"
            : "text-stone-500 hover:bg-white/75 hover:text-stone-900",
        ].join(" ")}
      >
        {/* ACTIVE BAR */}

        {(active || open) && (
          <span
            aria-hidden="true"
            className="
              absolute left-0
              top-1/2
              h-5 w-[3px]
              -translate-y-1/2
              rounded-r-full
              bg-gradient-to-b
              from-orange-500
              to-violet-500
            "
          />
        )}

        {/* ICON */}

        <span
          className={[
            "grid h-8 w-8 shrink-0",
            "place-items-center rounded-[10px]",
            "transition-all duration-200",

            active || open
              ? "bg-orange-50 text-orange-600"
              : "text-stone-400 group-hover:bg-stone-100 group-hover:text-stone-700",
          ].join(" ")}
        >
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </span>

        {/* LABEL */}

        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
          {label}
        </span>

        {/* BADGE */}

        {counts?.all !== undefined && (
          <span
            className="
              mr-1
              min-w-[20px]
              rounded-full
              bg-stone-100
              px-1.5 py-0.5
              text-center
              text-[9px]
              font-black
              text-stone-500
            "
          >
            {counts.all}
          </span>
        )}

        {/* CHEVRON */}

        {open ? (
          <ChevronDown
            size={15}
            className="text-stone-400"
            strokeWidth={2}
          />
        ) : (
          <ChevronRight
            size={15}
            className="text-stone-400"
            strokeWidth={2}
          />
        )}
      </button>

      {/* SUB MENU */}

      <div
        className={[
          "grid transition-[grid-template-rows,opacity]",
          "duration-200 ease-out",

          open
            ? "grid-rows-[1fr] opacity-100"
            : "pointer-events-none grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="ml-[27px] mt-1 border-l border-stone-200/80 pl-2">
            <div className="space-y-0.5 pb-1">
              {items.map(
                (item) => {
                  const ItemIcon =
                    item.icon;

                  const count =
                    counts &&
                    item.countKey
                      ? counts[
                          item.countKey
                        ]
                      : undefined;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={
                        item.exact !==
                        false
                      }
                      className={({ isActive }) =>
                        [
                          "group relative flex items-center gap-2.5",
                          "rounded-xl px-3 py-2",
                          "text-xs outline-none",
                          "transition-all duration-200",

                          "focus-visible:ring-2",
                          "focus-visible:ring-orange-500/10",

                          isActive
                            ? "bg-white font-semibold text-stone-900 shadow-sm ring-1 ring-stone-200/70"
                            : "text-stone-500 hover:bg-white/70 hover:text-stone-900",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* SMALL ACTIVE INDICATOR */}

                          {isActive && (
                            <span
                              aria-hidden="true"
                              className="
                                absolute -left-[9px]
                                top-1/2
                                h-4 w-[2px]
                                -translate-y-1/2
                                rounded-full
                                bg-orange-500
                              "
                            />
                          )}

                          {/* ICON */}

                          <span
                            className={[
                              "grid h-7 w-7 shrink-0",
                              "place-items-center rounded-lg",

                              isActive
                                ? "bg-orange-50 text-orange-600"
                                : "text-stone-400 group-hover:text-stone-700",
                            ].join(" ")}
                          >
                            <ItemIcon
                              size={14}
                              strokeWidth={1.8}
                            />
                          </span>

                          {/* LABEL */}

                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>

                          {/* COUNT */}

                          {count !==
                            undefined && (
                            <span
                              className={[
                                "min-w-[19px]",
                                "rounded-full px-1.5 py-0.5",
                                "text-center text-[8px]",
                                "font-black",

                                isActive
                                  ? "bg-orange-50 text-orange-600"
                                  : "bg-stone-100 text-stone-400",
                              ].join(
                                " "
                              )}
                            >
                              {
                                count
                              }
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

