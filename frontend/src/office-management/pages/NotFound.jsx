import { Link } from "react-router-dom";
import { ROUTES } from "../routes/routeConstants";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-6xl font-black text-blue-600">404</h1>

        <h2 className="mt-4 text-2xl font-black text-slate-900">Page not found</h2>

        <p className="mt-3 text-sm text-slate-500">
          The page you are looking for does not exist.
        </p>

        <Link
          to={ROUTES.DASHBOARD}
          className="mt-6 inline-flex rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Go back
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
