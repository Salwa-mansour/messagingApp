import { useContext, useState, useEffect } from "react"; 
import { AuthContext } from "../context/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import LogoutBtn from "./LogoutBtn";
import "../css/index.css";

const ChatDashboard = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [currentRoom, setCurrentRoom] = useState(null);
  
  // 💡 Fix 1: Decouple the chat history array from the typed input string
  const [messages, setMessages] = useState([]); 
  const [newMessageText, setNewMessageText] = useState(""); 

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  // Fetch Chat Rooms
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

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, auth?.token]);

  // Fetch Messages for Selected Room
  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      if (!currentRoom) return;
      try {
        const response = await axiosPrivate.get(`/message/${currentRoom}`);
        if (isMounted) {
          // Fallback defensively to an array if nested
          const history = Array.isArray(response.data) ? response.data : response.data.messages || [];
          setMessages(history);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
    // Removed chatRooms dependency here to stop infinite re-fetch loops when rooms update
  }, [currentRoom, axiosPrivate]);

  // Handle Sending Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentRoom || !newMessageText.trim()) return;

    try {
      const response = await axiosPrivate.post(`/message/send/${currentRoom}`, {
        content: newMessageText, // Send the explicit string state
      });

      // 💡 Fix 2: Append the server's clean returned message to your history array
      // Depending on your backend res.json structure, extract response.data or response.data.data
      const rawMessage = response.data?.data || response.data;
      
      setMessages((prevMessages) => [...prevMessages, rawMessage]);
      setNewMessageText(""); // 💡 Clean clear out the text input field upon delivery success!
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading chat rooms...</p>
      </div>
    );
  }

  return (
    <>
      <LogoutBtn />
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
                <h3>{room.name}</h3>
              </li>
            ))
          ) : (
            <p>No chat rooms available.</p>
          )}
        </ul>

        {/* Right Side Panel: Active Chat View */}
        <div className="chat-window">
          <section className="messages">
            {currentRoom ? (
              messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id || Math.random()} className="message">  
                    <p>
                      <strong>{msg.sender?.username || msg.senderId || "User"}:</strong> {msg.content}
                    </p>
                  </div>
                ))
              ) : (
                <p>No messages in this room yet.</p>
              )
            ) : (
              <p>Select a chat room to view messages.</p>
            )}
          </section>

          {/* Form Processing Footer */}
          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text" 
              placeholder="Type your message..."
              value={newMessageText} // 💡 Bind to text string state
              onChange={(e) => setNewMessageText(e.target.value)}
              disabled={!currentRoom}
            />
            <button type="submit" disabled={!currentRoom || !newMessageText.trim()}>Send</button>
          </form>
        </div>
      </section>
    </>
  );
};

export default ChatDashboard;