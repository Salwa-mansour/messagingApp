import { useContext, useState, useEffect } from "react"; 
import { AuthContext } from "../context/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import  useSocketConnection  from "../hooks/useSocketConnection"; // Ensure named export matches hook
import { useNavigate, useLocation } from "react-router-dom";
import MessageForm from "./MessageForm";
import "../css/index.css";
// 💡 NOTE: Removd the macro import line if you aren't rendering icons inline right here to keep standard builds light

const ChatDashboard = () => {
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const socket = useSocketConnection();
  const { auth } = useContext(AuthContext);

  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [pendingDM, setPendingDM] = useState(null);

  const refreshChatRoomsList = async () => {
    try {
      const response = await axiosPrivate.get("/group/user-groups");
      setChatRooms(response.data);
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

  //  Fetch Historical Messages VIA HTTP AND Initialize Real-Time Sockets Together
  useEffect(() => {
    if (!currentRoom?.id) return;
    let isMounted = true;

    const fetchMessageHistory = async () => {
      try {
        const response = await axiosPrivate.get(`/message/${currentRoom.id}`);
        if (isMounted) {
          const history = Array.isArray(response.data) ? response.data : response.data.messages || [];
              // 💡 FIX: Prevent overwriting real-time messages that dropped in while this was loading
            setMessages(history);
        }
      } catch (err) {
        console.error("Failed to fetch historical database logs:", err);
      }
    };

    // Execute the database retrieval
    fetchMessageHistory();

    // Setup WebSocket pipeline if socket is initialized and ready
    if (socket) {
      socket.emit("join_room", currentRoom.id);

      socket.on("receive_message", (incomingMsg) => {
        if (isMounted) {
       setMessages((prev) => [...prev, incomingMsg]);
        }
      });
    }

    return () => { 
      isMounted = false; 
      if (socket) {
        socket.off("receive_message");
      }
    };
  }, [currentRoom?.id, socket, axiosPrivate]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading chat rooms...</p>
      </div>
    );
  }

  const getActiveChatName = () => {
    if (currentRoom) {
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
    <div className="chat-dashboard">
      {/* Left Side Panel: Chat Rooms */}
      <aside className="chat-list">
         <ul>
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <li 
                key={room.id} 
                className={`chat-room ${currentRoom?.id === room.id ? "active-room" : ""}`} 
                onClick={() => setCurrentRoom(room)} 
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
      <section className={`chat-window ${currentRoom?.isDM ? "direct-msg" : "chat-group"}`}>
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

        <MessageForm 
          currentRoom={currentRoom}
          pendingDM={pendingDM}
        
          onGroupCreated={(newGroupId) => {
            setCurrentRoom({ id: newGroupId });
            setPendingDM(null);
            refreshChatRoomsList(); 
          }}
        />
      </section>
    </div>
  );
};

export default ChatDashboard;