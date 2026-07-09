/**
 * Products, Categories & Manufacturers API Endpoints
 *
 * Source: server/apps/products/views/public.py, product.py, category.py, manufacturer.py
 *         server/apps/products/serializers/public.py, product.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  // ── Products (Public) ─────────────────────────────────────
  {
    path: "/api/products/",
    method: "GET",
    summary: "List/search products with filtering, sorting, pagination",
    description:
      "Main product listing. Supports full-text search, category/manufacturer filter, " +
      "price range, prescription requirement, on-sale/in-stock filter, and ordering. " +
      "Includes descendant categories when filtering by category slug.",
    tags: ["Products"],
    auth: ["Public"],
    params: [
      { name: "search", in: "query", type: "string", required: false, description: "Search in name, SKU, description" },
      { name: "category", in: "query", type: "string", required: false, description: "Category slug (includes descendants)" },
      { name: "manufacturer", in: "query", type: "string", required: false, description: "Manufacturer slug" },
      { name: "min_price", in: "query", type: "number", required: false, description: "Minimum price (VND)" },
      { name: "max_price", in: "query", type: "number", required: false, description: "Maximum price (VND)" },
      { name: "product_type", in: "query", type: "string", required: false, description: "MEDICINE, SUPPLEMENT, COSMETIC, etc." },
      { name: "requires_prescription", in: "query", type: "boolean", required: false, description: "Prescription filter" },
      { name: "is_featured", in: "query", type: "boolean", required: false, description: "Featured products only" },
      { name: "on_sale", in: "query", type: "boolean", required: false, description: "On-sale products only" },
      { name: "in_stock", in: "query", type: "boolean", required: false, description: "In-stock only" },
      { name: "ordering", in: "query", type: "string", required: false, description: "Sort: price, -price, name, -created_at, -sold_quantity" },
      { name: "page", in: "query", type: "integer", required: false, description: "Page number (default 1)" },
      { name: "page_size", in: "query", type: "integer", required: false, description: "Items per page (default 20)" },
    ],
    response: {
      count: 150,
      next: "https://banthuocsi.vn/api/products/?page=2",
      previous: null,
      results: [{
        id: "uuid", sku: "PARA-500", name: "Paracetamol 500mg", slug: "paracetamol-500mg",
        short_description: "Giảm đau, hạ sốt",
        price: "50000.00", sale_price: "45000.00", current_price: "45000.00",
        discount_percentage: 10, is_on_sale: true,
        primary_image: { id: 1, image_url: "https://...", alt_text: "...", is_primary: true },
        category: { id: "uuid", name: "Giảm đau kháng viêm", slug: "giam-dau-khang-viem" },
        manufacturer: { id: "uuid", name: "Domesco", slug: "domesco" },
        product_type: "MEDICINE", unit: "Hộp", stock_quantity: 100,
        requires_prescription: false, is_featured: true,
        is_liked: false, likes_count: 25,
      }],
    },
  },
  {
    path: "/api/products/{slug}/",
    method: "GET",
    summary: "Get product detail with full description, images, related products",
    tags: ["Products"],
    auth: ["Public"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Product slug" }],
    response: {
      id: "uuid", sku: "PARA-500", name: "Paracetamol 500mg", slug: "paracetamol-500mg",
      description: "<p>Full HTML description...</p>", short_description: "Giảm đau, hạ sốt",
      price: "50000.00", sale_price: "45000.00", current_price: "45000.00",
      discount_percentage: 10, is_on_sale: true, is_low_stock: false,
      category: { id: "uuid", name: "Giảm đau kháng viêm", slug: "giam-dau-khang-viem", full_path: "Thuốc/Giảm đau kháng viêm" },
      manufacturer: { id: "uuid", name: "Domesco", slug: "domesco", country: "Vietnam", logo: "https://..." },
      images: [{ id: 1, image_url: "https://...", alt_text: "...", is_primary: true }],
      related_products: [{ id: "uuid", name: "Panadol", price: "55000", image_url: "https://..." }],
      product_type: "MEDICINE", unit: "Hộp", quantity_per_unit: "10 vỉ x 10 viên",
      stock_quantity: 100, requires_prescription: false,
      is_liked: false, likes_count: 25, rating: 4.5, review_count: 12,
    },
  },
  {
    path: "/api/products/featured/",
    method: "GET",
    summary: "Get featured/promoted products (for homepage)",
    tags: ["Products"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", name: "...", price: "50000", image_url: "https://...", is_featured: true }],
  },
  {
    path: "/api/products/new/",
    method: "GET",
    summary: "Get newest products",
    tags: ["Products"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", name: "...", price: "50000", image_url: "https://..." }],
  },
  {
    path: "/api/products/on-sale/",
    method: "GET",
    summary: "Get products currently on sale",
    tags: ["Products"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", name: "...", price: "50000", sale_price: "45000", image_url: "https://..." }],
  },
  {
    path: "/api/products/best-selling/",
    method: "GET",
    summary: "Get best-selling products",
    tags: ["Products"],
    auth: ["Public"],
    params: [],
    response: [{ id: "uuid", name: "...", price: "50000", image_url: "https://..." }],
  },

  // ── Favorites ────────────────────────────────────────────
  {
    path: "/api/products/favorites/",
    method: "GET",
    summary: "List current user's favorite products",
    tags: ["Products", "Favorites"],
    auth: ["Bearer JWT"],
    params: [{ name: "page", in: "query", type: "integer", required: false, description: "Page number" }],
    response: { count: 5, results: [{ id: "uuid", name: "...", is_liked: true }] },
  },
  {
    path: "/api/products/id/{id}/favorite/",
    method: "POST",
    summary: "Toggle favorite — add if not liked, remove if liked",
    tags: ["Products", "Favorites"],
    auth: ["Bearer JWT"],
    params: [{ name: "id", in: "path", type: "uuid", required: true, description: "Product UUID" }],
    response: { is_liked: true, message: "Đã thêm vào yêu thích" },
  },

  // ── Categories (Public) ──────────────────────────────────
  {
    path: "/api/categories/",
    method: "GET",
    summary: "List categories (flat, with product counts)",
    tags: ["Categories"],
    auth: ["Public"],
    params: [
      { name: "parent", in: "query", type: "string", required: false, description: "Filter by parent slug" },
      { name: "active_only", in: "query", type: "boolean", required: false, description: "Only active" },
    ],
    response: [{ id: "uuid", name: "Giảm đau kháng viêm", slug: "giam-dau-khang-viem", image: "https://...", is_active: true }],
  },
  {
    path: "/api/categories/tree/",
    method: "GET",
    summary: "Category tree with children (for navigation mega menu), precomputed product counts",
    tags: ["Categories"],
    auth: ["Public"],
    params: [{ name: "active_only", in: "query", type: "boolean", required: false, description: "Only active" }],
    response: [{
      id: "uuid", name: "Thuốc", slug: "thuoc", image: "https://...", full_path: "Thuốc",
      product_count: 500,
      children: [{ id: "uuid", name: "Giảm đau kháng viêm", slug: "giam-dau-khang-viem", children: [] }],
    }],
  },
  {
    path: "/api/categories/{slug}/",
    method: "GET",
    summary: "Get single category by slug",
    tags: ["Categories"],
    auth: ["Public"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Category slug" }],
    response: { id: "uuid", name: "Giảm đau kháng viêm", slug: "giam-dau-khang-viem", description: "...", image: "..." },
  },

  // ── Manufacturers ────────────────────────────────────────
  {
    path: "/api/manufacturers/",
    method: "GET",
    summary: "List all active manufacturers (max 1000 per page)",
    tags: ["Manufacturers"],
    auth: ["Public"],
    params: [{ name: "page_size", in: "query", type: "integer", required: false, description: "Items per page (max 1000)" }],
    response: [{ id: "uuid", name: "Domesco", slug: "domesco", country: "Vietnam", logo: "https://...", is_active: true }],
  },
  {
    path: "/api/manufacturers/{slug}/",
    method: "GET",
    summary: "Get manufacturer detail with their products",
    tags: ["Manufacturers"],
    auth: ["Public"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Manufacturer slug" }],
    response: {
      id: "uuid", name: "Domesco", slug: "domesco", description: "...", country: "Vietnam", logo: "https://...",
      products: [{ id: "uuid", name: "Paracetamol", price: "50000" }],
    },
  },
];
