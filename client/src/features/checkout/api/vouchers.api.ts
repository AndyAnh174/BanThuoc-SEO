import { http } from '@/lib/http';

export interface ApplyVoucherResponse {
  valid: boolean;
  error_code?: string;
  error_message?: string;
  discount_amount: number;
  voucher_info?: any;
  order_total: number;
  final_total: number;
}

export const checkVoucher = async (code: string, orderTotal: number, items: any[]) => {
    // Extract IDs for validation
    const categoryIds: string[] = [];
    const productIds: string[] = [];
    
    items.forEach(item => {
        if (item.product) {
            productIds.push(item.product.id);
            if (item.product.category?.id) {
                categoryIds.push(item.product.category.id);
            }
        }
    });

    const response = await http.post<ApplyVoucherResponse>('/vouchers/calculate/', {
        code,
        order_total: orderTotal,
        category_ids: categoryIds,
        product_ids: productIds
    });
    return response.data;
};
