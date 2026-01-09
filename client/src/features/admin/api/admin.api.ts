import axios from 'axios';
import { User, UserListResponse, UserStatusUpdate } from '../types/admin.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper to get auth header (Assuming JWT is stored in localStorage 'token' or similar)
// For now, I'll rely on a simple getter, but in a real app this might come from a centralized Auth Store or Session
const getAuthHeader = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
    }
    return {};
};

export const fetchUsers = async (page = 1, status = '', search = ''): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await axios.get<UserListResponse>(`${API_URL}/api/admin/users`, {
        params: params,
        headers: getAuthHeader() // We need to ensure we send the token
    });
    return response.data;
};

export const fetchUserDetail = async (userId: number): Promise<User> => {
    const response = await axios.get<User>(`${API_URL}/api/admin/users/${userId}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateUserStatus = async (userId: number, data: UserStatusUpdate) => {
    const response = await axios.patch(`${API_URL}/api/admin/users/${userId}/status`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};
