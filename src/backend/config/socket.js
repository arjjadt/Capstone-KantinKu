const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIo(httpServer, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST']
      }
    });

    // Middleware to authenticate socket connection
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.id}, Role: ${socket.user.role}`);

      // If user is seller, join stall room
      if (socket.user.role === 'seller' && socket.user.stallId) {
        socket.join(`stall_${socket.user.stallId}`);
        console.log(`Seller joined room: stall_${socket.user.stallId}`);
      }

      // Join room for specific order tracking (buyer tracking their order)
      socket.on('join_order_room', (splitId) => {
        socket.join(`order_${splitId}`);
        console.log(`User ${socket.user.id} joined order room: order_${splitId}`);
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
      });
    });

    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};
