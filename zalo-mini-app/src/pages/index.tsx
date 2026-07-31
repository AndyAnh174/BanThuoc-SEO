import React, { useRef, useEffect, useState, useMemo } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { useAppStore, Product } from "@/stores/app.store";
import * as bannersApi from "@/services/banners.api";
import * as flashsaleApi from "@/services/flashsale.api";
import { ShopHeader } from "@/components/shop-header";
import { VoucherBar } from "@/components/voucher-bar";
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
  IconDonHang,
  IconVoucher,
  IconDiemThuong,
  IconChatDuocSi,
} from "@/components/category-icons";

type MainTab = "home" | "products" | "categories";
type SortFilter = "recommend" | "bestseller" | "newest" | "price_asc" | "price_desc";

const CATEGORY_SHORTCUTS = [
  { n: "OTC", icon: IconOTC, bg: "#ecfdf5", color: "#059669" },
  { n: "TPCN", icon: IconTPCN, bg: "#ecfdf5", color: "#059669" },
  { n: "Vitamin", icon: IconVitamin, bg: "#ecfdf5", color: "#059669" },
  { n: "D.MỹPhẩm", icon: IconDuocMyPham, bg: "#ecfdf5", color: "#059669" },
  { n: "TB Y Tế", icon: IconTBYTe, bg: "#ecfdf5", color: "#059669" },
  { n: "Mẹ & Bé", icon: IconMeBe, bg: "#ecfdf5", color: "#059669" },
  { n: "Combo", icon: IconCombo, bg: "#ecfdf5", color: "#059669" },
  { n: "Khác", icon: IconKhac, bg: "#ecfdf5", color: "#059669" },
];

const QUICK_ACTIONS = [
  { n: "Đơn hàng", d: "Xem đơn & theo dõi", icon: IconDonHang, nav: "/cart", bg: "#f0fdf4" },
  { n: "Voucher", d: "Ưu đãi & khuyến mãi", icon: IconVoucher, nav: "/profile", bg: "#f0fdfa" },
  { n: "Điểm thưởng", d: "Tích điểm & đổi quà", icon: IconDiemThuong, nav: "/profile", bg: "#fefce8" },
  { n: "Chat dược sĩ", d: "Tư vấn & hỗ trợ", icon: IconChatDuocSi, nav: "/profile", bg: "#f0fdf4" },
];

function useAutoScroll(n: number, ms: number) {
  const [i, setI] = useState(0);
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms]);

  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, [i]);

  return { r, i };
}

function useCountdown(endTime: string | null) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    if (!endTime) {
      setLeft("");
      return;
    }
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setLeft("00:00:00");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [endTime]);

  return left;
}

export default function HomePage() {
  const nav = useNavigate();
  const { products, loadProducts, cartCount } = useAppStore();

  const [activeMainTab, setActiveMainTab] = useState<MainTab>("home");
  const [activeSort, setActiveSort] = useState<SortFilter>("recommend");
  const [isListView, setIsListView] = useState(false);

  // Real API data
  const [heroBanners, setHeroBanners] = useState<bannersApi.BannerItem[]>([]);
  const [flashSale, setFlashSale] = useState<flashsaleApi.FlashSaleResponse | null>(null);

  const bannerScroll = useAutoScroll(heroBanners.length || 1, 4000);
  const countdown = useCountdown(flashSale?.current_session?.end_time || null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    bannersApi
      .getHeroBanners()
      .then((data) => setHeroBanners(Array.isArray(data) ? data : []))
      .catch(() => {});

    flashsaleApi
      .getActiveFlashSale()
      .then((data) => {
        if (data) setFlashSale(data);
      })
      .catch(() => {});
  }, []);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Filtered and Sorted products list with smart category matching
  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (selectedCategoryFilter) {
      const f = selectedCategoryFilter.toLowerCase();
      list = list.filter((p) => {
        const catName = (p.category?.name || "").toLowerCase();
        const catSlug = (p.category?.slug || "").toLowerCase();
        const prodName = (p.name || "").toLowerCase();

        if (f === "otc") {
          return catName.includes("thuốc") || catName.includes("otc") || catSlug.includes("otc") || prodName.includes("thuốc");
        }
        if (f === "tpcn") {
          return catName.includes("thực phẩm") || catName.includes("tpcn") || catSlug.includes("tpcn") || prodName.includes("vitamin") || prodName.includes("siro");
        }
        if (f.includes("mỹ phẩm")) {
          return catName.includes("mỹ phẩm") || catSlug.includes("my-pham") || prodName.includes("kem") || prodName.includes("sữa");
        }
        if (f.includes("mẹ")) {
          return catName.includes("mẹ") || catSlug.includes("me-be") || prodName.includes("bé") || prodName.includes("sữa");
        }
        return catName.includes(f) || f.includes(catName) || catSlug.includes(f) || prodName.includes(f);
      });
    }

    if (activeSort === "bestseller") {
      return list.sort((a, b) => (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0));
    }
    if (activeSort === "newest") {
      return list.reverse();
    }
    if (activeSort === "price_asc") {
      return list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    }
    if (activeSort === "price_desc") {
      return list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    }
    return list; // "recommend"
  }, [products, activeSort, selectedCategoryFilter]);

  const handleCategoryClick = (catName: string) => {
    if (catName === "Khác" || catName === "Tất cả") {
      setSelectedCategoryFilter(null);
    } else {
      setSelectedCategoryFilter(catName);
    }
    setActiveMainTab("products");
  };



  // Group products by category for 'Danh mục' tab
  const categoriesWithProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.forEach((p) => {
      const catName = p.category?.name || "Khác";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(p);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [products]);

  const togglePriceSort = () => {
    if (activeSort === "price_asc") {
      setActiveSort("price_desc");
    } else {
      setActiveSort("price_asc");
    }
  };

  return (
    <Box style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ── SHOPEE SHOP HEADER WITH LOGO ── */}
      <ShopHeader cartCount={cartCount()} />

      {/* ── VOUCHER CAROUSEL BAR WITH DARK TEAL HEADER BACKGROUND ── */}
      <Box style={{ background: "#064e3b", paddingBottom: 6 }}>
        <VoucherBar />
      </Box>


      {/* ── TOP MAIN NAVIGATION TABS ── */}
      <Box
        style={{
          background: "white",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderBottom: "1px solid #f1f5f9",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box
          className={`shopee-nav-tab ${activeMainTab === "home" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategoryFilter(null);
            setActiveMainTab("home");
          }}
        >
          Trang chủ
        </Box>


        <Box
          className={`shopee-nav-tab ${activeMainTab === "products" ? "active" : ""}`}
          onClick={() => setActiveMainTab("products")}
        >
          Sản phẩm
        </Box>

        <Box
          className={`shopee-nav-tab ${activeMainTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveMainTab("categories")}
        >
          Danh mục
        </Box>
      </Box>

      {/* ── SUB-FILTER & SORT BAR ── */}
      {(activeMainTab === "products" || activeMainTab === "home") && (
        <Box
          flex
          justifyContent="space-between"
          alignItems="center"
          style={{
            background: "white",
            padding: "0 16px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <Box flex alignItems="center" className="no-scrollbar" style={{ overflowX: "auto", gap: 4 }}>
            <Box
              className={`shopee-filter-item ${activeSort === "recommend" ? "active" : ""}`}
              onClick={() => setActiveSort("recommend")}
            >
              Đề xuất
            </Box>

            <Box
              className={`shopee-filter-item ${activeSort === "bestseller" ? "active" : ""}`}
              onClick={() => setActiveSort("bestseller")}
            >
              Bán chạy
            </Box>

            <Box
              className={`shopee-filter-item ${activeSort === "newest" ? "active" : ""}`}
              onClick={() => setActiveSort("newest")}
            >
              Hàng mới
            </Box>

            <Box
              className={`shopee-filter-item ${
                activeSort === "price_asc" || activeSort === "price_desc" ? "active" : ""
              }`}
              onClick={togglePriceSort}
              flex
              alignItems="center"
              style={{ gap: 2 }}
            >
              <span>Giá</span>
              <span style={{ fontSize: 11 }}>
                {activeSort === "price_asc" ? "↑" : activeSort === "price_desc" ? "↓" : "↕"}
              </span>
            </Box>
          </Box>

          {/* Grid vs List View Toggle */}
          <Box
            onClick={() => setIsListView(!isListView)}
            style={{
              padding: "8px 0 8px 12px",
              borderLeft: "1px solid #f1f5f9",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <Icon icon={isListView ? "zi-list-1" : "zi-home"} size={18} />
          </Box>
        </Box>
      )}

      {/* ── TAB CONTENT: TRANG CHỦ ── */}
      {activeMainTab === "home" && (
        <Box style={{ padding: "12px 16px" }}>
          {/* Hero Banner Carousel */}
          {heroBanners.length > 0 && (
            <Box style={{ marginBottom: 14 }}>
              <Box
                ref={bannerScroll.r}
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "hidden",
                  scrollBehavior: "smooth",
                  borderRadius: 14,
                }}
              >
                {heroBanners.map((b, k) => (
                  <Box
                    key={b.id || k}
                    onClick={() => (b.link_url ? nav(b.link_url) : undefined)}
                    style={{
                      minWidth: "100%",
                      height: 125,
                      borderRadius: 14,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "16px 20px",
                      color: "white",
                      flexShrink: 0,
                      position: "relative",
                      overflow: "hidden",
                      background: b.color_start
                        ? `linear-gradient(135deg, ${b.color_start}, ${b.color_end || b.color_start})`
                        : `url(${b.image_url}) center/cover, linear-gradient(135deg, #0d9488, #0f766e)`,
                    }}
                  >
                    {b.image_url && b.color_start && (
                      <img
                        src={b.image_url}
                        alt={b.title}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          opacity: 0.6,
                        }}
                      />
                    )}
                    <Text style={{ color: "white", fontSize: 18, fontWeight: 800, position: "relative", zIndex: 1 }}>
                      {b.title}
                    </Text>
                    {b.subtitle && (
                      <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, position: "relative", zIndex: 1 }}>
                        {b.subtitle}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Quick Actions 2x2 Grid (Matching reference image) */}
          <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {QUICK_ACTIONS.map((a, k) => {
              const IconComp = a.icon;
              return (
                <Box
                  key={k}
                  onClick={() => nav(a.nav)}
                  flex
                  alignItems="center"
                  style={{
                    background: "white",
                    borderRadius: 16,
                    padding: "14px 16px",
                    gap: 12,
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    cursor: "pointer",
                  }}
                >
                  <Box
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: a.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={24} />
                  </Box>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{a.n}</Text>
                    <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{a.d}</Text>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* 8 Category Icons Grid (Exact match with reference image) */}
          <Box
            style={{
              background: "white",
              borderRadius: 16,
              padding: "16px 12px",
              marginBottom: 16,
              border: "1px solid #f1f5f9",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: 800, color: "#064e3b", marginBottom: 14 }}>
              Danh mục sản phẩm
            </Text>

            <Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {CATEGORY_SHORTCUTS.map((c, k) => {
                const IconComp = c.icon;
                return (
                  <Box
                    key={k}
                    onClick={() => handleCategoryClick(c.n)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}
                  >
                    <Box
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 18,
                        background: c.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #d1fae5",
                        boxShadow: "0 2px 6px rgba(5, 150, 105, 0.08)",
                      }}
                    >
                      <IconComp size={28} color={c.color} />
                    </Box>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: "#374151", textAlign: "center" }}>
                      {c.n}
                    </Text>
                  </Box>
                );
              })}
            </Box>

          </Box>

          {/* Flash Sale Banner */}
          {flashSale?.current_session && flashSale.featured_items.length > 0 && (
            <Box
              style={{
                background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)",
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
                border: "1px solid #fecdd3",
              }}
            >
              <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
                <Box flex alignItems="center" style={{ gap: 6 }}>
                  <Text style={{ fontSize: 16, fontWeight: 800, color: "#ee4d2d" }}>
                    ⚡ FLASH SALE
                  </Text>
                </Box>
                {countdown && (
                  <Box
                    style={{
                      background: "#ee4d2d",
                      color: "white",
                      padding: "3px 8px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {countdown}
                  </Box>
                )}
              </Box>

              <Box className="no-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto" }}>
                {flashSale.featured_items.map((item, k) => {
                  const p = item.product;
                  return (
                    <Box
                      key={item.id || k}
                      onClick={() => nav("/product/" + p.slug)}
                      style={{
                        background: "white",
                        borderRadius: 10,
                        padding: 8,
                        minWidth: 130,
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {item.discount_percentage > 0 && (
                        <Box className="shopee-discount-badge">
                          -{item.discount_percentage}%
                        </Box>
                      )}
                      <Box
                        style={{
                          height: 70,
                          background: "#f8fafc",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 6,
                          overflow: "hidden",
                        }}
                      >
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                          />
                        ) : (
                          <Icon icon="zi-home" style={{ color: "#ee4d2d" }} size={24} />
                        )}
                      </Box>
                      <Text style={{ fontSize: 11, fontWeight: 600, truncate: true }}>{p.name}</Text>
                      <Text style={{ color: "#ee4d2d", fontWeight: 800, fontSize: 13, marginTop: 4 }}>
                        {item.flash_sale_price}đ
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Shopee Style Product Grid Section */}
          <Box style={{ marginBottom: 12 }}>
            <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 10 }}>
              <Box>
                <Text style={{ fontSize: 17, fontWeight: 800, color: "#064e3b" }}>
                  Sản phẩm nổi bật 🍃
                </Text>
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>
                  (*) Sản phẩm được đề xuất bởi Nhà thuốc
                </Text>
              </Box>

              <Text
                style={{ fontSize: 12, color: "#0d9488", fontWeight: 700, cursor: "pointer" }}
                onClick={() => setActiveMainTab("products")}
              >
                Xem tất cả ›
              </Text>
            </Box>

            <Box
              style={{
                display: isListView ? "flex" : "grid",
                flexDirection: isListView ? "column" : undefined,
                gridTemplateColumns: isListView ? undefined : "1fr 1fr",
                gap: 10,
              }}
            >
              {sortedProducts.map((p, k) => (
                <ShopeeProductCard
                  key={p.id || k}
                  product={p}
                  discountPercentage={30 + (k % 4) * 5}
                  salesCount={`${1.2 + (k % 5) * 0.4}k`}
                  rating={4.8 + (k % 3) * 0.1}
                  isListMode={isListView}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── TAB CONTENT: SẢN PHẨM ── */}
      {activeMainTab === "products" && (
        <Box style={{ padding: "12px 16px" }}>
          {selectedCategoryFilter && (
            <Box
              flex
              alignItems="center"
              justifyContent="space-between"
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                padding: "8px 12px",
                borderRadius: 12,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>
                📂 Đang lọc: {selectedCategoryFilter}
              </Text>
              <Text
                style={{ fontSize: 12, fontWeight: 800, color: "#059669", cursor: "pointer" }}
                onClick={() => setSelectedCategoryFilter(null)}
              >
                ✕ Xem tất cả
              </Text>
            </Box>
          )}

          <Text style={{ fontSize: 14, color: "#64748b", marginBottom: 10 }}>
            Hiển thị {sortedProducts.length} sản phẩm chính hãng
          </Text>


          <Box
            style={{
              display: isListView ? "flex" : "grid",
              flexDirection: isListView ? "column" : undefined,
              gridTemplateColumns: isListView ? undefined : "1fr 1fr",
              gap: 10,
            }}
          >
            {sortedProducts.map((p, k) => (
              <ShopeeProductCard
                key={p.id || k}
                product={p}
                discountPercentage={25 + (k % 5) * 5}
                salesCount={`${1.0 + (k % 8) * 0.3}k`}
                rating={4.9}
                isListMode={isListView}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* ── TAB CONTENT: DANH MỤC ── */}
      {activeMainTab === "categories" && (
        <Box style={{ padding: "12px 16px" }}>
          <Text style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
            TẤT CẢ DANH MỤC NỔI BẬT
          </Text>

          <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {categoriesWithProducts.map(([catName, catProds], i) => (
              <Box
                key={catName}
                onClick={() => handleCategoryClick(catName)}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: 14,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 110,
                  cursor: "pointer",
                }}
              >
                <Box flex justifyContent="space-between" alignItems="flex-start">
                  <Text style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{catName}</Text>
                  <Box
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 10,
                    }}
                  >
                    {catProds.length} sp
                  </Box>
                </Box>

                <Box flex alignItems="center" justifyContent="space-between" style={{ marginTop: 12 }}>
                  <Text style={{ fontSize: 12, color: "#64748b" }}>Xem sản phẩm</Text>
                  <Icon icon="zi-chevron-right" style={{ color: "#0d9488" }} size={16} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
