import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken"; 
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
        await refresh();
      } catch (err) {
        console.log("No valid refresh session found (User is a guest).");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // This runs on mount. If there's already a token in memory, skip.
    // If there's no token but persist is true, try to refresh.
    if (!auth?.token && persist) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
    
  // 3. FIX: Remove auth?.token from here! 
  // We only pass 'persist' and 'refresh'. Since 'refresh' is a stable hook function,
  // this effect will now only run once when the user first visits the page.
  }, [persist, refresh]); 

  return !persist ? <Outlet /> : isLoading ? <p>Loading session...</p> : <Outlet />;
};

export default PersistLogin;