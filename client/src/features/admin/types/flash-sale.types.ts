export interface FlashSaleItem {
    id: string;
    product: string; // ID
    product_details?: any; // View only
    original_price: number;
    flash_sale_price: number;
    discount_percentage?: number;
    total_quantity: number;
    remaining_quantity: number;
    sold_quantity: number;
    max_per_user: number;
    is_sold_out: boolean;
    is_active: boolean;
    sort_order: number;
    session: string;
}

export interface FlashSaleSession {
    id: string;
    name: string;
    description?: string;
    banner_image?: string;
    start_time: string;
    end_time: string;
    status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
    is_active: boolean;
    is_currently_active?: boolean;
    items?: FlashSaleItem[];
    total_items?: number;
    items_count?: number;
}

export interface FlashSaleFormData {
    name: string;
    description?: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
    // banner_image?
}

export interface FlashSaleItemFormData {
    product: string;
    flash_sale_price: number;
    total_quantity: number;
    max_per_user: number;
    sort_order?: number;
    is_active?: boolean;
}
