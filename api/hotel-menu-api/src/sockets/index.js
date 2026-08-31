const { Server } = require('socket.io');

let io;

/**
 * Rooms used:
 *  - "kitchen"                 -> all admin panel clients watching the live order queue
 *  - `order:{orderId}`         -> the specific guest browser tracking that order's status
 *  - `table:{tableId}`         -> optional, useful if a table has multiple devices
 *
 * Events emitted:
 *  - "order:new"        -> to "kitchen" room, when a guest submits a new order
 *  - "order:updated"    -> to "kitchen" room AND `order:{orderId}` room, on any status change
 */
function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Admin panel joins the kitchen room to receive the live queue feed
    socket.on('kitchen:join', () => {
      socket.join('kitchen');
    });

    // Guest menu app joins a room scoped to their specific order so they
    // only receive updates relevant to them (privacy + efficiency).
    socket.on('order:track', (orderId) => {
      if (orderId) socket.join(`order:${orderId}`);
    });

    socket.on('order:untrack', (orderId) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      // no-op; rooms are cleaned up automatically
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized yet');
  return io;
}

function emitNewOrder(order) {
  getIO().to('kitchen').emit('order:new', order);
}

function emitOrderUpdate(order) {
  getIO().to('kitchen').emit('order:updated', order);
  getIO().to(`order:${order.id}`).emit('order:updated', order);
}

module.exports = { initSocket, getIO, emitNewOrder, emitOrderUpdate };
