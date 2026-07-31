/**
 * Mini App Membership API — tiers & user status
 * Source: server/apps/miniapp/views.py (MembershipTierListView, MembershipMyView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/membership/tiers/",
    method: "GET",
    summary: "Mini App — List all membership tiers with cashback config",
    tags: ["Mini App", "Membership"],
    auth: ["Public"],
    params: [],
    response: [
      { id: 1, tier_name: "SILVER", tier_label: "Silver", min_spent: "0", cashback_percent: "1.0" },
      { id: 2, tier_name: "GOLD", tier_label: "Gold", min_spent: "2000000", cashback_percent: "1.2" },
      { id: 3, tier_name: "PLATINUM", tier_label: "Bạch Kim", min_spent: "5000000", cashback_percent: "1.5" },
      { id: 4, tier_name: "DIAMOND", tier_label: "Kim Cương", min_spent: "10000000", cashback_percent: "2.0" },
    ],
  },
  {
    path: "/api/miniapp/membership/my/",
    method: "GET",
    summary: "Mini App — Current user membership status & next tier progress",
    tags: ["Mini App", "Membership"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: {
      current_tier: { tier_name: "GOLD", tier_label: "Gold", cashback_percent: "1.2" },
      total_spent: "3500000", loyalty_points: 25000,
      next_tier: { tier_name: "PLATINUM", min_spent: "5000000", progress_percent: 70 },
    },
  },
];
