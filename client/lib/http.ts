import axios from 'axios';

// Fake test key for gitleaks CI test — xoá sau khi test xong
// ORG_API_TOKEN=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const http = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

/** Get token — try cookie first (set by middleware/auth), fallback to localStorage */
function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Try cookie (set by auth store on login, readable by middleware)
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
    if (match) return match[1];
    // Fallback to localStorage
    return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
}

/** Store token in both localStorage and cookie */
function storeAccessToken(token: string) {
    localStorage.setItem('accessToken', token);
    document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
}

/** Clear all auth data */
function clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    document.cookie = 'accessToken=; path=/; max-age=0';
}

// Attach access token to every request
http.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Track if a refresh is already in-flight to avoid parallel refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function clearAuthAndRedirect() {
    const wasLoggedIn = !!(getAccessToken() || getRefreshToken());
    clearAuth();
    if (wasLoggedIn && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
    }
}

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (typeof window === 'undefined') {
            return Promise.reject(error);
        }

        const refreshToken = getRefreshToken();

        // No refresh token -> go to login
        if (!refreshToken) {
            clearAuthAndRedirect();
            return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve) => {
                addRefreshSubscriber((newToken: string) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    originalRequest._retry = true;
                    resolve(http(originalRequest));
                });
            });
        }

        // Try to refresh
        isRefreshing = true;
        originalRequest._retry = true;

        try {
            const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
                refresh: refreshToken,
            });

            const newAccess = data.access;
            storeAccessToken(newAccess);

            // If backend rotates refresh tokens, save new one
            if (data.refresh) {
                localStorage.setItem('refreshToken', data.refresh);
            }

            isRefreshing = false;
            onRefreshed(newAccess);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return http(originalRequest);
        } catch (refreshError) {
            // Refresh token also expired/invalid -> logout
            isRefreshing = false;
            refreshSubscribers = [];
            clearAuthAndRedirect();
            return Promise.reject(refreshError);
        }
    }
);
