/**
 * Admin Categories Store (Zustand)
 */
import { create } from 'zustand';
import { toast } from 'sonner';
import { categoriesApi } from '../api/categories.api';
import type {
  Category,
  CategoryTree,
  CategoryListParams,
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../types/category.types';

interface CategoriesState {
  // Data
  categories: Category[];
  categoryTree: CategoryTree[];
  selectedCategory: Category | null;
  
  // Pagination
  totalCount: number;
  currentPage: number;
  pageSize: number;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // UI state
  isModalOpen: boolean;
  modalMode: 'create' | 'edit';
  
  // Actions
  fetchCategories: (params?: CategoryListParams) => Promise<void>;
  fetchCategoryTree: (activeOnly?: boolean) => Promise<void>;
  createCategory: (data: CategoryCreateInput) => Promise<boolean>;
  updateCategory: (slug: string, data: CategoryUpdateInput) => Promise<boolean>;
  deleteCategory: (slug: string) => Promise<boolean>;
  moveCategory: (id: string, newParentId: string | null) => Promise<boolean>;
  
  // UI actions
  setSelectedCategory: (category: Category | null) => void;
  openCreateModal: () => void;
  openEditModal: (category: Category) => void;
  closeModal: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  // Initial state
  categories: [],
  categoryTree: [],
  selectedCategory: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isModalOpen: false,
  modalMode: 'create',

  // Fetch categories list
  fetchCategories: async (params?: CategoryListParams) => {
    set({ isLoading: true });
    try {
      const { currentPage, pageSize } = get();
      const response = await categoriesApi.getCategories({
        page: params?.page ?? currentPage,
        page_size: params?.page_size ?? pageSize,
        ...params,
      });
      set({
        categories: response.results,
        totalCount: response.count,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
      set({ isLoading: false });
    }
  },

  // Fetch category tree
  fetchCategoryTree: async (activeOnly = false) => {
    try {
      const response = await categoriesApi.getCategoryTree(activeOnly);
      set({ categoryTree: response.results });
    } catch (error: any) {
      console.error('Error fetching category tree:', error);
      toast.error('Không thể tải cây danh mục');
    }
  },

  // Create category
  createCategory: async (data: CategoryCreateInput) => {
    set({ isCreating: true });
    try {
      await categoriesApi.createCategory(data);
      toast.success('Tạo danh mục thành công');
      set({ isCreating: false, isModalOpen: false });
      get().fetchCategories();
      get().fetchCategoryTree();
      return true;
    } catch (error: any) {
      console.error('Error creating category:', error);
      const message = error.response?.data?.name?.[0] || 
                      error.response?.data?.detail ||
                      'Không thể tạo danh mục';
      toast.error(message);
      set({ isCreating: false });
      return false;
    }
  },

  // Update category
  updateCategory: async (slug: string, data: CategoryUpdateInput) => {
    set({ isUpdating: true });
    try {
      await categoriesApi.updateCategory(slug, data);
      toast.success('Cập nhật danh mục thành công');
      set({ isUpdating: false, isModalOpen: false, selectedCategory: null });
      get().fetchCategories();
      get().fetchCategoryTree();
      return true;
    } catch (error: any) {
      console.error('Error updating category:', error);
      const message = error.response?.data?.name?.[0] || 
                      error.response?.data?.detail ||
                      'Không thể cập nhật danh mục';
      toast.error(message);
      set({ isUpdating: false });
      return false;
    }
  },

  // Delete category
  deleteCategory: async (slug: string) => {
    set({ isDeleting: true });
    try {
      await categoriesApi.deleteCategory(slug);
      toast.success('Xóa danh mục thành công');
      set({ isDeleting: false, selectedCategory: null });
      get().fetchCategories();
      get().fetchCategoryTree();
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error.response?.data?.error || 
                      error.response?.data?.detail ||
                      'Không thể xóa danh mục';
      toast.error(message);
      set({ isDeleting: false });
      return false;
    }
  },

  // Move category
  moveCategory: async (id: string, newParentId: string | null) => {
    try {
      await categoriesApi.moveCategory(id, newParentId);
      toast.success('Di chuyển danh mục thành công');
      get().fetchCategories();
      get().fetchCategoryTree();
      return true;
    } catch (error: any) {
      console.error('Error moving category:', error);
      const message = error.response?.data?.error || 'Không thể di chuyển danh mục';
      toast.error(message);
      return false;
    }
  },

  // UI actions
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  openCreateModal: () => set({ 
    isModalOpen: true, 
    modalMode: 'create', 
    selectedCategory: null 
  }),
  
  openEditModal: (category) => set({ 
    isModalOpen: true, 
    modalMode: 'edit', 
    selectedCategory: category 
  }),
  
  closeModal: () => set({ 
    isModalOpen: false, 
    selectedCategory: null 
  }),
  
  setPage: (page) => {
    set({ currentPage: page });
    const { pageSize } = get();
    get().fetchCategories({ page, page_size: pageSize });
  },
  
  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchCategories({ page: 1, page_size: size });
  },
}));
