'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, ExternalLink, Clock } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface FlashSaleSession {
  id: string; name: string; slug: string;
  start_time: string; end_time: string; status: string;
  show_on_miniapp?: boolean;
}

export default function MiniAppFlashSalesPage() {
  const [sessions, setSessions] = useState<FlashSaleSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API}/flash-sale/sessions/?page_size=100`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        const data = await res.json();
        setSessions(data.results || []);
      } catch { toast.error('Không thể tải Flash Sale'); }
      setLoading(false);
    })();
  }, []);

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'ACTIVE': return 'default';
      case 'UPCOMING': return 'secondary';
      case 'ENDED': return 'outline';
      default: return 'secondary';
    }
  };

  const isExpired = (end: string) => new Date(end) < new Date();
  const isUpcoming = (start: string) => new Date(start) > new Date();

  return (
    <div className="space-y-6">
      <AdminHeader title="Flash Sale Mini App" description={`${sessions.length} đợt Flash Sale — Quản lý Flash Sale hiển thị trên Mini App Zalo.`}
        action={<Button variant="outline" size="sm" onClick={() => window.open('/admin/flash-sales', '_blank')}><ExternalLink className="w-4 h-4 mr-1" /> Mở B2B Flash Sale</Button>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng đợt</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{sessions.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50"><CardHeader className="pb-2"><CardTitle className="text-sm">Đang chạy</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{sessions.filter(s => s.status === 'ACTIVE').length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Sắp diễn ra</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{sessions.filter(s => s.status === 'UPCOMING' || isUpcoming(s.start_time)).length}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Tên đợt</th>
                  <th className="text-left p-3 font-medium">Thời gian</th>
                  <th className="text-center p-3 font-medium">Trạng thái</th>
                  <th className="text-center p-3 font-medium">Mini App</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="text-center py-12 text-gray-400">Đang tải...</td></tr> : sessions.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(s.start_time).toLocaleDateString('vi')} → {new Date(s.end_time).toLocaleDateString('vi')}</span>
                    </td>
                    <td className="p-3 text-center"><Badge variant={getStatusColor(s.status)}>{s.status}</Badge></td>
                    <td className="p-3 text-center"><Switch checked={s.show_on_miniapp || false} /></td>
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
