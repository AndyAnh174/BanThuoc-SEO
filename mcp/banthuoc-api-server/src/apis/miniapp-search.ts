/**
 * Mini App Search API — product search, suggestions, hot keywords
 * Source: server/apps/miniapp/views.py (SearchView, SearchSuggestView, SearchHotkeyView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/search/",
    method: "GET",
    summary: "Mini App — Search products (name, description, category)",
    tags: ["Mini App", "Search"],
    auth: ["Bearer JWT (Mini App)"],
    params: [
      { name: "q", in: "query", type: "string", required: true, description: "Search keyword" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number" },
    ],
    response: { count: 25, results: [{ id: "uuid", name: "Paracetamol", slug: "...", retail_price: "55000" }] },
  },
  {
    path: "/api/miniapp/search/suggest/",
    method: "GET",
    summary: "Mini App — Autocomplete search suggestions (top 8)",
    tags: ["Mini App", "Search"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "q", in: "query", type: "string", required: true, description: "Partial keyword" }],
    response: [{ name: "Paracetamol 500mg", slug: "paracetamol-500mg", image_url: "https://..." }],
  },
  {
    path: "/api/miniapp/search/hotkey/",
    method: "GET",
    summary: "Mini App — Trending/hot search keywords",
    tags: ["Mini App", "Search"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    response: [{ keyword: "vitamin C", count: 150 }, { keyword: "giảm đau", count: 120 }],
  },
];
