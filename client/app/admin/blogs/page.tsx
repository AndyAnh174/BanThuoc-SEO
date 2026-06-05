'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BlogPostItem } from '@/src/features/blog/api/blog';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPosts = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/?page_size=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      // Admin needs all posts including drafts
      const allRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/`, {
        headers: { 'Authorization': `Bearer ${token}`, 'X-Admin': 'true' },
      });
      // The viewset filters to published only for non-admin by default
      // We need to get all from admin endpoint — but our viewset shares the same list
      // Use query param to bypass filter
      const allData = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/?status=all&page_size=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }).then(r => r.json());
      setPosts(allData.results || data.results || []);
    } catch (e) {
      console.error('Failed to load posts', e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Xóa bài "${title}"?`)) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setPosts(prev => prev.filter(p => p.slug !== slug));
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      PUBLISHED: 'bg-teal-100 text-teal-800',
      ARCHIVED: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = {
      DRAFT: 'Nháp',
      PUBLISHED: 'Đã đăng',
      ARCHIVED: 'Lưu trữ',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
        <Link
          href="/admin/blogs/new"
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          + Viết bài mới
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <span className="text-6xl">📝</span>
          <p className="text-gray-500 mt-4">Chưa có bài viết nào</p>
          <Link
            href="/admin/blogs/new"
            className="inline-block mt-4 text-teal-600 hover:underline font-medium"
          >
            Viết bài đầu tiên
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-500 text-sm">Tiêu đề</th>
                <th className="text-left p-4 font-medium text-gray-500 text-sm hidden md:table-cell">Trạng thái</th>
                <th className="text-left p-4 font-medium text-gray-500 text-sm hidden lg:table-cell">Ngày đăng</th>
                <th className="text-right p-4 font-medium text-gray-500 text-sm">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {post.cover_image ? (
                        <img
                          src={post.cover_image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-300">
                          📄
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 truncate">{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">{statusBadge(post.status)}</td>
                  <td className="p-4 text-sm text-gray-500 hidden lg:table-cell">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('vi-VN')
                      : new Date(post.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blogs/${post.slug}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Sửa
                      </Link>
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-gray-600 text-sm"
                      >
                        Xem
                      </Link>
                      <button
                        onClick={() => handleDelete(post.slug, post.title)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
