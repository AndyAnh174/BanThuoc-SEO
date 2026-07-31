/**
 * Mini App Flash Sale API — active flash sale with items
 * Source: server/apps/miniapp/views.py (MiniappFlashSaleView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/flash-sale/",
    method: "GET",
    summary: "Mini App — Active flash sale session with items, countdown, sold progress",
    description:
      "Returns currently active flash sale with items (show_on_miniapp=true). " +
      "Includes discount %, sold progress bars, time remaining.",
    tags: ["Mini App", "Flash Sale"],
    auth: ["Public"],
    params: [],
    response: {
      current_session: { id: "uuid", name: "Flash Sale 29/07", start_time: "...", end_time: "...", status: "ACTIVE", time_remaining: 43200 },
      featured_items: [{
        id: "uuid", product: { id: "uuid", name: "Vitamin C", primary_image: { image_url: "..." } },
        flash_sale_price: "79000", original_price: "120000",
        discount_percentage: 34, sold_quantity: 25, remaining_quantity: 75, sold_percentage: 25,
      }],
    },
  },
];
