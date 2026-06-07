import { Outlet } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useRefreshToken from "../hooks/useRefreshToken"; 
import { useAuth } from "../hooks/useAuth";
import useToggle from "../hooks/useToggle";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  const [persist] = useToggle("persist", false);
  
  // 💡 CIRCUIT BREAKER: Prevents React from executing the effect block 
  // more than once per mount cycle, even if state or context updates.
  const hasRun = useRef(false);

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

    // 💡 ADJUSTED LOGIC: Check our ref flag alongside your conditions.
    // This blocks the infinite loop if a network error fires setAuth({}).
    if (!auth?.token && persist && !hasRun.current) {
      hasRun.current = true; // Lock the gate instantly
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
    // Kept clean, tracking standard hook triggers stably
  }, [persist, refresh, auth?.token]); 

  return !persist ? <Outlet /> : isLoading ? <p>Loading session...</p> : <Outlet />;
};

export default PersistLogin;