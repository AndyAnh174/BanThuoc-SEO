import React, { useState, useRef, useEffect } from "react";
import { Box, Text, Icon, Button, Header, useNavigate, useParams } from "zmp-ui";
import { useAppStore, formatPrice } from "@/stores/app.store";
import * as productApi from "@/services/products.api";

const STOCK_STYLE = (q: number) =>
  q > 20
    ? { color: "#16a34a", bg: "#dcfce7" }
    : q > 0
    ? { color: "#ea580c", bg: "#fff7ed" }
    : { color: "#dc2626", bg: "#fef2f2" };

const STOCK_LABEL = (q: number) =>
  q > 20 ? `Còn ${q} sp` : q > 0 ? `Sắp hết - còn ${q}` : "Hết hàng";

interface DetailProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  sale_price?: string | null;
  retail_price?: string | null;
  description?: string;
  short_description?: string;
  unit: string;
  stock_quantity: number;
  quantity_per_unit?: string;
  category?: { name: string; slug: string; full_path?: string };
  manufacturer?: { name: string; slug: string; country?: string };
  images?: { image_url: string; is_primary?: boolean }[];
  related_products?: { id: string; name: string; price: string; image_url?: string; slug?: string }[];
  rating?: number;
  review_count?: number;
}

function getBestPrice(p: DetailProduct): number {
  return Number(p.retail_price || p.sale_price || p.price || 0);
}
function getOriginalPrice(p: DetailProduct): number {
  return Number(p.price || 0);
}
function hasSale(p: DetailProduct): boolean {
  const best = getBestPrice(p);
  const orig = getOriginalPrice(p);
  return best < orig;
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { addToCart, products } = useAppStore();

  const [detail, setDetail] = useState<DetailProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [curImg, setCurImg] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  // Fetch product detail from API
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await productApi.getProduct(slug);
        setDetail(data as any);
      } catch {
        // Fallback to store products
        const found = products.find((p) => p.slug === slug);
        if (found) {
          setDetail({
            id: found.id,
            name: found.name,
            slug: found.slug,
            price: String(found.price),
            sale_price: found.salePrice ? String(found.salePrice) : null,
            unit: found.unit,
            stock_quantity: found.stockQuantity,
            description: found.description,
            category: found.category,
            manufacturer: found.manufacturer,
            images: found.images,
          });
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  // Build image gallery
  const productImages = detail?.images && detail.images.length > 0 ? detail.images : [];
  const galleryImages = productImages.length > 0 ? productImages : null;
  const totalImages = galleryImages ? galleryImages.length : 1;

  const scrollToImg = (i: number) => {
    setCurImg(i);
    const el = imgRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (totalImages <= 1) return;
    const t = setInterval(() => {
      setCurImg((prev) => {
        const next = (prev + 1) % totalImages;
        const el = imgRef.current;
        if (el) {
          const child = el.children[next] as HTMLElement;
          if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [totalImages]);

  if (loading) {
    return (
      <Box style={{ background: "#f5f5f5", minHeight: "100vh" }}>
        <Header title="Đang tải..." onBackClick={() => nav(-1)} />
        <Box style={{ padding: 60, textAlign: "center" }}>
          <Text style={{ color: "#94a3b8" }}>Đang tải thông tin sản phẩm...</Text>
        </Box>
      </Box>
    );
  }

  if (!detail) {
    return (
      <Box style={{ background: "#f5f5f5", minHeight: "100vh" }}>
        <Header title="Chi tiết" onBackClick={() => nav(-1)} />
        <Box style={{ padding: 60, textAlign: "center" }}>
          <Text style={{ fontSize: 40 }}>💊</Text>
          <Text style={{ marginTop: 16, color: "#1e293b", fontSize: 16, fontWeight: 700 }}>
            Không tìm thấy sản phẩm
          </Text>
          <Button style={{ marginTop: 20, background: "#ee4d2d", borderRadius: 20 }} onClick={() => nav("/")}>
            Về trang chủ
          </Button>
        </Box>
      </Box>
    );
  }

  const cp = getBestPrice(detail);
  const origPrice = getOriginalPrice(detail);
  const onSale = hasSale(detail);
  const dp = onSale ? Math.round((1 - cp / origPrice) * 100) : 35;
  const st = STOCK_STYLE(detail.stock_quantity);
  const inStock = detail.stock_quantity > 0;

  const related =
    detail.related_products && detail.related_products.length > 0
      ? detail.related_products
      : products.filter((p) => p.category?.slug === detail.category?.slug && p.id !== detail.id).slice(0, 4);

  const cleanDesc = detail.description
    ? detail.description.replace(/<[^>]+>/g, "").trim()
    : detail.short_description || "";

  return (
    <Box style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 120 }}>
      <Header title={detail.name} onBackClick={() => nav(-1)} />

      {/* Product Image Gallery Slider */}
      <Box style={{ position: "relative", background: "white", paddingTop: 8 }}>
        <Box
          ref={imgRef}
          style={{
            display: "flex",
            overflowX: "hidden",
            scrollBehavior: "smooth",
            height: 320,
            background: "#ffffff",
          }}
        >
          {galleryImages ? (
            galleryImages.map((img, i) => (
              <Box
                key={i}
                style={{
                  minWidth: "100%",
                  height: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <img
                  src={img.image_url}
                  alt={`${detail.name}`}
                  style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
                />
              </Box>
            ))
          ) : (
            <Box
              style={{
                minWidth: "100%",
                height: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon icon="zi-home" style={{ color: "#cbd5e1" }} size={90} />
            </Box>
          )}
        </Box>

        {/* Gallery Dots */}
        {totalImages > 1 && (
          <Box flex justifyContent="center" style={{ position: "absolute", bottom: 16, left: 0, right: 0, gap: 6 }}>
            {Array.from({ length: totalImages }).map((_, i) => (
              <Box
                key={i}
                style={{
                  width: i === curImg ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === curImg ? "#ee4d2d" : "rgba(0,0,0,0.2)",
                  transition: "all 0.3s",
                }}
                onClick={() => scrollToImg(i)}
              />
            ))}
          </Box>
        )}

        {/* Discount Badge */}
        {dp > 0 && (
          <Box
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "#ee4d2d",
              color: "white",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Giảm {dp}%
          </Box>
        )}
      </Box>

      {/* Main Info Box */}
      <Box style={{ background: "white", padding: "16px", marginBottom: 10 }}>
        {/* Mall Badge & Title */}
        <Box flex alignItems="center" style={{ gap: 6, marginBottom: 8 }}>
          <Box
            style={{
              background: "#ee4d2d",
              color: "white",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 800,
            }}
          >
            MALL
          </Box>
          <Text style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
            {detail.name}
          </Text>
        </Box>

        {/* Price & Rating */}
        <Box flex alignItems="baseline" style={{ gap: 10, marginBottom: 10 }}>
          <Text style={{ color: "#ee4d2d", fontSize: 26, fontWeight: 800 }}>
            {formatPrice(cp)}
          </Text>
          {onSale && (
            <Text style={{ color: "#94a3b8", fontSize: 14, textDecoration: "line-through" }}>
              {formatPrice(origPrice)}
            </Text>
          )}
        </Box>

        {/* Badges line */}
        <Box flex alignItems="center" style={{ gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <Box style={{ background: "#e6f4ea", padding: "3px 10px", borderRadius: 12 }}>
            <Text style={{ fontSize: 11, color: "#137333", fontWeight: 700 }}>🚚 Freeship 0đ</Text>
          </Box>
          <Box style={{ background: "#fff7ed", padding: "3px 10px", borderRadius: 12 }}>
            <Text style={{ fontSize: 11, color: "#ea580c", fontWeight: 700 }}>★ 5.0 | Đã bán 1.2k</Text>
          </Box>
          <Box style={{ background: st.bg, padding: "3px 10px", borderRadius: 12 }}>
            <Text style={{ color: st.color, fontSize: 11, fontWeight: 700 }}>
              {STOCK_LABEL(detail.stock_quantity)}
            </Text>
          </Box>
        </Box>

        <Box style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
          <Text style={{ fontSize: 13, color: "#64748b" }}>
            Đơn vị tính: <b>{detail.unit}</b>
            {detail.manufacturer && ` • NSX: ${detail.manufacturer.name}`}
          </Text>
        </Box>
      </Box>

      {/* Description Box */}
      {cleanDesc && (
        <Box style={{ background: "white", padding: 16, marginBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
            Mô tả sản phẩm
          </Text>
          <Text style={{ fontSize: 14, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {cleanDesc}
          </Text>
        </Box>
      )}

      {/* Fixed Bottom Action Bar */}
      <Box
        style={{
          position: "fixed",
          bottom: 50,
          left: 0,
          right: 0,
          background: "white",
          borderTop: "1px solid #e2e8f0",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
          zIndex: 100,
        }}
      >
        {/* Chat Dược sĩ */}
        <Box
          onClick={() => nav("/profile")}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
        >
          <Icon icon="zi-chat" style={{ color: "#0d9488" }} size={22} />
          <Text style={{ fontSize: 10, color: "#0d9488", fontWeight: 600 }}>Chat Dược Sĩ</Text>
        </Box>

        {/* Quantity Controls */}
        <Box flex alignItems="center" style={{ border: "1px solid #cbd5e1", borderRadius: 8 }}>
          <Box
            style={{
              width: 32,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#334155",
              cursor: "pointer",
            }}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
          >
            -
          </Box>
          <Box
            style={{
              width: 36,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {quantity}
          </Box>
          <Box
            style={{
              width: 32,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: "#334155",
              cursor: "pointer",
            }}
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </Box>
        </Box>

        {/* Add to Cart */}
        <Button
          variant="secondary"
          style={{
            borderRadius: 20,
            color: "#ee4d2d",
            background: "#fff0f0",
            border: "1px solid #ffd8d8",
            fontWeight: 700,
            fontSize: 13,
            padding: "8px 14px",
          }}
          disabled={!inStock}
          onClick={() => {
            if (!inStock) return;
            addToCart(
              {
                id: detail.id,
                name: detail.name,
                slug: detail.slug,
                price: cp,
                unit: detail.unit,
                stockQuantity: detail.stock_quantity,
                category: detail.category || { name: "", slug: "" },
                imageUrl: galleryImages?.[0]?.image_url,
              } as any,
              quantity
            );
            alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
          }}
        >
          Thêm Giỏ
        </Button>

        {/* Buy Now */}
        <Button
          variant="primary"
          style={{
            flex: 1,
            borderRadius: 20,
            background: "linear-gradient(135deg, #ee4d2d, #ff7337)",
            fontWeight: 700,
            fontSize: 14,
            padding: "8px 16px",
          }}
          disabled={!inStock}
          onClick={() => {
            if (!inStock) return;
            addToCart(
              {
                id: detail.id,
                name: detail.name,
                slug: detail.slug,
                price: cp,
                unit: detail.unit,
                stockQuantity: detail.stock_quantity,
                category: detail.category || { name: "", slug: "" },
                imageUrl: galleryImages?.[0]?.image_url,
              } as any,
              quantity
            );
            nav("/cart");
          }}
        >
          Mua Ngay
        </Button>
      </Box>
    </Box>
  );
}
