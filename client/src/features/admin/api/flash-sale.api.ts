import axios from 'axios';
import { FlashSaleSession, FlashSaleFormData, FlashSaleItem, FlashSaleItemFormData } from '../types/flash-sale.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

export const flashSaleApi = {
    // Sessions
    getSessions: async (params?: any) => {
        const response = await axios.get(`${API_URL}/api/admin/flash-sales/`, { ...getAuthHeaders(), params });
        return response.data;
    },

    getSession: async (id: string) => {
        const response = await axios.get(`${API_URL}/api/admin/flash-sales/${id}/`, getAuthHeaders());
        return response.data;
    },

    createSession: async (data: FlashSaleFormData) => {
        const response = await axios.post(`${API_URL}/api/admin/flash-sales/`, data, getAuthHeaders());
        return response.data;
    },

    updateSession: async (id: string, data: Partial<FlashSaleFormData>) => {
        const response = await axios.patch(`${API_URL}/api/admin/flash-sales/${id}/`, data, getAuthHeaders());
        return response.data;
    },

    deleteSession: async (id: string) => {
        await axios.delete(`${API_URL}/api/admin/flash-sales/${id}/`, getAuthHeaders());
    },

    // Session Items (Bulk or Single)
    addItemsToSession: async (sessionId: string, items: { product: string, flash_sale_price: number, total_quantity: number, max_per_user: number }[]) => {
        const response = await axios.post(`${API_URL}/api/admin/flash-sales/${sessionId}/add_products/`, { products: items }, getAuthHeaders());
        return response.data;
    },

    // Items CRUD (Direct)
    updateItem: async (itemId: string, data: Partial<FlashSaleItemFormData>) => {
        const response = await axios.patch(`${API_URL}/api/admin/flash-sale-items/${itemId}/`, data, getAuthHeaders());
        return response.data;
    },

    deleteItem: async (itemId: string) => {
        await axios.delete(`${API_URL}/api/admin/flash-sale-items/${itemId}/`, getAuthHeaders());
    },
};
