/**
 * Banners API Endpoints
 *
 * Source: server/apps/products/views/banner.py
 *         server/apps/products/serializers/banner.py
 *
 * ViewSet CRUD under /api/banners/ plus custom actions: visible, row, promo, popup.
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/banners/",
    method: "GET",
    summary: "List banners (public: visible only; admin: all). Supports position filter.",
    tags: ["Banners"],
    auth: ["Public / Admin"],
    params: [
      { name: "position", in: "query", type: "string", required: false, description: "HERO, ROW, PROMO, POPUP" },
    ],
    response: [{
      id: "uuid", title: "Khuyến mãi hè 2026", subtitle: "Giảm đến 50%",
      image_url: "https://...", link_url: "/flash-sale", link_text: "Mua ngay",
      background_color: "#ffffff", text_color: "#000000",
      display_position: "HERO", sort_order: 1,
      is_active: true, is_visible: true,
      start_date: "2026-07-01", end_date: "2026-08-31",
    }],
  },
  {
    path: "/api/banners/",
    method: "POST",
    summary: "Admin — Create a new banner",
    tags: ["Banners", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [],
    requestBody: {
      title: "string", subtitle: "string (optional)", image_url: "string",
      link_url: "string (optional)", link_text: "string (optional)",
      display_position: "HERO | ROW | PROMO | POPUP",
      sort_order: "integer", is_active: "boolean", start_date: "date", end_date: "date",
    },
    response: { id: "uuid", title: "...", is_active: true },
  },
  {
    path: "/api/banners/{id}/",
    method: "PUT",
    summary: "Admin — Update banner",
    tags: ["Banners", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "id", in: "path", type: "uuid", required: true, description: "Banner ID" }],
    response: { id: "uuid" },
  },
  {
    path: "/api/banners/{id}/",
    method: "DELETE",
    summary: "Admin — Delete banner",
    tags: ["Banners", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "id", in: "path", type: "uuid", required: true, description: "Banner ID" }],
    response: { message: "Deleted" },
  },
  {
    path: "/api/banners/visible/",
    method: "GET",
    summary: "Get currently visible HERO banners (for homepage slider)",
    tags: ["Banners"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", title: "...", image_url: "https://...", position: "HERO" }],
  },
  {
    path: "/api/banners/row/",
    method: "GET",
    summary: "Get currently visible ROW banners (for homepage banner row)",
    tags: ["Banners"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", title: "...", image_url: "https://...", position: "ROW" }],
  },
];
