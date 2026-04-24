import axios, { type AxiosRequestConfig } from 'axios';
import { getToken, setToken } from './tokenStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from store on every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → silent refresh → retry.  Concurrent 401s queue behind a single refresh.
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

function drainQueue(token: string | null) {
  queue.forEach((resolve) => resolve(token));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {};

    const isRefreshEndpoint = original.url?.includes('/api/auth/refresh');
    if (error.response?.status !== 401 || original._retry || isRefreshEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Wait for the in-flight refresh to finish
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error);
          original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
          original._retry = true;
          resolve(api(original));
        });
      });
    }

    isRefreshing = true;
    original._retry = true;

    try {
      const { data } = await api.post<{ data: { accessToken: string } }>('/api/auth/refresh');
      const newToken = data.data.accessToken;
      setToken(newToken);
      drainQueue(newToken);
      original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
      return api(original);
    } catch {
      setToken(null);
      drainQueue(null);
      // Signal app-level logout — dispatching a custom event avoids a circular import
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
