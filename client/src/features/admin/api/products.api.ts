/**
 * Admin Products API
 */
import { http } from '@/lib/http';
import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductListParams,
  ProductListResponse,
} from '../types/product.types';

export const getProducts = async (params?: ProductListParams): Promise<ProductListResponse> => {
  const response = await http.get<ProductListResponse>('/admin/products/', { params });
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await http.get<Product>(`/admin/products/${id}/`);
  return response.data;
};

export const createProduct = async (data: ProductCreateInput): Promise<Product> => {
  const response = await http.post<Product>('/admin/products/', data);
  return response.data;
};

export const updateProduct = async (id: string, data: ProductUpdateInput): Promise<Product> => {
  const response = await http.patch<Product>(`/admin/products/${id}/`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await http.delete(`/admin/products/${id}/`);
};

export const productsApi = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
