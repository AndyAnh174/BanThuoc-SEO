import React, { useState } from "react";
import { Box, Text, Input, Icon, useNavigate } from "zmp-ui";
import { MOCK_PRODUCTS, formatPrice } from "@/stores/app.store";

const HOT_KEYS = ["Paracetamol","Vitamin C","Panadol","Ginkgo","Siro ho"];

export default function SearchPage() {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const results = query.trim().length >= 2
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <Box style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 80 }}>
      <Box style={{ padding: "14px 16px", paddingTop: 50, background: "white", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Box onClick={() => nav("/")} style={{ width: 36, height: 36, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon icon="zi-chevron-left" style={{ color: "#4b5563" }} size={22} />
        </Box>
        <Input
          placeholder="Tim ten thuoc, benh ly..."
          value={query}
          onChange={(e) => setQuery((e.target as any).value)}
          autoFocus
          className="bg-white rounded-full px-4 py-2"
        />
      </Box>
      <Box className="p-4">
        {query.trim().length < 2 ? (
          <>
            <Text.Title className="mb-3">Từ khóa HOT</Text.Title>
            <Box flex className="flex-wrap gap-2">
              {HOT_KEYS.map((kw, i) => (
                <span key={i} className="text-sm bg-white text-teal-600 border border-teal-200 px-3 py-1.5 rounded-full" onClick={() => setQuery(kw)}>{kw}</span>
              ))}
            </Box>
          </>
        ) : (
          <>
            <Text.Title className="mb-3">{results.length} kết quả cho "{query}"</Text.Title>
            <Box className="space-y-2">
              {results.length === 0 && <Text className="text-gray-400 text-center py-8">Không tìm thấy sản phẩm nào</Text>}
              {results.map((p) => (
                <Box key={p.id} flex className="bg-white rounded-xl p-3 space-x-3 items-center" onClick={() => nav("product/" + p.slug)}>
                  <Box className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon icon="zi-pill" className="text-teal-400" size={24} />
                  </Box>
                  <Box className="flex-1">
                    <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                    <Box flex className="items-baseline gap-2">
                      <span className="text-red-500 font-bold">{formatPrice(p.salePrice ?? p.price)}</span>
                      {p.salePrice && <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>}
                    </Box>
                  </Box>
                  <Icon icon="zi-chevron-right" className="text-gray-300" />
                </Box>
              ))}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
