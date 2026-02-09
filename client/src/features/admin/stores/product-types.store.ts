import { create } from 'zustand';
import { toast } from 'sonner';
import { productTypesApi, ProductType, CreateProductTypeInput, UpdateProductTypeInput } from '@/src/features/products/api/product-types.api';

interface ProductTypesState {
    // Data
    types: ProductType[];
    selectedType: ProductType | null;

    // Loading states
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // UI state
    isModalOpen: boolean;
    modalMode: 'create' | 'edit';

    // Actions
    fetchTypes: () => Promise<void>;
    createType: (data: CreateProductTypeInput) => Promise<boolean>;
    updateType: (id: string, data: UpdateProductTypeInput) => Promise<boolean>;
    deleteType: (id: string) => Promise<boolean>;

    // UI actions
    setSelectedType: (type: ProductType | null) => void;
    openCreateModal: () => void;
    openEditModal: (type: ProductType) => void;
    closeModal: () => void;
}

export const useProductTypesStore = create<ProductTypesState>((set, get) => ({
    // Initial state
    types: [],
    selectedType: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isModalOpen: false,
    modalMode: 'create',

    // Fetch types
    fetchTypes: async () => {
        set({ isLoading: true });
        try {
            const response = await productTypesApi.list();

            // Handle pagination
            const data = response.data as any;
            const types = Array.isArray(data) ? data : (data.results || []);
            set({ types: types, isLoading: false });
        } catch (error: any) {
            console.error('Error fetching product types:', error);
            toast.error('Không thể tải danh sách loại sản phẩm');
            set({ isLoading: false });
        }
    },

    // Create type
    createType: async (data: CreateProductTypeInput) => {
        set({ isCreating: true });
        try {
            await productTypesApi.create(data);
            toast.success('Tạo loại sản phẩm thành công');
            set({ isCreating: false, isModalOpen: false });
            get().fetchTypes();
            return true;
        } catch (error: any) {
            console.error('Error creating product type:', error);
            const message = error.response?.data?.name?.[0] ||
                error.response?.data?.code?.[0] ||
                error.response?.data?.detail ||
                'Không thể tạo loại sản phẩm';
            toast.error(message);
            set({ isCreating: false });
            return false;
        }
    },

    // Update type
    updateType: async (id: string, data: UpdateProductTypeInput) => {
        set({ isUpdating: true });
        try {
            await productTypesApi.update(id, data);
            toast.success('Cập nhật loại sản phẩm thành công');
            set({ isUpdating: false, isModalOpen: false, selectedType: null });
            get().fetchTypes();
            return true;
        } catch (error: any) {
            console.error('Error updating product type:', error);
            const message = error.response?.data?.name?.[0] ||
                error.response?.data?.detail ||
                'Không thể cập nhật loại sản phẩm';
            toast.error(message);
            set({ isUpdating: false });
            return false;
        }
    },

    // Delete type
    deleteType: async (id: string) => {
        set({ isDeleting: true });
        try {
            await productTypesApi.delete(id);
            toast.success('Xóa loại sản phẩm thành công');
            set({ isDeleting: false, selectedType: null });
            get().fetchTypes();
            return true;
        } catch (error: any) {
            var message = 'Không thể xóa loại sản phẩm';
            if (error.response?.status === 400 || error.response?.status === 500) {
                // Likely protected error
                message = 'Không thể xóa loại sản phẩm đang được sử dụng';
            }
            toast.error(message);
            set({ isDeleting: false });
            return false;
        }
    },

    // UI actions
    setSelectedType: (type) => set({ selectedType: type }),

    openCreateModal: () => set({
        isModalOpen: true,
        modalMode: 'create',
        selectedType: null
    }),

    openEditModal: (type) => set({
        isModalOpen: true,
        modalMode: 'edit',
        selectedType: type
    }),

    closeModal: () => set({
        isModalOpen: false,
        selectedType: null
    }),
}));
