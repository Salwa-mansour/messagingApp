import { useContext, useState } from "react"; // Added useState just in case isLoading is local
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChatDashboard = () => {
  // 1. Initialize navigate hook
  const navigate = useNavigate();

  // 2. Destructure setAuth alongside auth from your context
  const { auth, setAuth } = useContext(AuthContext);
console.log("Current Auth State:", auth);
  // 3. Keep track of loading state locally if it's not global
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async (e) => {
    // 4. STOP the form from submitting and refreshing the browser window
    e.preventDefault(); 
    
    setIsLoading(true);
    try {
      // Tell the server to destroy the session/cookie
      await axios.post('/logout', {}, {
        withCredentials: true 
      });
    } catch (err) {
      console.error("Server-side session deletion failed:", err.response?.data || err.message);
    } finally {
      // Clear client-side global auth state
      setAuth({}); 
      
      setIsLoading(false);
      
      // Redirect to login page
      // navigate("/login");
    }
  };

  return (
    <>
      <form onSubmit={handleLogout}>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </form>

      <div style={{ padding: "20px" }}>
        <h2>Chat Dashboard Workspace</h2>
        <p>Welcome! You successfully authenticated.</p>
        <p>{JSON.stringify(auth?.user)}</p>
      </div>
    </>
  );
};

export default ChatDashboard;