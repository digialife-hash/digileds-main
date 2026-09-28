import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ROUTES } from "./routeConstants";

// Keep the protection logic in place; set this to true when Office login is required.
const OFFICE_AUTH_REQUIRED = true;

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (OFFICE_AUTH_REQUIRED && loading) {
    return <LoadingSpinner />;
  }

  // Login redirect is intentionally disabled for direct Office route access.
  if (OFFICE_AUTH_REQUIRED && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
