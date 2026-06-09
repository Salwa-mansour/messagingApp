import { useNavigate } from "react-router-dom";
function LogoutBtn() {
  const [isLogingOut, setIsLogingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    setIsLogingOut(true);

    localStorage.removeItem("persist"); 
    setAuth({});
    try {
      // 💡 Fix 3: Changed 'axios' to 'axiosPrivate' to prevent a 'ReferenceError: axios is not defined' crash
      await axiosPrivate.post('/logout', {}); 
    } catch (err) {
      console.error("Backend failed to clear session:", err);
    } finally {
      setIsLogingOut(false);
      navigate("/login", { replace: true });
    }
  };



    
  return (
  <form onSubmit={handleLogout}>
    <button type="submit" className="logout-btn" disabled={isLogingOut}>
      {isLogingOut ? "Logging out..." : "Logout"}
    </button>
  </form>
  )
}

export default LogoutBtn