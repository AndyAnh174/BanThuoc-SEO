import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = 'https://banthuocsi.vn';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/auth/',
          '/checkout/',
          '/orders/',
          '/cart/',
          '/profile/',
          '/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
