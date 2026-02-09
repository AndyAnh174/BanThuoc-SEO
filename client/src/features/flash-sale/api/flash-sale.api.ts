import { http } from '@/lib/http';

export interface FlashSaleProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    unit: string;
    images: { id: string; image_url: string; is_primary: boolean }[];
    category: { id: string; name: string; slug: string } | null;
    manufacturer: { id: string; name: string } | null;
}

export interface FlashSaleItem {
    id: string;
    product: FlashSaleProduct;
    original_price: number;
    flash_sale_price: number;
    discount_percentage: number;
    total_quantity: number;
    remaining_quantity: number;
    sold_quantity: number;
    sold_percentage: number;
    max_per_user: number;
    is_sold_out: boolean;
    is_active: boolean;
    sort_order: number;
}

export interface FlashSaleSession {
    id: string;
    name: string;
    slug: string;
    description: string;
    banner_image: string | null;
    start_time: string;
    end_time: string;
    status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
    is_currently_active: boolean;
    is_upcoming: boolean;
    is_ended: boolean;
    time_remaining: number | null;
    total_items: number;
    items_count: number;
    max_items_per_user: number;
}

export interface CurrentFlashSaleResponse {
    current_session: FlashSaleSession | null;
    upcoming_session: FlashSaleSession | null;
    featured_items: FlashSaleItem[];
    server_time: string;
}

export interface FlashSaleSessionDetailResponse extends FlashSaleSession {
    items: FlashSaleItem[];
}

export const flashSaleApi = {
    getCurrent: () =>
        http.get<CurrentFlashSaleResponse>('/flash-sale/'),

    getSessions: () =>
        http.get<{ count: number; results: FlashSaleSession[] }>('/flash-sale/sessions/'),

    getSessionBySlug: (slug: string) =>
        http.get<FlashSaleSessionDetailResponse>(`/flash-sale/sessions/${slug}/`),

    getItems: (sessionSlug: string, availableOnly = false) =>
        http.get<{ count: number; results: FlashSaleItem[] }>('/flash-sale/items/', {
            params: { session: sessionSlug, available_only: availableOnly }
        }),

    checkProduct: (productId: string) =>
        http.get<{ has_flash_sale: boolean; flash_sale_item: any }>('/flash-sale/check/', {
            params: { product_id: productId }
        }),
};
