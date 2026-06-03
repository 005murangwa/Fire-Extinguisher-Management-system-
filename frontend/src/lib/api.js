/**
 * @file api.js
 * Axios API client for the FEMS gateway.
 *
 * Responsibilities:
 *   - Attach the access token to every request.
 *   - Transparently refresh an expired access token using the refresh token
 *     and retry the original request once.
 *   - Normalise the API response envelope so callers get `data` directly.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/** Local-storage keys for the token pair. */
const ACCESS_KEY = 'fems_access';
const REFRESH_KEY = 'fems_refresh';

/** Endpoints that must not trigger the refresh-and-retry interceptor. */
const AUTH_NO_REFRESH_PATHS = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/send-registration-otp',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export const tokenStore = {
  get access() { return localStorage.getItem(ACCESS_KEY); },
  get refresh() { return localStorage.getItem(REFRESH_KEY); },
  set({ accessToken, refreshToken }) {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

/**
 * Exchange refresh token for a new pair (body + httpOnly cookie).
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
export async function refreshSession() {
  const body = tokenStore.refresh ? { refreshToken: tokenStore.refresh } : {};
  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, body, { withCredentials: true });
  const tokens = {
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
  };
  tokenStore.set(tokens);
  return tokens;
}

// Request interceptor: attach the bearer token.
api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

// Response interceptor: refresh-and-retry on a 401 once.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const url = original?.url || '';
    const skipRefresh = AUTH_NO_REFRESH_PATHS.some((p) => url.includes(p));

    if (status === 401 && !original._retried && !skipRefresh) {
      original._retried = true;
      try {
        refreshing = refreshing || refreshSession();
        const tokens = await refreshing;
        refreshing = null;
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch (refreshErr) {
        refreshing = null;
        tokenStore.clear();
        if (!window.location.pathname.startsWith('/login')
          && !window.location.pathname.startsWith('/register')
          && !window.location.pathname.startsWith('/forgot-password')
          && !window.location.pathname.startsWith('/reset-password')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extract a human-readable message from an Axios error.
 * @param {unknown} error - Caught error.
 * @returns {string} Display message.
 */
export function apiErrorMessage(error) {
  return (
    error?.response?.data?.error?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}
