import jwt from 'jsonwebtoken';

export const setupSocketAuth = (io) => {
  // 💡 1. Register the authentication guard on the socket instance
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication error: Token missing."));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      // Attach the decoded token payload to the socket session
      socket.user = decoded; 
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  // 💡 2. Register connection listeners right here once authenticated
  io.on("connection", (socket) => {
    // Make sure your JWT token actually includes a 'username' field, otherwise fallback to id
    console.log(`Authenticated user connected: ${socket.user?.username || socket.id}`);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });
    
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};