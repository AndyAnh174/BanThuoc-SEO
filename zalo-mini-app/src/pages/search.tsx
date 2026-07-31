import React, { useState, useEffect } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { useAppStore } from "@/stores/app.store";
import { ShopeeProductCard } from "@/components/shopee-product-card";
import * as productApi from "@/services/products.api";

const DEFAULT_HOT_KEYS = [
  "Paracetamol",
  "Vitamin C",
  "Panadol Extra",
  "Ginkgo Biloba",
  "Siro ho Prospan",
  "Enterogermina",
  "Kem chống nắng",
];

export default function SearchPage() {
  const nav = useNavigate();
  const { products } = useAppStore();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hotKeys, setHotKeys] = useState<string[]>(DEFAULT_HOT_KEYS);
  const [history, setHistory] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("search_history") || "[]");
    } catch {
      return ["Thuốc cảm cúm", "Men tiêu hóa"];
    }
  });

  // Fetch hot search keywords from backend API safely
  useEffect(() => {
    productApi
      .getHotkeys()
      .then((res: any) => {
        if (res && Array.isArray(res.keywords) && res.keywords.length > 0) {
          setHotKeys(res.keywords.map((item: any) => item.keyword || item));
        } else if (Array.isArray(res) && res.length > 0) {
          setHotKeys(res.map((item: any) => item.keyword || item));
        }
      })
      .catch(() => {
        setHotKeys(DEFAULT_HOT_KEYS);
      });
  }, []);

  // Fetch autocomplete suggestions safely
  useEffect(() => {
    if (query.trim().length >= 2) {
      productApi
        .getSuggestions(query)
        .then((res: any) => {
          if (res && Array.isArray(res.suggestions)) {
            setSuggestions(res.suggestions.map((item: any) => item.text || item.keyword || item));
          } else if (Array.isArray(res)) {
            setSuggestions(res.map((item: any) => item.text || item.name || item));
          }
        })
        .catch(() => {
          setSuggestions([]);
        });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (keyword: string) => {
    setQuery(keyword);
    if (keyword && !history.includes(keyword)) {
      const updated = [keyword, ...history.slice(0, 9)];
      setHistory(updated);
      try {
        localStorage.setItem("search_history", JSON.stringify(updated));
      } catch {}
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("search_history");
    } catch {}
  };

  // Safe product filtering
  const searchResults =
    query.trim().length >= 1 && Array.isArray(products)
      ? products.filter((p) => {
          if (!p) return false;
          const q = query.toLowerCase();
          const nameMatch = p.name ? p.name.toLowerCase().includes(q) : false;
          const catMatch = p.category?.name ? p.category.name.toLowerCase().includes(q) : false;
          const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
          return nameMatch || catMatch || descMatch;
        })
      : [];

  return (
    <Box style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Search Bar Header */}
      <Box
        style={{
          padding: "12px 16px",
          paddingTop: 50,
          background: "white",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 10,
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
            flexShrink: 0,
          }}
        >
          <Icon icon="zi-chevron-left" style={{ color: "#334155" }} size={20} />
        </Box>

        <Box style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            placeholder="Tìm tên thuốc, triệu chứng, dược phẩm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 24,
              padding: "10px 36px 10px 38px",
              fontSize: 14,
              outline: "none",
              color: "#0f172a",
              boxSizing: "border-box",
            }}
          />
          <Icon
            icon="zi-search"
            style={{ position: "absolute", left: 12, top: 11, color: "#ee4d2d" }}
            size={18}
          />
          {query && (
            <Box
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: 12,
                top: 10,
                color: "#94a3b8",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              ✕
            </Box>
          )}
        </Box>
      </Box>

      {/* Main Search Content */}
      <Box style={{ padding: 16 }}>
        {/* Instant Suggestions Popup */}
        {query.trim().length >= 2 && suggestions.length > 0 && searchResults.length === 0 && (
          <Box style={{ background: "white", borderRadius: 12, padding: 12, marginBottom: 14 }}>
            <Text style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Gợi ý tìm kiếm:</Text>
            {suggestions.map((sug, i) => (
              <Box
                key={i}
                onClick={() => handleSearch(sug)}
                flex
                alignItems="center"
                style={{ padding: "8px 0", borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
              >
                <Icon icon="zi-search" style={{ color: "#0d9488", marginRight: 10 }} size={14} />
                <Text style={{ fontSize: 14, color: "#1e293b" }}>{sug}</Text>
              </Box>
            ))}
          </Box>
        )}

        {/* When Query is Empty */}
        {query.trim().length === 0 ? (
          <>
            {/* Recent Search History */}
            {history.length > 0 && (
              <Box style={{ marginBottom: 20 }}>
                <Box flex justifyContent="space-between" alignItems="center" style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>
                    Lịch sử tìm kiếm
                  </Text>
                  <Text style={{ fontSize: 12, color: "#94a3b8", cursor: "pointer" }} onClick={clearHistory}>
                    Xóa
                  </Text>
                </Box>

                <Box flex flexWrap="wrap" style={{ gap: 8 }}>
                  {history.map((kw, i) => (
                    <Box
                      key={i}
                      onClick={() => handleSearch(kw)}
                      style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        padding: "6px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                        color: "#475569",
                        cursor: "pointer",
                      }}
                    >
                      {kw}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Trending Hot Keywords */}
            <Box>
              <Text style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 10 }}>
                🔥 Từ khóa HOT tìm nhiều
              </Text>

              <Box flex flexWrap="wrap" style={{ gap: 8 }}>
                {hotKeys.map((kw, i) => (
                  <Box
                    key={i}
                    onClick={() => handleSearch(kw)}
                    style={{
                      background: "#fff0f0",
                      border: "1px solid #ffd8d8",
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#ee4d2d",
                      cursor: "pointer",
                    }}
                  >
                    🔥 {kw}
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        ) : (
          /* Search Results Display */
          <>
            <Text style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 12 }}>
              Tìm thấy {searchResults.length} sản phẩm cho "{query}"
            </Text>

            {searchResults.length === 0 ? (
              <Box
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: 32,
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🔍</Text>
                <Text style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                  Không tìm thấy sản phẩm phù hợp
                </Text>
                <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                  Thử tìm kiếm với từ khóa khác như "Paracetamol", "Vitamin C", "Khẩu trang"...
                </Text>
              </Box>
            ) : (
              <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {searchResults.map((p, k) => (
                  <ShopeeProductCard
                    key={p.id || k}
                    product={p}
                    discountPercentage={30}
                    salesCount="1.5k"
                    rating={5.0}
                  />
                ))}
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
