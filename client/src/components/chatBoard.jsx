import { useContext, useState, useEffect } from "react"; 
import { AuthContext } from "../context/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";
import MessageForm from "./MessageForm";
import "../css/index.css";

const ChatDashboard = () => {
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  
  // 💡 currentRoom will now cleanly hold the entire room object or null
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]); 

  const [pendingDM, setPendingDM] = useState(null);

  // Helper to re-fetch the room listings for the left side panel
  const refreshChatRoomsList = async () => {
    try {
      const response = await axiosPrivate.get("/group/user-groups");
      setChatRooms(response.data);
      
      // 💡 If we just created a group, update currentRoom state with its full fresh object
      if (currentRoom && !currentRoom.name) {
        const matchingRoom = response.data.find(r => r.id === currentRoom.id);
        if (matchingRoom) setCurrentRoom(matchingRoom);
      }
    } catch (err) {
      console.error("Failed to refresh side bar channels:", err);
    }
  };

  // 1. Fetch Chat Rooms on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchChatRooms = async () => {
      try {
        setIsLoading(true); 
        const response = await axiosPrivate.get("/group/user-groups");
        if (isMounted) {
          setChatRooms(response.data);
          console.log("Fetched chat rooms:", response.data);
        }
      } catch (err) {
        console.error("Failed to fetch chat rooms:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false); 
        }
      }
    };

    if (auth?.token) {
      fetchChatRooms();
    } else {
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [axiosPrivate, auth?.token]);

  // 2. Intercept Router Redirection Context from AllUsers
  useEffect(() => {
    if (location.state?.recipientId) {
      setPendingDM({
        id: location.state.recipientId,
        username: location.state.recipientName
      });
      setCurrentRoom(null);
      setMessages([]);

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 3. Fetch Messages for Selected Room
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      // 💡 FIX: Use optional chaining to check for the ID safely
      if (!currentRoom?.id) return;
      try {
        const response = await axiosPrivate.get(`/message/${currentRoom.id}`);
        if (isMounted) {
          const history = Array.isArray(response.data) ? response.data : response.data.messages || [];
          setMessages(history);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    if (currentRoom) {
      fetchMessages();
      setPendingDM(null); 
    }

    return () => { isMounted = false; };
  // 💡 Depend on currentRoom?.id so the effect triggers cleanly when the selected target transitions
  }, [currentRoom?.id, axiosPrivate]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading chat rooms...</p>
      </div>
    );
  }

  // Dynamic window layout title text generator
  const getActiveChatName = () => {
    if (currentRoom) {
      // 💡 FIX: Read the name directly from the object if it exists, otherwise fall back to list search
      if (currentRoom.name) return currentRoom.name;
      const current = chatRooms.find(r => r.id === currentRoom.id);
      return current ? current.name : "Active Chat Channel";
    }
    if (pendingDM) {
      return `Direct Message with ${pendingDM.username}`;
    }
    return "Select a conversation room";
  };

  return (
    <>
      <div className="chat-dashboard">
        {/* Left Side Panel: Chat Rooms */}
        <aside className="chat-list">
           <ul>
            {chatRooms.length > 0 ? (
              chatRooms.map((room) => (
                <li 
                  key={room.id} 
                  // 💡 FIX: Added optional chaining here so it doesn't break when currentRoom is null
                  className={`chat-room ${currentRoom?.id === room.id ? "active-room" : ""}`} 
                  onClick={() => setCurrentRoom(room)} // Storing whole object
                >
                  <h3>{room?.name}</h3>
                </li>
              ))
            ) : (
              <p>No chat rooms available.</p>
            )}
          </ul>
        </aside>
        
        {/* Right Side Panel: Active Chat View */}
        <section className={`chat-window ${currentRoom?.isDM ? "direct-msg":"chat-group"}`}>
          <header className="chat-header-pane">
            <h2>{getActiveChatName()}</h2>
          </header>

          <div className="messages">
            {(currentRoom || pendingDM) ? (
              messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id || Math.random()} className={`message ${msg.senderId === auth?.user?.id ? "sent" : "received"}`}>  
                    <p>
                      <strong className="owner">{msg.sender?.username || msg.senderId || "User"}:</strong> {msg.content}
                    </p>
                  </div>
                ))
              ) : (
                <p>No messages in this room yet. Send a message to start conversing!</p>
              )
            ) : (
              <p>Select a chat room to view messages.</p>
            )}
          </div>

          {/* Form Processing Footer with Dynamic Props */}
          <MessageForm 
            currentRoom={currentRoom}
            pendingDM={pendingDM}
            onMessageSent={(newMsg) => setMessages((prev) => [...prev, newMsg])}
            // 💡 Hand back a small structural object context here so it satisfies your object state requirement
            onGroupCreated={(newGroupId) => {
              setCurrentRoom({ id: newGroupId });
              setPendingDM(null);
              refreshChatRoomsList(); 
            }}
          />

        </section>
      </div>
    </>
  );
};

export default ChatDashboard;