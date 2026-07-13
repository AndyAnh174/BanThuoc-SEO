import React, { useState } from "react";
import { Box, Text, Icon, Button, Header, useNavigate, useParams } from "zmp-ui";
import { MOCK_PRODUCTS, useAppStore, formatPrice } from "@/stores/app.store";

const STOCK_STYLE = (q: number) => q > 20 ? { color: "#16a34a", bg: "#dcfce7" } : q > 0 ? { color: "#ea580c", bg: "#fff7ed" } : { color: "#dc2626", bg: "#fef2f2" };
const STOCK_LABEL = (q: number) => q > 20 ? `Con ${q} sp` : q > 0 ? `Sap het - con ${q}` : "Het hang";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.slug === slug);
  const { addToCart, cart } = useAppStore();
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);

  if (!product) return <Box style={{ padding: 40, textAlign: "center" }}><Text.Title>Khong tim thay san pham</Text.Title></Box>;

  const dp = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const cp = product.salePrice ?? product.price;
  const st = STOCK_STYLE(product.stockQuantity);
  const related = MOCK_PRODUCTS.filter(p => p.category.slug === product.category.slug && p.id !== product.id).slice(0, 4);

  return (
    <Box style={{ background: "#f9fafb", minHeight: "100vh", paddingBottom: 90 }}>
      <Header title={product.name} onBackClick={() => nav(-1)} />

      {/* Product image */}
      <Box style={{ height: 260, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon icon="zi-home" style={{ color: "#99f6e4" }} size={100} />
      </Box>

      {/* Price + Info */}
      <Box style={{ background: "white", padding: 16, marginTop: 8 }}>
        <Text.Title style={{ fontSize: 18, marginBottom: 8 }}>{product.name}</Text.Title>
        <Box flex alignItems="baseline" style={{ gap: 8, marginBottom: 8 }}>
          <Text style={{ color: "#ef4444", fontSize: 24, fontWeight: 700 }}>{formatPrice(cp)}</Text>
          {product.salePrice && <>
            <Text style={{ color: "#9ca3af", fontSize: 14, textDecoration: "line-through" }}>{formatPrice(product.price)}</Text>
            <Box style={{ background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 50 }}>-{dp}%</Box>
          </>}
        </Box>
        <Box flex style={{ gap: 16 }}>
          <Text style={{ fontSize: 13, color: "#6b7280" }}>Don vi: <b>{product.unit}</b></Text>
          <Box style={{ background: st.bg, padding: "2px 10px", borderRadius: 50 }}>
            <Text style={{ color: st.color, fontSize: 12, fontWeight: 600 }}>{STOCK_LABEL(product.stockQuantity)}</Text>
          </Box>
        </Box>
      </Box>

      {/* Detailed Info */}
      <Box style={{ background: "white", padding: 16, marginTop: 8 }}>
        <Text.Title size="small" style={{ marginBottom: 12 }}>Thong tin san pham</Text.Title>
        {[
          ["Thanh phan", "Hoat chat chinh dat chuan GMP, dam bao chat luong va an toan cho nguoi su dung."],
          ["Doi tuong su dung", "Nguoi lon va tre em tren 12 tuoi. Tham khao y kien bac si truoc khi dung."],
          ["Huong dan su dung", "Uong 1-2 vien/lan, ngay 2 lan sau bữa an. Khong vuot qua 8 vien/ngay."],
          ["Bao quan", "Noi kho rao, tranh anh sang truc tiep. Nhiet do duoi 30 do C."],
        ].map(([label, value], i) => (
          <Box key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
            <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 2 }}>{label}</Text>
            <Text style={{ fontSize: 14, color: "#1f2937" }}>{value}</Text>
          </Box>
        ))}
      </Box>

      {/* Related Products */}
      {related.length > 0 && (
        <Box style={{ padding: 16 }}>
          <Text.Title style={{ marginBottom: 12 }}>San pham lien quan</Text.Title>
          <Box style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {related.map((p) => (
              <Box key={p.id} onClick={() => nav("/product/" + p.slug, { animate: false })} style={{ background: "white", borderRadius: 10, padding: 10, minWidth: 130, flexShrink: 0 }}>
                <Box style={{ width: 60, height: 60, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <Icon icon="zi-home" style={{ color: "#0d9488" }} size={28} />
                </Box>
                <Text style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
                <Text style={{ color: "#ef4444", fontWeight: 700, fontSize: 13, marginTop: 4 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Bottom bar */}
      <Box style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e5e7eb", padding: 12, display: "flex", alignItems: "center", gap: 8, zIndex: 50 }}>
        {/* Chat */}
        <Box onClick={() => {}} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 4px" }}>
          <Icon icon="zi-chat" style={{ color: "#0d9488" }} size={22} />
          <Text style={{ fontSize: 10, color: "#0d9488" }}>Chat</Text>
        </Box>
        {/* Like */}
        <Box onClick={() => setLiked(!liked)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 4px" }}>
          <Icon icon="zi-heart" style={{ color: liked ? "#ef4444" : "#9ca3af" }} size={22} />
          <Text style={{ fontSize: 10, color: liked ? "#ef4444" : "#9ca3af" }}>{liked ? "Da thich" : "Thich"}</Text>
        </Box>

        {/* Quantity */}
        <Box flex alignItems="center" style={{ border: "1px solid #d1d5db", borderRadius: 8, marginLeft: 8 }}>
          <Box style={{ width: 32, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Box>
          <Box style={{ width: 40, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 14 }}>{quantity}</Box>
          <Box style={{ width: 32, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }} onClick={() => setQuantity(quantity + 1)}>+</Box>
        </Box>

        <Button variant="primary" style={{ flex: 1 }} onClick={() => { addToCart(product, quantity); nav("/cart"); }}>
          Them gio hang ({formatPrice(cp * quantity)})
        </Button>
      </Box>
    </Box>
  );
}
