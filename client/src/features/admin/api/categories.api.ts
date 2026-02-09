/**
 * Admin Categories API
 */
import { http } from '@/lib/http';
import type {
  Category,
  CategoryDetail,
  CategoryListParams,
  CategoryListResponse,
  CategoryTreeResponse,
  CategoryCreateInput,
  CategoryUpdateInput,
} from '../types/category.types';

/**
 * Get paginated list of categories
 */
export const getCategories = async (params?: CategoryListParams): Promise<CategoryListResponse> => {
  const response = await http.get<CategoryListResponse>('/categories/', { params });
  return response.data;
};

/**
 * Get category tree structure
 */
export const getCategoryTree = async (activeOnly: boolean = true): Promise<CategoryTreeResponse> => {
  const response = await http.get<CategoryTreeResponse>('/categories/tree/', {
    params: { active_only: activeOnly }
  });
  return response.data;
};

/**
 * Get category detail by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<CategoryDetail> => {
  const response = await http.get<CategoryDetail>(`/categories/${slug}/`);
  return response.data;
};

/**
 * Create new category
 */
export const createCategory = async (data: CategoryCreateInput): Promise<Category> => {
  const response = await http.post<Category>('/categories/', data);
  return response.data;
};

/**
 * Update category by slug
 */
export const updateCategory = async (slug: string, data: CategoryUpdateInput): Promise<Category> => {
  const response = await http.patch<Category>(`/categories/${slug}/`, data);
  return response.data;
};

/**
 * Delete category by slug
 */
export const deleteCategory = async (slug: string): Promise<void> => {
  await http.delete(`/categories/${slug}/`);
};

/**
 * Move category to new parent
 */
export const moveCategory = async (id: string, newParentId: string | null): Promise<CategoryDetail> => {
  const response = await http.post<{ message: string; category: CategoryDetail }>(
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
