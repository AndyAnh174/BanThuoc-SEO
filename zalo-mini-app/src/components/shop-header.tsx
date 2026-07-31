import React from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import logoImg from "@/static/logo.png";

interface ShopHeaderProps {
  onSearchClick?: () => void;
  cartCount?: number;
}

export function ShopHeader({ onSearchClick, cartCount = 0 }: ShopHeaderProps) {
  const nav = useNavigate();

  return (
    <Box className="shopee-shop-header" style={{ paddingLeft: 16, paddingRight: 16 }}>
      {/* Top Bar with Shop Logo & Info & Action Buttons */}
      <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 14 }}>
        <Box flex alignItems="center" style={{ gap: 12 }}>
          {/* Official Logo / Shop Avatar */}
          <Box
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              background: "#ffffff",
              border: "2px solid rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              flexShrink: 0,
              padding: 2,
              overflow: "hidden",
            }}
          >
            <img src={logoImg} alt="Ngọc Kim Ngân Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </Box>

          {/* Shop Meta Details */}
          <Box>
            <Text style={{ color: "white", fontSize: 17, fontWeight: 800, letterSpacing: "0.2px" }}>
              Ngọc Kim Ngân
            </Text>
            <Text style={{ color: "#94a3b8", fontSize: 11, marginTop: 1 }}>
              Nhà thuốc chuẩn GPP • Thuốc tốt giá tốt
            </Text>
            <Box flex alignItems="center" style={{ gap: 6, marginTop: 4 }}>
              {/* Badge Gian Hàng Chính Hãng */}
              <Box
                style={{
                  background: "rgba(238, 77, 45, 0.2)",
                  border: "1px solid rgba(238, 77, 45, 0.6)",
                  padding: "1px 6px",
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: "#ff8c75", fontSize: 10, fontWeight: 700 }}>
                  Gian hàng chính hãng
                </Text>
              </Box>

              {/* Location Badge */}
              <Box flex alignItems="center" style={{ gap: 2 }}>
                <Icon icon="zi-location" style={{ color: "#22c55e" }} size={12} />
                <Text style={{ color: "#cbd5e1", fontSize: 10 }}>Toàn Quốc</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Action Buttons: + Follow OA & Nhắn tin */}
        <Box flex flexDirection="column" style={{ gap: 6 }}>
          <Box
            flex
            alignItems="center"
            style={{
              background: "white",
              color: "#0f172a",
              padding: "5px 12px",
              borderRadius: 20,
              gap: 4,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
            }}
            onClick={() => alert("Đã quan tâm Zalo Official Account Ngọc Kim Ngân Pharmacy!")}
          >
            <Text style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>+ Follow OA</Text>
          </Box>

          <Box
            flex
            alignItems="center"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "5px 12px",
              borderRadius: 20,
              gap: 4,
              cursor: "pointer",
            }}
            onClick={() => nav("/profile")}
          >
            <Icon icon="zi-chat" style={{ color: "white" }} size={14} />
            <Text style={{ fontSize: 12, fontWeight: 600, color: "white" }}>Nhắn tin</Text>
          </Box>
        </Box>
      </Box>

      {/* Search Input Bar */}
      <Box
        onClick={onSearchClick || (() => nav("/search"))}
        flex
        alignItems="center"
        justifyContent="space-between"
        style={{
          background: "white",
          borderRadius: 24,
          padding: "10px 16px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          cursor: "pointer",
        }}
      >
        <Box flex alignItems="center" style={{ gap: 8 }}>
          <Icon icon="zi-search" style={{ color: "#ee4d2d" }} size={18} />
          <Text style={{ color: "#94a3b8", fontSize: 13 }}>Tìm tên thuốc, bệnh lý, triệu chứng...</Text>
        </Box>

        <Box style={{ position: "relative" }} onClick={(e) => { e.stopPropagation(); nav("/cart"); }}>
          <Icon icon="zi-cart" style={{ color: "#334155" }} size={22} />
          {cartCount > 0 && (
            <Box
              style={{
                position: "absolute",
                top: -6,
                right: -8,
                background: "#ee4d2d",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 10,
                padding: "1px 5px",
                minWidth: 16,
                textAlign: "center",
              }}
            >
              {cartCount}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
