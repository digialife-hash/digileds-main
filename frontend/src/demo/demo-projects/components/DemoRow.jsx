import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  LoaderCircle,
  MoreVertical,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { formatDate, formatRemaining, getProjectType } from "../utils.js";

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

export default function DemoRow({
  demo,
  onRotate,
  onDelete,
  onCopy,
  onOpen,
  onExtend,
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(
    demo.durationMinutes || 60,
  );
  const [now, setNow] = useState(Date.now());
  const menuRef = useRef(null);
  const remaining = Math.max(0, new Date(demo.expiresAt).getTime() - now);
  const status = getStatusInfo(demo);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnOutside(event) {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
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

  async function extend() {
    setMenuOpen(false);
    setBusy("extend");
    try {
      await onExtend(demo.id, durationMinutes);
    } finally {
      setBusy("");
    }
  }

  const username = demo.accessUsername || demo.credentials?.username || "";
  const usernameCopyClass =
    demo.copied === "username"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "text-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white";
  const passwordCopyClass =
    demo.copied === "password"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : "text-slate-400 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white";

  return (
    <article className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:p-5 dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1.35fr_0.9fr_1fr_1.25fr_auto] xl:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {getProjectType(demo.projectType).icon}
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
              className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${demo.copied === "link" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-900 dark:hover:text-white"}`}
              aria-live="polite"
            >
              {demo.copied === "link" ? (
                <Check size={12} />
              ) : (
                <Copy size={12} />
              )}
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
                  className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${usernameCopyClass}`}
                  title="Copy username"
                  aria-label={
                    demo.copied === "username"
                      ? "Username copied"
                      : "Copy username"
                  }
                >
                  <Copy size={12} />
                  {demo.copied === "username" ? "Copied" : "Copy"}
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
                  className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-bold transition ${passwordCopyClass}`}
                  title="Copy password"
                  aria-label={
                    demo.copied === "password"
                      ? "Password copied"
                      : "Copy password"
                  }
                >
                  <Copy size={12} />
                  {demo.copied === "password" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                Password available in this browser
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Password unavailable
              </p>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-400">
                This browser did not create this demo&apos;s password.
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
              <div className="border-t border-slate-100 p-2 dark:border-slate-800">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Set live time
                </label>
                <select
                  value={durationMinutes}
                  onChange={(event) =>
                    setDurationMinutes(Number(event.target.value))
                  }
                  disabled={Boolean(busy)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={360}>6 hours</option>
                  <option value={720}>12 hours</option>
                  <option value={1440}>1 day</option>
                  <option value={10080}>7 days</option>
                </select>
                <button
                  type="button"
                  onClick={extend}
                  disabled={Boolean(busy)}
                  className="mt-2 flex w-full items-center justify-center rounded-lg bg-slate-950 px-2 py-2 text-[11px] font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  {busy === "extend" ? "Updating..." : "Update expiry"}
                </button>
              </div>
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
