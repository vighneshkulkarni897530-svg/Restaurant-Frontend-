import { io, Socket } from 'socket.io-client';

export const getSocketUrl = (): string => {
  if (typeof window !== 'undefined') {
    const envSocket = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (envSocket && !envSocket.includes('localhost') && !envSocket.includes('127.0.0.1')) {
      return envSocket;
    }
    // Dynamic match: connect to backend at current host:5000 (e.g. http://192.168.1.5:5000 or http://10.230.94.1:5000)
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://127.0.0.1:5000';
};

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = getSocketUrl();
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket connected to server:', socket?.id, 'at', socketUrl);
    });

    socket.on('disconnect', () => {
      console.log('⚡ Socket disconnected from server');
    });
  }

  return socket;
};
