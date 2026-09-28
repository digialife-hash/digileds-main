import { Link } from "react-router-dom";
import ThemeToggleButton from "../../../components/ui/ThemeToggleButton.jsx";

export default function AuthShell({ children }) {
  return (
    <main className="social-theme-root relative min-h-screen overflow-hidden bg-stone-100 dark:bg-[#070b14] dark:text-slate-100">
      <img
        src="/images/auth.png"
        alt="Social media management"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-blue-950/10" />
      <section className="relative flex min-h-screen items-center justify-end p-5 sm:p-10 lg:pr-[7vw]">
        <Link
          to="/social-post"
          className="absolute left-6 top-6 flex items-center gap-2 text-lg font-bold"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-stone-900 font-serif italic text-white">
            S
          </span>
          Socially
        </Link>
        <ThemeToggleButton
          variant="compact"
          className="absolute right-6 top-6"
          srLabel="Toggle social theme"
        />
        <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white/95 p-7 shadow-2xl backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-100 sm:p-10">
          {children}
        </div>
      </section>
    </main>
  );
}
