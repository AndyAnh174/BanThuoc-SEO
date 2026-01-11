/**
 * Admin Products Store
 */
import { create } from 'zustand';
import { toast } from 'sonner';
import { productsApi } from '../api/products.api';
import type {
  Product,
  ProductListParams,
  ProductCreateInput,
  ProductUpdateInput,
} from '../types/product.types';

interface ProductsState {
  // Data
  products: Product[];
  selectedProduct: Product | null;
  
  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Filters
  searchTerm: string;
  categoryFilter: string | undefined;
  statusFilter: string | undefined;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // UI state
  isModalOpen: boolean;
  modalMode: 'create' | 'edit';
  
  // Actions
  fetchProducts: (params?: ProductListParams) => Promise<void>;
  createProduct: (data: ProductCreateInput) => Promise<boolean>;
  updateProduct: (id: string, data: ProductUpdateInput) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // UI actions
  setSelectedProduct: (product: Product | null) => void;
  openCreateModal: () => void;
  openEditModal: (product: Product) => void;
  closeModal: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: { search?: string; category?: string; status?: string }) => void;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  searchTerm: '',
  categoryFilter: undefined,
  statusFilter: undefined,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isModalOpen: false,
  modalMode: 'create',

  // Fetch products
  fetchProducts: async (params?: ProductListParams) => {
    set({ isLoading: true });
    try {
      const { currentPage, pageSize, searchTerm, categoryFilter, statusFilter } = get();
      
      const queryParams: ProductListParams = {
        page: params?.page ?? currentPage,
        page_size: params?.page_size ?? pageSize,
        search: params?.search ?? searchTerm,
        category: params?.category ?? categoryFilter,
        status: (params?.status ?? statusFilter) as any,
        ...params,
      };

      const response = await productsApi.getProducts(queryParams);
      
      set({
        products: response.results,
        totalCount: response.count,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
      set({ isLoading: false });
    }
  },

  // Create product
  createProduct: async (data: ProductCreateInput) => {
    set({ isCreating: true });
    try {
      await productsApi.createProduct(data);
      toast.success('Tạo sản phẩm thành công');
      set({ isCreating: false, isModalOpen: false });
      get().fetchProducts();
      return true;
    } catch (error: any) {
      console.error('Error creating product:', error);
      const message = error.response?.data?.detail || 'Không thể tạo sản phẩm';
      toast.error(message);
      set({ isCreating: false });
      return false;
    }
  },

  // Update product
  updateProduct: async (id: string, data: ProductUpdateInput) => {
    set({ isUpdating: true });
    try {
      await productsApi.updateProduct(id, data);
      toast.success('Cập nhật sản phẩm thành công');
      set({ isUpdating: false, isModalOpen: false, selectedProduct: null });
      get().fetchProducts();
      return true;
    } catch (error: any) {
      console.error('Error updating product:', error);
      const message = error.response?.data?.detail || 'Không thể cập nhật sản phẩm';
      toast.error(message);
      set({ isUpdating: false });
      return false;
    }
  },

  // Delete product
  deleteProduct: async (id: string) => {
    set({ isDeleting: true });
    try {
      await productsApi.deleteProduct(id);
      toast.success('Xóa sản phẩm thành công');
      set({ isDeleting: false, selectedProduct: null });
      get().fetchProducts();
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const message = error.response?.data?.detail || 'Không thể xóa sản phẩm';
      toast.error(message);
      set({ isDeleting: false });
      return false;
    }
  },

  // UI actions
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  
  openCreateModal: () => set({ 
    isModalOpen: true, 
    modalMode: 'create', 
    selectedProduct: null 
  }),
  
  openEditModal: (product) => set({ 
    isModalOpen: true, 
    modalMode: 'edit', 
    selectedProduct: product 
  }),
  
  closeModal: () => set({ 
    isModalOpen: false, 
    selectedProduct: null 
  }),
  
  setPage: (page) => {
    set({ currentPage: page });
    const { pageSize } = get();
    get().fetchProducts({ page, page_size: pageSize });
  },
  
  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchProducts({ page: 1, page_size: size });
  },
  
  setFilters: (filters) => {
    set((state) => ({ ...state, ...filters, currentPage: 1 }));
    get().fetchProducts({ page: 1 });
  },
}));
