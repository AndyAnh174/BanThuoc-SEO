'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Plus, RefreshCw, Clock, ExternalLink } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Session {
  id: string; name: string; slug: string;
  start_time: string; end_time: string; status: string;
  show_on_miniapp?: boolean;
}

export default function MiniAppFlashSalesPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/flash-sale/sessions/?page_size=100`, { headers });
      const data = await res.json();
      setSessions(data.results || []);
    } catch { toast.error('Không thể tải Flash Sale'); }
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const toggleMiniapp = async (s: Session) => {
    const newVal = !s.show_on_miniapp;
    try {
      await fetch(`${API}/flash-sale/sessions/${s.id}/`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ show_on_miniapp: newVal }),
      });
      setSessions(prev => prev.map(x => x.id === s.id ? { ...x, show_on_miniapp: newVal } : x));
      toast.success(`${s.name}: ${newVal ? 'Hiện' : 'Ẩn'} trên Mini App`);
    } catch { toast.error('Cập nhật thất bại'); }
  };

  const now = new Date();
  const running = sessions.filter(s => s.status === 'ACTIVE' || (new Date(s.start_time) <= now && new Date(s.end_time) >= now));
  const upcoming = sessions.filter(s => s.status === 'UPCOMING' || new Date(s.start_time) > now);
  const ended = sessions.filter(s => s.status === 'ENDED' || new Date(s.end_time) < now);

  return (
    <div className="space-y-6">
      <AdminHeader title="Flash Sale Mini App"
        description={`${sessions.length} đợt Flash Sale — Bật/tắt hiển thị trên Mini App Zalo. Flash Sale đang chạy sẽ hiển thị ở section Flash Sale trên trang chủ Mini App.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSessions}><RefreshCw className="w-4 h-4 mr-1" /> Làm mới</Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={() => router.push('/admin/flash-sales/create')}>
              <Plus className="w-4 h-4 mr-1" /> Tạo đợt mới
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng đợt</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{sessions.length}</div></CardContent></Card>
        <Card className="border-green-200 bg-green-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">🟢 Đang chạy</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{running.length}</div></CardContent></Card>
        <Card className="border-blue-200 bg-blue-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">🔵 Sắp diễn ra</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{upcoming.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">⚫ Đã kết thúc</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-500">{ended.length}</div></CardContent></Card>
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
                  <th className="text-center p-3 font-medium">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400"><RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin" /> Đang tải...</td></tr>
                ) : sessions.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400"><Zap className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Chưa có đợt Flash Sale nào</p></td></tr>
                ) : sessions.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{s.name}</td>
                    <td className="p-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.start_time).toLocaleDateString('vi')} → {new Date(s.end_time).toLocaleDateString('vi')}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant={s.status === 'ACTIVE' ? 'default' : s.status === 'UPCOMING' ? 'secondary' : 'outline'}>{s.status}</Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={s.show_on_miniapp || false} onCheckedChange={() => toggleMiniapp(s)} />
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/flash-sales/${s.id}`)}>
                        <ExternalLink className="w-3 h-3 mr-1" /> Chi tiết
                      </Button>
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
