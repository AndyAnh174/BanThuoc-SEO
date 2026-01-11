/**
 * API functions for products
 */
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Types
export interface ProductListParams {
  page?: number;
  page_size?: number;
  category?: string;
  manufacturer?: string;
  min_price?: number;
  max_price?: number;
  status?: string;
  search?: string;
  ordering?: string;
}

export interface CategoryListParams {
  parent?: string;
  active_only?: boolean;
}

// Product APIs
export const getProducts = async (params?: ProductListParams) => {
  return api.get('/products/', { params });
};

export const getProduct = async (slug: string) => {
  return api.get(`/products/${slug}/`);
};

export const getFeaturedProducts = async () => {
  return api.get('/products/featured/');
};

export const getOnSaleProducts = async () => {
  return api.get('/products/on-sale/');
};

export const searchProducts = async (query: string, params?: ProductListParams) => {
  return api.get('/search/', { params: { q: query, ...params } });
};

export const getSuggestions = async (query: string) => {
  return api.get('/search/suggest/', { params: { q: query } });
};

// Category APIs
export const getCategories = async (params?: CategoryListParams) => {
  return api.get('/categories/', { params });
};

export const getCategory = async (slug: string) => {
  return api.get(`/categories/${slug}/`);
};

// Manufacturer APIs
export const getManufacturers = async () => {
  return api.get('/manufacturers/');
};

export const getManufacturer = async (slug: string) => {
  return api.get(`/manufacturers/${slug}/`);
};

// Flash Sale APIs
export const getCurrentFlashSale = async () => {
  return api.get('/flash-sale/');
};

export const getFlashSaleSessions = async () => {
  return api.get('/flash-sale/sessions/');
};

export const getFlashSaleSession = async (slug: string) => {
  return api.get(`/flash-sale/sessions/${slug}/`);
};

export const checkProductFlashSale = async (productId: string) => {
  return api.get('/flash-sale/check/', { params: { product_id: productId } });
};

export default api;
