import React, { useState, useRef, useEffect } from "react";
import { Box, Text, Icon, Button, Header, useNavigate, useParams } from "zmp-ui";
import { useAppStore, formatPrice } from "@/stores/app.store";
import * as productApi from "@/services/products.api";

const STOCK_STYLE = (q: number) => q > 20 ? { color: "#16a34a", bg: "#dcfce7" } : q > 0 ? { color: "#ea580c", bg: "#fff7ed" } : { color: "#dc2626", bg: "#fef2f2" };
const STOCK_LABEL = (q: number) => q > 20 ? `Còn ${q} sp` : q > 0 ? `Sắp hết - còn ${q}` : "Hết hàng";

interface DetailProduct {
  id: string; name: string; slug: string; price: string; sale_price?: string | null;
  retail_price?: string | null; description?: string; short_description?: string;
  unit: string; stock_quantity: number; quantity_per_unit?: string;
  category?: { name: string; slug: string; full_path?: string };
  manufacturer?: { name: string; slug: string; country?: string };
  images?: { image_url: string; is_primary?: boolean }[];
  related_products?: { id: string; name: string; price: string; image_url?: string; slug?: string }[];
  rating?: number; review_count?: number;
}

// Priority: retail_price > sale_price > price
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
        const found = products.find(p => p.slug === slug);
        if (found) {
          setDetail({
            id: found.id, name: found.name, slug: found.slug,
            price: String(found.price),
            sale_price: found.salePrice ? String(found.salePrice) : null,
            unit: found.unit, stock_quantity: found.stockQuantity,
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
  const productImages = (detail?.images && detail.images.length > 0)
    ? detail.images
    : [];
  const galleryImages = productImages.length > 0 ? productImages : null;
  const totalImages = galleryImages ? galleryImages.length : 1;

  const scrollToImg = (i: number) => {
    setCurImg(i);
    const el = imgRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  // Auto-rotate images every 4s
  useEffect(() => {
    if (totalImages <= 1) return;
    const t = setInterval(() => {
      setCurImg(prev => {
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

  // ── Loading state ──
  if (loading) {
    return (
      <Box style={{ background: "#f3f4f6", minHeight: "100vh" }}>
        <Header title="Đang tải..." onBackClick={() => nav(-1)} />
        <Box style={{ padding: 60, textAlign: "center" }}>
          <Box style={{ width: 48, height: 48, borderRadius: 24, background: "#e5e7eb", margin: "0 auto", animation: "pulse 1.5s infinite" }} />
          <Text style={{ color: "#9ca3af", marginTop: 16 }}>Đang tải sản phẩm...</Text>
        </Box>
      </Box>
    );
  }

  // ── Not found ──
  if (!detail) {
    return (
      <Box style={{ background: "#f3f4f6", minHeight: "100vh" }}>
        <Header title="Chi tiết" onBackClick={() => nav(-1)} />
        <Box style={{ padding: 60, textAlign: "center" }}>
          <Icon icon="zi-home" style={{ color: "#d1d5db" }} size={64} />
          <Text.Title style={{ marginTop: 16, color: "#6b7280" }}>Không tìm thấy sản phẩm</Text.Title>
          <Text style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}>Sản phẩm có thể đã bị gỡ hoặc đường dẫn không đúng</Text>
          <Button style={{ marginTop: 20 }} onClick={() => nav("/")}>Về trang chủ</Button>
        </Box>
      </Box>
    );
  }

  const cp = getBestPrice(detail);
  const origPrice = getOriginalPrice(detail);
  const onSale = hasSale(detail);
  const dp = onSale ? Math.round((1 - cp / origPrice) * 100) : 0;
  const st = STOCK_STYLE(detail.stock_quantity);
  const inStock = detail.stock_quantity > 0;

  // Related products from the detail API or from store
  const related = (detail.related_products && detail.related_products.length > 0)
    ? detail.related_products
    : products.filter(p => p.category?.slug === detail.category?.slug && p.id !== detail.id).slice(0, 4);

  // Strip HTML from description for clean text
  const cleanDesc = detail.description
    ? detail.description.replace(/<[^>]+>/g, "").trim()
    : detail.short_description || "";

  return (
    <Box style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 160 }}>
      <Header title={detail.name} onBackClick={() => nav(-1)} />

      {/* Product Image Gallery */}
      <Box style={{ position: "relative", background: "white", paddingTop: 8 }}>
        <Box ref={imgRef} style={{ display: "flex", overflowX: "hidden", scrollBehavior: "smooth", height: 340, background: "#f9fafb" }}>
          {galleryImages ? galleryImages.map((img, i) => (
            <Box key={i} style={{ minWidth: "100%", height: 340, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <img src={img.image_url} alt={`${detail.name}`} style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", paddingTop: 40 }} />
            </Box>
          )) : (
            <Box style={{ minWidth: "100%", height: 340, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Box style={{ width: 180, height: 180, borderRadius: 16, background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon icon="zi-home" style={{ color: "#9ca3af" }} size={80} />
              </Box>
            </Box>
          )}
        </Box>
        {/* Dot indicators */}
        {totalImages > 1 && (
          <Box flex justifyContent="center" style={{ position: "absolute", bottom: 16, left: 0, right: 0, gap: 6 }}>
            {Array.from({ length: totalImages }).map((_, i) => (
              <Box key={i} style={{ width: i === curImg ? 20 : 6, height: 6, borderRadius: 3, background: i === curImg ? "#0d9488" : "rgba(0,0,0,0.25)", transition: "all 0.3s" }} onClick={() => scrollToImg(i)} />
            ))}
          </Box>
        )}
        {/* Nav arrows */}
        {curImg > 0 && (
          <Box onClick={() => scrollToImg(curImg - 1)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon icon="zi-chevron-left" style={{ color: "white" }} size={20} />
          </Box>
        )}
        {curImg < totalImages - 1 && (
          <Box onClick={() => scrollToImg(curImg + 1)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 18, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon icon="zi-chevron-right" style={{ color: "white" }} size={20} />
          </Box>
        )}
        {dp > 0 && <Box style={{ position: "absolute", top: 12, left: 12, background: "#ef4444", color: "white", padding: "4px 10px", borderRadius: 50, fontSize: 13, fontWeight: 700 }}>-{dp}%</Box>}
        {!inStock && (
          <Box style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "white", fontSize: 24, fontWeight: 700, background: "rgba(220,38,38,0.9)", padding: "10px 24px", borderRadius: 8 }}>HẾT HÀNG</Text>
          </Box>
        )}
      </Box>

      {/* Price + Basic Info */}
      <Box style={{ background: "white", padding: "16px 16px 20px" }}>
        <Box flex alignItems="center" style={{ gap: 4, marginBottom: 6 }}>
          <Box style={{ border: "1px solid #fca5a5", borderRadius: 3, padding: "1px 5px" }}><Text style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>MALL</Text></Box>
          <Text.Title style={{ fontSize: 18 }}>{detail.name}</Text.Title>
        </Box>
        <Box flex alignItems="baseline" style={{ gap: 10, marginBottom: 10 }}>
          <Text style={{ color: "#f97316", fontSize: 28, fontWeight: 700 }}>{formatPrice(cp)}</Text>
          {onSale && <Text style={{ color: "#9ca3af", fontSize: 15, textDecoration: "line-through" }}>{formatPrice(origPrice)}</Text>}
        </Box>
        <Box flex alignItems="center" style={{ gap: 12, flexWrap: "wrap" }}>
          <Text style={{ fontSize: 13, color: "#6b7280" }}>Đơn vị: <b>{detail.unit}</b></Text>
          {detail.quantity_per_unit && <Text style={{ fontSize: 13, color: "#6b7280" }}>Quy cách: <b>{detail.quantity_per_unit}</b></Text>}
          <Box style={{ background: st.bg, padding: "3px 12px", borderRadius: 50 }}>
            <Text style={{ color: st.color, fontSize: 12, fontWeight: 600 }}>{STOCK_LABEL(detail.stock_quantity)}</Text>
          </Box>
          {detail.manufacturer && (
            <Text style={{ fontSize: 13, color: "#6b7280" }}>NSX: <b>{detail.manufacturer.name}</b></Text>
          )}
        </Box>
        <Box flex style={{ gap: 8, marginTop: 12 }}>
          <Box style={{ background: "#fff7ed", padding: "4px 10px", borderRadius: 50 }}><Text style={{ fontSize: 11, color: "#f97316" }}>🚚 Giao nhanh</Text></Box>
          <Box style={{ background: "#dcfce7", padding: "4px 10px", borderRadius: 50 }}><Text style={{ fontSize: 11, color: "#16a34a" }}>Giá tốt</Text></Box>
          <Box style={{ background: "#fef3c7", padding: "4px 10px", borderRadius: 50 }}><Text style={{ fontSize: 11, color: "#a16207" }}>Chính hãng</Text></Box>
          {detail.rating && (
            <Box style={{ background: "#fff7ed", padding: "4px 10px", borderRadius: 50 }}>
              <Text style={{ fontSize: 11, color: "#f59e0b" }}>★ {detail.rating.toFixed(1)}</Text>
            </Box>
          )}
        </Box>
      </Box>

      {/* Product Description */}
      {cleanDesc && (
        <Box style={{ background: "white", padding: 16, marginTop: 8 }}>
          <Text.Title size="small" style={{ marginBottom: 12 }}>Mô tả sản phẩm</Text.Title>
          <Text style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, whiteSpace: "pre-line" }}>{cleanDesc}</Text>
        </Box>
      )}

      {/* Detailed Info (generic - since API doesn't have separate fields) */}
      <Box style={{ background: "white", padding: 16, marginTop: 8 }}>
        <Text.Title size="small" style={{ marginBottom: 14 }}>Thông tin chi tiết</Text.Title>
        {[
          ...(detail.manufacturer ? [["Nhà sản xuất", detail.manufacturer.name + (detail.manufacturer.country ? ` (${detail.manufacturer.country})` : "")]] : []),
          ...(detail.category ? [["Danh mục", detail.category.full_path || detail.category.name]] : []),
          ["Đơn vị tính", detail.unit],
          ...(detail.quantity_per_unit ? [["Quy cách", detail.quantity_per_unit]] : []),
          ["Tình trạng", STOCK_LABEL(detail.stock_quantity)],
          ...(detail.description ? [["Mô tả đầy đủ", "Xem chi tiết bên trên"]] : []),
        ].map(([label, value], i, arr) => (
          <Box key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</Text>
            <Text style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{value}</Text>
          </Box>
        ))}
      </Box>

      {/* Related Products */}
      {related.length > 0 && (
        <Box style={{ padding: "16px 16px 0" }}>
          <Text.Title style={{ marginBottom: 12 }}>Sản phẩm liên quan</Text.Title>
          <Box style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
            {related.map((p: any) => (
              <Box key={p.id} onClick={() => { setCurImg(0); setLoading(true); setDetail(null); nav("/product/" + (p.slug || p.id), { animate: false }); }} style={{ background: "white", borderRadius: 12, padding: 10, minWidth: 140, flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Box style={{ width: 70, height: 70, background: "#f3f4f6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", overflow: "hidden" }}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <Icon icon="zi-home" style={{ color: "#0d9488" }} size={32} />}
                </Box>
                <Text style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</Text>
                <Text style={{ color: "#f97316", fontWeight: 700, fontSize: 13, marginTop: 4 }}>{formatPrice(Number(p.price))}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Bottom action bar */}
      <Box style={{ position: "fixed", bottom: 56, left: 0, right: 0, background: "white", borderTop: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, zIndex: 100 }}>
        <Box onClick={() => {}} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Icon icon="zi-chat" style={{ color: "#0d9488" }} size={22} />
          <Text style={{ fontSize: 10, color: "#0d9488" }}>Chat</Text>
        </Box>
        <Box onClick={() => setLiked(!liked)} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Icon icon="zi-heart" style={{ color: liked ? "#ef4444" : "#9ca3af" }} size={22} />
          <Text style={{ fontSize: 10, color: liked ? "#ef4444" : "#9ca3af" }}>{liked ? "Đã thích" : "Thích"}</Text>
        </Box>
        <Box flex alignItems="center" style={{ border: "1px solid #d1d5db", borderRadius: 8 }}>
          <Box style={{ width: 34, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#4b5563" }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</Box>
          <Box style={{ width: 44, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, borderLeft: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb" }}>{quantity}</Box>
          <Box style={{ width: 34, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#4b5563" }} onClick={() => setQuantity(quantity + 1)}>+</Box>
        </Box>
        <Button
          variant="primary"
          style={{ flex: 1, borderRadius: 10, height: 44, fontWeight: 600 }}
          disabled={!inStock}
          onClick={() => {
            if (!inStock) return;
            addToCart({
              id: detail.id, name: detail.name, slug: detail.slug,
              price: cp, unit: detail.unit, stockQuantity: detail.stock_quantity,
              category: detail.category || { name: "", slug: "" },
              imageUrl: galleryImages?.[0]?.image_url,
            } as any, quantity);
            nav("/cart");
          }}
        >
          {inStock ? `Thêm giỏ (${formatPrice(cp * quantity)})` : "Hết hàng"}
        </Button>
      </Box>
    </Box>
  );
}
