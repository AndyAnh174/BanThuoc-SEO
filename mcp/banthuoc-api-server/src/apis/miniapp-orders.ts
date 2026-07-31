/**
 * Mini App Orders API — order CRUD & cancellation
 * Source: server/apps/miniapp/views.py (OrderListCreateView, OrderDetailView, OrderCancelView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/orders/",
    method: "GET",
    summary: "Mini App — List user orders with status filter",
    tags: ["Mini App", "Orders"],
    auth: ["Bearer JWT (Mini App)"],
    params: [
      { name: "status", in: "query", type: "string", required: false, description: "PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number" },
    ],
    response: {
      count: 10,
      results: [{ id: 1, order_number: "MSP20260729-0001", status: "PENDING", payment_method: "COD", final_amount: "105000", items_count: 2 }],
    },
  },
  {
    path: "/api/miniapp/orders/",
    method: "POST",
    summary: "Mini App — Create order from cart with voucher/points",
    description: "Creates order from current cart. Validates stock, applies voucher/points. Cart cleared on success.",
    tags: ["Mini App", "Orders"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    requestBody: {
      address_id: "integer (required)", payment_method: "COD | BANKING | ZALOPAY | VNPAY",
      voucher_code: "string (optional)", use_points: "integer (optional, VND to redeem)", note: "string (optional)",
    },
    response: {
      id: 1, order_number: "MSP20260729-0001",
      subtotal: "98000", shipping_fee: "15000", discount_voucher: "10000", discount_points: "5000", final_amount: "98000",
      status: "PENDING", payment_method: "COD",
    },
  },
  {
    path: "/api/miniapp/orders/{pk}/",
    method: "GET",
    summary: "Mini App — Order detail with items, shipping tracking",
    tags: ["Mini App", "Orders"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Order ID" }],
    response: {
      id: 1, order_number: "MSP20260729-0001",
      status: "SHIPPING", payment_method: "COD", payment_status: "UNPAID",
      subtotal: "98000", shipping_fee: "15000", discount_voucher: "10000", final_amount: "103000",
      points_earned: 1030, tracking_number: "GHN123456",
      items: [{ product_name: "Paracetamol", quantity: 2, unit_price: "49000", total_price: "98000" }],
    },
  },
  {
    path: "/api/miniapp/orders/{pk}/cancel/",
    method: "POST",
    summary: "Mini App — Cancel order (only PENDING or CONFIRMED)",
    tags: ["Mini App", "Orders"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Order ID" }],
    requestBody: { reason: "string (optional)" },
    response: { id: 1, status: "CANCELLED", message: "Đã huỷ đơn hàng" },
  },
];
