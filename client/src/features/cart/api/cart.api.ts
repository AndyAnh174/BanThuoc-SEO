import { http } from '@/lib/http';
import { Cart, AddToCartData } from '../types/cart.types';

export const cartApi = {
    getCart: async () => {
        const response = await http.get<Cart>('/cart/');
        return response.data;
    },
    addToCart: async (data: AddToCartData) => {
        const response = await http.post<Cart>('/cart/add/', data);
        return response.data;
    },
    updateItem: async (itemId: number, quantity: number) => {
        const response = await http.patch<Cart>(`/cart/items/${itemId}/`, { quantity });
        return response.data;
    },
    removeItem: async (itemId: number) => {
        const response = await http.delete<Cart>(`/cart/items/${itemId}/`);
        return response.data;
    },
    clearCart: async () => {
        const response = await http.post<Cart>('/cart/clear/', {});
        return response.data;
    }
};
