import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { getBlogPosts, getBlogTags, type BlogListResponse } from '@/src/features/blog/api/blog';
import BlogClientWrapper from './BlogClientWrapper';

const BASE_URL = 'https://banthuocsi.vn';

export const metadata: Metadata = {
  title: 'Blog Kiến Thức Dược Phẩm | BanThuocSi - Cập Nhật Mới Nhất',
  description:
    'Blog kiến thức dược phẩm, sức khỏe, hướng dẫn sử dụng thuốc an toàn từ chuyên gia BanThuocSi. Cập nhật bài viết mới nhất về dược phẩm, điều trị, chăm sóc sức khỏe.',
  keywords: [
    'blog dược phẩm', 'kiến thức thuốc', 'hướng dẫn sử dụng thuốc', 'sức khỏe',
    'dược phẩm', 'blog sức khỏe', 'tin tức y tế', 'banthuocsi blog',
  ],
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: 'Blog Kiến Thức Dược Phẩm | BanThuocSi',
    description:
      'Cập nhật kiến thức về dược phẩm, sức khỏe và hướng dẫn sử dụng thuốc an toàn. Đọc bài viết từ chuyên gia BanThuocSi.',
    type: 'website',
    siteName: 'BanThuocSi',
    url: `${BASE_URL}/blog`,
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Kiến Thức Dược Phẩm | BanThuocSi',
    description:
      'Cập nhật kiến thức về dược phẩm, sức khỏe từ chuyên gia BanThuocSi.',
  },
  robots: { index: true, follow: true },
};

export const revalidate = 60;

export default async function BlogPage() {
  let postsData: BlogListResponse = { count: 0, next: null, previous: null, results: [] };
  let tags: string[] = [];

  try {
    [postsData, tags] = await Promise.all([
      getBlogPosts(1, 12),
      getBlogTags(),
    ]);
  } catch {
    // Fallback
  }

  const blogCollectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blog Kiến Thức Dược Phẩm - BanThuocSi',
    description:
      'Tổng hợp bài viết kiến thức dược phẩm, sức khỏe, hướng dẫn sử dụng thuốc từ BanThuocSi.',
    url: `${BASE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'BanThuocSi - Ngọc Kim Ngân Pharma',
      url: BASE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: postsData.results.map((post, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
    ],
  };

  return (
    <MainLayout fullWidth>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogCollectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogClientWrapper initialPosts={postsData} tags={tags || []} />
    </MainLayout>
  );
}
