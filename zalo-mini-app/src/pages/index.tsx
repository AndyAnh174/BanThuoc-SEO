import React, { useRef, useEffect, useState } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { useAppStore, formatPrice, MOCK_PRODUCTS } from "@/stores/app.store";

const B = [
  { g: "linear-gradient(135deg, #0d9488, #14b8a6)", t: "Flash Sale He 2026", s: "Giam den 50% - Mua ngay keo lo" },
  { g: "linear-gradient(135deg, #f97316, #fb923c)", t: "Combo Tiet Kiem", s: "Mua 2 tang 1 - Gia chi 199k" },
  { g: "linear-gradient(135deg, #6366f1, #818cf8)", t: "Mien Phi Van Chuyen", s: "Cho don hang tu 200.000d" },
];

const SC = [
  { n: "OTC", i: "zi-home" },{ n: "TPCN", i: "zi-heart" },{ n: "Vitamin", i: "zi-star" },{ n: "D.MyPham", i: "zi-calendar" },
  { n: "TB Y Te", i: "zi-location" },{ n: "Me & Be", i: "zi-heart" },{ n: "Combo", i: "zi-star" },{ n: "Khac", i: "zi-list-1" },
];

const QA = [
  { n: "Don hang", i: "zi-note", c: "#f97316", bg: "#fff7ed" },
  { n: "Voucher", i: "zi-star", c: "#06b6d4", bg: "#ecfeff" },
  { n: "Diem thuong", i: "zi-star", c: "#eab308", bg: "#fefce8" },
  { n: "Chat duoc si", i: "zi-chat", c: "#0d9488", bg: "#ccfbf1" },
];

const ST = (q: number) => q > 20 ? { c: "#16a34a", b: "#dcfce7", t: `Con ${q}` } : q > 0 ? { c: "#ea580c", b: "#fff7ed", t: `Sap het` } : { c: "#dc2626", b: "#fef2f2", t: "Het hang" };

function useAutoScroll(n: number, ms: number) {
  const [i, setI] = useState(0);
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setInterval(() => setI(p => (p + 1) % n), ms); return () => clearInterval(t); }, [n, ms]);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, [i]);
  return { r, i };
}

export default function HomePage() {
  const nav = useNavigate();
  const { isAuthenticated, user } = useAppStore();
  const bS = useAutoScroll(3, 3000);
  const fS = useAutoScroll(5, 2500);

  const tierColors: Record<string, string> = { SILVER: "#9ca3af", GOLD: "#f59e0b", PLATINUM: "#6366f1", DIAMOND: "#06b6d4" };
  const tierLabels: Record<string, string> = { SILVER: "Silver", GOLD: "Gold", PLATINUM: "Bach Kim", DIAMOND: "Kim Cuong" };
  const tier = user?.membershipTier || "SILVER";
  const tierColor = tierColors[tier];

  return (
    <Box style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 80 }}>
      {/* ── HEADER ── */}
      <Box style={{ paddingTop: 50, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, background: "linear-gradient(135deg, #0d9488, #0f766e)", borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
        <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 14 }}>
          <Box flex alignItems="center" style={{ gap: 10 }}>
            <Box style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700 }}>NK</Box>
            <Box>
              <Text style={{ color: "white", fontSize: 16, fontWeight: 700 }}>Ngoc Kim Ngan</Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Thuoc tot - Gia tot - Dich vu tot</Text>
            </Box>
          </Box>
          <Icon icon="zi-cart" style={{ color: "white" }} size={24} onClick={() => nav("/cart")} />
        </Box>
        {/* Search bar */}
        <Box onClick={() => nav("/search")} flex alignItems="center" style={{ background: "white", borderRadius: 50, padding: "12px 16px" }}>
          <Icon icon="zi-search" style={{ color: "#9ca3af" }} size={18} />
          <Text style={{ color: "#9ca3af", marginLeft: 8, fontSize: 14 }}>Tim ten thuoc, benh ly...</Text>
        </Box>
      </Box>

      {/* ── BANNER CAROUSEL ── */}
      <Box style={{ margin: "12px 16px 0" }}>
        <Box ref={bS.r} style={{ display: "flex", gap: 12, overflowX: "hidden", scrollBehavior: "smooth", borderRadius: 14 }}>
          {B.map((b, k) => (
            <Box key={k} style={{ minWidth: "100%", height: 100, background: b.g, borderRadius: 14, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", color: "white", flexShrink: 0 }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: 700 }}>{b.t}</Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{b.s}</Text>
            </Box>
          ))}
        </Box>
        {/* Dots */}
        <Box flex justifyContent="center" style={{ gap: 6, marginTop: 10, marginBottom: 8 }}>
          {B.map((_, k) => <Box key={k} style={{ width: k === bS.i ? 18 : 6, height: 6, borderRadius: 3, background: k === bS.i ? "#0d9488" : "#d1d5db", transition: "all 0.3s" }} />)}
        </Box>
      </Box>

      {/* ── MEMBERSHIP CARD ── */}
      <Box style={{ margin: "0 16px 16px", background: "white", borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Box flex>
          <Box flex={1} flex alignItems="center" style={{ gap: 10 }}>
            <Box style={{ width: 44, height: 44, borderRadius: 22, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 20, fontWeight: 700 }}>{isAuthenticated ? (user?.name?.charAt(0) || "K") : "K"}</Box>
            <Box>
              <Text style={{ fontSize: 12, color: "#9ca3af" }}>Xin chao,</Text>
              <Text style={{ fontSize: 14, fontWeight: 600 }}>{isAuthenticated ? user?.name : "Quy khach hang"}</Text>
            </Box>
          </Box>
          <Box style={{ width: 1, alignSelf: "stretch", background: "#f3f4f6", margin: "0 12px" }} />
          <Box flex={1} flex alignItems="center" style={{ gap: 8 }}>
            <Box style={{ width: 36, height: 36, borderRadius: 18, background: tierColor + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 16, color: tierColor }}>🥉</Text>
            </Box>
            <Box>
              <Text style={{ fontSize: 14, fontWeight: 700, color: "#0d9488" }}>{isAuthenticated ? (user?.loyaltyPoints?.toLocaleString() || "0") + "d" : "0d"}</Text>
              <Text style={{ fontSize: 11, color: tierColor, fontWeight: 600 }}>{tierLabels[tier]}</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── QUICK ACTIONS 2×2 ── */}
      <Box style={{ margin: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {QA.map((a, k) => (
          <Box key={k} onClick={() => { if (k === 0) nav("/cart"); else if (k === 2) nav("/profile"); }} flex alignItems="center" style={{ background: "white", borderRadius: 14, padding: "14px 16px", gap: 12, border: "1px solid #f3f4f6", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Box style={{ width: 42, height: 42, borderRadius: 12, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon icon={a.i as any} style={{ color: a.c }} size={22} />
            </Box>
            <Text style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{a.n}</Text>
          </Box>
        ))}
      </Box>

      {/* ── PROMO BANNER ── */}
      <Box onClick={() => nav("/search")} style={{ margin: "0 16px 16px", background: "#ccfbf1", borderRadius: 50, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box flex alignItems="center" style={{ gap: 8 }}>
          <Icon icon="zi-star" style={{ color: "#0d9488" }} size={18} />
          <Text style={{ color: "#0d9488", fontWeight: 600, fontSize: 14 }}>Ban dang co 2 uu dai</Text>
        </Box>
        <Icon icon="zi-chevron-right" style={{ color: "#0d9488" }} size={18} />
      </Box>

      {/* ── CATEGORIES 4×2 ── */}
      <Box style={{ margin: "0 16px 16px" }}>
        <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#111827" }}>Danh muc san pham</Text>
        <Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {SC.map((c, k) => (
            <Box key={k} onClick={() => nav("/categories")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Box style={{ width: 52, height: 52, borderRadius: 16, background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon icon={c.i as any} style={{ color: "#0d9488" }} size={24} />
              </Box>
              <Text style={{ fontSize: 11, color: "#4b5563", textAlign: "center" }}>{c.n}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── FLASH SALE ── */}
      <Box style={{ margin: "0 16px 16px", background: "#fef2f2", borderRadius: 14, padding: 16 }}>
        <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 14 }}>
          <Box flex alignItems="center" style={{ gap: 8 }}>
            <Icon icon="zi-star" style={{ color: "#ef4444" }} size={18} />
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#dc2626" }}>Flash Sale</Text>
          </Box>
          <Box flex style={{ gap: 4, background: "#1f2937", color: "white", padding: "4px 10px", borderRadius: 50, fontSize: 12, fontWeight: 700 }}>
            <span>02</span><span>:</span><span>14</span><span>:</span><span>38</span>
          </Box>
        </Box>
        <Box ref={fS.r} style={{ display: "flex", gap: 10, overflowX: "hidden", scrollBehavior: "smooth" }}>
          {MOCK_PRODUCTS.slice(0, 5).map((p, k) => (
            <Box key={k} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 12, padding: 10, minWidth: 140, flexShrink: 0 }}>
              <Box style={{ height: 56, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <Icon icon="zi-home" style={{ color: "#0d9488" }} size={28} />
              </Box>
              <Text style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</Text>
              <Box flex justifyContent="space-between" alignItems="center" style={{ marginTop: 4 }}>
                <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 14 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
                {p.salePrice && <Text style={{ color: "#9ca3af", fontSize: 10, textDecoration: "line-through" }}>{formatPrice(p.price)}</Text>}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── PRODUCT GRID ── */}
      <Box style={{ margin: "0 16px" }}>
        <Text style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "#111827" }}>Goi y cho ban</Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>(*) Cac san pham ban co the thich</Text>
        <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {MOCK_PRODUCTS.slice(0, 6).map((p, k) => {
            const st = ST(p.stockQuantity);
            return (
              <Box key={k} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Box style={{ height: 140, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <Icon icon="zi-home" style={{ color: "#0d9488" }} size={48} />
                  {k === 0 && <Box style={{ position: "absolute", top: 8, right: 8, background: "#fef3c7", padding: "3px 8px", borderRadius: 50 }}><Text style={{ fontSize: 10, fontWeight: 700, color: "#a16207" }}>★ BEST SELLER</Text></Box>}
                </Box>
                <Box style={{ padding: 12 }}>
                  <Box flex alignItems="center" style={{ gap: 4, marginBottom: 4 }}>
                    <Box style={{ border: "1px solid #fca5a5", borderRadius: 3, padding: "1px 4px" }}><Text style={{ fontSize: 9, fontWeight: 700, color: "#ef4444" }}>MALL</Text></Box>
                    <Text style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
                  </Box>
                  <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
                  <Box style={{ marginBottom: 4 }}>
                    <Text style={{ fontSize: 10, color: "#f97316", background: "#fff7ed", display: "inline-block", padding: "2px 8px", borderRadius: 50 }}>#SanPhamChinhHang</Text>
                  </Box>
                  <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 6 }}>
                    <Box flex alignItems="center" style={{ gap: 4 }}>
                      <Text style={{ color: "#eab308", fontSize: 11 }}>★★★★★</Text>
                      <Text style={{ fontSize: 11, color: "#9ca3af" }}>5.0 | 1,4k da ban</Text>
                    </Box>
                  </Box>
                  <Box flex style={{ gap: 6 }}>
                    <Text style={{ fontSize: 10, color: "#f97316", background: "#fff7ed", padding: "2px 6px", borderRadius: 50 }}>🚚 Giao nhanh</Text>
                    <Text style={{ fontSize: 10, color: "#16a34a", background: "#dcfce7", padding: "2px 6px", borderRadius: 50 }}>Gia tot</Text>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
