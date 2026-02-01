import { create } from 'zustand';
import { Order, OrderStatus } from '../types/admin.types';
import { getOrders, updateOrderStatus, downloadInvoice } from '@/src/features/orders/api/orders.api';
import { toast } from 'sonner';

interface OrdersState {
    orders: Order[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
    
    // Filters
    page: number;
    filterStatus: string;
    searchQuery: string;

    // Actions
    setPage: (page: number) => void;
    setFilterStatus: (status: string) => void;
    setSearchQuery: (query: string) => void;
    loadOrders: () => Promise<void>;
    updateOrderStatus: (orderId: number, status: OrderStatus) => Promise<boolean>;
    downloadInvoice: (orderId: number) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
    orders: [],
    totalCount: 0,
    isLoading: false,
    error: null,
    
    page: 1,
    filterStatus: 'all', // 'all' or specific status
    searchQuery: '',

    setPage: (page) => {
        set({ page });
        get().loadOrders();
    },
    setFilterStatus: (status) => {
        set({ filterStatus: status, page: 1 });
        get().loadOrders();
    },
    setSearchQuery: (query) => {
        set({ searchQuery: query, page: 1 });
        get().loadOrders();
    },

    loadOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const { page, filterStatus, searchQuery } = get();
            const params: any = { page };
            if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
            if (searchQuery) params.search = searchQuery;

            const response = await getOrders(params);
            set({ 
                orders: response.data.results || [], 
                totalCount: response.data.count || 0, 
                isLoading: false 
            });
        } catch (error: any) {
            set({ 
                isLoading: false, 
                error: error.message || "Không thể tải danh sách đơn hàng" 
            });
            toast.error("Lỗi khi tải danh sách đơn hàng");
        }
    },

    updateOrderStatus: async (orderId: number, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
            toast.success("Cập nhật trạng thái thành công");
            get().loadOrders();
            return true;
        } catch (error: any) {
            toast.error("Không thể cập nhật trạng thái");
            return false;
        }
    },

    downloadInvoice: async (orderId: number) => {
        try {
            toast.loading("Đang tải hóa đơn...");
            await downloadInvoice(orderId);
            toast.dismiss();
            toast.success("Tải hóa đơn thành công");
        } catch (error) {
            toast.dismiss();
            toast.error("Lỗi khi tải hóa đơn");
        }
    }
}));
