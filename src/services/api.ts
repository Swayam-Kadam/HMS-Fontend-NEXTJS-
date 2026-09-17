import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { waitForSession } from '@/lib/auth/sessionGate';
import {
  decryptPayload,
  encryptPayload,
  isEncryptedEnvelope,
  isPayloadEncryptionEnabled,
} from '@/lib/payloadCrypto';

const PROXY_BASE_URL = '/api/proxy';

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class Axios {
  public axios: AxiosInstance;

  constructor(baseURL: string) {
    this.axios = axios.create({ baseURL });
    this.axios.interceptors.request.use(async (config) => {
      if (typeof window !== 'undefined') {
        await waitForSession();
      }

      if (!isPayloadEncryptionEnabled()) {
        return config;
      }

      // Skip multipart file uploads (doctor/profile images)
      if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        return config;
      }

      if (config.data !== undefined && config.data !== null) {
        const plain =
          typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        config.data = await encryptPayload(plain);
        config.headers.set('Content-Type', 'application/json');
        config.headers.set('X-Payload-Encrypted', '1');
      }

      return config;
    });
    this.axios.interceptors.response.use(
      this._responseMiddleware,
      this._responseErr
    );
  }

  _responseMiddleware = async (response: AxiosResponse): Promise<AxiosResponse> => {
    if (isPayloadEncryptionEnabled() && isEncryptedEnvelope(response.data)) {
      response.data = await decryptPayload(response.data);
    }
    return response;
  };

  _responseErr = async (error: unknown): Promise<unknown> => {
    const axiosError = error as {
      response?: { status?: number; data?: unknown };
      config?: RetryableConfig;
    };

    if (
      isPayloadEncryptionEnabled() &&
      axiosError.response &&
      isEncryptedEnvelope(axiosError.response.data)
    ) {
      axiosError.response.data = await decryptPayload(axiosError.response.data);
    }

    const status = axiosError?.response?.status;
    const originalRequest = axiosError?.config;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true;

      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        return this.axios(originalRequest);
      }

      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      const path = window.location.pathname;
      // Avoid /login?redirect=/login when a 401 happens on the auth pages.
      if (path === '/login' || path === '/signup') {
        window.location.href = '/login';
      } else {
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
      }
    }

    return Promise.reject(error);
  };
}

const axiosReact = new Axios(PROXY_BASE_URL).axios;
export { axiosReact };
