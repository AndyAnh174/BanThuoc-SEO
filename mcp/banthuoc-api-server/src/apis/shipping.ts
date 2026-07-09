/**
 * Shipping API Endpoints (GHN + ViettelPost)
 *
 * Source: server/apps/shipping/urls.py, views.py
 *         server/apps/shipping/ghn_client.py, viettelpost_client.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  // ── GHN (Giao Hang Nhanh) ──────────────────────────────
  {
    path: "/api/shipping/provinces/",
    method: "GET",
    summary: "GHN — List provinces (cached 24h)",
    tags: ["Shipping", "GHN"],
    auth: ["Public"],
    params: [],
    response: [{ ProvinceID: 201, ProvinceName: "Hồ Chí Minh" }, { ProvinceID: 202, ProvinceName: "Hà Nội" }],
  },
  {
    path: "/api/shipping/districts/",
    method: "GET",
    summary: "GHN — List districts by province_id (cached 24h)",
    tags: ["Shipping", "GHN"],
    auth: ["Public"],
    params: [{ name: "province_id", in: "query", type: "integer", required: true, description: "GHN province ID" }],
    response: [{ DistrictID: 1490, DistrictName: "Quận 1" }],
  },
  {
    path: "/api/shipping/wards/",
    method: "GET",
    summary: "GHN — List wards by district_id (cached 24h)",
    tags: ["Shipping", "GHN"],
    auth: ["Public"],
    params: [{ name: "district_id", in: "query", type: "integer", required: true, description: "GHN district ID" }],
    response: [{ WardCode: "1A0601", WardName: "Phường Bến Nghé" }],
  },
  {
    path: "/api/shipping/calculate-fee/",
    method: "POST",
    summary: "GHN — Calculate shipping fee (supports test mode)",
    tags: ["Shipping", "GHN"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      to_district_id: "integer",
      to_ward_code: "string",
      weight: "integer (grams)",
      cod_value: "number (optional)",
      insurance_value: "number (optional)",
    },
    response: { total: 25000, service_fee: 25000, insurance_fee: 0, estimated_delivery_time: "2026-07-10" },
  },
  {
    path: "/api/shipping/orders/{order_id}/create-shipment/",
    method: "POST",
    summary: "GHN — Create shipment for an order (admin only)",
    tags: ["Shipping", "GHN", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "order_id", in: "path", type: "integer", required: true, description: "Order ID" }],
    requestBody: { weight: "integer (grams)", service_id: "integer (optional)", note: "string (optional)" },
    response: { order_code: "GHN-123456", total_fee: "25000", expected_delivery_time: "..." },
  },
  {
    path: "/api/shipping/orders/{order_id}/print-token/",
    method: "GET",
    summary: "GHN — Get print token for shipping label",
    tags: ["Shipping", "GHN", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "order_id", in: "path", type: "integer", required: true, description: "Order ID" }],
    response: { token: "abc123xyz", print_url: "https://..." },
  },
  {
    path: "/api/shipping/webhook/",
    method: "POST",
    summary: "GHN — Webhook for shipment status updates (called by GHN server)",
    tags: ["Shipping", "GHN"],
    auth: ["Public (GHN signature verified internally)"],
    params: [],
    response: { message: "OK" },
  },

  // ── ViettelPost ─────────────────────────────────────────
  {
    path: "/api/shipping/vtp/provinces/",
    method: "GET",
    summary: "VTP V3 — List provinces (34 provinces, no auth, cached 24h)",
    tags: ["Shipping", "ViettelPost"],
    auth: ["Public"],
    params: [],
    response: [{ PROVINCE_ID: 1, PROVINCE_NAME: "Hồ Chí Minh" }],
  },
  {
    path: "/api/shipping/vtp/wards/",
    method: "GET",
    summary: "VTP V3 — List wards by province (direct province→ward, no district level)",
    tags: ["Shipping", "ViettelPost"],
    auth: ["Public"],
    params: [{ name: "province_id", in: "query", type: "integer", required: true, description: "VTP province ID" }],
    response: [{ WARDS_ID: 10001, WARDS_NAME: "Phường Bến Nghé" }],
  },
  {
    path: "/api/shipping/vtp/calculate-fee/",
    method: "POST",
    summary: "VTP — Calculate shipping fee via ViettelPost Partner API",
    tags: ["Shipping", "ViettelPost"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: { to_province_id: "integer", to_ward_id: "integer", weight: "integer (grams)" },
    response: { total_fee: 20000, estimated_days: 3 },
  },
  {
    path: "/api/shipping/vtp/orders/{order_id}/create/",
    method: "POST",
    summary: "VTP — Create ViettelPost shipment (admin only)",
    tags: ["Shipping", "ViettelPost", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "order_id", in: "path", type: "integer", required: true, description: "Order ID" }],
    requestBody: { weight: "integer", service_type: "string (optional)" },
    response: { tracking_code: "VTP-12345", tracking_url: "https://..." },
  },
];
