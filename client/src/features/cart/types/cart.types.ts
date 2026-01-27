export interface ProductSummary {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price?: number | null;
    primary_image?: {
        image_url: string;
        alt_text?: string;
    } | null;
    unit?: string;
    manufacturer?: {
        name: string;
        id: number;
    };
    stock_quantity?: number;
}

export interface CartItem {
    id: number;
    product: ProductSummary;
    product_id?: number; // Write-only often
    quantity: number;
    total_price: number | string;
    created_at: string;
}

export interface Cart {
    id: number;
    items: CartItem[];
    total_price: number | string;
    total_items: number;
    updated_at: string;
}

export interface AddToCartData {
    product_id: string;
    quantity: number;
}
