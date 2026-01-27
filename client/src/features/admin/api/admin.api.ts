import axios from 'axios';
import { User, UserListResponse, UserStatusUpdate, UserCreateData, UserUpdateData } from '../types/admin.types';

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

export const fetchUsers = async (page = 1, status = '', search = '', role = ''): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);

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

export const createUser = async (data: UserCreateData): Promise<User> => {
    const response = await axios.post<User>(`${API_URL}/api/admin/users/create`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateUser = async (userId: number, data: UserUpdateData): Promise<User> => {
    const response = await axios.patch<User>(`${API_URL}/api/admin/users/${userId}/update`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await axios.delete(`${API_URL}/api/admin/users/${userId}/delete`, {
        headers: getAuthHeader()
    });
};

