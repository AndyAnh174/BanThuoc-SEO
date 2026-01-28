import { http } from '@/lib/http';

export interface CreateOrderData {
  shipping_address: string;
  payment_method: string;
  note?: string;
  items_input: Array<{
    product: string; // Product ID
    quantity: number;
    price: number; // Current price
  }>;
}

export const createOrder = async (data: CreateOrderData) => {
  return http.post('/orders/', data);
};

export const getMyOrders = async () => {
  return http.get('/orders/my-orders/');
};

export const getOrder = async (id: string) => {
  return http.get(`/orders/${id}/`);
};
