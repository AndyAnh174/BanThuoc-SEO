import { MetadataRoute } from 'next';

// Force dynamic generation on every request — no build-time caching.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BASE_URL = 'https://banthuocsi.vn';
// Try internal cluster DNS first, then fall back to public URL.
const API_CANDIDATES = [
  process.env.INTERNAL_API_URL,
  'http://backend-service:8000/api',
  'http://backend:8000/api',
  'https://banthuocsi.vn/api',
].filter(Boolean) as string[];

async function fetchJson(url: string): Promise<any | null> {
  for (const base of API_CANDIDATES) {
    const full = url.startsWith('http') ? url : `${base}${url}`;
    try {
      const res = await fetch(full, { cache: 'no-store' });
      if (!res.ok) {
        console.warn(`[sitemap] ${full} -> ${res.status}`);
        continue;
      }
      return await res.json();
    } catch (e) {
      console.warn(`[sitemap] ${full} failed:`, (e as Error).message);
    }
  }
  return null;
}

async function fetchAllProducts(): Promise<{ slug: string; updated_at: string }[]> {
  const results: { slug: string; updated_at: string }[] = [];
  let nextPath: string | null = '/products/?page_size=100&status=ACTIVE';
  let safety = 0;

  while (nextPath && safety < 200) {
    safety += 1;
    const data = await fetchJson(nextPath);
    if (!data) break;
    const items = data.results || [];
    results.push(
      ...items.map((p: any) => ({
        slug: p.slug,
        updated_at: p.updated_at || p.updatedAt || '',
      }))
    );
    // data.next is a full absolute URL — extract path portion so we keep using fallback base chain
    if (data.next) {
      try {
        const u = new URL(data.next);
        nextPath = u.pathname.replace(/^\/api/, '') + u.search;
      } catch {
        nextPath = null;
      }
    } else {
      nextPath = null;
    }
  }
  console.log(`[sitemap] fetched ${results.length} products`);
  return results;
}

async function fetchAllCategories(): Promise<{ slug: string; updated_at: string }[]> {
  const data = await fetchJson('/categories/?page_size=200');
  if (!data) return [];
  const items = data.results || [];
  return items.map((c: any) => ({
    slug: c.slug,
    updated_at: c.updated_at || '',
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/flash-sale`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const products = await fetchAllProducts();
  const productPages: MetadataRoute.Sitemap = products
    .filter((p) => !!p.slug)
    .map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const categories = await fetchAllCategories();
  const categoryPages: MetadataRoute.Sitemap = categories
    .filter((c) => !!c.slug)
    .map((c) => ({
      url: `${BASE_URL}/products?category=${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  return [...staticPages, ...productPages, ...categoryPages];
}
