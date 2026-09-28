import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import PageBackButton from "../components/common/PageBackButton";
import { ROUTES } from "../routes/routeConstants";

const Unauthorized = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <PageBackButton fallbackPath={ROUTES.DASHBOARD} className="absolute left-4 top-4 z-10" />
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-600">
          <ShieldAlert size={32} />
        </div>

        <h1 className="text-2xl font-black text-slate-900">Access denied</h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          You do not have permission to access this page.
        </p>

        <Link
          to={ROUTES.DASHBOARD}
          className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
