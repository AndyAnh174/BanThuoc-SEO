import React, { useEffect, useState } from "react";
import { Box, Text, Icon, Button, useNavigate } from "zmp-ui";
import { useAppStore } from "@/stores/app.store";
import * as membershipApi from "@/services/membership.api";
import logoImg from "@/static/logo.png";

export default function ProfilePage() {
  const nav = useNavigate();
  const { user, isAuthenticated, login, logout } = useAppStore();

  const [realProfile, setRealProfile] = useState<any>(null);
  const [membershipData, setMembershipData] = useState<any>(null);

  // Fetch real profile & membership data from backend API
  useEffect(() => {
    if (isAuthenticated) {
      membershipApi.getProfile().then((data) => setRealProfile(data)).catch(() => {});
      membershipApi.getMyMembership().then((data) => setMembershipData(data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const tierColors: Record<string, string> = {
    SILVER: "#9ca3af",
    GOLD: "#f59e0b",
    PLATINUM: "#6366f1",
    DIAMOND: "#06b6d4",
  };

  const tierLabels: Record<string, string> = {
    SILVER: "Hạng Bạc",
    GOLD: "Hạng Vàng",
    PLATINUM: "Hạng Bạch Kim",
    DIAMOND: "Hạng Kim Cương",
  };

  const currentTier = realProfile?.membership_tier || membershipData?.tier || user?.membershipTier || "GOLD";
  const tierColor = tierColors[currentTier] || "#f59e0b";
  const points = realProfile?.loyalty_points ?? user?.loyaltyPoints ?? 25000;
  const spent = realProfile?.total_spent ?? user?.totalSpent ?? 3500000;

  return (
    <Box style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Profile Header Banner (Teal Theme) */}
      <Box
        style={{
          background: "linear-gradient(180deg, #064e3b 0%, #0d9488 100%)",
          paddingTop: 50,
          paddingBottom: 24,
          paddingLeft: 16,
          paddingRight: 16,
          color: "white",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 16 }}>
          <Box flex alignItems="center" style={{ gap: 8 }}>
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 2,
                overflow: "hidden",
              }}
            >
              <img src={logoImg} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </Box>
            <Text style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Tài khoản cá nhân</Text>
          </Box>

          <Icon
            icon="zi-settings"
            style={{ color: "white", cursor: "pointer" }}
            size={22}
            onClick={() => alert("Cài đặt tài khoản")}
          />
        </Box>

        {/* User Avatar & Name */}
        <Box flex alignItems="center" style={{ gap: 14 }}>
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: "white",
              border: "2px solid rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0d9488",
              fontSize: 22,
              fontWeight: 800,
              overflow: "hidden",
            }}
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              user?.name?.charAt(0) || "K"
            )}
          </Box>

          <Box style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: 800, color: "white" }}>
              {isAuthenticated ? user?.name : "Khách hàng Ngọc Kim Ngân"}
            </Text>
            <Text style={{ fontSize: 12, color: "#e2e8f0", marginTop: 2 }}>
              {user?.phone || "0901 234 567"}
            </Text>

            {/* Membership Tier Badge */}
            <Box
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(255,255,255,0.2)",
                padding: "2px 10px",
                borderRadius: 12,
                marginTop: 6,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: 800, color: "white" }}>
                👑 {tierLabels[currentTier]}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Profile Content */}
      <Box style={{ padding: 16 }}>
        {/* Loyalty Points & Voucher Stats Card */}
        <Box
          style={{
            background: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            textAlign: "center",
          }}
        >
          <Box onClick={() => alert(`Lịch sử tích điểm: ${points.toLocaleString()} điểm`)} style={{ cursor: "pointer" }}>
            <Text style={{ fontSize: 16, fontWeight: 800, color: "#0d9488" }}>
              {points.toLocaleString()}đ
            </Text>
            <Text style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Điểm thưởng</Text>
          </Box>

          <Box onClick={() => alert("Voucher của bạn")} style={{ cursor: "pointer", borderLeft: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9" }}>
            <Text style={{ fontSize: 16, fontWeight: 800, color: "#ee4d2d" }}>
              3
            </Text>
            <Text style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Voucher sẵn có</Text>
          </Box>

          <Box onClick={() => alert(`Tổng chi tiêu: ${Number(spent).toLocaleString()}đ`)} style={{ cursor: "pointer" }}>
            <Text style={{ fontSize: 16, fontWeight: 800, color: "#ca8a04" }}>
              {(Number(spent) / 1000).toFixed(0)}k
            </Text>
            <Text style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Chi tiêu tháng</Text>
          </Box>
        </Box>

        {/* Orders Status Grid */}
        <Box
          style={{
            background: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              Đơn hàng của tôi
            </Text>
            <Text style={{ fontSize: 12, color: "#0d9488", fontWeight: 700, cursor: "pointer" }} onClick={() => nav("/cart")}>
              Xem lịch sử đơn ›
            </Text>
          </Box>

          <Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, textAlign: "center" }}>
            <Box onClick={() => nav("/cart")} style={{ cursor: "pointer" }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>⏳</Text>
              <Text style={{ fontSize: 11, color: "#334155" }}>Chờ xác nhận</Text>
            </Box>

            <Box onClick={() => nav("/cart")} style={{ cursor: "pointer" }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>🚚</Text>
              <Text style={{ fontSize: 11, color: "#334155" }}>Đang giao</Text>
            </Box>

            <Box onClick={() => nav("/cart")} style={{ cursor: "pointer" }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>✅</Text>
              <Text style={{ fontSize: 11, color: "#334155" }}>Đã giao</Text>
            </Box>

            <Box onClick={() => nav("/cart")} style={{ cursor: "pointer" }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>❌</Text>
              <Text style={{ fontSize: 11, color: "#334155" }}>Đã hủy</Text>
            </Box>
          </Box>
        </Box>

        {/* My Vouchers Section */}
        <Box
          style={{
            background: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
            <Box flex alignItems="center" style={{ gap: 6 }}>
              <Text style={{ fontSize: 18 }}>🎟️</Text>
              <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                Voucher của tôi (3)
              </Text>
            </Box>
            <Text style={{ fontSize: 12, color: "#0d9488", fontWeight: 700, cursor: "pointer" }} onClick={() => nav("/")}>
              Xem thêm ›
            </Text>
          </Box>

          <Box flex flexDirection="column" style={{ gap: 10 }}>
            <Box
              flex
              alignItems="center"
              justifyContent="space-between"
              style={{
                background: "#faf5ff",
                border: "1px dashed #d8b4fe",
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              <Box>
                <Text style={{ fontSize: 13, fontWeight: 800, color: "#7e22ce" }}>
                  🎁 Voucher sản phẩm x10000
                </Text>
                <Text style={{ fontSize: 11, color: "#6b21a8", marginTop: 2 }}>
                  Giảm 20% cho đơn từ 100.000đ • HSD: 31/12/2026
                </Text>
              </Box>
              <Box
                onClick={() => nav("/cart")}
                style={{
                  background: "#7e22ce",
                  color: "white",
                  padding: "5px 14px",
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Dùng ngay
              </Box>
            </Box>

            <Box
              flex
              alignItems="center"
              justifyContent="space-between"
              style={{
                background: "#f0fdf4",
                border: "1px dashed #86efac",
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              <Box>
                <Text style={{ fontSize: 13, fontWeight: 800, color: "#15803d" }}>
                  🚚 Freeship Đơn 0đ
                </Text>
                <Text style={{ fontSize: 11, color: "#166534", marginTop: 2 }}>
                  Miễn phí vận chuyển tối đa 30.000đ • HSD: 31/12/2026
                </Text>
              </Box>
              <Box
                onClick={() => nav("/cart")}
                style={{
                  background: "#15803d",
                  color: "white",
                  padding: "5px 14px",
                  borderRadius: 16,
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Dùng ngay
              </Box>
            </Box>
          </Box>
        </Box>


        {/* Menu Options List */}
        <Box
          style={{
            background: "white",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            marginBottom: 20,
          }}
        >
          <Box
            flex
            alignItems="center"
            justifyContent="space-between"
            style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
            onClick={() => alert("Sổ địa chỉ nhận hàng")}
          >
            <Box flex alignItems="center" style={{ gap: 12 }}>
              <Icon icon="zi-location" style={{ color: "#0d9488" }} size={20} />
              <Text style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                Sổ địa chỉ nhận hàng
              </Text>
            </Box>
            <Icon icon="zi-chevron-right" style={{ color: "#cbd5e1" }} size={16} />
          </Box>

          <Box
            flex
            alignItems="center"
            justifyContent="space-between"
            style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
            onClick={() => nav("/blog")}
          >
            <Box flex alignItems="center" style={{ gap: 12 }}>
              <Icon icon="zi-note" style={{ color: "#0284c7" }} size={20} />
              <Text style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                Tin tức & Kiến thức y tế
              </Text>
            </Box>
            <Icon icon="zi-chevron-right" style={{ color: "#cbd5e1" }} size={16} />
          </Box>

          <Box
            flex
            alignItems="center"
            justifyContent="space-between"
            style={{ padding: "14px 16px", borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
            onClick={() => alert("Hotline tư vấn dược sĩ: 1900 1234")}
          >
            <Box flex alignItems="center" style={{ gap: 12 }}>
              <Icon icon="zi-call" style={{ color: "#16a34a" }} size={20} />
              <Text style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                Tổng đài tư vấn Dược sĩ (1900 1234)
              </Text>
            </Box>
            <Icon icon="zi-chevron-right" style={{ color: "#cbd5e1" }} size={16} />
          </Box>

          <Box
            flex
            alignItems="center"
            justifyContent="space-between"
            style={{ padding: "14px 16px", cursor: "pointer" }}
            onClick={() => alert("Nhà thuốc Ngọc Kim Ngân - Chuẩn GPP")}
          >
            <Box flex alignItems="center" style={{ gap: 12 }}>
              <Icon icon="zi-shield" style={{ color: "#eab308" }} size={20} />
              <Text style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
                Về Nhà thuốc Ngọc Kim Ngân
              </Text>
            </Box>
            <Icon icon="zi-chevron-right" style={{ color: "#cbd5e1" }} size={16} />
          </Box>
        </Box>

        {/* Logout Button */}
        {isAuthenticated ? (
          <Button
            variant="secondary"
            style={{
              width: "100%",
              borderRadius: 24,
              color: "#ef4444",
              background: "#fef2f2",
              border: "1px solid #fecdd3",
              fontWeight: 700,
            }}
            onClick={logout}
          >
            Đăng xuất
          </Button>
        ) : (
          <Button
            variant="primary"
            style={{
              width: "100%",
              borderRadius: 24,
              background: "#0d9488",
              fontWeight: 700,
            }}
            onClick={login}
          >
            Đăng nhập Zalo
          </Button>
        )}
      </Box>
    </Box>
  );
}
