/**
 * API functions for products
 */
import { http as api } from '@/lib/http';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

import { transformProduct, transformProductList } from '../utils/transformer';

// Product APIs
export const getProducts = async (params?: ProductListParams) => {
  const res = await api.get('/products/', { params });
  return { ...res, data: transformProductList(res.data) };
};

export const getProduct = async (slug: string) => {
  const res = await api.get(`/products/${slug}/`);
  return { ...res, data: transformProduct(res.data) };
};

export const getFeaturedProducts = async () => {
  const res = await api.get('/products/featured/');
  // API might return list directly or paginated
  // If list:
  if (Array.isArray(res.data)) {
      return { ...res, data: res.data.map(transformProduct) };
  }
  return { ...res, data: transformProductList(res.data) };
};

export const getOnSaleProducts = async () => {
    const res = await api.get('/products/on-sale/');
    if (Array.isArray(res.data)) {
        return { ...res, data: res.data.map(transformProduct) };
    }
    return { ...res, data: transformProductList(res.data) };
};

export const getNewProducts = async () => {
    const res = await api.get('/products/new/');
    if (Array.isArray(res.data)) {
        return { ...res, data: res.data.map(transformProduct) };
    }
    return { ...res, data: transformProductList(res.data) };
};

export const searchProducts = async (query: string, params?: ProductListParams) => {
  const res = await api.get('/search/', { params: { q: query, ...params } });
  return { ...res, data: transformProductList(res.data) }; // SearchResponse has results array
};

export const getSuggestions = async (query: string) => {
  return api.get('/search/suggest/', { params: { q: query } });
};

// Category APIs
export const getCategories = async (params?: CategoryListParams) => {
  return api.get('/categories/tree/', { params });
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
