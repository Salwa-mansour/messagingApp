import { useContext, useState } from "react"; // Added useState just in case isLoading is local
import { AuthContext } from "../context/AuthContext";
import axios from "../api/axios";
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
  if (e) e.preventDefault();
  setIsLoading(true);

  // 1. CRITICAL STEP: Turn off the persist flag in localStorage first!
  // This completely stops PersistLogin from firing verifyRefreshToken()
  localStorage.removeItem("persist"); 

  // 2. Force clear your frontend state out of memory
  setAuth({});

  try {
    // 3. Clear your backend session cookie
    await axios.post('/logout', {}, { withCredentials: true });
  } catch (err) {
    console.error("Backend failed to clear session:", err);
  } finally {
    setIsLoading(false);
    // 4. Send them clean away to the login view
    navigate("/login", { replace: true });
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
        {/* <p>{JSON.stringify(auth?.user)}</p> */}
      </div>
    </>
  );
};

export default ChatDashboard;