import { getToken } from './storage';

export interface ChatMessagePayload {
  id: string | number;
  sessionId?: string | number;
  senderId?: string;
  content?: string;
  messageType?: number;
  mediaUrl?: string;
  isMine?: boolean;
  createdAt?: string;
}

type SocketClient = {
  emit: (event: string, data?: unknown) => void;
  on: (event: string, cb: (data: ChatMessagePayload) => void) => void;
  disconnect: () => void;
};

let socket: SocketClient | null = null;

function wsBaseUrl(): string {
  const configured = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  if (configured) return configured.replace(/\/$/, '');
  const api = (import.meta.env.VITE_API_BASE_URL as string) || '/api';
  if (api.startsWith('http')) {
    return api.replace(/\/api\/?$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://127.0.0.1:3000';
}

export async function connectChatSocket(
  sessionId: string,
  onMessage: (msg: ChatMessagePayload) => void,
): Promise<boolean> {
  const token = getToken();
  if (!token || !sessionId) return false;

  try {
    const { io } = await import('socket.io-client');
    if (socket) socket.disconnect();

    socket = io(`${wsBaseUrl()}/chat`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    }) as SocketClient;

    socket.on('connect', () => {
      socket?.emit('join', { sessionId });
    });
    socket.on('message', onMessage);
    return true;
  } catch {
    return false;
  }
}

export function sendChatViaSocket(payload: Record<string, unknown>) {
  socket?.emit('send', payload);
}

export function disconnectChatSocket() {
  socket?.disconnect();
  socket = null;
}

export function isChatSocketReady() {
  return Boolean(socket);
}
