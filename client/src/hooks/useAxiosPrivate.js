import { useEffect } from "react";
import { axiosPrivate } from "../api/axios"; // Your custom axios instance with base URL
import useRefreshToken from "./useRefreshToken";
import { useAuth } from "./useAuth";

const useAxiosPrivate = () => {
  const refresh = useRefreshToken();
  const { auth } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        // Attach token if it exists
        if (!config.headers["Authorization"] && auth?.token) {
          config.headers["Authorization"] = `Bearer ${auth.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        
        // Check if it's a 401 error and we haven't already tried retrying this specific request
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true; // 💡 CRITICAL: Mark this request as retried so it never loops!

          try {
            const newAccessToken = await refresh();
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosPrivate(prevRequest); // Retry the original request with the new token
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [auth, refresh]);

  return axiosPrivate;
};

export default useAxiosPrivate;