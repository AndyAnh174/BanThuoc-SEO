import { create } from 'zustand';
import { toast } from 'sonner';
import {
    manufacturersApi,
    Manufacturer,
    ManufacturerCreateInput,
    ManufacturerUpdateInput
} from '../api/manufacturers.api';

interface ManufacturersState {
    // Data
    manufacturers: Manufacturer[];
    selectedManufacturer: Manufacturer | null;

    // Pagination
    totalCount: number;
    currentPage: number;

    // Loading states
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // UI state
    isModalOpen: boolean;
    modalMode: 'create' | 'edit';

    // Actions
    fetchManufacturers: (page?: number) => Promise<void>;
    createManufacturer: (data: ManufacturerCreateInput) => Promise<boolean>;
    updateManufacturer: (id: string, data: ManufacturerUpdateInput) => Promise<boolean>;
    deleteManufacturer: (id: string) => Promise<boolean>;

    // UI actions
    setSelectedManufacturer: (manufacturer: Manufacturer | null) => void;
    openCreateModal: () => void;
    openEditModal: (manufacturer: Manufacturer) => void;
    closeModal: () => void;
}

export const useManufacturersStore = create<ManufacturersState>((set, get) => ({
    // Initial state
    manufacturers: [],
    selectedManufacturer: null,
    totalCount: 0,
    currentPage: 1,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isModalOpen: false,
    modalMode: 'create',

    // Fetch manufacturers
    fetchManufacturers: async (page = 1) => {
        set({ isLoading: true });
        try {
            const response = await manufacturersApi.list({ page });
            set({
                manufacturers: response.data.results,
                totalCount: response.data.count,
                currentPage: page,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Error fetching manufacturers:', error);
            toast.error('Không thể tải danh sách nhà sản xuất');
            set({ isLoading: false });
        }
    },

    // Create manufacturer
    createManufacturer: async (data: ManufacturerCreateInput) => {
        set({ isCreating: true });
        try {
            await manufacturersApi.create(data);
            toast.success('Tạo nhà sản xuất thành công');
            set({ isCreating: false, isModalOpen: false });
            get().fetchManufacturers();
            return true;
        } catch (error: any) {
            console.error('Error creating manufacturer:', error);
            const message = error.response?.data?.name?.[0] ||
                error.response?.data?.detail ||
                'Không thể tạo nhà sản xuất';
            toast.error(message);
            set({ isCreating: false });
            return false;
        }
    },

    // Update manufacturer
    updateManufacturer: async (id: string, data: ManufacturerUpdateInput) => {
        set({ isUpdating: true });
        try {
            await manufacturersApi.update(id, data);
            toast.success('Cập nhật nhà sản xuất thành công');
            set({ isUpdating: false, isModalOpen: false, selectedManufacturer: null });
            get().fetchManufacturers();
            return true;
        } catch (error: any) {
            console.error('Error updating manufacturer:', error);
            const message = error.response?.data?.name?.[0] ||
                error.response?.data?.detail ||
                'Không thể cập nhật nhà sản xuất';
            toast.error(message);
            set({ isUpdating: false });
            return false;
        }
    },

    // Delete manufacturer
    deleteManufacturer: async (id: string) => {
        set({ isDeleting: true });
        try {
            await manufacturersApi.delete(id);
            toast.success('Xóa nhà sản xuất thành công');
            set({ isDeleting: false, selectedManufacturer: null });
            get().fetchManufacturers();
            return true;
        } catch (error: any) {
            let message = 'Không thể xóa nhà sản xuất';
            if (error.response?.status === 400 || error.response?.status === 500) {
                message = 'Không thể xóa nhà sản xuất đang được sử dụng';
            }
            toast.error(message);
            set({ isDeleting: false });
            return false;
        }
    },

    // UI actions
    setSelectedManufacturer: (manufacturer) => set({ selectedManufacturer: manufacturer }),

    openCreateModal: () => set({
        isModalOpen: true,
        modalMode: 'create',
        selectedManufacturer: null
    }),

    openEditModal: (manufacturer) => set({
        isModalOpen: true,
        modalMode: 'edit',
        selectedManufacturer: manufacturer
    }),

    closeModal: () => set({
        isModalOpen: false,
        selectedManufacturer: null
    }),
}));
