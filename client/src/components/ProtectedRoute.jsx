import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { auth } = useAuth();
  const location = useLocation();

 
  // 💡 FIX: Access localStorage directly to see if the user wanted to be remembered.
  // If they do, and memory state is empty, let PersistLogin handle the loading screen first!
  const isPersistChecked = JSON.parse(localStorage.getItem("persist")) || false;

  // If we have a token, they are allowed in
  if (auth?.token) {
    return <Outlet />;
  }

  // If there's no token, BUT the user trusted this device, pause and don't redirect yet.
  // PersistLogin will change the loading state and populate the token.
  if (isPersistChecked && !auth?.token) {
    return <Outlet />; 
  }

  // Otherwise, they are truly logged out. Send them away.
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;