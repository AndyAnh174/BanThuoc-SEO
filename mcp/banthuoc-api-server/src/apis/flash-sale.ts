/**
 * Flash Sale API Endpoints
 *
 * Source: server/apps/products/views/flash_sale.py, flash_sale_admin.py
 *         server/apps/products/serializers/flash_sale.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/flash-sale/",
    method: "GET",
    summary: "Get current active flash sale with featured items (max 8), plus upcoming session info",
    tags: ["Flash Sale"],
    auth: ["Public"],
    params: [],
    response: {
      current_session: {
        id: "uuid", name: "Flash Sale 11/11", slug: "flash-sale-11-11",
        start_time: "2026-07-08T00:00:00Z", end_time: "2026-07-09T00:00:00Z",
        status: "ACTIVE", description: "...",
        total_items_count: 25,
      },
      upcoming_session: { id: "uuid", name: "Flash Sale 12/12", status: "SCHEDULED" },
      featured_items: [{
        id: "uuid",
        product: { id: "uuid", name: "Paracetamol", price: "50000", image_url: "https://..." },
        original_price: "50000.00", flash_sale_price: "35000.00",
        discount_percentage: 30, total_quantity: 100, remaining_quantity: 45,
        sold_quantity: 55, sold_percentage: 55, max_per_user: 3,
        is_sold_out: false, is_active: true,
      }],
      server_time: "2026-07-08T12:00:00Z",
    },
  },
  {
    path: "/api/flash-sale/sessions/",
    method: "GET",
    summary: "List all flash sale sessions (active, upcoming, recently ended within 7 days)",
    tags: ["Flash Sale"],
    auth: ["Public"],
    params: [
      { name: "status", in: "query", type: "string", required: false, description: "Filter: SCHEDULED, ACTIVE, ENDED" },
    ],
    response: {
      count: 5,
      results: [{
        id: "uuid", name: "Flash Sale 11/11", slug: "flash-sale-11-11",
        status: "ACTIVE", start_time: "...", end_time: "...", total_items_count: 25,
      }],
    },
  },
  {
    path: "/api/flash-sale/sessions/{slug}/",
    method: "GET",
    summary: "Get flash sale session detail with all items",
    tags: ["Flash Sale"],
    auth: ["Public"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Session slug" }],
    response: {
      id: "uuid", name: "...", status: "ACTIVE",
      items: [{ id: "uuid", product: {}, flash_sale_price: "35000", discount_percentage: 30 }],
    },
  },
  {
    path: "/api/flash-sale/items/",
    method: "GET",
    summary: "List all flash sale items across sessions",
    tags: ["Flash Sale"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", product: {}, flash_sale_price: "35000", remaining_quantity: 45 }],
  },
  {
    path: "/api/flash-sale/items/{id}/",
    method: "GET",
    summary: "Get single flash sale item with session_name, session_end_time",
    tags: ["Flash Sale"],
    auth: ["Public"],
    params: [{ name: "pk", in: "path", type: "uuid", required: true, description: "Flash sale item ID" }],
    response: {
      id: "uuid", product: {}, original_price: "50000", flash_sale_price: "35000",
      discount_percentage: 30, remaining_quantity: 45,
      session_name: "Flash Sale 11/11", session_end_time: "2026-07-09T00:00:00Z",
    },
  },
  {
    path: "/api/flash-sale/check/",
    method: "GET",
    summary: "Check if a product is in any active flash sale",
    tags: ["Flash Sale"],
    auth: ["Public"],
    params: [{ name: "product_id", in: "query", type: "string", required: true, description: "Product ID (UUID)" }],
    response: { in_flash_sale: true, flash_sale_price: "35000", remaining: 45 },
  },
];
