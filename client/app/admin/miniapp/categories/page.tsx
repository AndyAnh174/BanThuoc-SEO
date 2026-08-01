'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Category {
  id: string; name: string; slug: string; is_active: boolean; full_path: string;
  product_count: number; children?: Category[];
  _miniappCount?: number; _depth?: number;
}

export default function MiniAppCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Fetch categories tree + Mini App product counts
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API}/categories/tree/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/products/?page_size=500&show_on_miniapp=true&fields=id,category`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const catResData = await catRes.json();
        const cats: Category[] = Array.isArray(catResData) ? catResData : (catResData.results || []);
        const prodData = await prodRes.json().catch(() => ({}));
        const products = prodData.results || [];


        // Count Mini App products per category
        const counts: Record<string, number> = {};
        products.forEach((p: any) => {
          if (p.category?.id) counts[p.category.id] = (counts[p.category.id] || 0) + 1;
        });

        // Tag each category with Mini App count
        const tagCounts = (list: Category[], depth = 0) => {
          list.forEach(c => {
            c._miniappCount = counts[c.id] || 0;
            c._depth = depth;
            if (c.children) tagCounts(c.children, depth + 1);
          });
        };
        tagCounts(cats);
        setCategories(cats);
      } catch { toast.error('Không thể tải danh mục'); }
      setLoading(false);
    })();
  }, []);

  const flatten = (cats: Category[]): Category[] => cats.flatMap(c => [c, ...flatten(c.children || [])]);
  const flatList = flatten(categories);
  const withMiniApp = flatList.filter(c => (c._miniappCount || 0) > 0);
  const displayList = showAll ? flatList : withMiniApp;

  return (
    <div className="space-y-6">
      <AdminHeader title="Danh mục Mini App"
        description={`${withMiniApp.length}/${flatList.length} danh mục có sản phẩm Mini App. Chỉ hiển thị danh mục thực sự có sản phẩm bán lẻ trên Zalo.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng danh mục</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{flatList.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Có SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{withMiniApp.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Danh mục gốc</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{categories.length}</div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={showAll} onCheckedChange={setShowAll} />
          {showAll ? 'Đang hiện tất cả' : 'Chỉ hiện danh mục có SP Mini App'}
        </label>
        <span className="text-xs text-gray-400">{displayList.length} danh mục</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Tên danh mục</th>
                  <th className="text-left p-3 font-medium">Đường dẫn</th>
                  <th className="text-center p-3 font-medium">Tổng SP</th>
                  <th className="text-center p-3 font-medium">SP Mini App</th>
                  <th className="text-center p-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400"><RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin" /> Đang tải...</td></tr>
                ) : displayList.map(c => (
                  <tr key={c.id} className={`border-b hover:bg-gray-50 ${(c._miniappCount || 0) === 0 ? 'opacity-40' : ''}`}>
                    <td className="p-3">
                      <span className="font-medium" style={{ paddingLeft: (c._depth || 0) * 16 }}>{(c._depth || 0) > 0 && '└ '}{c.name}</span>
                    </td>
                    <td className="p-3 text-xs text-gray-500">{c.full_path}</td>
                    <td className="p-3 text-center"><Badge variant="outline">{c.product_count || 0}</Badge></td>
                    <td className="p-3 text-center">
                      <Badge variant={(c._miniappCount || 0) > 0 ? 'default' : 'secondary'} className={(c._miniappCount || 0) > 0 ? 'bg-teal-100 text-teal-700' : ''}>
                        {c._miniappCount || 0}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                    </td>
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
