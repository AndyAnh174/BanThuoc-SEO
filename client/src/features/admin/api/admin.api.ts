import { http } from '@/lib/http';
import { User, UserListResponse, UserStatusUpdate, UserCreateData, UserUpdateData } from '../types/admin.types';

export const fetchUsers = async (page = 1, status = '', search = '', role = ''): Promise<UserListResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);

    const response = await http.get<UserListResponse>('/admin/users', {
        params: params
    });
    return response.data;
};

export const fetchUserDetail = async (userId: number): Promise<User> => {
    const response = await http.get<User>(`/admin/users/${userId}`);
    return response.data;
};

export const updateUserStatus = async (userId: number, data: UserStatusUpdate) => {
    const response = await http.patch(`/admin/users/${userId}/status`, data);
    return response.data;
};

export const createUser = async (data: UserCreateData): Promise<User> => {
    const response = await http.post<User>('/admin/users/create', data);
    return response.data;
};

export const updateUser = async (userId: number, data: UserUpdateData): Promise<User> => {
    const response = await http.patch<User>(`/admin/users/${userId}/update`, data);
    return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
    await http.delete(`/admin/users/${userId}/delete`);
};

