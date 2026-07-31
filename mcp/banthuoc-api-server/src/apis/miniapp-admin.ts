/**
 * Mini App Admin API — membership tier CRUD
 * Source: server/apps/miniapp/views.py (AdminMembershipTierView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/admin/miniapp/membership-tiers/",
    method: "GET",
    summary: "Admin — List Mini App membership tiers (SILVER/GOLD/PLATINUM/DIAMOND)",
    tags: ["Admin", "Mini App"],
    auth: ["Bearer JWT (Admin)"],
    params: [],
    response: [
      { id: 1, tier_name: "SILVER", tier_label: "Silver", min_spent: "0", cashback_percent: "1.0" },
      { id: 2, tier_name: "GOLD", tier_label: "Gold", min_spent: "2000000", cashback_percent: "1.2" },
      { id: 3, tier_name: "PLATINUM", tier_label: "Bạch Kim", min_spent: "5000000", cashback_percent: "1.5" },
      { id: 4, tier_name: "DIAMOND", tier_label: "Kim Cương", min_spent: "10000000", cashback_percent: "2.0" },
    ],
  },
  {
    path: "/api/admin/miniapp/membership-tiers/",
    method: "POST",
    summary: "Admin — Create new membership tier",
    tags: ["Admin", "Mini App"],
    auth: ["Bearer JWT (Admin)"],
    params: [],
    requestBody: { tier_name: "string (unique)", tier_label: "string", min_spent: "number (VND)", cashback_percent: "number (e.g. 2.5)" },
    response: { id: 5, tier_name: "VIP", tier_label: "VIP", min_spent: "20000000", cashback_percent: "2.5" },
  },
  {
    path: "/api/admin/miniapp/membership-tiers/{pk}/",
    method: "GET",
    summary: "Admin — Get single membership tier",
    tags: ["Admin", "Mini App"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Tier ID" }],
    response: { id: 1, tier_name: "SILVER", tier_label: "Silver", min_spent: "0", cashback_percent: "1.0" },
  },
  {
    path: "/api/admin/miniapp/membership-tiers/{pk}/",
    method: "PUT",
    summary: "Admin — Full update membership tier",
    tags: ["Admin", "Mini App"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Tier ID" }],
    requestBody: { tier_name: "string", tier_label: "string", min_spent: "number", cashback_percent: "number" },
    response: { id: 1, tier_name: "SILVER", cashback_percent: "1.5" },
  },
  {
    path: "/api/admin/miniapp/membership-tiers/{pk}/",
    method: "PATCH",
    summary: "Admin — Partial update membership tier (e.g. just cashback %)",
    tags: ["Admin", "Mini App"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Tier ID" }],
    requestBody: { cashback_percent: "number" },
    response: { id: 1, tier_name: "SILVER", cashback_percent: "1.5" },
  },
  {
    path: "/api/admin/miniapp/membership-tiers/{pk}/",
    method: "DELETE",
    summary: "Admin — Delete membership tier",
    tags: ["Admin", "Mini App"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Tier ID" }],
    response: { message: "Deleted" },
  },
];
