/**
 * Mini App Vouchers API — available vouchers, check, apply
 * Source: server/apps/miniapp/views.py (VoucherListView, VoucherCheckView, VoucherApplyView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/vouchers/available/",
    method: "GET",
    summary: "Mini App — List available vouchers (B2C/ALL type only, excludes B2B)",
    tags: ["Mini App", "Vouchers"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: [{ id: "uuid", code: "MINIAPP10", name: "Giảm 10%", discount_type: "PERCENTAGE", discount_value: "10", min_order_value: "100000", max_discount: "50000" }],
  },
  {
    path: "/api/miniapp/vouchers/check/",
    method: "POST",
    summary: "Mini App — Validate voucher code for current cart",
    tags: ["Mini App", "Vouchers"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    requestBody: { code: "string", order_total: "number" },
    response: { valid: true, discount_amount: 9800, code: "MINIAPP10" },
  },
  {
    path: "/api/miniapp/vouchers/apply/",
    method: "POST",
    summary: "Mini App — Apply voucher to order at checkout",
    tags: ["Mini App", "Vouchers"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    requestBody: { code: "string", order_id: "integer" },
    response: { applied: true, discount_amount: 9800, final_amount: 88200 },
  },
];
