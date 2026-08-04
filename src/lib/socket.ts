import { io, type Socket } from 'socket.io-client';
import conf from '@/conf/conf';

export type SupportSocket = Socket;

let socket: SupportSocket | null = null;
let connectPromise: Promise<SupportSocket> | null = null;

const getSocketBaseUrl = () => {
  const fromEnv = process.env.NEXT_PUBLIC_SOCKET_URL || conf.socketUrl;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');

  const apiUrl = (conf.APIUrl || '').replace(/\/$/, '');
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4);
  }
  return apiUrl || 'http://localhost:3001';
};

const fetchSocketToken = async (): Promise<string> => {
  const res = await fetch('/api/auth/socket-token', {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Unable to get socket token');
  }
  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error('Socket token missing');
  }
  return data.token;
};

export const disconnectSupportSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  connectPromise = null;
};

export const getSupportSocket = async (): Promise<SupportSocket> => {
  if (typeof window === 'undefined') {
    throw new Error('Socket is browser-only');
  }

  if (socket?.connected) {
    return socket;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    const token = await fetchSocketToken();

    if (socket) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      socket = io(getSocketBaseUrl(), {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        auth: { token },
      });
      socket.connect();
    }

    await new Promise<void>((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        socket?.off('connect', onConnect);
        socket?.off('connect_error', onError);
      };
      socket?.once('connect', onConnect);
      socket?.once('connect_error', onError);
    });

    return socket!;
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
};

export const emitWithAck = <T = unknown>(
  event: string,
  payload: unknown,
  timeoutMs = 8000
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const active = await getSupportSocket();
      active
        .timeout(timeoutMs)
        .emit(event, payload, (err: Error | null, response: T) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(response);
        });
    } catch (error) {
      reject(error);
    }
  });
};
