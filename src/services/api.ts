import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { waitForSession } from '@/lib/auth/sessionGate';

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
      return config;
    });
    this.axios.interceptors.response.use(
      this._responseMiddleware,
      this._responseErr
    );
  }

  _responseMiddleware = (response: AxiosResponse): AxiosResponse => response;

  _responseErr = async (error: unknown): Promise<unknown> => {
    const axiosError = error as {
      response?: { status?: number };
      config?: RetryableConfig;
    };
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
      const redirect = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?redirect=${redirect}`;
    }

    return Promise.reject(error);
  };
}

const axiosReact = new Axios(PROXY_BASE_URL).axios;
export { axiosReact };
