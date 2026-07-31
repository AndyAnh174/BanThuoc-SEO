/**
 * Mini App Cart API — shopping cart CRUD
 * Source: server/apps/miniapp/views.py (CartView, CartAddView, CartItemView, CartClearView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/cart/",
    method: "GET",
    summary: "Mini App — Get cart with items and totals",
    tags: ["Mini App", "Cart"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: {
      items: [{ id: 1, product: { id: "uuid", name: "...", retail_price: "55000" }, quantity: 2 }],
      total_items: 2, total_amount: "110000",
    },
  },
  {
    path: "/api/miniapp/cart/add/",
    method: "POST",
    summary: "Mini App — Add product to cart (or increase quantity)",
    tags: ["Mini App", "Cart"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    requestBody: { product_id: "string (uuid)", quantity: "integer (default 1)" },
    response: { id: 1, quantity: 2, message: "Đã thêm vào giỏ hàng" },
  },
  {
    path: "/api/miniapp/cart/items/{pk}/",
    method: "PATCH",
    summary: "Mini App — Update cart item quantity",
    tags: ["Mini App", "Cart"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Cart item ID" }],
    requestBody: { quantity: "integer (min 1)" },
    response: { id: 1, quantity: 3 },
  },
  {
    path: "/api/miniapp/cart/items/{pk}/",
    method: "DELETE",
    summary: "Mini App — Remove item from cart",
    tags: ["Mini App", "Cart"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Cart item ID" }],
    response: { message: "Đã xoá" },
  },
  {
    path: "/api/miniapp/cart/clear/",
    method: "POST",
    summary: "Mini App — Clear entire cart",
    tags: ["Mini App", "Cart"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: { message: "Giỏ hàng đã được xoá" },
  },
];
