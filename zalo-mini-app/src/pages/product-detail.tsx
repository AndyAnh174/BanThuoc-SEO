import React, { useState, useRef, useEffect } from "react";
import { Box, Text, Icon, Button, Header, useNavigate, useParams } from "zmp-ui";
import { MOCK_PRODUCTS, useAppStore, formatPrice } from "@/stores/app.store";

const STOCK_STYLE = (q: number) => q > 20 ? { color: "#16a34a", bg: "#dcfce7" } : q > 0 ? { color: "#ea580c", bg: "#fff7ed" } : { color: "#dc2626", bg: "#fef2f2" };
const STOCK_LABEL = (q: number) => q > 20 ? `Con ${q} sp` : q > 0 ? `Sap het - con ${q}` : "Het hang";
const IMG_PLACEHOLDERS = [1, 2, 3, 4]; // Simulated multiple images

export default function ProductDetailPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const product = MOCK_PRODUCTS.find(p => p.slug === slug);
  const { addToCart, cart } = useAppStore();
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [curImg, setCurImg] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  const scrollToImg = (i: number) => {
    setCurImg(i);
    const el = imgRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  // Auto-rotate images every 3s
  useEffect(() => {
    const t = setInterval(() => {
      setCurImg(prev => {
        const next = (prev + 1) % IMG_PLACEHOLDERS.length;
        const el = imgRef.current;
        if (el) {
          const child = el.children[next] as HTMLElement;
          if (child) el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  if (!product) return <Box style={{ padding: 40, textAlign: "center" }}><Text.Title>Khong tim thay san pham</Text.Title></Box>;

  const dp = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const cp = product.salePrice ?? product.price;
  const st = STOCK_STYLE(product.stockQuantity);
  const related = MOCK_PRODUCTS.filter(p => p.category.slug === product.category.slug && p.id !== product.id).slice(0, 4);

  return (
    <Box style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 140 }}>
      <Header title={product.name} onBackClick={() => nav(-1)} />

      {/* Product Image Gallery */}
      <Box style={{ position: "relative" }}>
        <Box ref={imgRef} style={{ display: "flex", overflowX: "hidden", scrollBehavior: "smooth", height: 300, background: "white" }}>
          {IMG_PLACEHOLDERS.map((img, i) => (
            <Box key={i} style={{ minWidth: "100%", height: 300, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
              <Icon icon="zi-home" style={{ color: "#ccfbf1" }} size={120} />
              <Text style={{ position: "absolute", bottom: 16, color: "#9ca3af", fontSize: 12 }}>Anh {i + 1}/{IMG_PLACEHOLDERS.length}</Text>
            </Box>
          ))}
        </Box>
        {/* Dot indicators */}
        <Box flex justifyContent="center" style={{ position: "absolute", bottom: 40, left: 0, right: 0, gap: 6 }}>
          {IMG_PLACEHOLDERS.map((_, i) => (
            <Box key={i} style={{ width: i === curImg ? 20 : 6, height: 6, borderRadius: 3, background: i === curImg ? "#0d9488" : "rgba(255,255,255,0.6)", transition: "all 0.3s" }} onClick={() => scrollToImg(i)} />
          ))}
        </Box>
        {/* Nav arrows */}
        {curImg > 0 && (
          <Box onClick={() => scrollToImg(curImg - 1)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon icon="zi-chevron-left" style={{ color: "white" }} size={20} />
          </Box>
        )}
        {curImg < IMG_PLACEHOLDERS.length - 1 && (
          <Box onClick={() => scrollToImg(curImg + 1)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon icon="zi-chevron-right" style={{ color: "white" }} size={20} />
          </Box>
        )}
        {dp > 0 && <Box style={{ position: "absolute", top: 12, left: 12, background: "#ef4444", color: "white", padding: "4px 10px", borderRadius: 50, fontSize: 13, fontWeight: 700 }}>-{dp}%</Box>}
      </Box>

      {/* Price + Info */}
      <Box style={{ background: "white", padding: "16px 16px 20px" }}>
        <Box flex alignItems="center" style={{ gap: 4, marginBottom: 6 }}>
          <Box style={{ border: "1px solid #fca5a5", borderRadius: 3, padding: "1px 5px" }}><Text style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>MALL</Text></Box>
          <Text.Title style={{ fontSize: 18 }}>{product.name}</Text.Title>
        </Box>
        <Box flex alignItems="center" style={{ gap: 8, marginBottom: 10 }}>
          <Box flex alignItems="center" style={{ gap: 3 }}>
            <Text style={{ color: "#eab308", fontSize: 13 }}>★★★★★</Text>
            <Text style={{ color: "#9ca3af", fontSize: 12 }}>5.0 | 1,4k da ban</Text>
          </Box>
        </Box>
        <Box flex alignItems="baseline" style={{ gap: 10, marginBottom: 10 }}>
          <Text style={{ color: "#f97316", fontSize: 28, fontWeight: 700 }}>{formatPrice(cp)}</Text>
          {product.salePrice && <Text style={{ color: "#9ca3af", fontSize: 15, textDecoration: "line-through" }}>{formatPrice(product.price)}</Text>}
        </Box>
        <Box flex alignItems="center" style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: "#6b7280" }}>Don vi: <b>{product.unit}</b></Text>
          <Box style={{ background: st.bg, padding: "3px 12px", borderRadius: 50 }}>
            <Text style={{ color: st.color, fontSize: 12, fontWeight: 600 }}>{STOCK_LABEL(product.stockQuantity)}</Text>
          </Box>
        </Box>
        <Box flex style={{ gap: 8, marginTop: 12 }}>
          <Box style={{ background: "#fff7ed", padding: "4px 10px", borderRadius: 50 }}><Text style={{ fontSize: 11, color: "#f97316" }}>🚚 Giao nhanh</Text></Box>
          <Box style={{ background: "#dcfce7", padding: "4px 10px", borderRadius: 50 }}><Text style={{ fontSize: 11, color: "#16a34a" }}>Gia tot</Text></Box>
          <Box style={{ background: "#fef3c7", padding: "4px 10px", borderRadius: 50 }}><Text style={{ fontSize: 11, color: "#a16207" }}>Chinh hang</Text></Box>
        </Box>
      </Box>

      {/* Detailed Info */}
      <Box style={{ background: "white", padding: 16, marginTop: 8 }}>
        <Text.Title size="small" style={{ marginBottom: 14 }}>Thong tin san pham</Text.Title>
        {[
          ["Thanh phan", "Hoat chat chinh dat chuan GMP, dam bao chat luong va an toan cho nguoi su dung."],
          ["Doi tuong su dung", "Nguoi lon va tre em tren 12 tuoi. Tham khao y kien bac si truoc khi dung."],
          ["Huong dan su dung", "Uong 1-2 vien/lan, ngay 2 lan sau bua an. Khong vuot qua 8 vien/ngay."],
          ["Bao quan", "Noi kho rao, tranh anh sang truc tiep. Nhiet do duoi 30 do C."],
        ].map(([label, value], i) => (
          <Box key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{value}</Text>
          </Box>
        ))}
      </Box>

      {/* Related Products */}
      {related.length > 0 && (
        <Box style={{ padding: "16px 16px 0" }}>
          <Text.Title style={{ marginBottom: 12 }}>San pham lien quan</Text.Title>
          <Box style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {related.map((p) => (
              <Box key={p.id} onClick={() => nav("/product/" + p.slug, { animate: false })} style={{ background: "white", borderRadius: 12, padding: 10, minWidth: 140, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Box style={{ width: 70, height: 70, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <Icon icon="zi-home" style={{ color: "#0d9488" }} size={32} />
                </Box>
                <Text style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
                <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 13, marginTop: 4 }}>{formatPrice(p.salePrice ?? p.price)}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Bottom bar — above BottomNavigation */}
      <Box style={{ position: "fixed", bottom: 56, left: 0, right: 0, background: "white", borderTop: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, zIndex: 100 }}>
        <Box onClick={() => {}} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Icon icon="zi-chat" style={{ color: "#0d9488" }} size={22} />
          <Text style={{ fontSize: 10, color: "#0d9488" }}>Chat</Text>
        </Box>
        <Box onClick={() => setLiked(!liked)} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Icon icon="zi-heart" style={{ color: liked ? "#ef4444" : "#9ca3af" }} size={22} />
          <Text style={{ fontSize: 10, color: liked ? "#ef4444" : "#9ca3af" }}>{liked ? "Da thich" : "Thich"}</Text>
        </Box>
        <Box flex alignItems="center" style={{ border: "1px solid #d1d5db", borderRadius: 8 }}>
          <Box style={{ width: 34, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#4b5563" }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</Box>
          <Box style={{ width: 44, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>{quantity}</Box>
          <Box style={{ width: 34, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#4b5563" }} onClick={() => setQuantity(quantity + 1)}>+</Box>
        </Box>
        <Button variant="primary" style={{ flex: 1, borderRadius: 10, height: 44, fontWeight: 600 }} onClick={() => { addToCart(product, quantity); nav("/cart"); }}>
          Them gio ({formatPrice(cp * quantity)})
        </Button>
      </Box>
    </Box>
  );
}
