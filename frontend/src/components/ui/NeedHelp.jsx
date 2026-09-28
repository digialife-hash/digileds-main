import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Mail,
  MessageCircleMore,
  Phone,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./Button";
import ThemeToggleButton from "./ThemeToggleButton";

const helpOptions = [
  {
    title: "Get a Quote",
    description: "Share your project idea and get a custom plan.",
    href: "/quote",
    icon: Sparkles,
    external: false,
  },
  {
    title: "Talk to Sales",
    description: "+91 9211954915",
    href: "tel:+919211954915",
    icon: Phone,
    external: true,
  },
  {
    title: "Email Us",
    description: "info@digitalalife.com",
    href: "mailto:info@digitalalife.com",
    icon: Mail,
    external: true,
  },
  {
    title: "Contact Form",
    description: "Send us your requirements quickly.",
    href: "/contact",
    icon: MessageCircleMore,
    external: false,
  },
];

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";

  const savedTheme = localStorage.getItem("theme-mode");
  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function NeedHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "dark"
          : "light";
      setTheme(nextTheme);
    };

    syncTheme();
    window.addEventListener("themechange", syncTheme);

    const observer = new MutationObserver(() => syncTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("themechange", syncTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[1200] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[320px] rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.18)] ring-1 ring-black/5 backdrop-blur-sm dark-theme-panel transition-all duration-300 dark:border-slate-700 dark:bg-slate-950/95 dark:text-slate-100 dark:shadow-[0_22px_70px_rgba(2,6,23,0.7)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Need Help?
              </p>
              <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                We are here
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggleButton
                variant="compact"
                className="flex h-8 w-8 items-center justify-center rounded-full"
              />

              <Button
                variant="unstyled"
                type="button"
                aria-label="Close help panel"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              >
                <X size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {helpOptions.map(
              ({ title, description, href, icon: Icon, external }) => {
                const content = (
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner shadow-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-300 dark:shadow-none">
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {description}
                      </p>
                    </div>

                    <ArrowUpRight
                      size={16}
                      className="text-slate-400 dark:text-slate-500"
                    />
                  </div>
                );

                return external ? (
                  <a
                    key={title}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-2.5 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-emerald-400/40 dark:hover:bg-slate-800"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={title}
                    to={href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-2.5 transition hover:border-emerald-200 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:border-emerald-400/40 dark:hover:bg-slate-800"
                  >
                    {content}
                  </Link>
                );
              },
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-slate-900 p-3 text-white dark:bg-slate-800">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-300">
              Quick support
            </p>
            <p className="mt-1 text-sm font-medium">
              Usually replies within 10–15 minutes.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <ThemeToggleButton
          variant="compact"
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.12)] transition hover:scale-[1.02] hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-300 dark:shadow-[0_12px_35px_rgba(2,6,23,0.42)] dark:hover:border-emerald-400/60 dark:hover:bg-slate-800 dark:hover:text-emerald-200"
        />

        <Button
          variant="unstyled"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="
  group
  flex
  items-center
  gap-3
  rounded-full
  bg-gradient-to-l
  from-black
  via-[#267060]
  to-[#267060]
  px-4
  py-3
  text-sm
  font-semibold
  text-white
  shadow-[0_12px_35px_rgba(20,184,166,0.45)]
  transition
  duration-300
  hover:scale-[1.02]
  hover:shadow-[0_18px_40px_rgba(20,184,166,0.60)]
"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
            <MessageCircleMore size={18} />
          </span>
          <span className="hidden sm:inline">Need Help</span>
        </Button>
      </div>
    </div>
  );
}
