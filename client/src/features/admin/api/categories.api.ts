/**
 * Admin Categories API
 */
import axios from 'axios';
import type {
  Category,
  CategoryDetail,
  CategoryListParams,
  CategoryListResponse,
  CategoryTreeResponse,
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../types/category.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Authorization header needs Bearer token
    }
  }
  return config;
});

/**
 * Get paginated list of categories
 */
export const getCategories = async (params?: CategoryListParams): Promise<CategoryListResponse> => {
  const response = await api.get<CategoryListResponse>('/categories/', { params });
  return response.data;
};

/**
 * Get category tree structure
 */
export const getCategoryTree = async (activeOnly: boolean = true): Promise<CategoryTreeResponse> => {
  const response = await api.get<CategoryTreeResponse>('/categories/tree/', {
    params: { active_only: activeOnly }
  });
  return response.data;
};

/**
 * Get category detail by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<CategoryDetail> => {
  const response = await api.get<CategoryDetail>(`/categories/${slug}/`);
  return response.data;
};

/**
 * Create new category
 */
export const createCategory = async (data: CategoryCreateInput): Promise<Category> => {
  const response = await api.post<Category>('/categories/', data);
  return response.data;
};

/**
 * Update category by slug
 */
export const updateCategory = async (slug: string, data: CategoryUpdateInput): Promise<Category> => {
  const response = await api.patch<Category>(`/categories/${slug}/`, data);
  return response.data;
};

/**
 * Delete category by slug
 */
export const deleteCategory = async (slug: string): Promise<void> => {
  await api.delete(`/categories/${slug}/`);
};

/**
 * Move category to new parent
 */
export const moveCategory = async (id: string, newParentId: string | null): Promise<CategoryDetail> => {
  const response = await api.post<{ message: string; category: CategoryDetail }>(
    `/categories/${id}/move/`,
    { new_parent_id: newParentId }
  );
  return response.data.category;
};

export const categoriesApi = {
  getCategories,
  getCategoryTree,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategory,
};
