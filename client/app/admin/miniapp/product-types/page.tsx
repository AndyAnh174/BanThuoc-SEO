'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface ProductType {
  id: string; name: string; description: string; product_count: number;
  _miniappCount?: number;
}

export default function MiniAppProductTypesPage() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [typeRes, prodRes] = await Promise.all([
          fetch(`${API}/admin/product-types/?page_size=200`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/products/?page_size=500&show_on_miniapp=true&fields=id,product_type`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const typeData = (await typeRes.json()).results || [];
        const products = (await prodRes.json()).results || [];

        const counts: Record<string, number> = {};
        products.forEach((p: any) => {
          if (p.product_type) {
            const tid = typeof p.product_type === 'string' ? p.product_type : p.product_type.id || p.product_type;
            counts[tid] = (counts[tid] || 0) + 1;
          }
        });

        setTypes(typeData.map((t: ProductType) => ({ ...t, _miniappCount: counts[t.id] || 0 })));
      } catch { toast.error('Không thể tải loại sản phẩm'); }
      setLoading(false);
    })();
  }, []);

  const withMiniApp = types.filter(t => (t._miniappCount || 0) > 0);
  const display = showAll ? types : withMiniApp;

  return (
    <div className="space-y-6">
      <AdminHeader title="Loại sản phẩm Mini App"
        description={`${withMiniApp.length}/${types.length} loại SP có sản phẩm Mini App. Phân loại: Thuốc, TPCN, Thiết bị y tế, Mỹ phẩm...`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng loại</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{types.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Có SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{withMiniApp.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{types.reduce((s, t) => s + (t._miniappCount || 0), 0)}</div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={showAll} onCheckedChange={setShowAll} />
          {showAll ? 'Đang hiện tất cả' : 'Chỉ hiện loại có SP Mini App'}
        </label>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Tên loại</th>
                  <th className="text-left p-3 font-medium">Mô tả</th>
                  <th className="text-center p-3 font-medium">Tổng SP</th>
                  <th className="text-center p-3 font-medium">SP Mini App</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-400"><RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin" /></td></tr>
                ) : display.map(t => (
                  <tr key={t.id} className={`border-b hover:bg-gray-50 ${(t._miniappCount || 0) === 0 ? 'opacity-40' : ''}`}>
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-xs text-gray-500">{t.description || '—'}</td>
                    <td className="p-3 text-center"><Badge variant="outline">{t.product_count || 0}</Badge></td>
                    <td className="p-3 text-center">
                      <Badge variant={(t._miniappCount || 0) > 0 ? 'default' : 'secondary'} className={(t._miniappCount || 0) > 0 ? 'bg-teal-100 text-teal-700' : ''}>
                        {t._miniappCount || 0}
                      </Badge>
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
