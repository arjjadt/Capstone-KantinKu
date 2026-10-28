const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('./database');

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
      // Validasi kepemilikan: buyer pemilik order atau seller pemilik stall terkait
      socket.on('join_order_room', async (splitId) => {
        try {
          if (typeof splitId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(splitId)) {
            return socket.emit('order_error', { message: 'Invalid split id' });
          }
          const [rows] = await db.query(
            `SELECT os.id FROM ORDER_SPLITS os
             JOIN ORDERS o ON os.order_id = o.id
             WHERE os.id = ? AND (o.buyer_user_id = ? OR os.stall_id = ?)
             LIMIT 1`,
            [splitId, socket.user.id, socket.user.stallId || '00000000-0000-0000-0000-000000000000']
          );
          if (rows.length === 0) {
            return socket.emit('order_error', { message: 'You do not own this order' });
          }
          socket.join(`order_${splitId}`);
          console.log(`User ${socket.user.id} joined order room: order_${splitId}`);
        } catch (err) {
          console.error('join_order_room error:', err.message);
        }
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
