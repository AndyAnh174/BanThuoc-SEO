'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.INTERNAL_API_URL || 'https://banthuocsi.vn/api';

export interface BlogPostItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  og_image_url: string;
  author_name: string;
  status: string;
  tags: string[];
  reading_time_minutes: number;
  view_count: number;
  published_at: string | null;
  created_at: string;
}

export interface BlogPostDetail extends BlogPostItem {
  content: string;
  og_image: string;
  seo_title: string;
  seo_description: string;
  updated_at: string;
}

export interface BlogListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: BlogPostItem[];
}

export async function getBlogPosts(
  page = 1,
  pageSize = 12,
  tag?: string
): Promise<BlogListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  });
  if (tag) params.set('tags', tag);

  const res = await fetch(`${API_URL}/blog/?${params}`, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch blog posts');
  return res.json();
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail> {
  const res = await fetch(`${API_URL}/blog/${slug}/`, {
    next: { revalidate: 300 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Blog post not found');
  return res.json();
}

export async function getLatestPosts(limit = 5): Promise<BlogPostItem[]> {
  const res = await fetch(`${API_URL}/blog/latest/?page_size=${limit}`, {
    next: { revalidate: 60 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.results || [];
}

export async function getBlogTags(): Promise<string[]> {
  const res = await fetch(`${API_URL}/blog/tags/`, {
    next: { revalidate: 300 },
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) return [];
  return res.json();
}
