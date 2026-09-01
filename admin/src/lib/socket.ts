import { io, Socket } from 'socket.io-client';

// In dev mode, the Vite proxy handles /socket.io so we connect to the same origin.
// In production, set VITE_API_URL to the real backend URL.
const SOCKET_URL = import.meta.env.VITE_API_URL || '';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL || window.location.origin, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(token?: string) {
  const s = getSocket();
  if (!s.connected) {
    if (token) {
      s.auth = { token };
    }
    s.connect();
    s.on('connect', () => {
      s.emit('kitchen:join');
    });
  } else {
    s.emit('kitchen:join');
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
