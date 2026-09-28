import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (!auth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  const { user, loading } = auth;
  if (loading) return <div className="social-theme-root grid min-h-screen place-items-center bg-stone-100 text-stone-500 dark:bg-[#070b14] dark:text-slate-400">Loading...</div>;
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}
