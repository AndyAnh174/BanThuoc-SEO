import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const http = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for session/cookies if used
});

// Add interceptors if needed
// Add request interceptor to attach token
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
    (error) => {
        return Promise.reject(error);
    }
);

http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we get a 401 and haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Check if this might be a public endpoint (no auth required)
            // Try the request again without the token
            if (typeof window !== 'undefined') {
                // Clear potentially invalid/expired token
                const currentToken = localStorage.getItem('accessToken');

                if (currentToken) {
                    // Create a new request without the Authorization header
                    const newConfig = { ...originalRequest };
                    delete newConfig.headers.Authorization;

                    try {
                        // Retry without token for public endpoints
                        return await axios.request({
                            ...newConfig,
                            baseURL: API_URL,
                        });
                    } catch (retryError: any) {
                        // If retry also fails with 401, it's truly a protected endpoint
                        // Clear tokens and redirect to login
                        if (retryError.response?.status === 401) {
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');

                            // Only redirect if not already on auth pages
                            if (!window.location.pathname.startsWith('/auth')) {
                                window.location.href = '/auth/login';
                            }
                        }
                        return Promise.reject(retryError);
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);
