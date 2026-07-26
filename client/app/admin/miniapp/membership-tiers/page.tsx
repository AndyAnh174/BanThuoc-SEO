'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Save, Plus, Trash2 } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

interface MembershipTier {
  id?: number;
  tier_name: string;
  tier_label: string;
  min_spent: number;
  cashback_percent: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

const TIER_COLORS: Record<string, string> = {
  SILVER: '#9ca3af', GOLD: '#f59e0b', PLATINUM: '#6366f1', DIAMOND: '#06b6d4',
};
const TIER_ICONS: Record<string, string> = {
  SILVER: '🥈', GOLD: '🥇', PLATINUM: '💎', DIAMOND: '👑',
};

export default function MembershipTiersPage() {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/miniapp/membership/tiers/`);
      const data = await res.json();
      setTiers(data);
    } catch {
      toast.error('Không thể tải hạng thành viên');
    }
    setLoading(false);
  };

  useEffect(() => { fetchTiers(); }, []);

  const updateTier = (idx: number, field: string, value: string | number) => {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  // Membership tiers are managed via backend seed/admin API
  // For now, show read-only with edit capability via admin API
  const saveTier = async (tier: MembershipTier) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/admin/miniapp/membership-tiers/${tier.id || ''}`, {
        method: tier.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify(tier),
      });
      if (res.ok) {
        toast.success(`Đã lưu ${tier.tier_label}`);
        fetchTiers();
      } else {
        toast.error('Lưu thất bại');
      }
    } catch {
      toast.error('Lưu thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Hạng thành viên"
        description="Quản lý cấp bậc thành viên, ngưỡng chi tiêu và % hoàn điểm cho Mini App"
      />

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, idx) => (
            <Card key={tier.tier_name} style={{ borderTop: `3px solid ${TIER_COLORS[tier.tier_name] || '#9ca3af'}` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{TIER_ICONS[tier.tier_name] || '🏅'}</span>
                  <span>{tier.tier_label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500">Tên hạng (code)</label>
                  <Input
                    value={tier.tier_name}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Tên hiển thị</label>
                  <Input
                    value={tier.tier_label}
                    onChange={e => updateTier(idx, 'tier_label', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Ngưỡng chi tiêu (VNĐ)</label>
                  <Input
                    type="number"
                    value={tier.min_spent}
                    onChange={e => updateTier(idx, 'min_spent', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">% Hoàn điểm</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={tier.cashback_percent}
                    onChange={e => updateTier(idx, 'cashback_percent', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => saveTier(tier)}
                >
                  <Save className="w-4 h-4 mr-2" /> Lưu
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Cơ chế tích điểm & thăng hạng</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-1">
          <p>• <b>1 điểm = 1 VND</b> khi thanh toán đơn hàng tiếp theo</p>
          <p>• Điểm được tính = FLOOR(tổng tiền × % hoàn điểm / 100)</p>
          <p>• Hạng được xét dựa trên <b>tổng chi tiêu tích lũy</b> của khách hàng</p>
          <p>• Mỗi lần đơn hàng hoàn thành (DELIVERED): cộng tiền, tính điểm, kiểm tra nâng hạng</p>
        </CardContent>
      </Card>
    </div>
  );
}
