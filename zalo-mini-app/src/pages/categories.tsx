import React, { useState } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { useAppStore } from "@/stores/app.store";
import { ShopeeProductCard } from "@/components/shopee-product-card";
import {
  IconOTC,
  IconTPCN,
  IconVitamin,
  IconDuocMyPham,
  IconTBYTe,
  IconMeBe,
  IconCombo,
  IconKhac,
} from "@/components/category-icons";

const MAIN_CATEGORIES = [
  { id: "all", name: "Tất cả danh mục", icon: IconKhac, bg: "#f1f5f9", color: "#475569" },
  { id: "giam-dau", name: "Thuốc OTC", icon: IconOTC, bg: "#ecfdf5", color: "#059669" },
  { id: "tpcn", name: "Thực phẩm chức năng", icon: IconTPCN, bg: "#ecfdf5", color: "#059669" },
  { id: "vitamin", name: "Vitamin & Khoáng chất", icon: IconVitamin, bg: "#ecfdf5", color: "#059669" },
  { id: "duoc-my-pham", name: "Dược Mỹ Phẩm", icon: IconDuocMyPham, bg: "#ecfdf5", color: "#059669" },
  { id: "tb-yt", name: "Thiết Bị Y Tế", icon: IconTBYTe, bg: "#ecfdf5", color: "#059669" },
  { id: "me-be", name: "Mẹ & Bé", icon: IconMeBe, bg: "#ecfdf5", color: "#059669" },
  { id: "combo", name: "Combo Ưu Đãi", icon: IconCombo, bg: "#ecfdf5", color: "#059669" },
];

export default function CategoryPage() {
  const nav = useNavigate();
  const { products } = useAppStore();
  const [selectedCatId, setSelectedCatId] = useState<string>("all");

  const selectedCat = MAIN_CATEGORIES.find((c) => c.id === selectedCatId) || MAIN_CATEGORIES[0];

  const filteredProducts = selectedCatId === "all"
    ? products
    : products.filter((p) => {
        const catName = (p.category?.name || "").toLowerCase();
        const catSlug = (p.category?.slug || "").toLowerCase();
        return (
          catName.includes(selectedCat.name.toLowerCase()) ||
          catSlug.includes(selectedCatId) ||
          selectedCat.name.includes(catName)
        );
      });

  return (
    <Box style={{ background: "#f5f5f5", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header Bar */}
      <Box
        style={{
          padding: "14px 16px",
          paddingTop: 50,
          background: "white",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <Box
          onClick={() => nav("/")}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Icon icon="zi-chevron-left" style={{ color: "#334155" }} size={20} />
        </Box>
        <Box>
          <Text style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Danh mục sản phẩm
          </Text>
          <Text style={{ fontSize: 11, color: "#94a3b8" }}>
            {MAIN_CATEGORIES.length - 1} nhóm ngành hàng • {products.length} sản phẩm
          </Text>
        </Box>
      </Box>

      {/* Main 2-Column Sidebar + Content Layout */}
      <Box style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Left Category Sidebar (Fixed / Independently scrollable) */}
        <Box
          className="no-scrollbar"
          style={{
            width: 100,
            background: "white",
            borderRight: "1px solid #e2e8f0",
            overflowY: "auto",
            flexShrink: 0,
            paddingBottom: 80,
          }}
        >
          {MAIN_CATEGORIES.map((c) => {
            const isSelected = c.id === selectedCatId;
            const IconComp = c.icon;
            return (
              <Box
                key={c.id}
                onClick={() => setSelectedCatId(c.id)}
                style={{
                  padding: "14px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  background: isSelected ? "#ecfdf5" : "transparent",
                  borderLeft: isSelected ? "4px solid #059669" : "4px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <Box
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    background: isSelected ? "white" : c.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected ? "0 2px 6px rgba(5, 150, 105, 0.15)" : "none",
                  }}
                >
                  <IconComp size={22} color={c.color} />
                </Box>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? "#059669" : "#475569",
                    textAlign: "center",
                    lineHeight: "1.2",
                  }}
                >
                  {c.name}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Right Category Product Grid (Scrollable) */}
        <Box className="no-scrollbar" style={{ flex: 1, padding: 12, overflowY: "auto", paddingBottom: 90 }}>
          {/* Active Category Header Card */}
          <Box
            style={{
              background: "white",
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <Box flex alignItems="center" style={{ gap: 10 }}>
              {React.createElement(selectedCat.icon, { size: 24, color: selectedCat.color })}
              <Box>
                <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                  {selectedCat.name}
                </Text>
                <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                  {filteredProducts.length} sản phẩm có sẵn
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <Box style={{ background: "white", borderRadius: 14, padding: 24, textAlign: "center", marginTop: 10 }}>
              <Text style={{ fontSize: 32, marginBottom: 6 }}>📦</Text>
              <Text style={{ fontSize: 14, color: "#64748b" }}>Đang cập nhật sản phẩm cho nhóm này</Text>
            </Box>
          ) : (
            <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {filteredProducts.map((p, k) => (
                <ShopeeProductCard
                  key={p.id || k}
                  product={p}
                  discountPercentage={30}
                  salesCount="1.2k"
                  rating={4.9}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
