'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Manufacturer {
  id: string; name: string; slug: string; country: string; website: string;
  product_count: number; _miniappCount?: number;
}

export default function MiniAppManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [mfrRes, prodRes] = await Promise.all([
          fetch(`${API}/admin/manufacturers/?page_size=500`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/products/?page_size=500&show_on_miniapp=true&fields=id,manufacturer`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const mfrs = (await mfrRes.json()).results || [];
        const products = (await prodRes.json()).results || [];

        const counts: Record<string, number> = {};
        products.forEach((p: any) => {
          if (p.manufacturer?.id) counts[p.manufacturer.id] = (counts[p.manufacturer.id] || 0) + 1;
        });

        setManufacturers(mfrs.map((m: Manufacturer) => ({ ...m, _miniappCount: counts[m.id] || 0 })));
      } catch { toast.error('Không thể tải NSX'); }
      setLoading(false);
    })();
  }, []);

  const withMiniApp = manufacturers.filter(m => (m._miniappCount || 0) > 0);
  const display = showAll ? manufacturers : withMiniApp;

  return (
    <div className="space-y-6">
      <AdminHeader title="Nhà sản xuất Mini App"
        description={`${withMiniApp.length}/${manufacturers.length} NSX có sản phẩm Mini App. Chỉ hiển thị nhà sản xuất có sản phẩm bán lẻ trên Zalo.`}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng NSX</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{manufacturers.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Có SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{withMiniApp.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{manufacturers.reduce((s, m) => s + (m._miniappCount || 0), 0)}</div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={showAll} onCheckedChange={setShowAll} />
          {showAll ? 'Đang hiện tất cả' : 'Chỉ hiện NSX có SP Mini App'}
        </label>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Tên NSX</th>
                  <th className="text-left p-3 font-medium">Quốc gia</th>
                  <th className="text-center p-3 font-medium">Tổng SP</th>
                  <th className="text-center p-3 font-medium">SP Mini App</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-gray-400"><RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin" /></td></tr>
                ) : display.map(m => (
                  <tr key={m.id} className={`border-b hover:bg-gray-50 ${(m._miniappCount || 0) === 0 ? 'opacity-40' : ''}`}>
                    <td className="p-3 font-medium">{m.name}</td>
                    <td className="p-3 text-xs text-gray-500">{m.country || '—'}</td>
                    <td className="p-3 text-center"><Badge variant="outline">{m.product_count || 0}</Badge></td>
                    <td className="p-3 text-center">
                      <Badge variant={(m._miniappCount || 0) > 0 ? 'default' : 'secondary'} className={(m._miniappCount || 0) > 0 ? 'bg-teal-100 text-teal-700' : ''}>
                        {m._miniappCount || 0}
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
