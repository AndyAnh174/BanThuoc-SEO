/** Product & Search API */

import { api } from "./api";

export interface ProductItem {
  id: string; name: string; slug: string;
  price: number; sale_price?: number | null;
  image_url?: string; primary_image?: { image_url: string } | null;
  images?: { image_url: string }[];
  unit: string; stock_quantity: number;
  category: { name: string; slug: string };
  manufacturer?: { name: string; slug: string };
  description?: string; short_description?: string;
}

export function getProducts(params?: Record<string, string>) {
  const q = new URLSearchParams(params).toString();
  return api.get<{ count: number; results: ProductItem[] }>(`/products/${q ? "?" + q : ""}`);
}

export function getProduct(slug: string) {
  return api.get<ProductItem>(`/products/${slug}/`);
}

export function searchProducts(query: string) {
  return api.get<{ count: number; results: ProductItem[] }>(`/search/?q=${encodeURIComponent(query)}`);
}

export function getSuggestions(query: string) {
  return api.get<{ suggestions: { text: string; type: string; slug: string }[] }>(`/search/suggest/?q=${encodeURIComponent(query)}`);
}

export function getHotkeys() {
  return api.get<{ keywords: { keyword: string; count: number }[] }>("/search/hotkey/");
}
