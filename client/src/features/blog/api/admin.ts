'use server';

import { cookies } from 'next/headers';
import { http } from '@/lib/http';
import type { BlogPostItem, BlogPostDetail } from '@/src/features/blog/api/blog';

const getAuthHeaders = async () => {
  // On server, we need to handle auth differently
  // For admin actions, the client sends the token via request body/cookies
  return {};
};

export async function adminGetBlogPosts(page = 1): Promise<{
  count: number;
  results: BlogPostItem[];
}> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/blog/?page=${page}&page_size=20`,
    { next: { revalidate: 0 }, cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function adminGetAllBlogPosts(page = 1): Promise<{
  count: number;
  next: string | null;
  results: BlogPostItem[];
}> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/blog/?page=${page}&page_size=20&status=all`,
    { next: { revalidate: 0 }, cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export async function adminCreateBlogPost(
  token: string,
  data: {
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    cover_image?: string;
    tags?: string[];
    author: number;
    status?: string;
    seo_title?: string;
    seo_description?: string;
  }
): Promise<BlogPostDetail> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function adminUpdateBlogPost(
  token: string,
  slug: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    cover_image?: string;
    tags?: string[];
    status?: string;
    seo_title?: string;
    seo_description?: string;
  }
): Promise<BlogPostDetail> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function adminDeleteBlogPost(token: string, slug: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Delete failed');
}

export async function adminUploadImage(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'blog');

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  return data.url;
}
