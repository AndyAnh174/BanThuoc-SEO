/**
 * Mini App Products API — B2C product listing & detail
 * Source: server/apps/miniapp/views.py (ProductListView, ProductDetailView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/products/",
    method: "GET",
    summary: "Mini App — List B2C products (show_on_miniapp=true)",
    description:
      "Returns only products with show_on_miniapp=true. Price priority: retail_price > sale_price > price. " +
      "Supports search, category filter, pagination.",
    tags: ["Mini App", "Products"],
    auth: ["Bearer JWT (Mini App)"],
    params: [
      { name: "search", in: "query", type: "string", required: false, description: "Search by name" },
      { name: "category", in: "query", type: "string", required: false, description: "Category slug" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number" },
      { name: "page_size", in: "query", type: "string", required: false, description: "Items per page (default 20)" },
    ],
    response: {
      count: 150,
      results: [{
        id: "uuid", name: "Paracetamol 500mg", slug: "paracetamol-500mg",
        retail_price: "55000", sale_price: "49000", current_price: "49000",
        stock_quantity: 100, unit: "Hộp",
        primary_image: { image_url: "https://..." },
        category: { id: "uuid", name: "Giảm đau", slug: "giam-dau" },
        manufacturer: { id: "uuid", name: "Domesco", slug: "domesco" },
      }],
    },
  },
  {
    path: "/api/miniapp/products/{slug}/",
    method: "GET",
    summary: "Mini App — Product detail with images, description, related products",
    tags: ["Mini App", "Products"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Product slug" }],
    response: {
      id: "uuid", name: "Paracetamol 500mg", slug: "paracetamol-500mg",
      description: "<p>Full HTML...</p>",
      retail_price: "55000", sale_price: "49000", current_price: "49000",
      unit: "Hộp", stock_quantity: 100,
      images: [{ image_url: "https://...", is_primary: true }],
      category: { id: "uuid", name: "Giảm đau", slug: "giam-dau" },
      manufacturer: { id: "uuid", name: "Domesco", slug: "domesco" },
      related_products: [{ id: "uuid", name: "Panadol", slug: "panadol", retail_price: "85000" }],
    },
  },
];
