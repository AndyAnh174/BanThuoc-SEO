/** Blog API — shared với web chính, dùng publicApi (không cần auth) */
import { publicApi } from "./api";

export interface BlogPostItem {
  id: number; title: string; slug: string; excerpt: string;
  cover_image: string; og_image_url: string;
  author_name: string; tags: string[];
  reading_time_minutes: number; view_count: number;
  published_at: string | null; created_at: string;
}

export interface BlogPostDetail extends BlogPostItem {
  content: string; seo_title: string; seo_description: string;
  updated_at: string;
}

export interface BlogListResponse {
  count: number; next: string | null; previous: string | null;
  results: BlogPostItem[];
}

export function getBlogPosts(params?: { page?: number; page_size?: number; tag?: string; search?: string }): Promise<BlogListResponse> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.page_size) sp.set("page_size", String(params.page_size));
  if (params?.tag) sp.set("tags", params.tag);
  if (params?.search) sp.set("search", params.search);
  const qs = sp.toString();
  return publicApi.get<BlogListResponse>(`/blog/${qs ? "?" + qs : ""}`);
}

export function getBlogPost(slug: string): Promise<BlogPostDetail> {
  return publicApi.get<BlogPostDetail>(`/blog/${slug}/`);
}

export function getLatestPosts(limit = 5): Promise<BlogPostItem[]> {
  return publicApi.get<BlogPostItem[]>(`/blog/latest/?page_size=${limit}`).then(r => (Array.isArray(r) ? r : (r as any).results || []));
}

export function recordView(slug: string): void {
  publicApi.post(`/blog/${slug}/view/`, {}).catch(() => {});
}
