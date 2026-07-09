/**
 * Vouchers API Endpoints
 *
 * Source: server/apps/vouchers/views.py, serializers.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/vouchers/available/",
    method: "GET",
    summary: "List all currently active available vouchers (sorted by highest discount)",
    tags: ["Vouchers"],
    auth: ["Public"],
    params: [],
    response: [{
      code: "SALE10", name: "Giảm 10%",
      discount_type: "PERCENTAGE", discount_value: "10.00",
      min_order_value: "100000.00", max_discount: "50000.00",
      start_date: "2026-01-01", end_date: "2026-12-31",
      usage_limit: 100, usage_count: 45,
      applicable_categories: [{ id: "uuid", name: "Thuốc", slug: "thuoc" }],
      applicable_products: [],
    }],
  },
  {
    path: "/api/vouchers/check/",
    method: "POST",
    summary: "Check if a voucher code exists and is valid (without applying)",
    tags: ["Vouchers"],
    auth: ["Public"],
    params: [],
    requestBody: { code: "string" },
    response: {
      exists: true, valid: true,
      voucher: { code: "SALE10", name: "Giảm 10%", discount_type: "PERCENTAGE", discount_value: "10.00" },
      reason: null,
    },
  },
  {
    path: "/api/vouchers/apply/",
    method: "POST",
    summary: "Apply a voucher to an order (validates conditions, calculates discount)",
    tags: ["Vouchers"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      code: "string",
      order_total: "number (VND)",
      category_ids: "[uuid] (optional)",
      product_ids: "[uuid] (optional)",
      is_first_order: "boolean (optional, default false)",
    },
    response: {
      valid: true,
      error_code: null,
      error_message: null,
      discount_amount: 15000,
      final_total: 135000,
      voucher: { code: "SALE10", name: "Giảm 10%" },
    },
  },
  {
    path: "/api/vouchers/calculate/",
    method: "POST",
    summary: "Calculate discount without applying (same logic as apply, no side effects)",
    tags: ["Vouchers"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: { code: "string", order_total: "number" },
    response: {
      valid: true, discount_amount: 15000, final_total: 135000,
      discount_type: "PERCENTAGE", discount_value: "10.00",
    },
  },
  {
    path: "/api/vouchers/my/",
    method: "GET",
    summary: "List current user's claimed vouchers with usage status",
    tags: ["Vouchers"],
    auth: ["Bearer JWT"],
    params: [],
    response: [{
      id: "uuid", voucher: { code: "SALE10" },
      status: "AVAILABLE", times_used: 0, can_use: true,
      claimed_at: "2026-07-01", used_at: null,
    }],
  },
  {
    path: "/api/vouchers/claim/",
    method: "POST",
    summary: "Claim a voucher for current user",
    tags: ["Vouchers"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: { code: "string" },
    response: { message: "Đã nhận voucher", user_voucher: {} },
  },
  {
    path: "/api/vouchers/{code}/",
    method: "GET",
    summary: "Get voucher detail by code",
    tags: ["Vouchers"],
    auth: ["Public"],
    params: [{ name: "code", in: "path", type: "string", required: true, description: "Voucher code" }],
    response: {
      code: "SALE10", name: "Giảm 10%", description: "...",
      discount_type: "PERCENTAGE", discount_value: "10.00",
      min_order_value: "100000.00", max_discount: "50000.00",
      start_date: "2026-01-01", end_date: "2026-12-31",
      usage_limit: 100, usage_count: 45, status: "ACTIVE",
    },
  },
];
