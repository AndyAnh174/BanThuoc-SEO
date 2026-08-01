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
  if (n.includes("otc") || n.includes("thuốc") || n.includes("giảm đau") || n.includes("dị ứng") || n.includes("da liễu") || n.includes("kháng sinh") || n.includes("tim mạch") || n.includes("nội tiết")) return IconOTC;
  if (n.includes("chức năng") || n.includes("tpcn")) return IconTPCN;
  if (n.includes("vitamin") || n.includes("khoáng")) return IconVitamin;
  if (n.includes("mỹ phẩm") || n.includes("dược mỹ") || n.includes("chăm sóc")) return IconDuocMyPham;
  if (n.includes("thiết bị") || n.includes("y tế") || n.includes("tb")) return IconTBYTe;
  if (n.includes("mẹ") || n.includes("bé")) return IconMeBe;
  if (n.includes("combo")) return IconCombo;
  return IconKhac;
}

export default function CategoryPage() {
  const nav = useNavigate();
  const { products } = useAppStore();
  const [selectedCatName, setSelectedCatName] = useState<string>("Tất cả danh mục");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Build dynamic categories list from real products in DB
  const dynamicCategories = useMemo(() => {
    const map: Record<string, number> = {};

    products.forEach((p) => {
      const rawCat = p.category?.name?.trim() || "Khác";
      map[rawCat] = (map[rawCat] || 0) + 1;
    });

    const otherCount = map["Khác"] || 0;
    delete map["Khác"];

    // Main sorted category list
    const mainList = Object.entries(map).map(([name, count]) => ({
      name,
      count,
      icon: getCategoryIcon(name),
      bg: "#ecfdf5",
      color: "#059669",
    }));

    mainList.sort((a, b) => b.count - a.count);

    const list = [
      {
        name: "Tất cả danh mục",
        count: products.length,
        icon: IconKhac,
        bg: "#f1f5f9",
        color: "#475569",
      },
      ...mainList,
    ];

    // Always append "Khác" at the VERY LAST position
    list.push({
      name: "Khác",
      count: otherCount || 0,
      icon: IconKhac,
      bg: "#f8fafc",
      color: "#64748b",
    });

    return list;
  }, [products]);

  const selectedCategoryObj =
    dynamicCategories.find((c) => c.name === selectedCatName) || dynamicCategories[0];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category?.name || "").toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCatName === "Tất cả danh mục") return list;

    if (selectedCatName === "Khác") {
      return list.filter((p) => !p.category?.name || p.category.name.trim() === "Khác");
    }

    return list.filter((p) => {
      const catName = (p.category?.name || "").trim().toLowerCase();
      return catName === selectedCatName.toLowerCase();
    });
  }, [products, selectedCatName, searchQuery]);

  const SelectedIcon = selectedCategoryObj.icon;

  return (
    <Box style={{ background: "#f5f5f5", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header Bar with Search Bar */}
      <Box
        style={{
          padding: "12px 16px 14px 16px",
          paddingTop: 50,
          background: "linear-gradient(180deg, #064e3b 0%, #0d9488 100%)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <Box flex alignItems="center" justifyContent="space-between">
          <Box flex alignItems="center" style={{ gap: 10 }}>
            <Box
              onClick={() => nav("/")}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Icon icon="zi-chevron-left" style={{ color: "white" }} size={20} />
            </Box>
            <Text style={{ fontSize: 17, fontWeight: 800, color: "white" }}>
              Danh mục sản phẩm
            </Text>
          </Box>
          <Text style={{ fontSize: 11, color: "#e2e8f0" }}>
            {dynamicCategories.length - 1} ngành hàng • {products.length} sản phẩm
          </Text>
        </Box>

        {/* Search Bar Input */}
        <Box
          style={{
            background: "white",
            borderRadius: 20,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <Icon icon="zi-search" style={{ color: "#0d9488" }} size={18} />
          <input
            type="text"
            placeholder="Tìm sản phẩm theo tên, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: 12,
              color: "#1e293b",
              background: "transparent",
            }}
          />
          {searchQuery && (
            <Box onClick={() => setSearchQuery("")} style={{ cursor: "pointer", color: "#94a3b8", fontSize: 12 }}>
              ✕
            </Box>
          )}
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
                  Hiển thị {filteredProducts.length} sản phẩm chính hãng
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <Box style={{ background: "white", borderRadius: 14, padding: 24, textAlign: "center", marginTop: 10 }}>
              <Text style={{ fontSize: 32, marginBottom: 6 }}>📦</Text>
              <Text style={{ fontSize: 14, color: "#64748b" }}>Chưa có sản phẩm phù hợp</Text>
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
