import axios from "../api/axios"; // Your base public axios configuration
import { useAuth } from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    try {
      // Hit your backend refresh route
      const response = await axios.get("/refresh", {
        withCredentials: true // MANDATORY: Sends the secure HTTP-Only cookie to the backend
      });

      // Update the global state with the new token and user details
      setAuth((prev) => {
        // console.log("Old Token:", prev?.token);
        // console.log("Received Fresh Token:", response.data.accessToken);
        
        return {
          ...prev,
          user: response.data.user,
          token: response.data.accessToken
        };
      });

      // Return the new token string so useAxiosPrivate can immediately retry failed requests
      return response.data.accessToken;

    } catch (err) {
      console.error("Failed to rotate refresh token session:", err.response?.data || err.message);
      
      // Optional: Clear auth if refresh completely fails (e.g., cookie expired or altered)
      setAuth({});
      throw err; 
    }
  };

  return refresh;
};

export default useRefreshToken;