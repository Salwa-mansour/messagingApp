import { useContext, useState, useEffect } from "react"; 
import { AuthContext } from "../context/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import "../css/index.css";

const ChatDashboard = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 💡 Fix 1: Default to true so it shows loading first
  const [isLogingOut, setIsLogingOut] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;

    const fetchChatRooms = async () => {
      try {
        setIsLoading(true); // 💡 Ensure loading state triggers on execution
        const response = await axiosPrivate.get("/group/user-groups");
        if (isMounted) {
          console.log("Successfully loaded rooms:", response.data);
          setChatRooms(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch chat rooms:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false); // 💡 Fix 2: Turn loading off once the array arrives!
        }
      }
    };

    if (auth?.token) {
      fetchChatRooms();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, auth?.token]);

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

  // 💡 Safely intercept layout if database records are still processing
  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading chat rooms...</p>
      </div>
    );
  }

  return (
    <>
      <section className="chat-dashboard">
        <ul className="chat-list">
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <li key={room.id} className="chat-room"> 
                <h3>{room.name}</h3>
              </li>
            ))
          ) : (
            <p>No chat rooms available.</p>
          )}
        </ul>
        <div className="chat-window">
          {/* Main chat log messages template layout can follow here */}
        </div>
      </section>
    </>
  );
};

export default ChatDashboard;