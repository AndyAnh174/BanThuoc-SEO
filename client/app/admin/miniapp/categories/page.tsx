'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Category {
  id: string; name: string; slug: string; is_active: boolean;
  full_path: string; product_count: number; children?: Category[];
}

export default function MiniAppCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API}/categories/tree/`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.results || []);
      } catch { toast.error('Không thể tải danh mục'); }
      setLoading(false);
    })();
  }, []);

  const flatten = (cats: Category[], depth = 0): (Category & { _depth: number })[] =>
    cats.flatMap(c => [{ ...c, _depth: depth }, ...flatten(c.children || [], depth + 1)]);

  const flatList = flatten(categories);
  const activeCount = flatList.filter(c => c.is_active).length;

  return (
    <div className="space-y-6">
      <AdminHeader title="Danh mục Mini App" description={`${flatList.length} danh mục — Danh mục dùng chung cho cả B2B và Mini App. Sản phẩm trong danh mục nào được bật "Mini App" sẽ hiển thị trên Zalo.`} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng danh mục</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{flatList.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đang hoạt động</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{activeCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Danh mục gốc</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{categories.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Tên danh mục</th>
                  <th className="text-left p-3 font-medium">Đường dẫn đầy đủ</th>
                  <th className="text-center p-3 font-medium">Số sản phẩm</th>
                  <th className="text-center p-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Đang tải...</td></tr> : flatList.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-medium" style={{ paddingLeft: c._depth * 20 }}>{c._depth > 0 && '└ '}{c.name}</span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">{c.full_path}</td>
                    <td className="p-3 text-center"><Badge variant="outline">{c.product_count || 0}</Badge></td>
                    <td className="p-3 text-center"><Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
