import { MetadataRoute } from 'next';

const BASE_URL = 'https://banthuocsi.vn';
const API_URL = process.env.INTERNAL_API_URL || 'http://backend:8000/api';

async function fetchAllProducts(): Promise<{ slug: string; updated_at: string }[]> {
  const results: { slug: string; updated_at: string }[] = [];
  let url = `${API_URL}/products/?page_size=100&status=ACTIVE`;

  while (url) {
    try {
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (!res.ok) break;
      const data = await res.json();
      results.push(...(data.results || []));
      url = data.next;
    } catch {
      break;
    }
  }
  return results;
}

async function fetchAllCategories(): Promise<{ slug: string; updated_at: string }[]> {
  try {
    const res = await fetch(`${API_URL}/categories/?page_size=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/flash-sale`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Dynamic: products
  const products = await fetchAllProducts();
  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic: categories
  const categories = await fetchAllCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/products?category=${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
