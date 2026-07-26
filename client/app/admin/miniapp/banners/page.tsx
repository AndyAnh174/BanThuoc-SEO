'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Image, ExternalLink, Plus } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Banner {
  id: string; title: string; subtitle: string; image_url: string;
  link_url: string; display_position: string; sort_order: number;
  is_active: boolean; is_visible: boolean;
  start_date: string; end_date: string;
}

export default function MiniAppBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API}/banners/?page_size=100`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : data.results || []);
      } catch { toast.error('Không thể tải banner'); }
      setLoading(false);
    })();
  }, []);

  const toggleBanner = async (b: Banner) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API}/banners/${b.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify({ ...b, is_active: !b.is_active }),
    });
    if (res.ok) {
      setBanners(prev => prev.map(x => x.id === b.id ? { ...x, is_active: !x.is_active } : x));
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Banner Mini App" description={`${banners.length} banner — Quản lý banner hiển thị trên Mini App Zalo (carousel, promo, popup).`}
        action={<Button variant="outline" size="sm" onClick={() => window.open('/admin/banners', '_blank')}><ExternalLink className="w-4 h-4 mr-1" /> Mở B2B Banner</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng banner</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{banners.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đang active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{banners.filter(b => b.is_active).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">HERO</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{banners.filter(b => b.display_position === 'HERO').length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">ROW/PROMO</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{banners.filter(b => b.display_position === 'ROW' || b.display_position === 'PROMO').length}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium w-[15%]">Ảnh</th>
                  <th className="text-left p-3 font-medium">Tiêu đề</th>
                  <th className="text-center p-3 font-medium">Vị trí</th>
                  <th className="text-center p-3 font-medium">Thứ tự</th>
                  <th className="text-center p-3 font-medium">Thời hạn</th>
                  <th className="text-center p-3 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Đang tải...</td></tr> : banners.map(b => (
                  <tr key={b.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="w-20 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                        {b.image_url ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /> : <Image className="w-4 h-4 text-gray-300" />}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{b.title}</div>
                      <div className="text-xs text-gray-400">{b.subtitle}</div>
                    </td>
                    <td className="p-3 text-center"><Badge variant={b.display_position === 'HERO' ? 'default' : 'secondary'}>{b.display_position}</Badge></td>
                    <td className="p-3 text-center">{b.sort_order}</td>
                    <td className="p-3 text-center text-xs text-gray-500">{b.start_date ? `${b.start_date} → ${b.end_date}` : 'Không giới hạn'}</td>
                    <td className="p-3 text-center"><Switch checked={b.is_active} onCheckedChange={() => toggleBanner(b)} /></td>
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
