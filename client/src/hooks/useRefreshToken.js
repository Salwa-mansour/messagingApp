import axios from "../api/axios";
import { useAuth } from "./useAuth";

// 💡 A file-level variable to cache the request if it double-fires instantly
let activeRefreshPromise = null;

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    // 1. If a refresh request is ALREADY in flight, don't start a new one!
    // Just return the promise that is already running.
    if (activeRefreshPromise) {
      return activeRefreshPromise;
    }

    // 2. Create the refresh request and assign it to our lock variable
    activeRefreshPromise = (async () => {
      try {
        const response = await axios.get("/refresh", {
          withCredentials: true 
        });

        const { accessToken, user } = response.data;

        setAuth((prev) => {
          return {
            ...prev,
            user: user,
            token: accessToken
          };
        });

        return accessToken;

      } catch (err) {
        console.error("Failed to rotate refresh token session:", err.response?.data || err.message);
        setAuth({});
        throw err; 
      } finally {
        // 3. Clear the lock once the request finishes completely
        activeRefreshPromise = null;
      }
    })();

    return activeRefreshPromise;
  };

  return refresh;
};

export default useRefreshToken;