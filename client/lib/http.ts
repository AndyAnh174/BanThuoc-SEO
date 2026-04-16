import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const http = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Attach access token to every request
http.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    if (!window.location.pathname.startsWith('/auth')) {
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

        const refreshToken = localStorage.getItem('refreshToken');

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
            localStorage.setItem('accessToken', newAccess);

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
