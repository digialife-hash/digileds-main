import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ChevronDown,
  CreditCard,
  Database,
  FileArchive,
  FileText,
  FolderKanban,
  Image,
  LayoutDashboard,
  Library,
  Mail,
  MessageCircle,
  Package,
  PlusSquare,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Share2,
  Sparkles,
  UploadCloud,
  Users,
  X,
} from "lucide-react";

import { sidebarCategories as officeSidebarCategories } from "../../../office-management/config/sidebarLinks";
import canShowMenu, {
  hasDashboardPermission,
} from "../../../office-management/utils/canShowMenu";
import { ROUTES } from "../../../office-management/routes/routeConstants";

/* =========================================================
   STORED USER activeSection 
========================================================= */

function getStoredDashboardUser() {
  try {
    const officeUser = JSON.parse(
      window.localStorage.getItem("office_user") || "null",
    );

    const adminUser = JSON.parse(
      window.localStorage.getItem("demo_admin_user") || "null",
    );

    const candidates = [officeUser, adminUser]
      .filter(Boolean)
      .map(
        (storedUser) =>
          storedUser?.data?.user ||
          storedUser?.user ||
          storedUser,
      )
      .map((user) => ({
        ...user,
        role: String(user?.role || "")
          .trim()
          .toLowerCase()
          .replace(/[\s-]+/g, "_"),
      }));

    return (
      candidates.find(
        (candidate) => candidate.role === "super_admin",
      ) ||
      candidates[0] ||
      null
    );
  } catch {
    return null;
  }
}

/* =========================================================
   ICON MAPS
========================================================= */

const ADMIN_SECTION_ICONS = {
  demos: LayoutDashboard,

  projects: Database,
  upload: UploadCloud,
  products: Package,
  portfolio: FolderKanban,
  notes: FileArchive,

  analytics: BarChart3,

  /* =========================
     ADVERTISEMENT
  ========================= */

  ads: Sparkles,
  "add-ad": PlusSquare,

  team: Users,
  subscriptions: CreditCard,

  contact: Mail,
  "lead-applications": FileArchive,
  "career-applications": BriefcaseBusiness,

  settings: Settings2,
  security: ShieldCheck,
  tenants: Building2,
};

const ADMIN_GROUP_ICONS = {
  overview: LayoutDashboard,
  manage: FolderKanban,

  /* Separate Advertisement group */
  advertisements: Sparkles,

  crm: Mail,
  business: Users,
  system: Settings2,
};

/* =========================================================
   ADMIN NAV DATA
========================================================= */

const ADMIN_GROUPS = [
  /* =======================================================
     OVERVIEW
  ======================================================= */

  {
    id: "overview",
    label: "Overview",

    items: [
      {
        id: "demos",
        label: "Live demos",
        countKey: "demos",
      },

      {
        id: "analytics",
        label: "Visitor analytics",
      },
    ],
  },

  /* =======================================================
     CONTENT
  ======================================================= */

  {
    id: "manage",
    label: "Content",

    items: [
      {
        id: "projects",
        label: "Projects",
        countKey: "projects",
      },

      {
        id: "upload",
        label: "Upload project",
      },

      {
        id: "products",
        label: "Products",
      },

      {
        id: "portfolio",
        label: "Portfolio",
      },

      {
        id: "notes",
        label: "Notes & roles",
        badge: "KB",
      },
    ],
  },

  /* =======================================================
     ADVERTISEMENTS
     
     SEPARATE FROM CONTENT
     
     Admin + Super Admin
  ======================================================= */

  {
    id: "advertisements",
    label: "Advertisements",

    items: [
      {
        id: "ads",
        label: "All advertisements",
      },

      {
        id: "add-ad",
        label: "Add advertisement",
      },
    ],
  },

  /* =======================================================
     CRM
  ======================================================= */

  {
    id: "crm",
    label: "Leads & enquiries",

    items: [
      {
        id: "contact",
        label: "Contact enquiries",
      },

      {
        id: "lead-applications",
        label: "Lead applications",
      },

      {
        id: "career-applications",
        label: "Career applications",
      },
    ],
  },

  /* =======================================================
     BUSINESS
  ======================================================= */

  {
    id: "business",
    label: "Business",

    items: [
      {
        id: "team",
        label: "Team",
      },

      {
        id: "subscriptions",
        label: "Subscriptions",
      },
    ],
  },

  /* =======================================================
     SYSTEM
  ======================================================= */

  {
    id: "system",
    label: "Platform settings",

    items: [
      {
        id: "settings",
        label: "CRM settings",
      },

      {
        id: "security",
        label: "Security",
      },

      {
        id: "tenants",
        label: "Tenants & domains",
        superAdminOnly: true,
      },
    ],
  },
];

/* =========================================================
   SOCIAL NAV DATA
========================================================= */

const SOCIAL_GROUPS = [
  {
    id: "social-workspace",
    label: "Workspace",
    icon: LayoutDashboard,

    items: [
      {
        icon: LayoutDashboard,
        label: "Overview",
        section: "social-overview",
      },

      {
        icon: PlusSquare,
        label: "Create post",
        section: "social-create-post",
      },

      {
        icon: CalendarDays,
        label: "Content calendar",
        section: "social-calendar",
      },

      {
        icon: Image,
        label: "Media library",
        section: "social-media",
      },
    ],
  },

  {
    id: "social-posts",
    label: "Posts",
    icon: FileText,

    items: [
      {
        icon: FileText,
        label: "All posts",
        section: "social-all-posts",
      },

      {
        icon: FileText,
        label: "Drafts",
        section: "social-drafts",
      },

      {
        icon: Clock3,
        label: "Scheduled",
        section: "social-scheduled",
      },

      {
        icon: CheckCircle2,
        label: "Published",
        section: "social-published",
      },

      {
        icon: X,
        label: "Failed",
        section: "social-failed",
      },
    ],
  },

  {
    id: "social-accounts",
    label: "Accounts",
    icon: Share2,

    items: [
      {
        icon: Share2,
        label: "All accounts",
        section: "social-accounts",
      },

      {
        icon: RefreshCw,
        label: "Connected platforms",
        section: "social-platforms",
      },

      {
        icon: RefreshCw,
        label: "Reconnect accounts",
        section: "social-reconnect",
      },

      {
        icon: MessageCircle,
        label: "Engagement",
        section: "social-engagement",
      },
    ],
  },

  {
    id: "social-insights",
    label: "Insights",
    icon: BarChart3,

    items: [
      {
        icon: BarChart3,
        label: "Analytics",
        section: "social-analytics",
      },

      {
        icon: BarChart3,
        label: "Platform performance",
        section: "social-platform-performance",
      },

      {
        icon: Search,
        label: "Content performance",
        section: "social-content-performance",
      },

      {
        icon: Users,
        label: "Audience",
        section: "social-audience",
      },
    ],
  },

  {
    id: "social-tools",
    label: "Tools",
    icon: Library,

    items: [
      {
        icon: Library,
        label: "Content library",
        section: "social-content-library",
      },

      {
        icon: RefreshCw,
        label: "Publishing queue",
        section: "social-publishing-queue",
      },

      {
        icon: Search,
        label: "Hashtag research",
        section: "social-hashtags",
      },

      {
        icon: Mail,
        label: "Notifications",
        section: "social-notifications",
      },
    ],
  },

  {
    id: "social-system",
    label: "Settings",
    icon: Settings2,

    items: [
      {
        icon: Settings2,
        label: "General settings",
        section: "social-settings",
      },

      {
        icon: Users,
        label: "Team",
        section: "social-team",
      },

      {
        icon: ShieldCheck,
        label: "Security",
        section: "social-security",
      },
    ],
  },
];

/* =========================================================
   SIDEBAR
========================================================= */

export default function Sidebar({
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  selectSection,
  activeDemos = [],
  projects = [],
}) {
  const user = useMemo(getStoredDashboardUser, []);

  const showAdmin = hasDashboardPermission(user, "admin");
  const showSocial = hasDashboardPermission(user, "social");
  const showOffice = hasDashboardPermission(user, "office");

  const [query, setQuery] = useState("");

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(
    () => ({
      demos: activeDemos?.length || 0,
      projects: projects?.length || 0,
    }),
    [activeDemos, projects],
  );

  /* =======================================================
     OFFICE CATEGORIES
  ======================================================= */

  const officeCategories = useMemo(() => {
    const roleCategories = showOffice
      ? officeSidebarCategories[user?.role] || []
      : [];

    return roleCategories
      .map((category) => ({
        ...category,

        items: category.items.filter((item) =>
          canShowMenu(user, item),
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [showOffice, user]);

  /* =======================================================
     NAVIGATION HELPERS
  ======================================================= */

  const closeOnMobile = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(false);
    }
  };

  const officeSectionId = (path) =>
    path === ROUTES.SUPER_ADMIN_DASHBOARD ||
    path === ROUTES.ADMIN_DASHBOARD
      ? "office-dashboard"
      : `office:${encodeURIComponent(path)}`;

  const openOfficeRoute = (path) => {
    selectSection(
      { preventDefault() {} },
      officeSectionId(path),
    );

    closeOnMobile();
  };

  const openSection = (event, section) => {
    selectSection(event, section);
    closeOnMobile();
  };

  /* =======================================================
     ONE TREE
     
     Office Management
       ├── Operations
       ├── Social studio
       └── Admin control
            ├── Overview
            ├── Content
            ├── Advertisements
            │    ├── All advertisements
            │    └── Add advertisement
            ├── Leads & enquiries
            ├── Business
            └── Platform settings
  ======================================================= */

  const sections = useMemo(() => {
    const list = [];

    /* =====================================================
       OPERATIONS
    ===================================================== */

    if (officeCategories.length > 0) {
      list.push({
        id: "section-operations",
        label: "Operations",
        hint: "Daily office records",
        icon: Building2,

        groups: officeCategories.map((category) => ({
          id: `office-${category.id}`,
          label: category.title,
          icon: category.icon,
          headerPath: category.headerPath,

          items: category.items.map((item) => ({
            key: `office-${category.id}-${item.path}-${item.label}`,
            label: item.label,
            icon: item.icon,
            sectionId: officeSectionId(item.path),
            onSelect: () => openOfficeRoute(item.path),
          })),
        })),
      });
    }

    /* =====================================================
       SOCIAL STUDIO
    ===================================================== */

    if (showSocial) {
      list.push({
        id: "section-social",
        label: "Social studio",
        hint: "Plan, publish and track posts",
        icon: Share2,

        groups: SOCIAL_GROUPS.map((group) => ({
          id: group.id,
          label: group.label,
          icon: group.icon,

          items: group.items.map((item) => ({
            key: `${group.id}-${item.section}`,
            label: item.label,
            icon: item.icon,
            sectionId: item.section,

            onSelect: (event) =>
              openSection(event, item.section),
          })),
        })),
      });
    }

    /* =====================================================
       ADMIN CONTROL
    ===================================================== */

    if (showAdmin) {
      list.push({
        id: "section-admin",
        label: "Admin control",
        hint: "Site, CRM and platform setup",
        icon: ShieldCheck,

        groups: ADMIN_GROUPS.map((group) => ({
          id: `admin-${group.id}`,

          label: group.label,

          icon:
            ADMIN_GROUP_ICONS[group.id] ||
            FolderKanban,

          items: group.items
            .filter(
              (item) =>
                !item.superAdminOnly ||
                user?.role === "super_admin",
            )

            .map((item) => ({
              key: `admin-${item.id}`,

              label: item.label,

              icon:
                ADMIN_SECTION_ICONS[item.id] ||
                FileArchive,

              sectionId: item.id,

              href: `#${item.id}`,

              badge: item.badge,

              count: item.countKey
                ? counts[item.countKey]
                : null,

              onSelect: (event) =>
                openSection(event, item.id),
            })),
        })).filter(
          (group) => group.items.length > 0,
        ),
      });
    }

    return list.filter(
      (section) => section.groups.length > 0,
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    officeCategories,
    showSocial,
    showAdmin,
    user,
    counts,
  ]);

  /* =========================================================
     SEARCH
  ========================================================= */

  const searching = query.trim().length > 0;

  const visibleSections = useMemo(() => {
    if (!searching) {
      return sections;
    }

    const needle = query.trim().toLowerCase();

    return sections
      .map((section) => ({
        ...section,

        groups: section.groups
          .map((group) => ({
            ...group,

            items: group.items.filter((item) =>
              item.label
                .toLowerCase()
                .includes(needle),
            ),
          }))

          .filter(
            (group) => group.items.length > 0,
          ),
      }))

      .filter(
        (section) => section.groups.length > 0,
      );
  }, [sections, query, searching]);

  /* =========================================================
     OPEN / CLOSE
  ========================================================= */

  const [officeOpen, setOfficeOpen] = useState(true);

  const [openSections, setOpenSections] = useState({});

  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    setOpenSections((current) => {
      const next = { ...current };

      sections.forEach((section, index) => {
        if (!(section.id in next)) {
          next[section.id] = index === 0;
        }
      });

      return next;
    });

    setOpenGroups((current) => {
      const next = { ...current };

      sections.forEach((section) => {
        section.groups.forEach((group) => {
          if (!(group.id in next)) {
            next[group.id] = false;
          }
        });
      });

      return next;
    });
  }, [sections]);

  /* =========================================================
     AUTO OPEN ACTIVE
  ========================================================= */

  useEffect(() => {
    sections.forEach((section) => {
      section.groups.forEach((group) => {
        if (
          group.items.some(
            (item) =>
              item.sectionId === activeSection,
          )
        ) {
          setOfficeOpen(true);

          setOpenSections((current) => ({
            ...current,
            [section.id]: true,
          }));

          setOpenGroups((current) => ({
            ...current,
            [group.id]: true,
          }));
        }
      });
    });
  }, [activeSection, sections]);

  const isSectionOpen = (id) =>
    searching
      ? true
      : Boolean(openSections[id]);

  const isGroupOpen = (id) =>
    searching
      ? true
      : Boolean(openGroups[id]);

  const treeOpen = searching
    ? true
    : officeOpen;

  const roleLabel = (
    user?.role || "guest"
  ).replace(/_/g, " ");

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
         MOBILE OVERLAY
      ===================================================== */}

      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-[#053B20]/55 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* =====================================================
         SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#1AA85B] via-[#13924C] to-[#0C7A3D] text-white shadow-[16px_0_50px_rgba(5,59,32,0.35)] transition-transform duration-300 dark:from-[#071A12] dark:via-[#06130E] dark:to-[#030A07] dark:text-slate-100 dark:shadow-[16px_0_50px_rgba(0,0,0,0.55)] md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-[#053B20]/25 blur-3xl dark:bg-emerald-950/70" /> */}

        {/* ===================================================
           HEADER
        =================================================== */}

        <div className="relative flex h-[76px] shrink-0 items-center gap-3 border-b border-white/15 px-4 dark:border-emerald-950/80">
          <div className="min-w-0 flex-1">
            <h2 className="truncate !text-3xl font-black tracking-tight !text-white dark:text-emerald-50">
              Dashboard
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setMobileMenuOpen(false)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/75 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 dark:text-slate-400 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-100 dark:focus-visible:ring-emerald-500/40 md:hidden"
          >
            <X size={17} />
          </button>
        </div>

        {/* ===================================================
           SEARCH
        =================================================== */}

        <div className="relative shrink-0 px-3 pb-1 pt-3">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/70 dark:text-slate-500"
            />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search menu"
              aria-label="Search menu"
              className="w-full rounded-xl border border-white/20 bg-white/15 py-2 pl-8 pr-8 text-[11px] font-medium text-white placeholder:text-white/60 transition-colors hover:border-white/35 focus:border-white/60 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 dark:border-emerald-900/70 dark:bg-slate-950/50 dark:text-emerald-50 dark:placeholder:text-slate-500 dark:hover:border-emerald-700/70 dark:focus:border-emerald-500/80 dark:focus:bg-slate-950/75 dark:focus:ring-emerald-500/20"
            />

            {searching && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/20 hover:text-white dark:text-slate-500 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
           TREE
        =================================================== */}

        <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/25 dark:scrollbar-thumb-emerald-900/80">
          <div className="overflow-hidden rounded-2xl  p-1.5 dark:border-emerald-950/80 dark:bg-slate-950/45">
            {/* =================================================
               ROOT
            ================================================= */}

            <button
              type="button"
              aria-expanded={treeOpen}
              onClick={() =>
                setOfficeOpen(
                  (current) => !current,
                )
              }
              className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 dark:hover:bg-emerald-950/55 dark:focus-visible:ring-emerald-500/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0C7A3D] shadow-md shadow-[#053B20]/30 transition-transform duration-200 group-hover:scale-105 dark:bg-emerald-500 dark:text-emerald-950 dark:shadow-[0_0_18px_rgba(16,185,129,0.18)]">
                <Building2
                  size={16}
                  strokeWidth={2.2}
                />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-extrabold text-white dark:text-emerald-50">
                  Office Management
                </span>
              </span>

              <ChevronDown
                size={14}
                className={`shrink-0 text-white/75 transition-transform duration-200 dark:text-slate-500 ${
                  treeOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {/* =================================================
               SECTIONS
            ================================================= */}

            <div
              className={`grid transition-all duration-300 ${
                treeOpen
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="mt-1 space-y-1 border-t border-white/15 pt-2 dark:border-emerald-950/80">
                  {visibleSections.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/25 px-3 py-6 text-center text-[11px] font-medium text-white dark:border-emerald-900/70 dark:text-slate-500">
                      No menu matches “
                      {query.trim()}”. Try another
                      word.
                    </p>
                  ) : (
                    visibleSections.map(
                      (section) => {
                        const SectionIcon =
                          section.icon;

                        const sectionOpen =
                          isSectionOpen(
                            section.id,
                          );

                        const sectionActive =
                          section.groups.some(
                            (group) =>
                              group.items.some(
                                (item) =>
                                  item.sectionId ===
                                  activeSection,
                              ),
                          );

                        return (
                          <div
                            key={section.id}
                           
                          >
                            {/* =================================
                               SECTION HEADER
                            ================================= */}

                            <button
                              type="button"
                              aria-expanded={
                                sectionOpen
                              }
                              onClick={() =>
                                setOpenSections(
                                  (current) => ({
                                    ...current,
                                    [section.id]:
                                      !current[
                                        section.id
                                      ],
                                  }),
                                )
                              }
                              className="group flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 dark:hover:bg-emerald-950/55 dark:focus-visible:ring-emerald-500/40"
                            >
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                                  sectionActive
                                    ? "bg-white text-[#0C7A3D] dark:bg-emerald-500/15 dark:text-emerald-300"
                                    : "bg-white/15 text-white/85 group-hover:bg-white/25 group-hover:text-white dark:bg-slate-900/55 dark:text-slate-400 dark:group-hover:bg-emerald-950/70 dark:group-hover:text-emerald-200"
                                }`}
                              >
                                <SectionIcon
                                  size={15}
                                  strokeWidth={2.1}
                                />
                              </span>

                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[11.5px] font-bold text-white dark:text-emerald-50">
                                  {section.label}
                                </span>
                              </span>

                              <ChevronDown
                                size={13}
                                className={`shrink-0 text-white/75 transition-transform duration-200 dark:text-slate-500 ${
                                  sectionOpen
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>

                            {/* =================================
                               GROUPS
                            ================================= */}

                            <div
                              className={`grid transition-all duration-300 ${
                                sectionOpen
                                  ? "grid-rows-[1fr]"
                                  : "grid-rows-[0fr]"
                              }`}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <div className="ml-4 space-y-0.5 border-l border-white/20 pl-2 pb-1 dark:border-emerald-900/80">
                                  {section.groups.map(
                                    (group) => {
                                      const GroupIcon =
                                        group.icon ||
                                        FolderKanban;

                                      const groupOpen =
                                        isGroupOpen(
                                          group.id,
                                        );

                                      const groupActive =
                                        group.items.some(
                                          (item) =>
                                            item.sectionId ===
                                            activeSection,
                                        );

                                      return (
                                        <div
                                          key={
                                            group.id
                                          }
                                        >
                                          {/* =================
                                             GROUP
                                          ================= */}

                                          <button
                                            type="button"
                                            aria-expanded={
                                              groupOpen
                                            }
                                            onClick={() => {
                                              if (
                                                group.headerPath
                                              ) {
                                                openOfficeRoute(
                                                  group.headerPath,
                                                );
                                                return;
                                              }

                                              setOpenGroups(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  [group.id]:
                                                    !current[
                                                      group
                                                        .id
                                                    ],
                                                }),
                                              );
                                            }}
                                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[10px] font-bold tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                                              groupActive
                                                ? "text-emerald-50 dark:text-emerald-200"
                                                : "text-white/70 hover:bg-white/12 hover:text-white dark:text-slate-500 dark:hover:bg-emerald-950/55 dark:hover:text-emerald-200"
                                            }`}
                                          >
                                            <GroupIcon
                                              size={13}
                                              className="shrink-0"
                                            />

                                            <span className="min-w-0 flex-1 truncate">
                                              {
                                                group.label
                                              }
                                            </span>

                                            <ChevronDown
                                              size={12}
                                              className={`shrink-0 transition-transform duration-200 ${
                                                groupOpen
                                                  ? "rotate-180"
                                                  : ""
                                              }`}
                                            />
                                          </button>

                                          {/* =================
                                             GROUP ITEMS
                                          ================= */}

                                          <div
                                            className={`grid transition-all duration-200 ${
                                              groupOpen
                                                ? "grid-rows-[1fr]"
                                                : "grid-rows-[0fr]"
                                            }`}
                                          >
                                            <div className="min-h-0 overflow-hidden">
                                              <div className="ml-3 space-y-0.5 border-l border-white/15 pl-2 dark:border-emerald-950/80">
                                                {group.items.map(
                                                  (
                                                    item,
                                                  ) => (
                                                    <NavLeaf
                                                      key={
                                                        item.key
                                                      }
                                                      item={
                                                        item
                                                      }
                                                      active={
                                                        activeSection ===
                                                        item.sectionId
                                                      }
                                                    />
                                                  ),
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
           FOOTER
        =================================================== */}

        <div className="relative shrink-0 border-t border-white/15 bg-[#053B20]/20 p-3 dark:border-emerald-950/80 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 dark:border-emerald-950/80 dark:bg-slate-900/60">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[#0C7A3D] dark:bg-emerald-500 dark:text-emerald-950">
              <ShieldCheck size={15} />
            </span>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold text-white dark:text-emerald-50">
                {user?.name ||
                  "Protected workspace"}
              </p>

              <p className="mt-0.5 truncate text-[9px] font-medium capitalize text-white/70 dark:text-slate-500">
                {roleLabel} access
              </p>
            </div>

            <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#B9F6CA] shadow-[0_0_8px_rgba(185,246,202,0.9)] dark:bg-emerald-400 dark:shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
          </div>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   NAV LEAF
========================================================= */

function NavLeaf({ item, active }) {
  const Icon = item.icon || FileArchive;

  const className = `group/item relative flex w-full min-w-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[11.5px] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
    active
      ? "bg-white font-bold text-[#0B6E37] shadow-sm shadow-[#053B20]/25 dark:bg-emerald-950/80 dark:text-emerald-100 dark:ring-1 dark:ring-emerald-800/70"
      : "font-medium text-white/85 hover:bg-white/15 hover:text-white dark:text-slate-300 dark:hover:bg-emerald-950/55 dark:hover:text-emerald-100"
  }`;

  const content = (
    <>
      {active && (
        <span className="absolute -left-[9px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-white dark:bg-emerald-400" />
      )}

      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ${
          active
            ? "bg-[#0B6E37]/10 text-[#0B6E37] dark:bg-emerald-500/15 dark:text-emerald-300"
            : "text-white/75 group-hover/item:scale-105 group-hover/item:text-white dark:text-slate-400 dark:group-hover/item:text-emerald-200"
        }`}
      >
        <Icon
          size={14}
          strokeWidth={active ? 2.2 : 1.9}
        />
      </span>

      <span className="min-w-0 flex-1 truncate">
        {item.label}
      </span>

      {typeof item.count === "number" && (
        <span
          className={`min-w-[22px] rounded-md px-1.5 py-0.5 text-center text-[9px] font-bold ${
            active
              ? "bg-[#0B6E37]/12 text-[#0B6E37] dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-white/20 text-white dark:bg-slate-900/80 dark:text-slate-400"
          }`}
        >
          {item.count}
        </span>
      )}

      {item.badge && (
        <span
          className={`rounded-md px-1.5 py-0.5 text-[8px] font-bold ${
            active
              ? "bg-[#0B6E37]/12 text-[#0B6E37] dark:bg-emerald-500/15 dark:text-emerald-300"
              : "border border-white/25 bg-white/10 text-white/85 dark:border-emerald-900/70 dark:bg-emerald-950/45 dark:text-emerald-300"
          }`}
        >
          {item.badge}
        </span>
      )}
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        onClick={item.onSelect}
        aria-current={
          active ? "page" : undefined
        }
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={item.onSelect}
      aria-current={
        active ? "page" : undefined
      }
      className={className}
    >
      {content}
    </button>
  );
}