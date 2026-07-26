'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Tier {
  tier_name: string; tier_label: string; min_spent: string; cashback_percent: string;
}

const TIER_STYLE: Record<string, { color: string; border: string; bg: string; icon: string }> = {
  SILVER:   { color: '#6b7280', border: '#d1d5db', bg: '#f9fafb', icon: '🥈' },
  GOLD:     { color: '#d97706', border: '#fcd34d', bg: '#fffbeb', icon: '🥇' },
  PLATINUM: { color: '#4f46e5', border: '#a5b4fc', bg: '#eef2ff', icon: '💎' },
  DIAMOND:  { color: '#0891b2', border: '#67e8f9', bg: '#ecfeff', icon: '👑' },
};

export default function MembershipTiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/miniapp/membership/tiers/`);
        const data = await res.json();
        setTiers(data);
      } catch { toast.error('Không thể tải hạng thành viên'); }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <AdminHeader title="Hạng thành viên" description="Hệ thống hạng thành viên DÀNH RIÊNG cho Mini App Zalo (B2C). Dựa trên tổng chi tiêu tích lũy của khách hàng. Không liên quan đến B2B." />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map(tier => {
            const style = TIER_STYLE[tier.tier_name] || TIER_STYLE.SILVER;
            return (
              <Card key={tier.tier_name} style={{ borderTop: `4px solid ${style.color}` }} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="text-5xl mb-2">{style.icon}</div>
                  <CardTitle className="text-xl" style={{ color: style.color }}>{tier.tier_label}</CardTitle>
                  <div className="text-xs text-gray-400 font-mono">Code: {tier.tier_name}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 rounded-xl" style={{ background: style.bg }}>
                    <div className="text-xs text-gray-500 mb-1">Ngưỡng chi tiêu</div>
                    <div className="text-2xl font-bold" style={{ color: style.color }}>
                      {Number(tier.min_spent).toLocaleString('vi')}đ
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{ background: style.bg }}>
                    <div className="text-xs text-gray-500 mb-1">Hoàn điểm</div>
                    <div className="text-2xl font-bold" style={{ color: style.color }}>
                      {tier.cashback_percent}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">trên mỗi đơn hàng</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Cơ chế hoạt động</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">1.</span> <span><b>Tích điểm:</b> Mỗi đơn hàng hoàn thành, khách nhận điểm = FLOOR(tổng tiền × % hoàn điểm / 100). <b>1 điểm = 1 VND</b> cho đơn sau.</span></div>
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">2.</span> <span><b>Thăng hạng:</b> Dựa trên <b>tổng chi tiêu tích lũy</b>. Đạt ngưỡng → tự động lên hạng mới.</span></div>
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">3.</span> <span><b>Dùng điểm:</b> Thanh toán đơn hàng, đổi voucher, đổi quà tặng.</span></div>
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">4.</span> <span><b>Hạng mới</b> có hiệu lực từ đơn hàng tiếp theo (không truy thu đơn đã hoàn thành).</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
