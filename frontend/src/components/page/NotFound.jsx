import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section
      className="
        grid min-h-[60vh] place-items-center px-6 text-center
        bg-[#f7faf9] text-[#0C2C50]
        transition-colors duration-300
        dark:bg-[#071D35] dark:text-white
        h-[100vh]
      "
    >
      <div>
        {/* 404 */}
        <p
          className="
            text-7xl font-black
            text-[#2E9E6D]
            dark:text-[#4AAE85]
          "
        >
          404
        </p>

        {/* Heading */}
        <h1
          className="
            mt-3 text-3xl font-bold
            text-[#0C2C50]
            dark:text-white
          "
        >
          Page not found
        </h1>

        {/* Description */}
        <p
          className="
            mt-3 text-slate-500
            dark:text-white/55
          "
        >
          The page you are looking for does not exist.
        </p>

        {/* Back Home */}
        <Link
          to="/"
          className="
            mt-7 inline-flex items-center justify-center
            rounded-xl px-5 py-3
            font-semibold
            bg-[#0C2C50] text-white
            transition-all duration-300
            hover:-translate-y-0.5
            hover:bg-[#2E9E6D]
            dark:bg-[#2C8566]
            dark:hover:bg-[#4AAE85]
          "
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
