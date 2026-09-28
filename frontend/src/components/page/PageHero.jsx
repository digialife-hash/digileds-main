import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function PageHero({
  eyebrow = "Digital Alife",
  title,
  description,
  action = "Get a Free Consultation",
}) {
  return (
    <section
      className="
        relative min-h-[100vh] overflow-hidden
        px-6 py-24
        sm:px-10
        lg:px-14 lg:py-28

        bg-slate-50 text-slate-900
        dark:bg-[#0C2C50] dark:text-white

        transition-colors duration-300
      "
    >
      {/* Top Right Glow */}
      <div
        className="
          absolute -right-24 -top-28
          h-80 w-80 rounded-full
          bg-[#2E9E6D]/15 blur-3xl
          dark:bg-[#2E9E6D]/25
        "
      />

      {/* Bottom Glow */}
      <div
        className="
          absolute -bottom-32 left-1/4
          h-64 w-64 rounded-full
          bg-cyan-500/10 blur-3xl
          dark:bg-cyan-300/10
        "
      />

      {/* Main Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-12rem)] max-w-5xl flex-col items-center justify-center text-center">


        {/* Title */}
        <h1
          className="
            mx-auto mt-5 max-w-4xl
            text-4xl font-bold tracking-tight
            sm:text-5xl
            lg:text-6xl
            text-slate-900
            dark:text-white
          "
        >
          {title}
        </h1>

        {/* Description */}
        <p
          className="
            mx-auto mt-6 max-w-2xl
            text-base leading-7
            text-slate-600
            dark:text-white/75
          "
        >
          {description}
        </p>

        {/* CTA */}
        {action && (
          <Button
            as={Link}
            variant="primary"
            to="/quote"
            className="
              mt-9 rounded-xl
              px-6 py-3.5
              text-sm font-semibold
            "
          >
            {action}
          </Button>
        )}
      </div>
    </section>
  );
}
