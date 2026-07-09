/**
 * Reviews API Endpoints
 *
 * Source: server/apps/products/views/review.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/products/{product_id}/reviews/",
    method: "GET",
    summary: "List approved reviews for a product (paginated, 10 per page)",
    tags: ["Reviews"],
    auth: ["Public"],
    params: [
      { name: "product_id", in: "path", type: "uuid", required: true, description: "Product UUID" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number (default 1)" },
    ],
    response: {
      count: 12,
      results: [{
        id: "uuid", user: { id: 1, full_name: "Nguyen Van A" },
        rating: 5, title: "Rất tốt", content: "Sản phẩm chất lượng, giao hàng nhanh",
        status: "APPROVED", created_at: "2026-07-01",
      }],
    },
  },
  {
    path: "/api/products/{product_id}/reviews/",
    method: "POST",
    summary: "Create a review (requires purchase). Pending admin approval before public display.",
    tags: ["Reviews"],
    auth: ["Bearer JWT"],
    params: [{ name: "product_id", in: "path", type: "uuid", required: true, description: "Product UUID" }],
    requestBody: {
      rating: "integer (1-5, required)",
      title: "string (optional)",
      content: "string (required)",
    },
    response: { id: "uuid", message: "Đánh giá đã được gửi, đang chờ duyệt", status: "PENDING" },
  },
  {
    path: "/api/products/{product_id}/reviews/stats/",
    method: "GET",
    summary: "Get review statistics (average rating, 5-star distribution)",
    tags: ["Reviews"],
    auth: ["Public"],
    params: [{ name: "product_id", in: "path", type: "uuid", required: true, description: "Product UUID" }],
    response: { average: 4.5, total: 12, distribution: { "5": 8, "4": 2, "3": 1, "2": 1, "1": 0 } },
  },
  {
    path: "/api/admin/reviews/",
    method: "GET",
    summary: "Admin — List all reviews (filter by status: PENDING, APPROVED, REJECTED)",
    tags: ["Admin", "Reviews"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "status", in: "query", type: "string", required: false, description: "PENDING, APPROVED, REJECTED" }],
    response: { count: 50, results: [{ id: "uuid", product: {}, user: {}, rating: 5, content: "...", status: "PENDING" }] },
  },
  {
    path: "/api/admin/reviews/{review_id}/moderate/",
    method: "POST",
    summary: "Admin — Approve or reject a review",
    tags: ["Admin", "Reviews"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "review_id", in: "path", type: "uuid", required: true, description: "Review ID" }],
    requestBody: { action: "APPROVE | REJECT", note: "string (optional admin note)" },
    response: { id: "uuid", status: "APPROVED", moderated_at: "..." },
  },
];
