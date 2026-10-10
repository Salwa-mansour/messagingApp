import { useContext, useState, useEffect,useRef } from "react"; 
import { AuthContext } from "../context/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import  useSocketConnection  from "../hooks/useSocketConnection"; // Ensure named export matches hook
import { useNavigate, useLocation } from "react-router-dom";
import MessageForm from "./MessageForm";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
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
  const [loadingMessages,setLoadingMessages] = useState(true)
  const [pendingDM, setPendingDM] = useState(null);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 💡 4. Trigger auto-scroll every time the messages array updates
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const recipientId = location.state.recipientId;
      const recipientName = location.state.recipientName;

      // 1. Search if a DM room already exists with this user
      const existingRoom = chatRooms.find(room => 
        room.isDM && 
        room.users.some(user => user.id === recipientId)
      );
      setShowChatWindow(true)
      if (existingRoom) {
        // 2. If it exists, set it as the current room instead of an empty one
        setCurrentRoom(existingRoom);
        setPendingDM(null);
        // fetchMessagesForRoom(existingRoom.id); // Uncomment if you fetch messages here
      } else {
        // 3. Otherwise, fall back to the empty pending state
        setPendingDM({
          id: recipientId,
          username: recipientName
        });
        setCurrentRoom(null);
        setMessages([]);
      }

      // Clear the router state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, chatRooms]);
  //  Fetch Historical Messages VIA HTTP AND Initialize Real-Time Sockets Together
  useEffect(() => {
    if (!currentRoom?.id) return;
    let isMounted = true;

    const fetchMessageHistory = async () => {
      setLoadingMessages(true)
      try {
        const response = await axiosPrivate.get(`/message/${currentRoom.id}`);
        if (isMounted) {
          const history = Array.isArray(response.data) ? response.data : response.data.messages || [];
              // 💡 FIX: Prevent overwriting real-time messages that dropped in while this was loading
            setMessages(history);
        }
      } catch (err) {
        console.error("Failed to fetch historical database logs:", err);
      }finally{
        setLoadingMessages(false)
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

// 💡 One universal helper function for all rooms and DMs
  const getChatDisplayName = (room) => {
    if (!room) return "";

    // If it's a Direct Message, find the other participant's name
    if (room.isDM && room.users) {
      const currentUserId = auth?.user?.id ;
      
      const otherUser = room.users.find((u) => u.id !== currentUserId);
      if (otherUser) {
        return otherUser.username;
      }
    }

    // Otherwise, return the standard group name
    return room.name || "Active Chat Channel";
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
                onClick={() => {setCurrentRoom(room); setShowChatWindow(true); }} 
              >
                <h3>{getChatDisplayName(room)}</h3>
              </li>
            ))
          ) : (
            <p>No chat rooms available.</p>
          )}
        </ul>
      </aside>
   
      {/* Right Side Panel: Active Chat View */}
      <section className={`chat-window ${showChatWindow ? "active" : ""}
       ${currentRoom?.isDM ? " direct-msg" : " chat-group"}`}>
        <header className="chat-header-pane">
           <button onClick={() => {setCurrentRoom(null); setPendingDM(null); setMessages([]); setShowChatWindow(false); }}
          className="close-chat-btn"
            >
            <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          <h2>{getChatDisplayName()}</h2>
         
        </header>

        <div className="messages">
          {(currentRoom || pendingDM) ? (
            messages.length > 0 ? (
              messages.map((msg) => (
               
                <div key={msg.id || Math.random()} className={`message ${msg.senderId == auth?.user?.id ? "sent" : "received"}`}>  
               {console.log(msg.senderId,auth?.user?.id,msg.senderId == auth?.user?.id)}
                  <p>
                    <strong className="owner">{msg.sender?.username || msg.senderId || "User"}:</strong> {msg.content}
                  </p>
                </div>
              ))
            ) :
            loadingMessages ? <p>loading messages ...</p>
             :(
              <p>No messages in this room yet. Send a message to start conversing!</p>
            )
          ) : (
            <p>Select a chat room to view messages.</p>
          )}

           <div ref={messagesEndRef} />
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