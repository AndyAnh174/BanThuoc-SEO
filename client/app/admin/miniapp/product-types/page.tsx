'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface ProductType {
  id: string; name: string; description: string; product_count: number;
}

export default function MiniAppProductTypesPage() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API}/product-types/?page_size=200`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        const data = await res.json();
        setTypes(data.results || []);
      } catch { toast.error('Không thể tải loại sản phẩm'); }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader title="Loại sản phẩm Mini App" description={`${types.length} loại sản phẩm — Dùng chung với B2B. Phân loại: Thuốc, TPCN, Thiết bị y tế, Mỹ phẩm...`} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Tên loại</th>
                  <th className="text-left p-3 font-medium">Mô tả</th>
                  <th className="text-center p-3 font-medium">Số sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={3} className="text-center py-12 text-gray-400">Đang tải...</td></tr> : types.map(t => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-xs text-gray-500">{t.description || '—'}</td>
                    <td className="p-3 text-center"><Badge variant="outline">{t.product_count || 0}</Badge></td>
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
