import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export default function InlineMessage({
  children,
  variant = "error",
  onClose,
  small = false,
}) {
  const styles = {
    error: {
      wrapper:
        "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200",
      icon: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
      Icon: AlertCircle,
    },

    success: {
      wrapper:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
      Icon: CheckCircle2,
    },

    info: {
      wrapper:
        "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200",
      icon: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
      Icon: Info,
    },
  };

  const current = styles[variant] || styles.error;
  const Icon = current.Icon;

  return (
    <div
      role="alert"
      className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm transition-all ${
        current.wrapper
      } ${small ? "text-xs" : "text-sm"}`}
    >
      <span
        className={`mt-0.5 flex shrink-0 items-center justify-center rounded-xl ${
          small ? "h-7 w-7" : "h-8 w-8"
        } ${current.icon}`}
      >
        <Icon size={small ? 14 : 16} strokeWidth={2.2} />{" "}
      </span>

      <p
        className={`min-w-0 flex-1 leading-5 ${
          small ? "text-[11px]" : "text-sm"
        }`}
      >
        {children}
      </p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close message"
          className={`flex shrink-0 items-center justify-center rounded-lg text-current/60 transition hover:bg-black/5 hover:text-current dark:hover:bg-white/10 ${
            small ? "h-7 w-7" : "h-8 w-8"
          }`}
        >
          <X size={small ? 14 : 16} />
        </button>
      )}
    </div>
  );
}
