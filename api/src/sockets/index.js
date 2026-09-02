const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

let io;

/**
 * Room naming conventions:
 *  - "kitchen"                 -> kitchen station(s)
 *  - "bar"                     -> bar station(s)
 *  - "restaurant"              -> restaurant station(s)
 *  - "housekeeping"            -> housekeeping station(s)
 *  - "frontdesk"               -> front desk station(s)
 *  - "spa"                     -> spa station(s)
 *  - "maintenance"             -> maintenance station(s)
 *  - "management"              -> management/admin panel
 *  - "department:{code}"       -> department-specific room
 *  - "station:{stationId}"     -> specific station
 *  - "order:{orderId}"         -> guest tracking one order
 *  - "booking:{bookingId}"     -> booking updates
 *  - "service_request:{id}"    -> service request updates
 *
 * Events emitted:
 *  - "order:new"               -> to department rooms, new order submitted
 *  - "order:updated"           -> to department rooms + order room, status changed
 *  - "service_request:new"     -> to department room, new service request
 *  - "service_request:updated" -> to department room + request room, status changed
 *  - "room:status_changed"     -> to frontdesk/management, room status changed
 *  - "booking:updated"         -> to frontdesk/management, booking status changed
 *  - "station:heartbeat"       -> to management, station online status
 */
function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Optional JWT authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const guestSessionId = socket.handshake.auth?.guestSessionId;

    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const staff = await prisma.staff.findUnique({ where: { id: payload.staffId } });
        if (staff && staff.isActive) {
          socket.staff = staff;
          socket.staffId = staff.id;
          socket.hotelId = staff.hotelId;
          socket.role = staff.role;
        }
      } catch (err) {
        // Invalid token — allow connection as anonymous guest
      }
    }

    if (guestSessionId) {
      socket.guestSessionId = guestSessionId;
    }

    next();
  });

  io.on('connection', (socket) => {
    // Staff joins their department room based on role
    socket.on('join:department', (departmentCode) => {
      if (departmentCode) {
        socket.join(`department:${departmentCode.toLowerCase()}`);
      }
    });

    // Station joins its specific room
    socket.on('join:station', (stationId) => {
      if (stationId) {
        socket.join(`station:${stationId}`);
      }
    });

    // Admin panel joins management room
    socket.on('management:join', () => {
      if (socket.staff) {
        socket.join('management');
      }
    });

    // Legacy kitchen room join (backward compat)
    socket.on('kitchen:join', () => {
      socket.join('kitchen');
      socket.join('department:kitchen');
    });

    // Guest tracks a specific order
    socket.on('order:track', (orderId) => {
      if (orderId) socket.join(`order:${orderId}`);
    });

    socket.on('order:untrack', (orderId) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });

    // Station heartbeat
    socket.on('station:heartbeat', async (stationId) => {
      if (stationId) {
        try {
          await prisma.serviceStation.update({
            where: { id: stationId },
            data: { lastSeenAt: new Date(), status: 'ONLINE' },
          });
          io.to('management').emit('station:heartbeat', { stationId, timestamp: new Date() });
        } catch (err) {
          // Station not found, ignore
        }
      }
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

// ---------- Order events ----------

function emitNewOrder(order) {
  const io = getIO();
  io.to('kitchen').emit('order:new', order);
  io.to('department:kitchen').emit('order:new', order);
  if (order.items?.some(i => i.categoryType === 'drink' || i.departmentCode === 'BAR')) {
    io.to('bar').emit('order:new', order);
    io.to('department:bar').emit('order:new', order);
  }
  io.to('restaurant').emit('order:new', order);
  io.to('department:restaurant').emit('order:new', order);
}

function emitOrderUpdate(order) {
  const io = getIO();
  io.to('kitchen').emit('order:updated', order);
  io.to('department:kitchen').emit('order:updated', order);
  io.to('bar').emit('order:updated', order);
  io.to('department:bar').emit('order:updated', order);
  io.to('restaurant').emit('order:updated', order);
  io.to('department:restaurant').emit('order:updated', order);
  io.to(`order:${order.id}`).emit('order:updated', order);
}

// ---------- Service request events ----------

function emitServiceRequestNew(request) {
  const io = getIO();
  if (request.departmentCode) {
    io.to(`department:${request.departmentCode.toLowerCase()}`).emit('service_request:new', request);
  }
  io.to('frontdesk').emit('service_request:new', request);
  io.to('management').emit('service_request:new', request);
}

function emitServiceRequestUpdate(request) {
  const io = getIO();
  if (request.departmentCode) {
    io.to(`department:${request.departmentCode.toLowerCase()}`).emit('service_request:updated', request);
  }
  io.to('frontdesk').emit('service_request:updated', request);
  io.to('management').emit('service_request:updated', request);
  io.to(`service_request:${request.id}`).emit('service_request:updated', request);
}

// ---------- Room status events ----------

function emitRoomStatusChanged(room) {
  const io = getIO();
  io.to('frontdesk').emit('room:status_changed', room);
  io.to('management').emit('room:status_changed', room);
  io.to('department:housekeeping').emit('room:status_changed', room);
}

// ---------- Booking events ----------

function emitBookingUpdated(booking) {
  const io = getIO();
  io.to('frontdesk').emit('booking:updated', booking);
  io.to('management').emit('booking:updated', booking);
}

module.exports = {
  initSocket,
  getIO,
  emitNewOrder,
  emitOrderUpdate,
  emitServiceRequestNew,
  emitServiceRequestUpdate,
  emitRoomStatusChanged,
  emitBookingUpdated,
};
