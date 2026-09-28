import { ArrowLeft, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComingSoon = ({
  title = "Coming Soon",
  description = "This feature is planned for a future version. It is visible here so users know the module exists, but it is not available yet.",
}) => {
  const navigate = useNavigate();

  return (
    <section className="flex h-full items-center justify-center overflow-y-auto px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          <Clock3 size={26} />
        </div>
        <span className="mt-6 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700 ring-1 ring-amber-100">
          Coming Soon
        </span>
        <h1 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-6 text-slate-500">
          {description}
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    </section>
  );
};

export default ComingSoon;
