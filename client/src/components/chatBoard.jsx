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
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]); 

  // 💡 State to track a user context passed from /users directory before a group exists
  const [pendingDM, setPendingDM] = useState(null);

  // Helper to re-fetch the room listings for the left side panel
  const refreshChatRoomsList = async () => {
    try {
      const response = await axiosPrivate.get("/group/user-groups");
      setChatRooms(response.data);
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

      // Wipe routing state out of browser memory so reloads don't re-trigger focus shifts
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 3. Fetch Messages for Selected Room
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      if (!currentRoom) return;
      try {
        const response = await axiosPrivate.get(`/message/${currentRoom}`);
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
      setPendingDM(null); // Wipe pending data if navigating back to standard rooms
    }

    return () => { isMounted = false; };
  }, [currentRoom, axiosPrivate]);

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
      const current = chatRooms.find(r => r.id === currentRoom);
      return current ? current.name : "Active Chat Channel";
    }
    if (pendingDM) {
      return `Direct Message with ${pendingDM.username}`;
    }
    return "Select a conversation room";
  };

  return (
    <>
      <section className="chat-dashboard">
        {/* Left Side Panel: Chat Rooms */}
        <ul className="chat-list">
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <li 
                key={room.id} 
                className={`chat-room ${currentRoom === room.id ? "active-room" : ""}`} 
                onClick={() => setCurrentRoom(room.id)}
              >
                <h3>{room?.name}</h3>
              </li>
            ))
          ) : (
            <p>No chat rooms available.</p>
          )}
        </ul>

        {/* Right Side Panel: Active Chat View */}
        <div className="chat-window">
          <header className="chat-header-pane">
            <h2>{getActiveChatName()}</h2>
          </header>

          <section className="messages">
            {(currentRoom || pendingDM) ? (
              messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id || Math.random()} className="message">  
                    <p>
                      <strong>{msg.sender?.username || msg.senderId || "User"}:</strong> {msg.content}
                    </p>
                  </div>
                ))
              ) : (
                <p>No messages in this room yet. Send a message to start conversing!</p>
              )
            ) : (
              <p>Select a chat room to view messages.</p>
            )}
          </section>

          {/* 💡 Form Processing Footer with Dynamic Props */}
          <MessageForm 
            currentRoom={currentRoom}
            pendingDM={pendingDM}
            onMessageSent={(newMsg) => setMessages((prev) => [...prev, newMsg])}
            onGroupCreated={(newGroupId) => {
              setCurrentRoom(newGroupId);
              setPendingDM(null);
              refreshChatRoomsList(); // Automatically updates the left sidebar listing row!
            }}
          />

        </div>
      </section>
    </>
  );
};

export default ChatDashboard;