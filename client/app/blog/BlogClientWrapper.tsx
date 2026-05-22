'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogListResponse, BlogPostItem, getBlogPosts } from '@/src/features/blog/api/blog';

interface Props {
  initialPosts: BlogListResponse;
  tags: string[];
}

export default function BlogClientWrapper({ initialPosts, tags }: Props) {
  const [posts, setPosts] = useState<BlogPostItem[]>(initialPosts.results);
  const [nextPage, setNextPage] = useState<string | null>(initialPosts.next);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('');

  const loadMore = useCallback(async () => {
    if (!nextPage || loading) return;
    setLoading(true);
    try {
      const pageNum = parseInt(new URL(nextPage).searchParams.get('page') || '1');
      const data = await getBlogPosts(pageNum, 12, selectedTag);
      setPosts(prev => [...prev, ...data.results]);
      setNextPage(data.next);
    } catch (e) {
      console.error('Load more failed', e);
    } finally {
      setLoading(false);
    }
  }, [nextPage, loading, selectedTag]);

  const filterByTag = async (tag: string) => {
    setSelectedTag(tag);
    setLoading(true);
    try {
      const data = await getBlogPosts(1, 12, tag || undefined);
      setPosts(data.results);
      setNextPage(data.next);
    } catch (e) {
      console.error('Filter failed', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-r from-green-700 to-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog Kiến Thức Dược Phẩm
          </h1>
          <p className="text-lg md:text-xl text-green-50 max-w-2xl mx-auto">
            Cập nhật kiến thức về dược phẩm, sức khỏe và hướng dẫn sử dụng thuốc an toàn từ chuyên gia BanThuocSi
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <button
              onClick={() => filterByTag('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                !selectedTag
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => filterByTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Blog Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="relative w-full aspect-[16/9] bg-gray-200 overflow-hidden">
                  {post.cover_image ? (
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                      <span className="text-green-300 text-6xl">📄</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto">{post.reading_time_minutes} phút đọc</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-2 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {post.author_name}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('vi-VN')
                        : new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {nextPage && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 hover:border-green-300 transition-all disabled:opacity-50"
            >
              {loading ? 'Đang tải...' : 'Xem thêm bài viết'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
