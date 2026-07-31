'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, RefreshCw, Smartphone, Award, DollarSign } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface MiniAppUserItem {
  id: string;
  zalo_id: string;
  name: string;
  avatar: string;
  phone: string;
  membership_tier: string;
  loyalty_points: number;
  total_spent: string;
  date_joined: string;
}

const TIER_BADGES: Record<string, { bg: string; color: string; label: string }> = {
  SILVER: { bg: '#f3f4f6', color: '#4b5563', label: '🥈 Hạng Bạc' },
  GOLD: { bg: '#fef3c7', color: '#d97706', label: '🥇 Hạng Vàng' },
  PLATINUM: { bg: '#e0e7ff', color: '#4338ca', label: '💎 Hạng Bạch Kim' },
  DIAMOND: { bg: '#cffaff', color: '#0891b2', label: '👑 Hạng Kim Cương' },
};

const MOCK_USERS: MiniAppUserItem[] = [
  {
    id: "1",
    zalo_id: "zalouser_098765",
    name: "Nguyễn Văn Nam",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam",
    phone: "0987 654 321",
    membership_tier: "GOLD",
    loyalty_points: 25000,
    total_spent: "3500000",
    date_joined: "2026-07-20T10:30:00Z",
  },
  {
    id: "2",
    zalo_id: "zalouser_091234",
    name: "Trần Thị Mai",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mai",
    phone: "0912 345 678",
    membership_tier: "PLATINUM",
    loyalty_points: 68000,
    total_spent: "8200000",
    date_joined: "2026-07-15T14:20:00Z",
  },
  {
    id: "3",
    zalo_id: "zalouser_093344",
    name: "Lê Hoàng Thuận",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thuan",
    phone: "0933 445 566",
    membership_tier: "DIAMOND",
    loyalty_points: 120000,
    total_spent: "15400000",
    date_joined: "2026-07-01T09:15:00Z",
  },
];

export default function MiniAppUsersPage() {
  const [users, setUsers] = useState<MiniAppUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/miniapp/users/`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers(MOCK_USERS);
      }
    } catch {
      setUsers(MOCK_USERS);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.zalo_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Quản lý Người dùng Zalo Mini App"
        description="Xem danh sách tài khoản khách hàng Mini App, hạng thẻ thành viên, điểm thưởng & chi tiêu"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-teal-200 bg-teal-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" /> Tổng người dùng Mini App
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{users.length} khách hàng</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" /> Hạng thẻ cao cấp (Gold+)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {users.filter((u) => u.membership_tier !== 'SILVER').length} khách hàng
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Tổng điểm thưởng phát hành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {users.reduce((sum, u) => sum + (u.loyalty_points || 0), 0).toLocaleString()} điểm
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm tên, số điện thoại hoặc Zalo ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-700 font-semibold">
                  <th className="py-3 px-4">Khách hàng Mini App</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Hạng thẻ</th>
                  <th className="py-3 px-4 text-right">Điểm thưởng</th>
                  <th className="py-3 px-4 text-right">Tổng chi tiêu</th>
                  <th className="py-3 px-4 text-center">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Chưa tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const badge = TIER_BADGES[u.membership_tier] || TIER_BADGES.SILVER;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-teal-100 border border-teal-200 overflow-hidden flex items-center justify-center font-bold text-teal-700 flex-shrink-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                u.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{u.name}</div>
                              <div className="text-xs text-gray-400 font-mono">{u.zalo_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-700">{u.phone || '—'}</td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-teal-600">
                          {(u.loyalty_points || 0).toLocaleString()}đ
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-600">
                          {Number(u.total_spent || 0).toLocaleString()}đ
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-gray-500">
                          {new Date(u.date_joined).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
