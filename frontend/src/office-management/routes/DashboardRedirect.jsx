import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ROLE_DASHBOARD_ROUTES, ROUTES } from "./routeConstants";

const DashboardRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Opening dashboard..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Navigate to={ROLE_DASHBOARD_ROUTES[user?.role] || ROUTES.UNAUTHORIZED} replace />;
};

export default DashboardRedirect;
