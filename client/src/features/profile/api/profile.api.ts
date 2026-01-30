import axios from 'axios';
import { UserProfile, UserProfileUpdateData, RewardPointLog } from '../types/profile.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthHeader = () => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            return { Authorization: `Bearer ${token}` };
        }
    }
    return {};
};

export const getProfile = async (): Promise<UserProfile> => {
    const response = await axios.get<UserProfile>(`${API_URL}/api/me/`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const updateProfile = async (data: UserProfileUpdateData): Promise<UserProfile> => {
    const response = await axios.patch<UserProfile>(`${API_URL}/api/me/update/`, data, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const uploadAvatar = async (file: File): Promise<{ avatar: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post<{ avatar: string; message: string }>(
        `${API_URL}/api/me/avatar/`,
        formData,
        {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

export interface ChangePasswordData {
    old_password: string;
    new_password: string;
    confirm_password: string;
}

export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(
        `${API_URL}/api/me/change-password/`,
        data,
        { headers: getAuthHeader() }
    );
    return response.data;
};

export const getPointHistory = async (): Promise<RewardPointLog[]> => {
    const response = await axios.get<RewardPointLog[]>(`${API_URL}/api/me/points/`, {
        headers: getAuthHeader()
    });
    return response.data;
};
