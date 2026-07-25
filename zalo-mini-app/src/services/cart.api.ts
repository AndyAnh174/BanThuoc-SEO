/** Cart API */

import { api } from "./api";

export interface CartResponse {
  items: { id: number; product: any; quantity: number; subtotal: number }[];
  total_items: number;
  total_amount: number;
}

export function getCart() {
  return api.get<CartResponse>("/cart/");
}

export function addToCart(productId: string, quantity = 1) {
  return api.post("/cart/add/", { product_id: productId, quantity });
}

export function updateCartItem(itemId: number, quantity: number) {
  return api.patch(`/cart/items/${itemId}/`, { quantity });
}

export function removeCartItem(itemId: number) {
  return api.delete(`/cart/items/${itemId}/`);
}

export function clearCart() {
  return api.post("/cart/clear/");
}
