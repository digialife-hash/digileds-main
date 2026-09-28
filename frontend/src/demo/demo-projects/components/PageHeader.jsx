import { LogOut, Menu } from "lucide-react";

export default function PageHeader({
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  logout,
}) {
  const titles = {
    demos: "Live demos",
    projects: "Project library",
    upload: "Upload a project",
    notes: "Workspace notes",
    settings: "CRM settings",
    analytics: "Visitor analytics",
    products: "Products",
    portfolio: "Portfolio",
    team: "Team management",
    subscriptions: "Subscriptions",
    contact: "Contact enquiries",
    "lead-applications": "Lead applications",
    "career-applications": "Career applications",
  };
  const title = titles[activeSection] || "Admin control center";

  const subtitles = {
    demos: "Monitor, access and safely clean up every customer demo.",
    projects: "Manage source projects and launch isolated live environments.",
    upload: "Upload a complete project folder and prepare it for live demos.",
    notes: "Roles, architecture and operating instructions for your team.",
    settings:
      "Manage live site configuration, contacts, social links, assets and payments.",
    analytics: "Review visitor activity, traffic sources and engagement.",
    products: "Manage the products displayed on the public website.",
    portfolio: "Manage public portfolio projects and media.",
    team: "Manage public team members and leadership profiles.",
    subscriptions: "Manage public plans and customer subscription requests.",
    contact: "Review and manage contact enquiries.",
    "lead-applications":
      "Review corporate leads submitted from the navbar Lead Application form.",
    "career-applications":
      "Review applications submitted from the Digital Alife Career page.",
  };
  const subtitle = subtitles[activeSection] || "Admin control center.";

  return (
    <header className="  mb-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-950">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden dark:border-slate-800 dark:text-slate-200"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">

            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl dark:text-white">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-500/10"
            aria-label="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
