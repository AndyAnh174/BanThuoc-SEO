import { http } from '@/lib/http';
import { UserProfile, UserProfileUpdateData, RewardPointLog } from '../types/profile.types';

export const getProfile = async (): Promise<UserProfile> => {
    const response = await http.get<UserProfile>('/me/');
    return response.data;
};

export const updateProfile = async (data: UserProfileUpdateData): Promise<UserProfile> => {
    const response = await http.patch<UserProfile>('/me/update/', data);
    return response.data;
};

export const uploadAvatar = async (file: File): Promise<{ avatar: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    // Auth header is handled by http interceptor
    const response = await http.post<{ avatar: string; message: string }>(
        '/me/avatar/',
        formData,
        {
            headers: {
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
    const response = await http.post<{ message: string }>(
        '/me/change-password/',
        data
    );
    return response.data;
};

export const getPointHistory = async (): Promise<RewardPointLog[]> => {
    const response = await http.get<RewardPointLog[]>('/me/points/');
    return response.data;
};
