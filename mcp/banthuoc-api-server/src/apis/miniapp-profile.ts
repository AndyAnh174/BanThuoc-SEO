/**
 * Mini App Profile API — user profile, addresses, points, notifications
 * Source: server/apps/miniapp/views.py (ProfileView, AddressListCreateView, etc.)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/me/",
    method: "GET",
    summary: "Mini App — Current user profile with membership, points, spending",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: {
      id: "uuid", zalo_id: "123456", name: "Nguyễn Thị A",
      avatar: "https://...", phone: "090...",
      membership_tier: "GOLD", loyalty_points: 25000, total_spent: "3500000",
    },
  },
  {
    path: "/api/miniapp/me/addresses/",
    method: "GET",
    summary: "Mini App — List user delivery addresses",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: [{ id: 1, full_name: "...", phone: "090...", address: "...", province: "...", district: "...", ward: "...", is_default: true }],
  },
  {
    path: "/api/miniapp/me/addresses/",
    method: "POST",
    summary: "Mini App — Create delivery address",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    requestBody: { full_name: "string", phone: "string", address: "string", province: "string", district: "string", ward: "string", is_default: "boolean" },
    response: { id: 2, full_name: "...", is_default: false },
  },
  {
    path: "/api/miniapp/me/addresses/{pk}/",
    method: "GET",
    summary: "Mini App — Get single address",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Address ID" }],
    response: { id: 1, full_name: "...", address: "..." },
  },
  {
    path: "/api/miniapp/me/addresses/{pk}/",
    method: "PATCH",
    summary: "Mini App — Update address",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Address ID" }],
    requestBody: { full_name: "string", phone: "string", address: "string", is_default: "boolean" },
    response: { id: 1, is_default: true },
  },
  {
    path: "/api/miniapp/me/addresses/{pk}/",
    method: "DELETE",
    summary: "Mini App — Delete address",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Address ID" }],
    response: { message: "Deleted" },
  },
  {
    path: "/api/miniapp/me/points/",
    method: "GET",
    summary: "Mini App — Loyalty point transaction history",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: [{ id: 1, points: 500, reason: "EARN_ORDER", description: "Tích từ đơn MSP...", created_at: "..." }],
  },
  {
    path: "/api/miniapp/me/notifications/",
    method: "GET",
    summary: "Mini App — List user notifications",
    tags: ["Mini App", "Users"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: [{ id: 1, type: "ORDER_STATUS", title: "Đơn hàng đã giao", body: "...", is_read: false }],
  },
];
