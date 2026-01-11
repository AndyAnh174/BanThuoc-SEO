import { create } from 'zustand';
import { flashSaleApi } from '../api/flash-sale.api';
import { FlashSaleSession, FlashSaleItem } from '../types/flash-sale.types';
import { toast } from 'sonner';

interface FlashSaleState {
    sessions: FlashSaleSession[];
    currentSession: FlashSaleSession | null;
    isLoading: boolean;
    total: number;
    page: number;
    pageSize: number;

    fetchSessions: (page?: number, pageSize?: number) => Promise<void>;
    fetchSessionDetail: (id: string) => Promise<void>;
    createSession: (data: any) => Promise<void>;
    updateSession: (id: string, data: any) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    
    // Items
    addItems: (sessionId: string, items: any[]) => Promise<void>;
    updateItem: (itemId: string, data: any) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
}

export const useFlashSaleStore = create<FlashSaleState>((set, get) => ({
    sessions: [],
    currentSession: null,
    isLoading: false,
    total: 0,
    page: 1,
    pageSize: 10,

    fetchSessions: async (page = 1, pageSize = 10) => {
        set({ isLoading: true });
        try {
            const data = await flashSaleApi.getSessions({ page, page_size: pageSize });
            set({ 
                sessions: data.results, 
                total: data.count, 
                page, 
                pageSize,
                isLoading: false 
            });
        } catch (error) {
            console.error('Failed to fetch flash sales', error);
            set({ isLoading: false });
        }
    },

    fetchSessionDetail: async (id: string) => {
        set({ isLoading: true });
        try {
             const data = await flashSaleApi.getSession(id);
             set({ currentSession: data, isLoading: false });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
            toast.error('Không thể tải chi tiết Flash Sale');
        }
    },

    createSession: async (data) => {
        set({ isLoading: true });
        try {
            await flashSaleApi.createSession(data);
            await get().fetchSessions(get().page, get().pageSize);
            toast.success('Tạo phiên Flash Sale thành công');
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi tạo Flash Sale');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateSession: async (id, data) => {
        set({ isLoading: true });
        try {
            await flashSaleApi.updateSession(id, data);
            await get().fetchSessions(get().page, get().pageSize);
            // Refresh detail if open
            if (get().currentSession?.id === id) {
                await get().fetchSessionDetail(id);
            }
            toast.success('Cập nhật thành công');
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật');
            throw error;
        } finally {
             set({ isLoading: false });
        }
    },

    deleteSession: async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa phiên Flash Sale này?')) return;
        set({ isLoading: true });
        try {
            await flashSaleApi.deleteSession(id);
            await get().fetchSessions(get().page, get().pageSize);
            toast.success('Đã xóa phiên Flash Sale');
        } catch (error) {
             console.error(error);
             toast.error('Lỗi khi xóa');
        } finally {
            set({ isLoading: false });
        }
    },

    addItems: async (sessionId, items) => {
         set({ isLoading: true });
         try {
             await flashSaleApi.addItemsToSession(sessionId, items);
             await get().fetchSessionDetail(sessionId); // Reload items
             toast.success('Đã thêm sản phẩm vào Flash Sale');
         } catch (error) {
             console.error(error);
             toast.error('Lỗi khi thêm sản phẩm');
             throw error;
         } finally {
             set({ isLoading: false });
         }
    },

    updateItem: async (itemId, data) => {
         try {
             await flashSaleApi.updateItem(itemId, data);
             // Reload session to refresh items list
             if (get().currentSession) {
                 await get().fetchSessionDetail(get().currentSession!.id);
             }
             toast.success('Cập nhật sản phẩm thành công');
         } catch (error) {
             console.error(error);
             toast.error('Lỗi cập nhật sản phẩm');
             throw error;
         }
    },

    deleteItem: async (itemId) => {
        if (!confirm('Xóa sản phẩm này khỏi Flash Sale?')) return;
        try {
            await flashSaleApi.deleteItem(itemId);
             if (get().currentSession) {
                 await get().fetchSessionDetail(get().currentSession!.id);
             }
             toast.success('Đã xóa sản phẩm');
        } catch (error) {
             console.error(error);
             toast.error('Lỗi xóa sản phẩm');
        }
    }
}));
