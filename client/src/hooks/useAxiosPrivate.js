import { useEffect } from "react";
import axiosPrivate from "../api/axios";
import { useAuth } from "./useAuth";
import useRefreshToken from "./useRefreshToken";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        // 1. Request Interceptor: Attach the access token to the headers
        const requestIntercept = axiosPrivate.interceptors.request.use(
            (config) => {
                // If the Authorization header isn't set yet, inject our token
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.token}`;
                }
                return config;
            }, 
            (error) => Promise.reject(error)
        );

        // 2. Response Interceptor: Handle token expiration (403 or 401 depending on your backend)
        const responseIntercept = axiosPrivate.interceptors.response.use(
            (response) => response, // If the request succeeds, just return the response
            async (error) => {
                const prevRequest = error?.config;
                
                // If the server returns 403 (expired token) and we haven't retried this request yet
                if ((error?.response?.status === 403 || error?.response?.status === 401) && !prevRequest?.sent) {
                    prevRequest.sent = true; // Mark request as retried to avoid infinite loops

                    try {
                        // Fetch a completely new access token from the backend
                        const newAccessToken = await refresh();
                        
                        // Update the failed request's header with the brand new token
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                        
                        // Retry the original request with the new token
                        return axiosPrivate(prevRequest);
                    } catch (refreshError) {
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Cleanup interceptors when the component using the hook unmounts
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        };
    }, [auth, refresh]);

    return axiosPrivate;
};

export default useAxiosPrivate;