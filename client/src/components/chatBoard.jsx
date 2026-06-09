import { useContext, useState, useEffect } from "react"; 
import { AuthContext } from "../context/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import "../css/index.css";

const ChatDashboard = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 💡 Fix 1: Default to true so it shows loading first
  const [currentRoom, setCurrentRoom] = useState(null);
  const [message, setMessage] = useState([]);
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

useEffect(() => {
 const fetchMessages = async () => {
   if (!currentRoom) return;
    try {
      const response = await axiosPrivate.get(`/messages/${currentRoom}`);
      setMessage(response.data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };
  fetchMessages();
}, [currentRoom, chatRooms, axiosPrivate,auth?.token ]);
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
              <li key={room.id} className="chat-room" onClick={() => setCurrentRoom(room.id)}>
                <h3>{room.name}</h3>
              </li>
            ))
          ) : (
            <p>No chat rooms available.</p>
          )}
        </ul>
        <div className="chat-window">
          {/*chat messages*/}
          <section className="messages">
            {currentRoom ? (
                  message.length > 0 ? (
                    message.map((msg) => (
                      <div key={msg.id} className="message">  
                        <p><strong>{msg.sender.username}:</strong> {msg.content}</p>
                      </div>
                    ))
                  ) : (
                    <p>No messages in this room yet.</p>
                  )
            ) : (
              <p>Select a chat room to view messages.</p>
            )}
          </section>
          {/*
          send message form
          
          
          */}
        </div>
      </section>
    </>
  );
};

export default ChatDashboard;