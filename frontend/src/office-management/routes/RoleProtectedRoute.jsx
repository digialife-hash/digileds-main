import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ROUTES } from "./routeConstants";

// Keep role protection available; set this to true when Office login is required.
const OFFICE_AUTH_REQUIRED = true;

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isEmbeddedDashboard = location.pathname.startsWith("/admin/dashboard");

  if (isEmbeddedDashboard) {
    return <Outlet />;
  }

  if (OFFICE_AUTH_REQUIRED && loading) {
    return <LoadingSpinner />;
  }

  // Login redirect is intentionally disabled for direct Office route access.
  if (OFFICE_AUTH_REQUIRED && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Role redirect is intentionally disabled while Office routes are public.
  if (OFFICE_AUTH_REQUIRED && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
