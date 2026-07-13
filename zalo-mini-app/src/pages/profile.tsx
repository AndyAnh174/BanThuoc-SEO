import React from "react";
import { Box, Text, Icon, Button } from "zmp-ui";
import { useAppStore } from "@/stores/app.store";

export default function ProfilePage() {
  const { user, isAuthenticated, login, logout } = useAppStore();

  if (!isAuthenticated || !user) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Icon icon="zi-user" size={60} className="text-gray-300" />
        <Text.Title>Vui lòng đăng nhập</Text.Title>
        <Button variant="primary" onClick={login}>Đăng nhập bằng Zalo</Button>
      </Box>
    );
  }

  const tc: Record<string, string> = { SILVER: "#9ca3af", GOLD: "#f59e0b", PLATINUM: "#6366f1", DIAMOND: "#06b6d4" };
  const tierColor = tc[user.membershipTier] || "#9ca3af";

  return (
    <Box style={{ padding: 0, background: "#f9fafb", minHeight: "100vh" }}>
      <Box style={{ padding: "24px 16px 32px", background: "#0d9488", borderBottomLeftRadius: 16, borderBottomRightRadius: 16, textAlign: "center" }}>
        <Box style={{ width: 64, height: 64, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "white", fontSize: 28, fontWeight: 700 }}>{user.name.charAt(0)}</Box>
        <Text.Title className="text-white">{user.name}</Text.Title>
        <span className="text-teal-100 text-sm">{user.phone || "Chưa có SĐT"}</span>

        {/* Membership Badge */}
        <Box className="mt-3 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full" style={{ background: tierColor + "20", border: "1px solid " + tierColor }}>
          <Icon icon="zi-star-solid" style={{ color: tierColor }} size={14} />
          <span className="text-sm font-bold" style={{ color: tierColor }}>{user.membershipTier === "SILVER" ? "Hạng Bạc" : user.membershipTier === "GOLD" ? "Hạng Vàng" : user.membershipTier === "PLATINUM" ? "Bạch Kim" : "Kim Cương"}</span>
        </Box>
      </Box>

      {/* Points & Tier Info */}
      <Box className="mx-4 -mt-4 bg-white rounded-xl p-4 shadow-sm mb-4">
        <Box flex className="divide-x">
          <Box className="flex-1 text-center">
            <span className="text-2xl font-bold text-teal-600">{user.loyaltyPoints.toLocaleString()}</span>
            <p className="text-xs text-gray-400">Điểm tích lũy</p>
          </Box>
          <Box className="flex-1 text-center">
            <span className="text-2xl font-bold text-teal-600">{user.totalSpent.toLocaleString()}đ</span>
            <p className="text-xs text-gray-400">Tổng chi tiêu</p>
          </Box>
        </Box>
      </Box>

      {/* Menu */}
      <Box className="mx-4 space-y-1 mb-4">
        <MenuItem icon="zi-note" label="Đơn hàng của bạn" />
        <MenuItem icon="zi-ticket" label="Voucher của bạn" />
        <MenuItem icon="zi-star" label="Điểm thưởng" />
        <MenuItem icon="zi-location" label="Sổ địa chỉ" />
        <MenuItem icon="zi-heart" label="Yêu thích" />
        <MenuItem icon="zi-clock" label="Lịch sử mua hàng" />
      </Box>

      <Box className="mx-4 space-y-1 mb-4">
        <MenuItem icon="zi-call" label="Liên hệ" />
        <MenuItem icon="zi-document" label="Điều khoản sử dụng" />
        <MenuItem icon="zi-shield" label="Chính sách bảo mật" />
      </Box>

      <Box className="px-4 pb-4">
        <Button variant="secondary" className="w-full text-red-500" onClick={logout}>Đăng xuất</Button>
      </Box>
    </Box>
  );
}

function MenuItem({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <Box flex alignItems="center" className="bg-white rounded-xl p-4 space-x-3" onClick={onClick}>
      <Icon icon={icon as any} className="text-teal-500" size={20} />
      <span className="flex-1 text-sm">{label}</span>
      <Icon icon="zi-chevron-right" className="text-gray-300" size={16} />
    </Box>
  );
}
