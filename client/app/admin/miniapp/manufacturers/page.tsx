'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Manufacturer {
  id: string; name: string; slug: string; country: string; website: string;
  product_count: number;
}

export default function MiniAppManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API}/manufacturers/?page_size=200`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        const data = await res.json();
        setManufacturers(data.results || []);
      } catch { toast.error('Không thể tải nhà sản xuất'); }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader title="Nhà sản xuất Mini App" description={`${manufacturers.length} nhà sản xuất — Dùng chung với B2B. Sản phẩm của NSX nào được bật "Mini App" sẽ hiển thị trên Zalo.`} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng NSX</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{manufacturers.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Có sản phẩm</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{manufacturers.filter(m => m.product_count > 0).length}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Tên NSX</th>
                  <th className="text-left p-3 font-medium">Quốc gia</th>
                  <th className="text-left p-3 font-medium">Website</th>
                  <th className="text-center p-3 font-medium">Số sản phẩm</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Đang tải...</td></tr> : manufacturers.map(m => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className="p-3 text-xs text-gray-500">{m.country || '—'}</td>
                    <td className="p-3 text-xs text-blue-500">{m.website ? <a href={m.website} target="_blank" rel="noreferrer">{m.website}</a> : '—'}</td>
                    <td className="p-3 text-center"><Badge variant="outline">{m.product_count || 0}</Badge></td>
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
