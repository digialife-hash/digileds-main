import {
  CheckCircle2,
  Database,
  LayoutDashboard,
  Search,
  ShieldCheck,
} from "lucide-react";

export function StatsGrid({ activeDemos, healthyDemos, projects }) {
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

export function SectionHeading({ eyebrow, title, description, count }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
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

export function EmptyState({ icon: Icon = Search, title, description }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-950 dark:text-slate-500">
        <Icon size={22} />
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
