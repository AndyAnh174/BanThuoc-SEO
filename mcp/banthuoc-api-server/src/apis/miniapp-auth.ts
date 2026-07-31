/**
 * Mini App Auth API — Zalo OAuth → JWT
 * Source: server/apps/miniapp/views.py (LoginView, RefreshTokenView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/auth/login/",
    method: "POST",
    summary: "Mini App — Zalo OAuth login, returns JWT",
    description:
      "Verify Zalo access token with Zalo API, create/update MiniAppUser, return JWT. " +
      "Auto-creates Django User (username=zalo_id) for JWT compatibility.",
    tags: ["Mini App", "Auth"],
    auth: ["Public (Zalo access_token)"],
    params: [],
    requestBody: {
      zalo_access_token: "string (Zalo OAuth access token)",
      name: "string (from Zalo userInfo)",
      avatar: "string (avatar URL, optional)",
      phone: "string (from Zalo getPhoneNumber, optional)",
    },
    response: {
      access: "eyJ... (JWT, 1 day)", refresh: "eyJ... (JWT, 7 days)",
      user: { id: "uuid", zalo_id: "123456", name: "Nguyễn Thị A", membership_tier: "SILVER", loyalty_points: 0 },
    },
  },
  {
    path: "/api/miniapp/auth/refresh/",
    method: "POST",
    summary: "Mini App — Refresh expired JWT",
    tags: ["Mini App", "Auth"],
    auth: ["Public"],
    params: [],
    requestBody: { refresh: "string (refresh token)" },
    response: { access: "eyJ... (new access token)" },
  },
];
