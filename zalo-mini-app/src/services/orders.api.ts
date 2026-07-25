/** Orders API */

import { api } from "./api";

export interface CreateOrderParams {
  items: { product_id: string; quantity: number }[];
  full_name: string; phone: string;
  address?: string; province?: string; district?: string; ward?: string;
  note?: string; voucher_code?: string; use_points?: number;
  shipping_fee?: number; payment_method?: string;
}

export function getOrders() {
  return api.get<any[]>("/orders/");
}

export function getOrderDetail(id: number) {
  return api.get<any>(`/orders/${id}/`);
}

export function createOrder(params: CreateOrderParams) {
  return api.post<{ id: number; order_number: string; status: string; final_amount: number; points_earned: number }>("/orders/", params);
}

export function cancelOrder(id: number) {
  return api.post(`/orders/${id}/cancel/`);
}
