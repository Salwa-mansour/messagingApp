import { useEffect, useState, useContext } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";

const useSocketConnection = () => {
 const { auth } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!auth?.token) return;

    // Initialize connection with handshake configurations
    const newSocket = io("http://localhost:3000", {
      auth: {
        token: auth.token
      }
    });

    setSocket(newSocket);

    // Clean up connection on component unmount or token change
    return () => {
      newSocket.disconnect();
    };
  }, [auth?.token]);

  // Return the socket instance so your components can use it
  return socket;
};

export default useSocketConnection;