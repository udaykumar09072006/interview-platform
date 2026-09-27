import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../types';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[SocketClient] Connected to server, ID:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[SocketClient] Disconnected:', reason);
    });
  }
  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
