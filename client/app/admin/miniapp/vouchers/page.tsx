'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TicketPercent, ExternalLink, Users } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Voucher {
  id: string; code: string; name: string;
  discount_type: 'PERCENTAGE' | 'FIXED'; discount_value: string;
  min_order_value: string; max_discount: string;
  usage_limit: number; used_count: number;
  applicable_user_type: string;
  start_date: string; end_date: string; status: string;
}

export default function MiniAppVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${API}/vouchers/manage/?page_size=100`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        const data = await res.json();
        setVouchers(data.results || []);
      } catch { toast.error('Không thể tải voucher'); }
      setLoading(false);
    })();
  }, []);

  const b2cVouchers = vouchers.filter(v => v.applicable_user_type === 'B2C' || v.applicable_user_type === 'ALL');
  const activeVouchers = b2cVouchers.filter(v => v.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <AdminHeader title="Voucher Mini App" description="Quản lý mã giảm giá cho khách hàng B2C trên Zalo Mini App. Chỉ hiển thị voucher dành cho người dùng Mini App."
        action={<Button variant="outline" size="sm" onClick={() => window.open('/admin/vouchers', '_blank')}><ExternalLink className="w-4 h-4 mr-1" /> Mở B2B Voucher</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng voucher</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{vouchers.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Users className="w-3 h-3" /> B2C / ALL</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{b2cVouchers.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đang active (B2C)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeVouchers.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">B2B only</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-400">{vouchers.filter(v => v.applicable_user_type === 'B2B').length}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Mã / Tên</th>
                  <th className="text-center p-3 font-medium">Loại</th>
                  <th className="text-right p-3 font-medium">Giá trị</th>
                  <th className="text-right p-3 font-medium">Đơn tối thiểu</th>
                  <th className="text-center p-3 font-medium">Đối tượng</th>
                  <th className="text-center p-3 font-medium">Lượt dùng</th>
                  <th className="text-center p-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">Đang tải...</td></tr> : b2cVouchers.map(v => (
                  <tr key={v.id} className={`border-b hover:bg-gray-50 ${v.status !== 'ACTIVE' ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <div className="font-medium">{v.code}</div>
                      <div className="text-xs text-gray-400">{v.name}</div>
                    </td>
                    <td className="p-3 text-center"><Badge variant="outline">{v.discount_type === 'PERCENTAGE' ? '%' : 'đ'}</Badge></td>
                    <td className="p-3 text-right font-mono text-xs whitespace-nowrap">
                      {v.discount_type === 'PERCENTAGE' ? `${v.discount_value}% (tối đa ${Number(v.max_discount).toLocaleString('vi')}đ)` : `${Number(v.discount_value).toLocaleString('vi')}đ`}
                    </td>
                    <td className="p-3 text-right font-mono text-xs whitespace-nowrap">{Number(v.min_order_value).toLocaleString('vi')}đ</td>
                    <td className="p-3 text-center"><Badge variant={v.applicable_user_type === 'B2C' ? 'default' : 'secondary'}>{v.applicable_user_type}</Badge></td>
                    <td className="p-3 text-center text-xs">{v.used_count || 0}/{v.usage_limit || '∞'}</td>
                    <td className="p-3 text-center"><Badge variant={v.status === 'ACTIVE' ? 'default' : 'destructive'}>{v.status}</Badge></td>
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
