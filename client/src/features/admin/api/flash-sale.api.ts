import { http } from '@/lib/http';
import { FlashSaleFormData, FlashSaleItemFormData } from '../types/flash-sale.types';

export const flashSaleApi = {
    // Sessions
    getSessions: async (params?: any) => {
        const response = await http.get('/admin/flash-sales/', { params });
        return response.data;
    },

    getSession: async (id: string) => {
        const response = await http.get(`/admin/flash-sales/${id}/`);
        return response.data;
    },

    createSession: async (data: FlashSaleFormData) => {
        const response = await http.post('/admin/flash-sales/', data);
        return response.data;
    },

    updateSession: async (id: string, data: Partial<FlashSaleFormData>) => {
        const response = await http.patch(`/admin/flash-sales/${id}/`, data);
        return response.data;
    },

    deleteSession: async (id: string) => {
        await http.delete(`/admin/flash-sales/${id}/`);
    },

    // Session Items (Bulk or Single)
    addItemsToSession: async (sessionId: string, items: { product: string, flash_sale_price: number, total_quantity: number, max_per_user: number }[]) => {
        const response = await http.post(`/admin/flash-sales/${sessionId}/add_products/`, { products: items });
        return response.data;
    },

    // Items CRUD (Direct)
    updateItem: async (itemId: string, data: Partial<FlashSaleItemFormData>) => {
        const response = await http.patch(`/admin/flash-sale-items/${itemId}/`, data);
        return response.data;
    },

    deleteItem: async (itemId: string) => {
        await http.delete(`/admin/flash-sale-items/${itemId}/`);
    },
};
