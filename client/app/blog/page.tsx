import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { getBlogPosts, getBlogTags, type BlogListResponse } from '@/src/features/blog/api/blog';
import BlogClientWrapper from './BlogClientWrapper';

export const metadata: Metadata = {
  title: 'Blog Kiến Thức Dược Phẩm | BanThuocSi',
  description: 'Cập nhật kiến thức về dược phẩm, sức khỏe và hướng dẫn sử dụng thuốc an toàn. Đọc bài viết từ chuyên gia BanThuocSi.',
  openGraph: {
    title: 'Blog Kiến Thức Dược Phẩm | BanThuocSi',
    description: 'Cập nhật kiến thức về dược phẩm, sức khỏe và hướng dẫn sử dụng thuốc an toàn.',
    type: 'website',
    siteName: 'BanThuocSi',
  },
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
    // Fallback: API not ready yet, show empty blog page
  }

  return (
    <MainLayout fullWidth>
      <BlogClientWrapper initialPosts={postsData} tags={tags || []} />
    </MainLayout>
  );
}
