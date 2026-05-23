import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

  // If the user has an authentication token, let them through to the child routes
  // Otherwise, kick them back to login but remember where they wanted to go
  return auth?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;