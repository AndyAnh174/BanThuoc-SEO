/**
 * Zustand store for products state management
 */
import { create } from 'zustand';
import { toast } from 'sonner';
import {
  getProducts,
  getCategories,
  getManufacturers,
  searchProducts,
  getCurrentFlashSale,
  ProductListParams,
} from '../api/products.api';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  manufacturer?: {
    id: string;
    name: string;
    slug: string;
  };
  unit?: string;
  stockQuantity?: number;
  requiresPrescription?: boolean;
  isFeatured?: boolean;
  status?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
}

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
}

export interface FlashSaleSession {
  id: string;
  name: string;
  slug: string;
  startTime: string;
  endTime: string;
  status: string;
  bannerImage?: string;
  items: FlashSaleItem[];
}

export interface FlashSaleItem {
  id: string;
  product: Product;
  originalPrice: number;
  flashSalePrice: number;
  totalQuantity: number;
  remainingQuantity: number;
  soldQuantity: number;
  discountPercentage: number;
  soldPercentage: number;
}

export interface ProductFilters {
  categories: string[];
  manufacturers: string[];
  priceRange: { min: number; max: number };
  onSaleOnly: boolean;
  inStockOnly: boolean;
  requiresPrescription?: boolean;
}

interface ProductsState {
  // Data
  products: Product[];
  categories: Category[];
  manufacturers: Manufacturer[];
  currentFlashSale: FlashSaleSession | null;
  
  // Loading states
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingManufacturers: boolean;
  isLoadingFlashSale: boolean;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  
  // Filters
  filters: ProductFilters;
  searchQuery: string;
  
  // Actions
  fetchProducts: (params?: ProductListParams) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchManufacturers: () => Promise<void>;
  fetchCurrentFlashSale: () => Promise<void>;
  search: (query: string) => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
}

const defaultFilters: ProductFilters = {
  categories: [],
  manufacturers: [],
  priceRange: { min: 0, max: 10000000 },
  onSaleOnly: false,
  inStockOnly: true,
  requiresPrescription: undefined,
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  // Initial state
  products: [],
  categories: [],
  manufacturers: [],
  currentFlashSale: null,
  
  isLoadingProducts: false,
  isLoadingCategories: false,
  isLoadingManufacturers: false,
  isLoadingFlashSale: false,
  
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  
  filters: defaultFilters,
  searchQuery: '',
  
  // Actions
  fetchProducts: async (params?: ProductListParams) => {
    set({ isLoadingProducts: true });
    try {
      const { filters, currentPage } = get();
      
      const queryParams: ProductListParams = {
        page: currentPage,
        page_size: 20,
        ...params,
      };
      
      // Apply filters
      if (filters.categories.length > 0) {
        queryParams.category = filters.categories.join(',');
      }
      if (filters.manufacturers.length > 0) {
        queryParams.manufacturer = filters.manufacturers.join(',');
      }
      if (filters.priceRange.min > 0) {
        queryParams.min_price = filters.priceRange.min;
      }
      if (filters.priceRange.max < 10000000) {
        queryParams.max_price = filters.priceRange.max;
      }
      
      const response = await getProducts(queryParams);
      const data = response.data;
      
      set({
        products: data.results || [],
        totalProducts: data.count || 0,
        totalPages: Math.ceil((data.count || 0) / 20),
        isLoadingProducts: false,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Lỗi tải sản phẩm', { description: 'Không thể tải danh sách sản phẩm' });
      set({ isLoadingProducts: false, products: [] });
    }
  },
  
  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      const response = await getCategories();
      set({
        categories: response.data || [],
        isLoadingCategories: false,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ isLoadingCategories: false, categories: [] });
    }
  },
  
  fetchManufacturers: async () => {
    set({ isLoadingManufacturers: true });
    try {
      const response = await getManufacturers();
      set({
        manufacturers: response.data || [],
        isLoadingManufacturers: false,
      });
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      set({ isLoadingManufacturers: false, manufacturers: [] });
    }
  },
  
  fetchCurrentFlashSale: async () => {
    set({ isLoadingFlashSale: true });
    try {
      const response = await getCurrentFlashSale();
      const data = response.data;
      
      set({
        currentFlashSale: data.current_session || data.upcoming_session || null,
        isLoadingFlashSale: false,
      });
    } catch (error) {
      console.error('Error fetching flash sale:', error);
      set({ isLoadingFlashSale: false, currentFlashSale: null });
    }
  },
  
  search: async (query: string) => {
    set({ isLoadingProducts: true, searchQuery: query });
    try {
      const response = await searchProducts(query, { page: 1, page_size: 20 });
      const data = response.data;
      
      set({
        products: data.results || [],
        totalProducts: data.total || 0,
        totalPages: data.total_pages || 1,
        currentPage: 1,
        isLoadingProducts: false,
      });
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Lỗi tìm kiếm', { description: 'Không thể tìm kiếm sản phẩm' });
      set({ isLoadingProducts: false, products: [] });
    }
  },
  
  setFilters: (newFilters: Partial<ProductFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    }));
    // Auto-fetch products when filters change
    get().fetchProducts();
  },
  
  resetFilters: () => {
    set({
      filters: defaultFilters,
      currentPage: 1,
      searchQuery: '',
    });
    get().fetchProducts();
  },
  
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchProducts();
  },
}));

export default useProductsStore;
