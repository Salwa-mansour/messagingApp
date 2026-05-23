import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken"; // Your custom hook that hits /api/refresh
import { useAuth } from "../hooks/useAuth";
import useToggle from "../hooks/useToggle";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const [persist] = useToggle("persist", false);

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        // Hit your /api/refresh endpoint to get a fresh access token
        await refresh();
      } catch (err) {
        // Log gently — 401 is expected if they don't have a cookie yet
        console.log("No valid refresh session found (User is a guest).");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Only run verification if we have no access token in memory BUT persist is enabled
    if (!auth?.token && persist) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [auth?.token, persist, refresh]);

  // Show a clean loading state while the background check finishes to avoid UI flashing
  return !persist ? <Outlet /> : isLoading ? <p>Loading session...</p> : <Outlet />;
};

export default PersistLogin;