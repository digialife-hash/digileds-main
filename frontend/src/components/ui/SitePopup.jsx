import { useEffect, useState } from "react";

const SITE_API = import.meta.env.VITE_SITE_API_URL || "";

function getConfig(result) {
  const row = result?.data?.find((item) => item.key_name === "site_config");
  if (!row) return null;
  if (typeof row.value === "object") return row.value;
  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

export default function SitePopup() {
  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    fetch(`${SITE_API}/api/site-settings`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Settings request failed: ${response.status}`);
        return response.json();
      })
      .then((result) => {
        const next = getConfig(result);
        const popup = next?.popup;
        if (!popup?.enabled) return;
        if (
          popup.show_once &&
          window.localStorage.getItem("site-popup-seen") === "1"
        )
          return;
        setConfig(next);
        timer = window.setTimeout(
          () => setVisible(true),
          Math.max(0, Number(popup.delay_seconds) || 0) * 1000,
        );
      })
      .catch((error) => console.error("Site popup settings failed:", error));
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible || !config?.popup) return null;
  const popup = config.popup;
  const position =
    popup.position === "bottom-left"
      ? "bottom-5 left-5"
      : popup.position === "top-right"
        ? "right-5 top-5"
        : popup.position === "top-left"
          ? "left-5 top-5"
          : "bottom-5 right-5";

  function close() {
    if (popup.show_once) window.localStorage.setItem("site-popup-seen", "1");
    setVisible(false);
  }

  return (
    <div
      className={`fixed ${position} z-[100] w-[min(92vw,380px)] rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900`}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close popup"
        className="absolute right-3 top-3 text-xl text-slate-400"
      >
        ×
      </button>
      <h2 className="pr-6 text-lg font-black text-slate-950 dark:text-white">
        {popup.title || "Let’s talk"}
      </h2>
      {popup.message && (
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
          {popup.message}
        </p>
      )}
      <form
        className="mt-4 space-y-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          close();
        }}
      >
        {popup.collect_name && (
          <input
            name="name"
            required
            placeholder="Your name"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        )}
        {popup.collect_email && (
          <input
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        )}
        {popup.collect_phone && (
          <input
            name="phone"
            type="tel"
            placeholder="Phone number"
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        )}
        {popup.collect_message && (
          <textarea
            name="message"
            rows="3"
            placeholder="How can we help?"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        )}
        <a
          href={popup.button_url || "/contact"}
          onClick={close}
          className="block rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-bold text-white"
        >
          {popup.button_text || "Contact us"}
        </a>
      </form>
    </div>
  );
}
