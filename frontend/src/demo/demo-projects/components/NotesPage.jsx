import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  Database,
  FileText,
  FolderTree,
  Globe,
  LockKeyhole,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  X,
} from "lucide-react";

const tones = {
  indigo: {
    text: "text-indigo-700 dark:text-indigo-300",
    bg: "bg-indigo-100 dark:bg-indigo-500/10",
    bar: "bg-indigo-500",
    active:
      "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200",
  },
  sky: {
    text: "text-sky-700 dark:text-sky-300",
    bg: "bg-sky-100 dark:bg-sky-500/10",
    bar: "bg-sky-500",
    active:
      "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200",
  },
  emerald: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    bar: "bg-emerald-500",
    active:
      "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  amber: {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-500/10",
    bar: "bg-amber-500",
    active:
      "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  },
  rose: {
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-100 dark:bg-rose-500/10",
    bar: "bg-rose-500",
    active:
      "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200",
  },
};

const roles = [
  {
    id: "admin",
    icon: <Users size={18} />,
    tone: "indigo",
    title: "Admin / Operator",
    summary:
      "Demo project upload, live environment control और safe operations manage करना.",
    duties: [
      "Uploaded projects को review करना",
      "Live demo create और delete करना",
      "Credentials rotate करना",
      "Demo expiry और health monitor करना",
    ],
    relevantSections: ["overview", "workflow", "security", "troubleshooting"],
  },
  {
    id: "frontend",
    icon: <Code2 size={18} />,
    tone: "sky",
    title: "Frontend Team",
    summary:
      "UI shell, responsive navbar, dashboard design और user journey improve करना.",
    duties: [
      "App routing और theme behavior fix करना",
      "Responsive layout optimize करना",
      "Dark/light mode consistent रखना",
      "Admin dashboard UX smooth बनाना",
    ],
    relevantSections: ["overview", "architecture", "workflow"],
  },
  {
    id: "backend",
    icon: <ServerCog size={18} />,
    tone: "emerald",
    title: "Backend / Node",
    summary:
      "Project storage, proxy routing, admin auth और live demo orchestration.",
    duties: [
      "Backend API endpoints maintain करना",
      "Uploads और demo directories manage करना",
      "Proxy /d/:id route rewrite करना",
      "Protected admin session logic manage करना",
    ],
    relevantSections: ["architecture", "upload", "security"],
  },
  {
    id: "devops",
    icon: <Terminal size={18} />,
    tone: "amber",
    title: "Infrastructure",
    summary:
      "Docker, runtime health और isolated environment stability maintain करना.",
    duties: [
      "Docker services running रखना",
      "Container health verify करना",
      "Port collisions और deployment failures debug करना",
      "Resource limits और runtime safety ensure करना",
    ],
    relevantSections: ["overview", "architecture", "troubleshooting"],
  },
  {
    id: "qa",
    icon: <ShieldCheck size={18} />,
    tone: "rose",
    title: "QA / Reviewer",
    summary: "Project flow end-to-end verify करना और edge cases capture करना.",
    duties: [
      "Upload flow test करना",
      "Demo URL और login validate करना",
      "Responsive view check करना",
      "404, proxy mismatch और UI lag debug करना",
    ],
    relevantSections: ["workflow", "upload", "troubleshooting"],
  },
];

const noteSections = [
  {
    id: "overview",
    code: "OVR",
    icon: <Globe size={17} />,
    tone: "indigo",
    title: "Project overview",
    description:
      "यह system demo projects upload, launch, and manage karne ke liye bana hai.",
    items: [
      [
        "Goal",
        "Client-facing demo projects को safely upload करके isolated live URLs generate करना.",
      ],
      [
        "Main app",
        "Frontend UI में landing page, navbar, help panel और demo control dashboard include hai.",
      ],
      [
        "Demo manager",
        "Backend app project folders, live containers, proxy URLs और admin session management handle karta hai.",
      ],
      [
        "Routing model",
        "Browser URL /d/:demoId/ ko maintain rakhta hai, while backend internally strips prefix for React app routing.",
      ],
      [
        "Project flow",
        "Upload → project library → create demo → live preview → rotate/clean up.",
      ],
    ],
  },
  {
    id: "architecture",
    code: "ARC",
    icon: <FolderTree size={17} />,
    tone: "sky",
    title: "Code architecture",
    description: "Source code ka structure aur core responsibility clear hai.",
    items: [
      [
        "frontend/src/App.jsx",
        "Global app theme, document attributes, and main app bootstrap.",
      ],
      [
        "frontend/src/components/ui/Navbar.jsx",
        "Main website navigation, mobile menu, theme switch, and help panel integration.",
      ],
      [
        "frontend/src/demo/demo-projects/DemoProjectsPage.jsx",
        "Admin dashboard for projects, uploads, live demos, and health checks.",
      ],
      [
        "frontend/src/demo/demo-projects/components/NotesPage.jsx",
        "Internal operating guide and project knowledge base for the team.",
      ],
      [
        "Backend/src/app.js",
        "Express app bootstrap, frontend static serving, SPA fallback, and API mounts.",
      ],
      [
        "Backend/src/proxy/demo-proxy.js",
        "Demo URL rewriting, nested route handling, and live demo proxy logic.",
      ],
      [
        "Backend/src/routes/api-routes.js",
        "Admin API, demo APIs, project APIs, and protected admin endpoints.",
      ],
      [
        "Backend/src/services/admin-auth.js",
        "Signed session cookie logic for admin access control.",
      ],
    ],
  },
  {
    id: "workflow",
    code: "WKF",
    icon: <Sparkles size={17} />,
    tone: "indigo",
    title: "Daily operating workflow",
    description: "Daily process ko safe, repeatable aur clean maintain rakho.",
    items: [
      [
        "1. Upload project",
        "Project folder ko upload panel se choose karke project library mein add karo.",
      ],
      [
        "2. Review metadata",
        "Project type, file count, folder structure, and project name verify karo.",
      ],
      [
        "3. Launch demo",
        "View live demo click karte hi backend demo container build/launch karta hai.",
      ],
      [
        "4. Access live URL",
        "Public demo URL open karke credentials copy kar ke app preview check karo.",
      ],
      [
        "5. Monitor health",
        "Health, status, expiry time, and authentication state check karte raho.",
      ],
      [
        "6. Cleanup",
        "Task complete hone par demo delete karo, stale URLs remove karo, source project maintain karo.",
      ],
    ],
  },
  {
    id: "upload",
    code: "UPL",
    icon: <FileText size={17} />,
    tone: "emerald",
    title: "Upload & storage rules",
    description:
      "Project upload ka process secure, predictable aur project-specific hona chahiye.",
    items: [
      [
        "Folder preservation",
        "Dropped folder and nested files ka relative structure preserve hona chahiye.",
      ],
      [
        "Ignored files",
        "node_modules, .git, dist, build, coverage, IDE folders aur temporary folders skip hone chahiye.",
      ],
      [
        "Upload validation",
        "Unsafe executable file types, large traversal payloads aur suspicious entries reject hone chahiye.",
      ],
      [
        "Project type",
        "Auto/manual project type ko admin dashboard se choose kar sakte ho.",
      ],
      [
        "Backend storage",
        "Uploads backend ke public/demo-projects area me store hote hain for live preview generation.",
      ],
    ],
  },
  {
    id: "security",
    code: "SEC",
    icon: <LockKeyhole size={17} />,
    tone: "rose",
    title: "Security essentials",
    description:
      "Production aur access layer me sabse important settings yahi hain.",
    items: [
      [
        "Admin protection",
        "Admin mutating APIs ko signed sessions ya protected routes se secure rakho.",
      ],
      [
        "Credential handling",
        "Demo password browser local storage mein protected format me store ho sakta hai; server default response me nae dikhana.",
      ],
      [
        "Session safety",
        "Signed cookie, secure route guards aur redirects ko consistent rakhna zaroori hai.",
      ],
      [
        "Container isolation",
        "Container limits, no-new-privileges, cap drop rules aur resource caps maintain rakho.",
      ],
      [
        "Secrets",
        ".env files, admin secrets ya API keys ko notes, screenshots aur public logs me show mat karo.",
      ],
    ],
  },
  {
    id: "troubleshooting",
    code: "TRB",
    icon: <Terminal size={17} />,
    tone: "amber",
    title: "Troubleshooting",
    description:
      "Common issues ko early identify karke fix karna easy hota hai.",
    items: [
      [
        "404 on demo path",
        "URL /d/:id/... ko browser me direct open karte waqt proxy rewrite aur base routing check karo.",
      ],
      [
        "No routes matched",
        "Frontend React Router ko correct basename/path handling milna chahiye; nested route logic verify karo.",
      ],
      [
        "White/blank UI",
        "Dark/light theme attribute and CSS variables check karo; body background, text color aur borders match hone chahiye.",
      ],
      [
        "Docker not starting",
        "Docker Desktop running hai ya nahi, port availability, and container logs inspect karo.",
      ],
      [
        "Upload rejected",
        "File type validation, project folder structure, and suspicious file filtering verify karo.",
      ],
      [
        "Password unavailable",
        "Demo row se credentials rotate option use karke fresh secret generate karo.",
      ],
    ],
  },
];

const commandSnippets = [
  {
    label: "Start backend",
    code: "cd Backend\nnpm run dev",
  },
  {
    label: "Start frontend",
    code: "cd frontend\nnpm run dev",
  },
  {
    label: "Check running demos",
    code: "docker ps",
  },
  {
    label: "Inspect logs",
    code: "Get-ChildItem .\nGet-Content logs\*.log",
  },
];

export default function NotesPage() {
  const [query, setQuery] = useState("");
  const [activeRoles, setActiveRoles] = useState([]);
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(noteSections.map((section) => [section.id, true])),
  );
  const [personalNote, setPersonalNote] = useState("");
  const [copied, setCopied] = useState("");
  const sectionRefs = useRef({});

  function toggleRole(id) {
    setActiveRoles((current) =>
      current.includes(id)
        ? current.filter((roleId) => roleId !== id)
        : [...current, id],
    );
  }

  function toggleSection(id) {
    setOpenSections((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function jumpTo(id) {
    setOpenSections((current) => ({
      ...current,
      [id]: true,
    }));

    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function copyText(text, key) {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(key);

      window.setTimeout(() => {
        setCopied((current) => (current === key ? "" : current));
      }, 1600);
    } catch {
      setCopied("");
    }
  }

  function clearFilters() {
    setQuery("");
    setActiveRoles([]);
  }

  const filteredSections = useMemo(() => {
    const value = query.trim().toLowerCase();

    return noteSections
      .filter((section) => {
        if (!activeRoles.length) {
          return true;
        }

        return activeRoles.some((roleId) =>
          roles
            .find((role) => role.id === roleId)
            ?.relevantSections.includes(section.id),
        );
      })
      .map((section) => ({
        ...section,
        items: value
          ? section.items.filter(([label, text]) =>
              `${label} ${text} ${section.title}`.toLowerCase().includes(value),
            )
          : section.items,
      }))
      .filter((section) => (value ? section.items.length > 0 : true));
  }, [query, activeRoles]);

  const totalItems = filteredSections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );

  const hasFilters = query.trim().length > 0 || activeRoles.length > 0;

  return (
    <section className="min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {" "}
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        {/* Header */}{" "}
        <header className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
          {" "}
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            {" "}
            <div className="flex min-w-0 items-start gap-4">
              {" "}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {" "}
                <BookOpen size={22} />{" "}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Team knowledge base
                </p>

                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                  Project notes & roles
                </h1>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Demo upload, live preview, backend proxy, frontend shell aur
                  team workflow ka single source of truth.
                </p>
              </div>
            </div>
            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 size={14} />
              Single source of truth
            </div>
          </div>
        </header>
        {/* Search */}
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-500/10">
            <Search size={17} className="shrink-0 text-slate-400" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes, roles, errors..."
              aria-label="Search notes"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </label>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {filteredSections.length} sections · {totalItems} notes
            </span>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
        {/* Roles */}
        <div className="mt-5 -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {roles.map((role) => {
            const tone = tones[role.tone];
            const active = activeRoles.includes(role.id);

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role.id)}
                aria-pressed={active}
                className={`group w-[285px] flex-none rounded-3xl border p-4 text-left transition ${
                  active
                    ? tone.active
                    : "border-slate-200 bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
                  >
                    {role.icon}
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-slate-950 dark:text-white">
                      {role.title}
                    </h3>

                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Role view
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {role.summary}
                </p>

                <ul className="mt-3 space-y-2">
                  {role.duties.slice(0, active ? 4 : 2).map((duty) => (
                    <li
                      key={duty}
                      className="flex items-start gap-2 text-[11px] leading-4 text-slate-600 dark:text-slate-300"
                    >
                      <CheckCircle2
                        size={12}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />

                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        {/* Section navigator */}
        <div className="mt-5 overflow-x-auto border-y border-slate-200 py-3 dark:border-slate-800">
          <div className="flex min-w-max gap-2">
            {noteSections.map((section) => {
              const tone = tones[section.tone];

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => jumpTo(section.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${tone.bar}`} />

                  <span className="font-mono text-[10px] text-slate-400">
                    {section.code}
                  </span>

                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
        {/* Main layout */}
        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Notes */}
          <div className="min-w-0 space-y-4">
            {filteredSections.length ? (
              filteredSections.map((section) => {
                const tone = tones[section.tone];
                const isOpen = openSections[section.id];

                return (
                  <article
                    key={section.id}
                    ref={(element) => {
                      sectionRefs.current[section.id] = element;
                    }}
                    className="scroll-mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900 sm:p-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-10 w-1.5 shrink-0 rounded-full ${tone.bar}`}
                        />

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.text}`}
                        >
                          {section.icon}
                        </span>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black text-slate-950 dark:text-white">
                            {section.title}
                          </h3>

                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        size={18}
                        className={`shrink-0 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-200 dark:border-slate-800">
                        {section.items.map(([label, text]) => {
                          const key = `${section.id}-${label}`;

                          return (
                            <div
                              key={label}
                              className="group flex gap-4 border-b border-slate-100 p-4 last:border-0 dark:border-slate-900 sm:px-5"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    {label}
                                  </span>
                                </div>

                                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                  {text}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => copyText(text, key)}
                                aria-label={`Copy ${label}`}
                                title={`Copy ${label}`}
                                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 opacity-100 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                {copied === key ? (
                                  <CheckCircle2
                                    size={14}
                                    className="text-emerald-500"
                                  />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-950">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
                  <Search size={22} />
                </div>

                <h3 className="mt-4 text-base font-black text-slate-950 dark:text-white">
                  No matching notes
                </h3>

                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                  Try a role, folder name, issue, or project-related keyword.
                </p>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <FileText size={15} />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    Quick team note
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Session-specific note
                  </p>
                </div>
              </div>

              <textarea
                value={personalNote}
                onChange={(event) => setPersonalNote(event.target.value)}
                placeholder="Client instruction, deployment detail, or next task..."
                rows={6}
                className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-500/10"
              />

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Database size={11} />
                  Session note
                </span>

                <span>{personalNote.length} chars</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Terminal size={15} />
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">
                    Useful commands
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Development helpers
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {commandSnippets.map((command) => (
                  <div
                    key={command.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {command.label}
                      </span>

                      <button
                        type="button"
                        onClick={() => copyText(command.code, command.label)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
                      >
                        {copied === command.label ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-emerald-700 dark:text-emerald-300">
                      {command.code}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-xs leading-5 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-rose-500"
              />

              <span>
                Passwords aur .env values ko notes me kabhi share mat karo.
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <LockKeyhole size={16} className="text-indigo-500" />

                <h3 className="text-sm font-black text-slate-950 dark:text-white">
                  Security reminder
                </h3>
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Demo credentials ko sirf authorized workspace me use karo.
                Public screenshots ya logs me secrets expose mat karo.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
