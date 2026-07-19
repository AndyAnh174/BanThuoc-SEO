import React from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";

const CATS = [
  { n: "Thuoc\nOTC", i: "zi-home", c: "#0d9488", g: "linear-gradient(135deg, #0d9488, #14b8a6)", s: 11 },
  { n: "TPCN", i: "zi-heart", c: "#f97316", g: "linear-gradient(135deg, #f97316, #fb923c)", s: 5 },
  { n: "Vitamin", i: "zi-star", c: "#eab308", g: "linear-gradient(135deg, #eab308, #facc15)", s: 6 },
  { n: "Duoc\nMy Pham", i: "zi-calendar", c: "#ec4899", g: "linear-gradient(135deg, #ec4899, #f472b6)", s: 4 },
  { n: "TB Y Te", i: "zi-location", c: "#6366f1", g: "linear-gradient(135deg, #6366f1, #818cf8)", s: 3 },
  { n: "Me & Be", i: "zi-heart", c: "#ef4444", g: "linear-gradient(135deg, #ef4444, #f87171)", s: 3 },
  { n: "Combo", i: "zi-star", c: "#14b8a6", g: "linear-gradient(135deg, #14b8a6, #2dd4bf)", s: 3 },
  { n: "Khac", i: "zi-list-1", c: "#6b7280", g: "linear-gradient(135deg, #6b7280, #9ca3af)", s: 2 },
];

export default function CategoryPage() {
  const nav = useNavigate();

  return (
    <Box style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Top bar with back */}
      <Box style={{ padding: "14px 16px", paddingTop: 50, background: "white", display: "flex", alignItems: "center", gap: 12 }}>
        <Box onClick={() => nav("/")} style={{ width: 36, height: 36, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon icon="zi-chevron-left" style={{ color: "#4b5563" }} size={22} />
        </Box>
        <Box>
          <Text.Title style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Kham pha</Text.Title>
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>8 nhom — {CATS.reduce((a, c) => a + c.s, 0)} danh muc</Text>
        </Box>
      </Box>

      {/* 2-column masonry-like grid */}
      <Box style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {CATS.map((cat, i) => {
          // First item spans full width
          const isFull = i === 0;
          const gridColumn = isFull ? "1 / -1" : undefined;

          // Random-height feel: alternate card heights
          const h = isFull ? 130 : i % 3 === 0 ? 180 : 140;

          return (
            <Box
              key={i}
              onClick={() => nav("/search")}
              style={{
                gridColumn,
                height: h,
                background: cat.g,
                borderRadius: 20,
                padding: 20,
                display: "flex",
                flexDirection: isFull ? "row" : "column",
                justifyContent: isFull ? "space-between" : "space-between",
                alignItems: isFull ? "center" : "stretch",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {/* Decorative circle */}
              <Box style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: 50, background: "rgba(255,255,255,0.12)" }} />

              {/* Icon */}
              <Box style={{ width: isFull ? 56 : 48, height: isFull ? 56 : 48, borderRadius: 16, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                <Icon icon={cat.i as any} style={{ color: "white" }} size={isFull ? 28 : 24} />
              </Box>

              {/* Text */}
              <Box style={{ zIndex: 1 }}>
                <Text style={{ color: "white", fontSize: isFull ? 18 : 16, fontWeight: 700, whiteSpace: "pre-line", lineHeight: 1.3 }}>{cat.n}</Text>
                <Box flex alignItems="center" style={{ gap: 6, marginTop: 6 }}>
                  <Box style={{ background: "rgba(255,255,255,0.25)", padding: "2px 10px", borderRadius: 50 }}>
                    <Text style={{ color: "white", fontSize: 12, fontWeight: 600 }}>{cat.s} muc</Text>
                  </Box>
                  {i === 0 && <Icon icon="zi-chevron-right" style={{ color: "white" }} size={16} />}
                </Box>
              </Box>

              {/* Decorative dots pattern */}
              {!isFull && (
                <Box style={{ display: "flex", gap: 4, opacity: 0.3 }}>
                  {[1, 2, 3].map(d => <Box key={d} style={{ width: 4, height: 4, borderRadius: 2, background: "white" }} />)}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
