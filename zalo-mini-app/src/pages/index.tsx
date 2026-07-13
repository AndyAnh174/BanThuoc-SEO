import React, { useRef, useEffect, useState } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { useAppStore, formatPrice, MOCK_PRODUCTS } from "@/stores/app.store";

const BANNERS = [
  { color: "linear-gradient(135deg, #0d9488, #14b8a6)", title: "Flash Sale He 2026", sub: "Giam den 50%" },
  { color: "linear-gradient(135deg, #f97316, #fb923c)", title: "Combo Tiet Kiem", sub: "Mua 2 tang 1" },
  { color: "linear-gradient(135deg, #6366f1, #818cf8)", title: "Mua Sam Tha Ga", sub: "Mien phi ship don > 200k" },
];

const SHORTCUTS = [
  { l: "Thuoc OTC", i: "zi-home" },
  { l: "TPCN", i: "zi-heart" },
  { l: "Vitamin", i: "zi-star" },
  { l: "Duoc MP", i: "zi-calendar" },
  { l: "TB Y te", i: "zi-location" },
  { l: "Me & Be", i: "zi-heart" },
  { l: "Combo", i: "zi-star" },
  { l: "Khac", i: "zi-list-1" },
];

function useAutoScroll(length: number, intervalMs: number) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);

  useEffect(() => {
    if (ref.current) {
      const child = ref.current.children[idx] as HTMLElement | undefined;
      if (child) child.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    }
  }, [idx]);

  return { ref, idx, setIdx };
}

export default function HomePage() {
  const nav = useNavigate();
  const bestSelling = MOCK_PRODUCTS.slice(2, 6);
  const bannerScroll = useAutoScroll(3, 3000);
  const flashScroll = useAutoScroll(5, 2500);
  const [flashTime, setFlashTime] = useState({ h: "02", m: "14", s: "38" });

  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime((prev) => {
        let s = parseInt(prev.s) - 1;
        let m = parseInt(prev.m);
        let h = parseInt(prev.h);
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: "00", m: "00", s: "00" };
        return { h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box style={{ padding: 16, background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <Box style={{ padding: 16, background: "#0d9488", borderRadius: 12, marginBottom: 16 }}>
        <Box flex justifyContent="space-between" alignItems="center">
          <Box>
            <Text.Title style={{ color: "white" }}>Ngoc Kim Ngan</Text.Title>
            <Text style={{ color: "#99f6e4", fontSize: 12 }}>Thuoc tot - Gia tot - Dich vu tot</Text>
          </Box>
          <Icon icon="zi-cart" style={{ color: "white" }} size={24} onClick={() => nav("/cart")} />
        </Box>
        <Box onClick={() => nav("/search")} flex alignItems="center" style={{ background: "white", borderRadius: 50, padding: "10px 16px", marginTop: 12 }}>
          <Icon icon="zi-search" style={{ color: "#9ca3af" }} size={18} />
          <Text style={{ color: "#9ca3af", marginLeft: 8, fontSize: 14 }}>Tim ten thuoc, benh ly...</Text>
        </Box>
      </Box>

      {/* Banner Slider — Auto scroll */}
      <Box ref={bannerScroll.ref} style={{ display: "flex", gap: 12, overflowX: "hidden", marginBottom: 16, scrollBehavior: "smooth" }}>
        {BANNERS.map((b, i) => (
          <Box key={i} style={{ minWidth: "85%", height: 100, background: b.color, borderRadius: 12, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 20px", color: "white", flexShrink: 0 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: 700 }}>{b.title}</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{b.sub}</Text>
          </Box>
        ))}
      </Box>
      {/* Dots indicator */}
      <Box flex justifyContent="center" style={{ marginTop: -8, marginBottom: 16, gap: 6 }}>
        {BANNERS.map((_, i) => (
          <Box key={i} style={{ width: i === bannerScroll.idx ? 20 : 6, height: 6, borderRadius: 3, background: i === bannerScroll.idx ? "#0d9488" : "#d1d5db", transition: "all 0.3s" }} />
        ))}
      </Box>

      {/* Shortcut Icons — 8 items, 2 rows */}
      <Box style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {SHORTCUTS.map((s, i) => (
          <Box key={i} onClick={() => nav("/categories")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <Box style={{ width: 48, height: 48, background: "#ccfbf1", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon icon={s.i as any} style={{ color: "#0d9488" }} size={22} />
            </Box>
            <Text style={{ fontSize: 11, color: "#4b5563", textAlign: "center" }}>{s.l}</Text>
          </Box>
        ))}
      </Box>

      {/* Flash Sale with live countdown */}
      <Box style={{ background: "#fef2f2", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 12 }}>
          <Box flex alignItems="center">
            <Icon icon="zi-star" style={{ color: "#ef4444", marginRight: 6 }} size={18} />
            <Text.Title style={{ color: "#dc2626", fontSize: 16 }}>Flash Sale</Text.Title>
          </Box>
          <Box flex style={{ gap: 4, background: "#1f2937", color: "white", padding: "4px 10px", borderRadius: 50, fontSize: 12, fontWeight: 700 }}>
            <span>{flashTime.h}</span><span>:</span><span>{flashTime.m}</span><span>:</span><span>{flashTime.s}</span>
          </Box>
        </Box>
        <Box ref={flashScroll.ref} style={{ display: "flex", gap: 10, overflowX: "hidden", scrollBehavior: "smooth" }}>
          {MOCK_PRODUCTS.slice(0, 5).map((p) => (
            <Box key={p.id} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 10, padding: 10, minWidth: 140, flexShrink: 0 }}>
              <Box style={{ width: 56, height: 56, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                <Icon icon="zi-home" style={{ color: "#0d9488" }} size={28} />
              </Box>
              <Text style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
              <Box flex alignItems="baseline" style={{ gap: 4, marginTop: 4 }}>
                <Text style={{ color: "#ef4444", fontWeight: 700, fontSize: 13 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
                {p.salePrice && <Text style={{ color: "#9ca3af", fontSize: 10, textDecoration: "line-through" }}>{formatPrice(p.price)}</Text>}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Best Selling */}
      <Text.Title style={{ marginBottom: 12 }}>San pham ban chay</Text.Title>
      <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {bestSelling.map((p) => (
          <Box key={p.id} onClick={() => nav("/product/" + p.slug)} style={{ background: "white", borderRadius: 12, overflow: "hidden" }}>
            <Box style={{ height: 140, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon icon="zi-home" style={{ color: "#0d9488" }} size={40} />
            </Box>
            <Box style={{ padding: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
              <Box flex justifyContent="space-between" alignItems="center" style={{ marginTop: 4 }}>
                <Text style={{ color: "#ef4444", fontWeight: 700, fontSize: 14 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
                <Text style={{ color: "#9ca3af", fontSize: 11 }}>{p.unit}</Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
