import React, { useState, useMemo } from "react";
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

function getCategoryIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("otc") || n.includes("thuốc") || n.includes("giảm đau")) return IconOTC;
  if (n.includes("chức năng") || n.includes("tpcn")) return IconTPCN;
  if (n.includes("vitamin") || n.includes("khoáng")) return IconVitamin;
  if (n.includes("mỹ phẩm") || n.includes("chăm sóc")) return IconDuocMyPham;
  if (n.includes("thiết bị") || n.includes("y tế") || n.includes("tb")) return IconTBYTe;
  if (n.includes("mẹ") || n.includes("bé")) return IconMeBe;
  if (n.includes("combo")) return IconCombo;
  return IconKhac;
}

export default function CategoryPage() {
  const nav = useNavigate();
  const { products } = useAppStore();
  const [selectedCatName, setSelectedCatName] = useState<string>("Tất cả danh mục");

  // Dynamic Categories built directly from products in DB
  const dynamicCategories = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const catName = p.category?.name?.trim() || "Khác";
      map[catName] = (map[catName] || 0) + 1;
    });

    const list = Object.entries(map).map(([name, count]) => ({
      name,
      count,
      icon: getCategoryIcon(name),
      bg: "#ecfdf5",
      color: "#059669",
    }));

    // Sort by product count descending
    list.sort((a, b) => b.count - a.count);

    // Prepend "Tất cả danh mục"
    return [
      {
        name: "Tất cả danh mục",
        count: products.length,
        icon: IconKhac,
        bg: "#f1f5f9",
        color: "#475569",
      },
      ...list,
    ];
  }, [products]);

  const selectedCategoryObj =
    dynamicCategories.find((c) => c.name === selectedCatName) || dynamicCategories[0];

  const filteredProducts = useMemo(() => {
    if (selectedCatName === "Tất cả danh mục") return products;
    return products.filter((p) => {
      const catName = (p.category?.name || "").trim();
      return catName.toLowerCase() === selectedCatName.toLowerCase();
    });
  }, [products, selectedCatName]);

  const SelectedIcon = selectedCategoryObj.icon;

  return (
    <Box style={{ background: "#f5f5f5", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header Bar */}
      <Box
        style={{
          padding: "14px 16px",
          paddingTop: 50,
          background: "linear-gradient(180deg, #064e3b 0%, #0d9488 100%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Icon icon="zi-chevron-left" style={{ color: "white" }} size={20} />
        </Box>
        <Box>
          <Text style={{ fontSize: 18, fontWeight: 800, color: "white" }}>
            Danh mục sản phẩm
          </Text>
          <Text style={{ fontSize: 11, color: "#e2e8f0" }}>
            {dynamicCategories.length - 1} nhóm ngành hàng • {products.length} sản phẩm thực tế
          </Text>
        </Box>
      </Box>

      {/* Main 2-Column Sidebar + Content Layout */}
      <Box style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Left Category Sidebar (Fixed width / Scrollable) */}
        <Box
          className="no-scrollbar"
          style={{
            width: 105,
            background: "white",
            borderRight: "1px solid #e2e8f0",
            overflowY: "auto",
            flexShrink: 0,
            paddingBottom: 85,
          }}
        >
          {dynamicCategories.map((c) => {
            const isSelected = c.name === selectedCatName;
            const IconComp = c.icon;
            return (
              <Box
                key={c.name}
                onClick={() => setSelectedCatName(c.name)}
                style={{
                  padding: "12px 6px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  background: isSelected ? "#ecfdf5" : "transparent",
                  borderLeft: isSelected ? "4px solid #059669" : "4px solid transparent",
                  transition: "all 0.2s",
                }}
              >
                <Box
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    background: isSelected ? "white" : c.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isSelected ? "0 2px 6px rgba(5, 150, 105, 0.15)" : "none",
                  }}
                >
                  <IconComp size={20} color={c.color} />
                </Box>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? "#059669" : "#475569",
                    textAlign: "center",
                    lineHeight: "1.25",
                  }}
                >
                  {c.name}
                </Text>
                {c.name !== "Tất cả danh mục" && (
                  <Text style={{ fontSize: 9, color: "#94a3b8" }}>({c.count})</Text>
                )}
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
              <SelectedIcon size={24} color={selectedCategoryObj.color} />
              <Box>
                <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
                  {selectedCategoryObj.name}
                </Text>
                <Text style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>
                  Hiển thị tất cả {filteredProducts.length} sản phẩm chính hãng
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <Box style={{ background: "white", borderRadius: 14, padding: 24, textAlign: "center", marginTop: 10 }}>
              <Text style={{ fontSize: 32, marginBottom: 6 }}>📦</Text>
              <Text style={{ fontSize: 14, color: "#64748b" }}>Chưa có sản phẩm nào cho danh mục này</Text>
            </Box>
          ) : (
            <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {filteredProducts.map((p, k) => (
                <ShopeeProductCard
                  key={p.id || k}
                  product={p}
                  discountPercentage={20 + (k % 4) * 5}
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
