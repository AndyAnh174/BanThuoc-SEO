'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Crown, Save, RefreshCw } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Tier {
  id: number; tier_name: string; tier_label: string;
  min_spent: number; cashback_percent: number;
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
  const [savingId, setSavingId] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/miniapp/membership/tiers/`);
      const data = await res.json();
      setTiers(data.map((t: any) => ({ ...t, min_spent: Number(t.min_spent), cashback_percent: Number(t.cashback_percent) })));
    } catch { toast.error('Không thể tải hạng thành viên'); }
    setLoading(false);
  };

  useEffect(() => { fetchTiers(); }, []);

  const updateField = (id: number, field: string, value: number | string) => {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const saveTier = async (tier: Tier) => {
    setSavingId(tier.id);
    try {
      const res = await fetch(`${API}/admin/miniapp/membership-tiers/${tier.id}/`, {
        method: 'PATCH', headers, body: JSON.stringify(tier),
      });
      if (res.ok) {
        toast.success(`Đã lưu ${tier.tier_label}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(Object.values(err).flat().join(', ') || 'Lưu thất bại');
      }
    } catch { toast.error('Lưu thất bại — kiểm tra backend đã deploy chưa'); }
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Hạng thành viên"
        description="Hệ thống hạng thành viên DÀNH RIÊNG cho Mini App Zalo (B2C). Dựa trên tổng chi tiêu tích lũy của khách hàng. Không liên quan đến B2B."
        action={<Button variant="outline" size="sm" onClick={fetchTiers}><RefreshCw className="w-4 h-4 mr-1" /> Làm mới</Button>}
      />

      {loading ? (
        <div className="text-center py-16 text-gray-400"><RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" /> Đang tải...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map(tier => {
            const style = TIER_STYLE[tier.tier_name] || TIER_STYLE.SILVER;
            return (
              <Card key={tier.id} style={{ borderTop: `4px solid ${style.color}` }} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="text-5xl mb-2">{style.icon}</div>
                  <input
                    value={tier.tier_label}
                    onChange={e => updateField(tier.id, 'tier_label', e.target.value)}
                    className="text-xl font-bold text-center border-0 bg-transparent outline-none w-full"
                    style={{ color: style.color }}
                  />
                  <div className="text-xs text-gray-400 font-mono mt-1">Code: {tier.tier_name}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 rounded-xl" style={{ background: style.bg }}>
                    <label className="text-xs text-gray-500 mb-1 block">Ngưỡng chi tiêu (VNĐ)</label>
                    <Input
                      type="number"
                      value={tier.min_spent}
                      onChange={e => updateField(tier.id, 'min_spent', Number(e.target.value))}
                      className="text-center font-bold text-lg border-0 bg-transparent"
                      style={{ color: style.color }}
                    />
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{ background: style.bg }}>
                    <label className="text-xs text-gray-500 mb-1 block">% Hoàn điểm</label>
                    <Input
                      type="number" step="0.1"
                      value={tier.cashback_percent}
                      onChange={e => updateField(tier.id, 'cashback_percent', Number(e.target.value))}
                      className="text-center font-bold text-lg border-0 bg-transparent"
                      style={{ color: style.color }}
                    />
                  </div>
                  <Button
                    className="w-full"
                    style={{ background: style.color, borderColor: style.color }}
                    onClick={() => saveTier(tier)}
                    disabled={savingId === tier.id}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savingId === tier.id ? 'Đang lưu...' : `Lưu ${tier.tier_label}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Cơ chế hoạt động</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">1.</span> <span><b>Tích điểm:</b> Mỗi đơn hàng hoàn thành → điểm = FLOOR(tổng tiền × % hoàn điểm / 100). <b>1 điểm = 1 VND</b>.</span></div>
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">2.</span> <span><b>Thăng hạng:</b> Dựa trên tổng chi tiêu tích lũy. Đạt ngưỡng → tự động lên hạng mới.</span></div>
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">3.</span> <span><b>Dùng điểm:</b> Thanh toán đơn hàng, đổi voucher, đổi quà tặng.</span></div>
          <div className="flex items-start gap-2"><span className="text-teal-600 font-bold">4.</span> <span><b>Hạng mới</b> có hiệu lực từ đơn hàng tiếp theo.</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
