import axios from 'axios';
import { resolveApiBaseUrl } from './apiBaseUrl';

const API_BASE_URL = resolveApiBaseUrl();
const AUTH_USER_KEY = 'kab_auth_user';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getStoredRefreshToken() {
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user.refresh_token || null;
  } catch {
    return null;
  }
}

function updateStoredTokens(accessToken, refreshToken) {
  localStorage.setItem('authToken', accessToken);
  try {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (stored) {
      const user = JSON.parse(stored);
      user.access_token = accessToken;
      if (refreshToken) {
        user.refresh_token = refreshToken;
      }
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore parse errors
  }
}

function forceLogout() {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem('authToken');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

let isRefreshing = false;
let refreshQueue = [];

function processRefreshQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register')) {
      return Promise.reject(error);
    }

    const refreshTokenValue = getStoredRefreshToken();
    if (!refreshTokenValue) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refresh_token: refreshTokenValue },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { access_token: accessToken, refresh_token: newRefreshToken } = response.data;
      updateStoredTokens(accessToken, newRefreshToken);
      processRefreshQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processRefreshQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
