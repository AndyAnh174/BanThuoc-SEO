import React, { useRef, useEffect, useState, useMemo } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { useAppStore, formatPrice, Product } from "@/stores/app.store";
import * as bannersApi from "@/services/banners.api";
import * as flashsaleApi from "@/services/flashsale.api";

const SHORTCUTS = [
  { n: "OTC", i: "zi-home" }, { n: "TPCN", i: "zi-heart" }, { n: "Vitamin", i: "zi-star" }, { n: "D.MỹPhẩm", i: "zi-calendar" },
  { n: "TB Y Tế", i: "zi-location" }, { n: "Mẹ & Bé", i: "zi-heart" }, { n: "Combo", i: "zi-star" }, { n: "Khác", i: "zi-list-1" },
];

const QUICK_ACTIONS = [
  { n: "Đơn hàng", i: "zi-note", c: "#f97316", bg: "#fff7ed" },
  { n: "Voucher", i: "zi-star", c: "#06b6d4", bg: "#ecfeff" },
  { n: "Điểm thưởng", i: "zi-star", c: "#eab308", bg: "#fefce8" },
  { n: "Chat dược sĩ", i: "zi-chat", c: "#0d9488", bg: "#ccfbf1" },
];

const STOCK_STATUS = (q: number) =>
  q > 20 ? { c: "#16a34a", b: "#dcfce7", t: `Còn ${q}` } :
  q > 0 ? { c: "#ea580c", b: "#fff7ed", t: `Sắp hết` } :
  { c: "#dc2626", b: "#fef2f2", t: "Hết hàng" };

const CATEGORY_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  "Giảm đau kháng viêm": { icon: "💊", color: "#dc2626", bg: "#fef2f2" },
  "Chống dị ứng": { icon: "🤧", color: "#7c3aed", bg: "#f5f3ff" },
  "Cơ xương khớp": { icon: "🦴", color: "#ea580c", bg: "#fff7ed" },
  "Tim mạch": { icon: "❤️", color: "#ef4444", bg: "#fef2f2" },
  "Tiêu hóa": { icon: "🫄", color: "#16a34a", bg: "#f0fdf4" },
  "Hô hấp": { icon: "🫁", color: "#0891b2", bg: "#ecfeff" },
  "Thần kinh": { icon: "🧠", color: "#9333ea", bg: "#faf5ff" },
  "Nội tiết": { icon: "⚡", color: "#ca8a04", bg: "#fefce8" },
  "Da liễu": { icon: "✨", color: "#db2777", bg: "#fdf2f8" },
  "Tiết niệu": { icon: "💧", color: "#2563eb", bg: "#eff6ff" },
  "Vitamin": { icon: "🌟", color: "#f59e0b", bg: "#fffbeb" },
  "Thực phẩm chức năng": { icon: "🌿", color: "#059669", bg: "#ecfdf5" },
  "Dược mỹ phẩm": { icon: "💄", color: "#be185d", bg: "#fdf2f8" },
  "Thiết bị y tế": { icon: "🩺", color: "#4f46e5", bg: "#eef2ff" },
  "Mẹ và bé": { icon: "👶", color: "#f97316", bg: "#fff7ed" },
};

function getCatStyle(name: string) {
  for (const [key, style] of Object.entries(CATEGORY_STYLES)) {
    if (name.includes(key) || key.includes(name)) return style;
  }
  const defaults = [
    { icon: "📦", color: "#0d9488", bg: "#ccfbf1" },
    { icon: "🏷️", color: "#6366f1", bg: "#eef2ff" },
    { icon: "🔖", color: "#059669", bg: "#ecfdf5" },
  ];
  return defaults[name.length % defaults.length];
}

function useAutoScroll(n: number, ms: number) {
  const [i, setI] = useState(0);
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => { if (n <= 1) return; const t = setInterval(() => setI(p => (p + 1) % n), ms); return () => clearInterval(t); }, [n, ms]);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, [i]);
  return { r, i };
}

// Countdown hook
function useCountdown(endTime: string | null) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    if (!endTime) { setLeft(""); return; }
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setLeft("00:00:00"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [endTime]);
  return left;
}

export default function HomePage() {
  const nav = useNavigate();
  const { isAuthenticated, user, products, loadProducts } = useAppStore();

  // Real API data
  const [heroBanners, setHeroBanners] = useState<bannersApi.BannerItem[]>([]);
  const [rowBanners, setRowBanners] = useState<bannersApi.BannerItem[]>([]);
  const [flashSale, setFlashSale] = useState<flashsaleApi.FlashSaleResponse | null>(null);

  const bannerScroll = useAutoScroll(heroBanners.length || 1, 4000);
  const flashScroll = useAutoScroll(flashSale?.featured_items?.length || 1, 3000);
  const countdown = useCountdown(flashSale?.current_session?.end_time || null);

  useEffect(() => { loadProducts(); }, []);

  // Fetch all homepage data
  useEffect(() => {
    // Banners
    bannersApi.getHeroBanners().then(data => setHeroBanners(Array.isArray(data) ? data : [])).catch(() => {});
    bannersApi.getRowBanners().then(data => setRowBanners(Array.isArray(data) ? data : [])).catch(() => {});

    // Flash Sale
    flashsaleApi.getActiveFlashSale().then(data => {
      if (data) setFlashSale(data);
    }).catch(() => {});

  }, []);

  // Group products by category
  const categoriesWithProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.forEach(p => {
      const catName = p.category?.name || "Khác";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(p);
    });
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [products]);

  const tierColors: Record<string, string> = { SILVER: "#9ca3af", GOLD: "#f59e0b", PLATINUM: "#6366f1", DIAMOND: "#06b6d4" };
  const tierLabels: Record<string, string> = { SILVER: "Silver", GOLD: "Gold", PLATINUM: "Bạch Kim", DIAMOND: "Kim Cương" };
  const tier = user?.membershipTier || "SILVER";
  const tierColor = tierColors[tier] || "#9ca3af";

  // Featured products from store (already filtered by show_on_miniapp=true via miniapp API)
  const featuredProducts = products.slice(0, 6);
  const bestSellingProducts = products.slice(0, 6); // Top products from miniapp list

  return (
    <Box style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ── HEADER ── */}
      <Box style={{ paddingTop: 50, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, background: "linear-gradient(135deg, #0d9488, #0f766e)", borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
        <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 14 }}>
          <Box flex alignItems="center" style={{ gap: 10 }}>
            <Box style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700 }}>NK</Box>
            <Box>
              <Text style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Ngọc Kim Ngân</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Thuốc tốt - Giá tốt - Dịch vụ tốt</Text>
            </Box>
          </Box>
          <Icon icon="zi-cart" style={{ color: "white" }} size={24} onClick={() => nav("/cart")} />
        </Box>
        <Box onClick={() => nav("/search")} flex alignItems="center" style={{ background: "white", borderRadius: 50, padding: "12px 16px" }}>
          <Icon icon="zi-search" style={{ color: "#9ca3af" }} size={18} />
          <Text style={{ color: "#9ca3af", marginLeft: 8, fontSize: 14 }}>Tìm tên thuốc, bệnh lý...</Text>
        </Box>
      </Box>

      {/* ── BANNER CAROUSEL (real API) ── */}
      {heroBanners.length > 0 && (
        <Box style={{ margin: "12px 16px 0" }}>
          <Box ref={bannerScroll.r} style={{ display: "flex", gap: 12, overflowX: "hidden", scrollBehavior: "smooth", borderRadius: 14 }}>
            {heroBanners.map((b, k) => (
              <Box
                key={b.id || k}
                onClick={() => b.link_url ? nav(b.link_url) : undefined}
                style={{
                  minWidth: "100%", height: 120, borderRadius: 14,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "16px 20px",
                  color: "white", flexShrink: 0, position: "relative", overflow: "hidden",
                  background: b.color_start
                    ? `linear-gradient(135deg, ${b.color_start}, ${b.color_end || b.color_start})`
                    : `url(${b.image_url}) center/cover, linear-gradient(135deg, #0d9488, #14b8a6)`,
                }}
              >
                {b.image_url && b.color_start && (
                  <img src={b.image_url} alt={b.title} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
                )}
                <Text style={{ color: "white", fontSize: 18, fontWeight: 700, position: "relative", zIndex: 1 }}>{b.title}</Text>
                {b.subtitle && <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, position: "relative", zIndex: 1 }}>{b.subtitle}</Text>}
              </Box>
            ))}
          </Box>
          {heroBanners.length > 1 && (
            <Box flex justifyContent="center" style={{ gap: 6, marginTop: 10, marginBottom: 8 }}>
              {heroBanners.map((_, k) => <Box key={k} style={{ width: k === bannerScroll.i ? 18 : 6, height: 6, borderRadius: 3, background: k === bannerScroll.i ? "#0d9488" : "#d1d5db", transition: "all 0.3s" }} />)}
            </Box>
          )}
        </Box>
      )}

      {/* ── MEMBERSHIP CARD ── */}
      <Box style={{ margin: "0 16px 16px", background: "white", borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Box flex>
          <Box flex={1} flex alignItems="center" style={{ gap: 10 }}>
            <Box style={{ width: 44, height: 44, borderRadius: 22, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 20, fontWeight: 700 }}>{isAuthenticated ? (user?.name?.charAt(0) || "K") : "K"}</Box>
            <Box>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>Xin chào,</Text>
              <Text style={{ fontSize: 14, fontWeight: 600 }}>{isAuthenticated ? user?.name : "Quý khách hàng"}</Text>
            </Box>
          </Box>
          <Box style={{ width: 1, alignSelf: "stretch", background: "#f3f4f6", margin: "0 12px" }} />
          <Box flex={1} flex alignItems="center" style={{ gap: 8 }}>
            <Box style={{ width: 36, height: 36, borderRadius: 18, background: tierColor + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 16 }}>🥉</Text>
            </Box>
            <Box>
              <Text style={{ fontSize: 14, fontWeight: 700, color: "#0d9488" }}>{isAuthenticated ? (user?.loyaltyPoints?.toLocaleString() || "0") + "đ" : "0đ"}</Text>
              <Text style={{ fontSize: 11, color: tierColor, fontWeight: 600 }}>{tierLabels[tier]}</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── QUICK ACTIONS 2×2 ── */}
      <Box style={{ margin: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {QUICK_ACTIONS.map((a, k) => (
          <Box key={k} onClick={() => { if (k === 0) nav("/cart"); else if (k === 2) nav("/profile"); }} flex alignItems="center" style={{ background: "white", borderRadius: 14, padding: "14px 16px", gap: 12, border: "1px solid #f3f4f6", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Box style={{ width: 42, height: 42, borderRadius: 12, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon icon={a.i as any} style={{ color: a.c }} size={22} />
            </Box>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{a.n}</Text>
          </Box>
        ))}
      </Box>

      {/* ── ROW BANNERS (real API) ── */}
      {rowBanners.length > 0 && (
        <Box style={{ margin: "0 16px 16px", display: "flex", gap: 10, overflowX: "auto" }}>
          {rowBanners.map((b, k) => (
            <Box
              key={b.id || k}
              onClick={() => b.link_url ? nav(b.link_url) : undefined}
              style={{
                minWidth: 200, height: 80, borderRadius: 12, padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
                background: b.color_start
                  ? `linear-gradient(135deg, ${b.color_start}, ${b.color_end || b.color_start})`
                  : "#ccfbf1",
              }}
            >
              {b.image_url && <img src={b.image_url} alt={b.title} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />}
              <Box>
                <Text style={{ color: b.color_start ? "white" : "#0d9488", fontWeight: 600, fontSize: 13 }}>{b.title}</Text>
                {b.subtitle && <Text style={{ color: b.color_start ? "rgba(255,255,255,0.8)" : "#0d9488", fontSize: 11, opacity: 0.8 }}>{b.subtitle}</Text>}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* ── CATEGORIES 4×2 ── */}
      <Box style={{ margin: "0 16px 16px" }}>
        <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#111827" }}>Danh mục sản phẩm</Text>
        <Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {SHORTCUTS.map((c, k) => (
            <Box key={k} onClick={() => nav("/categories")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Box style={{ width: 52, height: 52, borderRadius: 16, background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon icon={c.i as any} style={{ color: "#0d9488" }} size={24} />
              </Box>
              <Text style={{ fontSize: 11, color: "#4b5563", textAlign: "center" }}>{c.n}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── FLASH SALE (real API) ── */}
      {flashSale?.current_session && flashSale.featured_items.length > 0 && (
        <Box style={{ margin: "0 16px 16px", background: "#fef2f2", borderRadius: 14, padding: 16 }}>
          <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 14 }}>
            <Box flex alignItems="center" style={{ gap: 8 }}>
              <Icon icon="zi-star" style={{ color: "#ef4444" }} size={18} />
              <Text style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>{flashSale.current_session.name}</Text>
            </Box>
            {countdown && (
              <Box flex style={{ gap: 4, background: "#1f2937", color: "white", padding: "4px 10px", borderRadius: 50, fontSize: 12, fontWeight: 700 }}>
                {countdown.split(":").map((seg, i, arr) => (
                  <React.Fragment key={i}>
                    <span>{seg}</span>
                    {i < arr.length - 1 && <span>:</span>}
                  </React.Fragment>
                ))}
              </Box>
            )}
          </Box>
          <Box ref={flashScroll.r} style={{ display: "flex", gap: 10, overflowX: "hidden", scrollBehavior: "smooth" }}>
            {flashSale.featured_items.map((item, k) => {
              const p = item.product;
              const imgUrl = p.primary_image?.image_url || p.image_url;
              return (
                <Box key={item.id || k} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 12, padding: 10, minWidth: 140, flexShrink: 0, position: "relative" }}>
                  {item.discount_percentage > 0 && (
                    <Box style={{ position: "absolute", top: 6, left: 6, background: "#ef4444", color: "white", padding: "2px 6px", borderRadius: 6, fontSize: 10, fontWeight: 700, zIndex: 2 }}>-{item.discount_percentage}%</Box>
                  )}
                  <Box style={{ height: 56, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" }}>
                    {imgUrl ? <img src={imgUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Icon icon="zi-home" style={{ color: "#0d9488" }} size={28} />}
                  </Box>
                  <Text style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</Text>
                  <Box flex justifyContent="space-between" alignItems="center" style={{ marginTop: 4 }}>
                    <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 14 }}>{formatPrice(Number(item.flash_sale_price))}</Text>
                    <Text style={{ color: "#9ca3af", fontSize: 10, textDecoration: "line-through" }}>{formatPrice(Number(item.original_price))}</Text>
                  </Box>
                  {/* Progress bar */}
                  <Box style={{ marginTop: 6, height: 4, background: "#fee2e2", borderRadius: 2, overflow: "hidden" }}>
                    <Box style={{ height: "100%", width: `${item.sold_percentage}%`, background: "#ef4444", borderRadius: 2 }} />
                  </Box>
                  <Text style={{ fontSize: 9, color: "#ef4444", marginTop: 2 }}>Đã bán {item.sold_quantity}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── FEATURED PRODUCTS ── */}
      {featuredProducts.length > 0 && (
        <Box style={{ margin: "0 16px 16px" }}>
          <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "#111827" }}>Sản phẩm nổi bật</Text>
          <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>(*) Sản phẩm được đề xuất bởi Nhà thuốc</Text>
          <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {featuredProducts.map((p, k) => {
              const st = STOCK_STATUS(p.stockQuantity);
              return (
                <Box key={k} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <Box style={{ height: 140, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} /> : <Icon icon="zi-home" style={{ color: "#0d9488" }} size={48} />}
                    {k === 0 && <Box style={{ position: "absolute", top: 8, right: 8, background: "#fef3c7", padding: "3px 8px", borderRadius: 50 }}><Text style={{ fontSize: 10, fontWeight: 700, color: "#a16207" }}>★ BEST SELLER</Text></Box>}
                  </Box>
                  <Box style={{ padding: 12 }}>
                    <Box flex alignItems="center" style={{ gap: 4, marginBottom: 4 }}>
                      <Box style={{ border: "1px solid #fca5a5", borderRadius: 3, padding: "1px 4px" }}><Text style={{ fontSize: 9, fontWeight: 700, color: "#ef4444" }}>MALL</Text></Box>
                      <Text style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
                    </Box>
                    <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
                    <Box style={{ marginBottom: 6 }}>
                      <Text style={{ fontSize: 10, color: "#f97316", background: "#fff7ed", display: "inline-block", padding: "2px 8px", borderRadius: 50 }}>#ChínhHãng</Text>
                    </Box>
                    <Box flex style={{ gap: 6 }}>
                      <Text style={{ fontSize: 10, color: "#f97316", background: "#fff7ed", padding: "2px 6px", borderRadius: 50 }}>🚚 Giao nhanh</Text>
                      <Text style={{ fontSize: 10, color: "#16a34a", background: "#dcfce7", padding: "2px 6px", borderRadius: 50 }}>Giá tốt</Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* ── BEST SELLING ── */}
      {bestSellingProducts.length > 0 && (
        <Box style={{ margin: "0 16px 16px" }}>
          <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
            <Box>
              <Text style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>Bán chạy nhất</Text>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>Sản phẩm được mua nhiều nhất</Text>
            </Box>
          </Box>
          <Box style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {bestSellingProducts.map((p, k) => (
              <Box key={k} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 12, padding: 10, minWidth: 150, maxWidth: 150, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" }}>
                <Box style={{ height: 90, background: "#f9fafb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" }}>
                  {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /> : <Icon icon="zi-home" style={{ color: "#0d9488" }} size={36} />}
                </Box>
                <Text style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{p.name}</Text>
                <Box flex justifyContent="space-between" alignItems="center">
                  <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 14 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
                </Box>
                {p.salePrice && <Text style={{ color: "#9ca3af", fontSize: 10, textDecoration: "line-through" }}>{formatPrice(p.price)}</Text>}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── CATEGORY SECTIONS ── */}
      {categoriesWithProducts.map(([catName, catProducts]) => {
        const style = getCatStyle(catName);
        return (
          <Box key={catName} style={{ margin: "0 16px 16px" }}>
            <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
              <Box flex alignItems="center" style={{ gap: 8 }}>
                <Box style={{ width: 36, height: 36, borderRadius: 10, background: style.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {style.icon}
                </Box>
                <Box>
                  <Text style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{catName}</Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af" }}>{catProducts.length} sản phẩm</Text>
                </Box>
              </Box>
              <Box onClick={() => nav("/categories")} flex alignItems="center" style={{ gap: 2 }}>
                <Text style={{ fontSize: 12, color: "#0d9488", fontWeight: 500 }}>Xem tất cả</Text>
                <Icon icon="zi-chevron-right" style={{ color: "#0d9488" }} size={14} />
              </Box>
            </Box>
            <Box style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {catProducts.map((p, k) => {
                const st = STOCK_STATUS(p.stockQuantity);
                return (
                  <Box key={k} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 12, padding: 10, minWidth: 150, maxWidth: 150, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #f3f4f6" }}>
                    <Box style={{ height: 90, background: "#f9fafb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, overflow: "hidden" }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /> : <Icon icon="zi-home" style={{ color: style.color }} size={36} />}
                    </Box>
                    <Text style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{p.name}</Text>
                    <Box flex justifyContent="space-between" alignItems="center">
                      <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 14 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
                      <Text style={{ fontSize: 9, color: st.c, background: st.b, padding: "1px 6px", borderRadius: 50 }}>{st.t}</Text>
                    </Box>
                    {p.salePrice && <Text style={{ color: "#9ca3af", fontSize: 10, textDecoration: "line-through" }}>{formatPrice(p.price)}</Text>}
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}

      <Box style={{ height: 16 }} />
    </Box>
  );
}
