/**
 * Blog API Endpoints
 *
 * Source: server/apps/blog/views.py, serializers.py, urls.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/blog/",
    method: "GET",
    summary: "List published blog posts (paginated, includes author_name, excerpt, reading_time)",
    tags: ["Blog"],
    auth: ["Public"],
    params: [
      { name: "page", in: "query", type: "integer", required: false, description: "Page number" },
      { name: "search", in: "query", type: "string", required: false, description: "Search by title" },
      { name: "tag", in: "query", type: "string", required: false, description: "Filter by tag" },
    ],
    response: {
      count: 20,
      results: [{
        id: "uuid", title: "Cách dùng Paracetamol đúng cách", slug: "cach-dung-paracetamol",
        excerpt: "Paracetamol là thuốc giảm đau phổ biến...",
        cover_image: "https://...", og_image_url: "https://...",
        author_name: "BS. Nguyen Van A", status: "PUBLISHED",
        tags: ["suc-khoe", "thuoc"], reading_time_minutes: 5,
        view_count: 1250, published_at: "2026-07-01", created_at: "...",
      }],
    },
  },
  {
    path: "/api/blog/{slug}/",
    method: "GET",
    summary: "Get blog post detail with full content, SEO metadata",
    tags: ["Blog"],
    auth: ["Public"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Blog post slug" }],
    response: {
      id: "uuid", title: "Cách dùng Paracetamol", slug: "cach-dung-paracetamol",
      excerpt: "...", content: "<p>HTML content...</p>", content_json: {},
      cover_image: "https://...", og_image: "https://...", og_image_url: "https://...",
      author_name: "BS. Nguyen Van A", status: "PUBLISHED", tags: ["suc-khoe"],
      reading_time_minutes: 5, view_count: 1250,
      seo_title: "Cách dùng Paracetamol | BanThuoc", seo_description: "...",
      published_at: "2026-07-01", created_at: "...", updated_at: "...",
    },
  },
  {
    path: "/api/blog/",
    method: "POST",
    summary: "Admin — Create blog post (auto-generates slug if not provided)",
    tags: ["Blog", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [],
    requestBody: {
      title: "string", slug: "string (optional, auto-generated)", content: "string (HTML)",
      excerpt: "string", cover_image: "File", tags: "[string]", status: "DRAFT | PUBLISHED",
    },
    response: { id: "uuid", title: "...", slug: "...", status: "PUBLISHED" },
  },
  {
    path: "/api/blog/{slug}/",
    method: "PUT",
    summary: "Admin — Update blog post",
    tags: ["Blog", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Blog post slug" }],
    response: { id: "uuid", title: "Updated title" },
  },
  {
    path: "/api/blog/{slug}/",
    method: "DELETE",
    summary: "Admin — Delete blog post",
    tags: ["Blog", "Admin"],
    auth: ["Bearer JWT (Admin)"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Blog post slug" }],
    response: { message: "Deleted" },
  },
  {
    path: "/api/blog/og-image/{slug}/",
    method: "GET",
    summary: "Get auto-generated OpenGraph image for social sharing",
    tags: ["Blog"],
    auth: ["Public"],
    params: [{ name: "slug", in: "path", type: "string", required: true, description: "Blog post slug" }],
    response: { content_type: "image/png", description: "OG image with post title + BanThuoc logo" },
  },
];
