import { create } from 'zustand';
import { toast } from 'sonner';
import { cartApi } from '../api/cart.api';
import { Cart } from '../types/cart.types';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    
    fetchCart: () => Promise<void>;
    addToCart: (productId: string, quantity?: number) => Promise<boolean>;
    updateItem: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    isLoading: false,

    fetchCart: async () => {
        set({ isLoading: true });
        try {
            const cart = await cartApi.getCart();
            set({ cart });
        } catch (error: any) {
            // Silently fail if 401 (guest) or 404
            console.error("Failed to fetch cart:", error);
            set({ cart: null });
        } finally {
            set({ isLoading: false });
        }
    },

    addToCart: async (productId: string, quantity = 1) => {
        set({ isLoading: true });
        try {
            const cart = await cartApi.addToCart({ product_id: productId, quantity });
            set({ cart });
            toast.success("Đã thêm vào giỏ hàng");
            return true;
        } catch (error: any) {
            const message = error.response?.data?.error || "Không thể thêm vào giỏ hàng";
            toast.error(message);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    updateItem: async (itemId: number, quantity: number) => {
        try {
            const cart = await cartApi.updateItem(itemId, quantity);
            set({ cart });
        } catch (error: any) {
            toast.error("Không thể cập nhật số lượng");
        }
    },

    removeItem: async (itemId: number) => {
        try {
            const cart = await cartApi.removeItem(itemId);
            set({ cart });
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
        } catch (error: any) {
            toast.error("Không thể xóa sản phẩm");
        }
    },

    clearCart: async () => {
        try {
            const cart = await cartApi.clearCart();
            set({ cart });
            toast.success("Đã xóa giỏ hàng");
        } catch (error: any) {
            toast.error("Không thể xóa giỏ hàng");
        }
    }
}));
