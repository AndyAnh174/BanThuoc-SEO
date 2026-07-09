/**
 * Elasticsearch Search & Suggest API Endpoints
 *
 * Source: server/apps/products/views/search.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/search/",
    method: "GET",
    summary: "Elasticsearch — Fuzzy full-text product search (typo-tolerant, Vietnamese support, relevance scoring)",
    description:
      "Advanced search via Elasticsearch. Much faster than DB search for large catalogs. " +
      "Supports typo tolerance, Vietnamese language analysis, and relevance-ranked results.",
    tags: ["Search", "Elasticsearch"],
    auth: ["Public"],
    params: [
      { name: "q", in: "query", type: "string", required: true, description: "Search query" },
      { name: "category", in: "query", type: "string", required: false, description: "Category slug filter" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number" },
      { name: "page_size", in: "query", type: "integer", required: false, description: "Results per page" },
    ],
    response: {
      count: 30,
      results: [{
        id: "uuid", name: "Paracetamol", price: "50000", sale_price: "45000",
        image_url: "https://...", slug: "paracetamol-500mg",
        category: { name: "Giảm đau kháng viêm" },
        _score: 12.5,
      }],
    },
  },
  {
    path: "/api/search/suggest/",
    method: "GET",
    summary: "Elasticsearch — Autocomplete suggestions as you type",
    tags: ["Search", "Elasticsearch"],
    auth: ["Public"],
    params: [
      { name: "q", in: "query", type: "string", required: true, description: "Partial query for autocomplete" },
    ],
    response: {
      suggestions: [
        { text: "Paracetamol", type: "product", slug: "paracetamol-500mg" },
        { text: "Panadol", type: "product", slug: "panadol" },
      ],
    },
  },
  {
    path: "/api/products/search/",
    method: "GET",
    summary: "Database-based product search (fallback when ES unavailable)",
    tags: ["Search"],
    auth: ["Public"],
    params: [
      { name: "q", in: "query", type: "string", required: true, description: "Search query" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number" },
    ],
    response: {
      count: 25,
      results: [{ id: "uuid", name: "...", price: "...", image_url: "..." }],
    },
  },
];
