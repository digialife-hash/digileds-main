
export default function PageHeader({
  eyebrow = "Workspace",
  title,
  description,
  action,
}) {
  return (
    <header className="relative mb-8 w-full ">
      {/* =========================================================
          TOP ACCENT LINE
      ========================================================== */}
      {/* <div className="pointer-events-none absolute -top-2 left-0 h-px w-24 bg-gradient-to-r from-orange-400/60 via-orange-400/20 to-transparent dark:from-orange-400/40 dark:via-orange-400/10 dark:to-transparent" /> */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ">
        {/* =======================================================
            CONTENT
        ======================================================== */}
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-stone-900 transition-colors duration-300 dark:text-white sm:text-4xl">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 transition-colors duration-300 dark:text-slate-400 sm:text-[15px]">
              {description}
            </p>
          )}
        </div>

        {/* =======================================================
            ACTION
        ======================================================== */}
        {action && (
          <div className="shrink-0 [&>button]:transition-all [&>button]:duration-200">
            {action}
          </div>
        )}
      </div>
    </header>
  );
}

