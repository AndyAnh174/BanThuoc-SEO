/**
 * Admin Products API
 */
import axios from 'axios';
import type {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductListParams,
  ProductListResponse,
} from '../types/product.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const getProducts = async (params?: ProductListParams): Promise<ProductListResponse> => {
  const response = await api.get<ProductListResponse>('/admin/products/', { params });
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get<Product>(`/admin/products/${id}/`);
  return response.data;
};

export const createProduct = async (data: ProductCreateInput): Promise<Product> => {
  const response = await api.post<Product>('/admin/products/', data);
  return response.data;
};

export const updateProduct = async (id: string, data: ProductUpdateInput): Promise<Product> => {
  const response = await api.patch<Product>(`/admin/products/${id}/`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/admin/products/${id}/`);
};

export const productsApi = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
