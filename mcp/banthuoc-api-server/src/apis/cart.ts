/**
 * Cart API Endpoints
 *
 * Source: server/apps/cart/views.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/cart/",
    method: "GET",
    summary: "Get current user's cart with all items and totals",
    tags: ["Cart"],
    auth: ["Bearer JWT"],
    params: [],
    response: {
      id: 1,
      items: [{
        id: 1,
        product: {
          id: "uuid", name: "Paracetamol", slug: "paracetamol", price: "50000",
          primary_image: { image_url: "https://..." }, unit: "Hộp",
          manufacturer: { name: "Domesco" },
        },
        quantity: 2,
        total_price: "100000.00",
      }],
      total_items: 2,
      total_price: "100000.00",
    },
  },
  {
    path: "/api/cart/add/",
    method: "POST",
    summary: "Add product to cart (increases quantity if already exists)",
    tags: ["Cart"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      product_id: "uuid (required)",
      quantity: "integer (default 1, min 1)",
    },
    response: { message: "Đã thêm vào giỏ hàng", cart: {} },
  },
  {
    path: "/api/cart/items/{id}/",
    method: "PATCH",
    summary: "Update cart item quantity (must be at least 1)",
    tags: ["Cart"],
    auth: ["Bearer JWT"],
    params: [{ name: "id", in: "path", type: "integer", required: true, description: "Cart item ID" }],
    requestBody: { quantity: "integer (min 1)" },
    response: { id: 1, quantity: 3, total_price: "150000.00" },
  },
  {
    path: "/api/cart/items/{id}/",
    method: "DELETE",
    summary: "Remove item from cart",
    tags: ["Cart"],
    auth: ["Bearer JWT"],
    params: [{ name: "id", in: "path", type: "integer", required: true, description: "Cart item ID" }],
    response: { message: "Đã xóa sản phẩm khỏi giỏ hàng", cart: {} },
  },
  {
    path: "/api/cart/clear/",
    method: "POST",
    summary: "Clear all items from cart",
    tags: ["Cart"],
    auth: ["Bearer JWT"],
    params: [],
    response: { message: "Đã xóa toàn bộ giỏ hàng", cart: { items: [], total_items: 0, total_price: "0" } },
  },
];
