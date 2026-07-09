/**
 * Orders & Returns API Endpoints
 *
 * Source: server/apps/orders/views.py, views_dashboard.py, views_return.py
 *         server/apps/orders/serializers.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/orders/",
    method: "GET",
    summary: "List orders (users see own orders; admins see all). Supports status filter.",
    tags: ["Orders"],
    auth: ["Bearer JWT"],
    params: [
      { name: "status", in: "query", type: "string", required: false, description: "PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, RETURNED" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number" },
      { name: "ordering", in: "query", type: "string", required: false, description: "Default: -created_at" },
    ],
    response: {
      count: 10,
      results: [{
        id: 1, user: 1, full_name: "Nguyen Van A", phone_number: "090...", email: "...",
        address: "123 Nguyen Hue", province: "HCM", district: "Q1", ward: "Ben Nghe",
        shipping_address: "123 Nguyen Hue, Ben Nghe, Q1, HCM",
        status: "PENDING", payment_method: "COD", payment_status: "UNPAID",
        total_amount: "150000.00", shipping_fee: "0.00", discount_amount: "0.00", final_amount: "150000.00",
        note: "", tracking_number: null, ghn_order_code: null, shipping_carrier: null,
        items: [{ id: 1, product: "uuid", product_name: "Paracetamol", quantity: 2, price: "50000", total_price: "100000" }],
        created_at: "2026-07-01T10:00:00Z", updated_at: "...",
      }],
    },
  },
  {
    path: "/api/orders/",
    method: "POST",
    summary: "Create order (with stock validation in atomic transaction). Accepts items_input + optional voucher_code.",
    tags: ["Orders"],
    auth: ["Public (AllowAny)"],
    params: [],
    requestBody: {
      full_name: "string",
      phone_number: "string",
      email: "string (optional)",
      address: "string",
      province: "string",
      district: "string",
      ward: "string",
      note: "string (optional)",
      payment_method: "COD | BANK_TRANSFER",
      items_input: "[{product: uuid, quantity: integer}]",
      voucher_code: "string (optional)",
    },
    response: {
      id: 1, status: "PENDING", final_amount: "150000.00",
      items: [{ product_name: "Paracetamol", quantity: 2, price: "50000", total_price: "100000" }],
    },
  },
  {
    path: "/api/orders/{id}/",
    method: "GET",
    summary: "Get order detail with items, shipping, and payment info",
    tags: ["Orders"],
    auth: ["Bearer JWT"],
    params: [{ name: "id", in: "path", type: "integer", required: true, description: "Order ID" }],
    response: { id: 1, status: "PENDING", items: [], shipping_address: "..." },
  },
  {
    path: "/api/orders/{id}/cancel/",
    method: "POST",
    summary: "Cancel order (PENDING or CONFIRMED only). Restores stock automatically.",
    tags: ["Orders"],
    auth: ["Bearer JWT"],
    params: [{ name: "id", in: "path", type: "integer", required: true, description: "Order ID" }],
    response: { message: "Đơn hàng đã được hủy" },
  },
  {
    path: "/api/orders/{id}/return/",
    method: "POST",
    summary: "Request return (within 7 days of delivery). Specify items and reason.",
    tags: ["Orders", "Returns"],
    auth: ["Bearer JWT"],
    params: [{ name: "order_id", in: "path", type: "integer", required: true, description: "Order ID" }],
    requestBody: {
      reason: "string (required)",
      items: "[{order_item_id: integer, quantity: integer}]",
      description: "string (optional)",
    },
    response: { id: "uuid", status: "PENDING_REVIEW", reason: "...", created_at: "..." },
  },
  {
    path: "/api/orders/{id}/invoice/",
    method: "GET",
    summary: "Get printable invoice PDF for an order",
    tags: ["Orders"],
    auth: ["Bearer JWT"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Order ID" }],
    response: { content_type: "application/pdf", description: "Invoice PDF file" },
  },

  // ── Returns ──────────────────────────────────────────────
  {
    path: "/api/returns/my/",
    method: "GET",
    summary: "List current user's return requests",
    tags: ["Orders", "Returns"],
    auth: ["Bearer JWT"],
    params: [],
    response: [{ id: "uuid", order_id: 1, status: "PENDING_REVIEW", reason: "Sản phẩm lỗi", created_at: "..." }],
  },

  // ── Dashboard ────────────────────────────────────────────
  {
    path: "/api/admin/dashboard/stats/",
    method: "GET",
    summary: "Admin dashboard stats: total orders, revenue, users, products, pending orders",
    tags: ["Admin", "Dashboard"],
    auth: ["Bearer JWT (Admin)"],
    params: [],
    response: {
      total_orders: 1500, total_revenue: "250000000", total_users: 500,
      total_products: 2000, pending_orders: 15, new_users_today: 5,
    },
  },
  {
    path: "/api/admin/dashboard/revenue-chart/",
    method: "GET",
    summary: "Admin revenue chart data (daily or monthly)",
    tags: ["Admin", "Dashboard"],
    auth: ["Bearer JWT (Admin)"],
    params: [
      { name: "period", in: "query", type: "string", required: false, description: "daily (default) or monthly" },
      { name: "days", in: "query", type: "integer", required: false, description: "Number of days (default 30)" },
    ],
    response: { labels: ["2026-07-01", "..."], revenue: [5000000, "..."], orders: [50, "..."] },
  },
];
