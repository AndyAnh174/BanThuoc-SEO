/**
 * Mini App Banners API — hero carousel & row banners
 * Source: server/apps/miniapp/views.py (MiniappBannerHeroView, MiniappBannerRowView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/banners/hero/",
    method: "GET",
    summary: "Mini App — Active HERO banners for homepage carousel",
    tags: ["Mini App", "Banners"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", title: "Khuyến mãi hè", subtitle: "Giảm 50%", image_url: "https://...", link_url: "/flash-sale", color_start: "#0d9488", color_end: "#14b8a6" }],
  },
  {
    path: "/api/miniapp/banners/row/",
    method: "GET",
    summary: "Mini App — Active ROW banners for homepage strip",
    tags: ["Mini App", "Banners"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", title: "Giao nhanh 2h", subtitle: "Miễn phí", image_url: "https://...", color_start: "#f97316", color_end: "#ea580c" }],
  },
];
