import { http } from '@/lib/http';

export interface CreateOrderData {
  address: string;
  province?: string;
  ward?: string;
  district?: string; // Optional
  full_name?: string;
  phone_number?: string;
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

export const downloadInvoice = async (orderId: number) => {
    try {
        const response = await http.get(`/orders/${orderId}/invoice/`, {
            responseType: 'blob', // Important for PDF
        });
        
        // Handle Blob download directly here or return blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${orderId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
    } catch (error) {
        console.error("Failed to download invoice", error);
        throw error;
    }
};

export const getOrders = async (params?: any) => {
  return http.get('/orders/', { params });
};

export const updateOrderStatus = async (id: number, status: string) => {
    return http.patch(`/orders/${id}/`, { status });
};

export const getOrder = async (id: string | number) => {
  return http.get(`/orders/${id}/`);
};
