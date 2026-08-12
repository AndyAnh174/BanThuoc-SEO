import React, { useState, useEffect } from "react";
import { Box, Text } from "zmp-ui";
import * as membershipApi from "@/services/membership.api";

export interface VoucherItem {
  id: string | number;
  code: string;
  name: string;
  condition: string;
  discountText: string;
  claimed?: boolean;
}

const DEFAULT_VOUCHERS: VoucherItem[] = [
  {
    id: 1,
    code: "NGOCKIMNGAN20K",
    name: "Voucher sản phẩm x10000",
    condition: "cho sản phẩm trên 100.000đ",
    discountText: "Giảm 20%",
  },
  {
    id: 2,
    code: "FREESHIP0D",
    name: "Freeship Đơn 0đ",
    condition: "tối đa 30.000đ",
    discountText: "Freeship 0đ",
  },
  {
    id: 3,
    code: "TPCN50K",
    name: "Voucher Thuốc TPCN",
    condition: "cho đơn từ 300.000đ",
    discountText: "Giảm 50k",
  },
];

// Small FontAwesome fa-gift style SVG icon
const GiftIcon = ({ size = 15, color = "#0d9488" }: { size?: number; color?: string }) => (

  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

export function VoucherBar() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>(DEFAULT_VOUCHERS);
  const [claimedIds, setClaimedIds] = useState<Record<string | number, boolean>>({});

  // Fetch real available vouchers from API
  useEffect(() => {
    membershipApi
      .getAvailableVouchers()
      .then((data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: VoucherItem[] = data.map((v: any) => ({
            id: v.id || v.code,
            code: v.code,
            name: v.name || `Voucher ${v.code}`,
            condition: v.min_order_value ? `cho đơn từ ${Number(v.min_order_value).toLocaleString()}đ` : "Cho mọi đơn hàng",
            discountText: v.discount_type === "PERCENTAGE" ? `Giảm ${v.discount_value}%` : `Giảm ${Number(v.discount_value).toLocaleString()}đ`,
          }));
          setVouchers(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleClaim = (id: string | number) => {
    setClaimedIds((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <Box style={{ padding: "8px 16px 4px 16px", background: "transparent" }}>
      <Box
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {vouchers.map((v) => {
          const isClaimed = claimedIds[v.id];
          return (
            <Box key={v.id} className="voucher-ticket-img3">
              {/* Voucher Information */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                {/* Title Line with Small Gift Icon */}
                <Box flex alignItems="center" style={{ gap: 6 }}>
                  <GiftIcon size={15} color="#0d9488" />
                  <Text style={{ fontSize: 13, fontWeight: 800, color: "#0f766e", truncate: true }}>
                    {v.name}
                  </Text>
                </Box>

                {/* Subtitle & Discount Badge Line */}
                <Box flex alignItems="center" style={{ gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: "#64748b" }}>{v.condition}</Text>
                  <Box
                    style={{
                      background: "#fff0f0",
                      padding: "1px 6px",
                      borderRadius: 4,
                      border: "1px solid #ffd8d8",
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: 800, color: "#ee4d2d" }}>
                      {v.discountText}
                    </Text>
                  </Box>
                </Box>
              </Box>

              {/* Green Teal Pill Action Button: Nhận */}
              <Box
                onClick={() => handleClaim(v.id)}
                style={{
                  background: isClaimed ? "#cbd5e1" : "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                  color: isClaimed ? "#475569" : "white",
                  padding: "6px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: isClaimed ? "default" : "pointer",
                  flexShrink: 0,
                  boxShadow: isClaimed ? "none" : "0 3px 10px rgba(13, 148, 136, 0.35)",
                  transition: "all 0.2s",
                }}
              >
                {isClaimed ? "Đã nhận" : "Nhận"}
              </Box>

            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
