/** Flash Sale API — Mini App specific endpoint */

import { api } from "./api";

export interface FlashSaleProduct {
  id: string;
  product: {
    id: string; name: string; slug: string;
    price: string; image_url?: string;
    primary_image?: { image_url: string } | null;
  };
  original_price: string;
  flash_sale_price: string;
  discount_percentage: number;
  total_quantity: number;
  remaining_quantity: number;
  sold_quantity: number;
  sold_percentage: number;
  max_per_user: number;
  is_sold_out: boolean;
  is_active: boolean;
}

export interface FlashSaleSession {
  id: string; name: string; slug: string;
  start_time: string; end_time: string;
  status: "ACTIVE" | "UPCOMING" | "ENDED";
  description?: string;
  total_items_count?: number;
}

export interface FlashSaleResponse {
  current_session: FlashSaleSession | null;
  upcoming_session: { id: string; name: string; status: string } | null;
  featured_items: FlashSaleProduct[];
  server_time: string;
}

export function getActiveFlashSale() {
  return api.get<FlashSaleResponse>("/flash-sale/");
}
