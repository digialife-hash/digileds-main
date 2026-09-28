
import { useState } from "react";

const CONSENT_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => {
    return !window.localStorage.getItem(CONSENT_KEY);
  });

  function saveConsent(value) {
    // Save user's choice permanently in this browser
    window.localStorage.setItem(CONSENT_KEY, value);

    // If user rejects optional cookies,
    // remove optional visitor tracking data.
    if (value === "rejected") {
      window.localStorage.removeItem("site.visitor.id");
      window.sessionStorage.removeItem("site.visitor.session");
    }

    // Tell the rest of the application that consent changed.
    window.dispatchEvent(
      new CustomEvent("cookie-consent-changed", {
        detail: value,
      }),
    );

    // Immediately hide the cookie popup.
    setVisible(false);
  }

  // Cookie popup is completely hidden after consent.
  // It will remain hidden even after page refresh because
  // the consent value is stored in localStorage.
  if (!visible) {
    return null;
  }

  return (
    <aside
      role="dialog"
      aria-label="Cookie preferences"
      aria-describedby="cookie-consent-message"
      className="
        fixed
        inset-x-3
        bottom-3
        z-[110]
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-2xl
        dark:border-slate-700
        dark:bg-slate-900
        sm:inset-x-auto
        sm:bottom-5
        sm:left-5
        sm:max-w-md
      "
    >
      <h2 className="text-sm font-black text-slate-950 dark:text-white">
        Cookie preferences
      </h2>

      <p
        id="cookie-consent-message"
        className="
          mt-1.5
          text-xs
          leading-5
          text-slate-600
          dark:text-slate-300
        "
      >
        We use essential cookies to keep you signed in and protect your
        account. Optional analytics cookies are not enabled without your
        permission.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {/* ACCEPT */}
        <button
          type="button"
          onClick={() => saveConsent("accepted")}
          className="
            rounded-xl
            bg-emerald-600
            px-3.5
            py-2
            text-xs
            font-bold
            text-white
            transition-colors
            hover:bg-emerald-700
          "
        >
          Accept optional
        </button>

        {/* REJECT */}
        <button
          type="button"
          onClick={() => saveConsent("rejected")}
          className="
            rounded-xl
            border
            border-slate-300
            px-3.5
            py-2
            text-xs
            font-bold
            text-slate-700
            transition-colors
            hover:bg-slate-50
            dark:border-slate-600
            dark:text-slate-200
            dark:hover:bg-slate-800
          "
        >
          Reject optional
        </button>
      </div>
    </aside>
  );
}

