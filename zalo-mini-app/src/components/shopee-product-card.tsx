import React from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";
import { Product, formatPrice, useAppStore } from "@/stores/app.store";

interface ShopeeProductCardProps {
  product: Product;
  discountPercentage?: number;
  salesCount?: string | number;
  rating?: number;
  isListMode?: boolean;
}

export function ShopeeProductCard({
  product,
  discountPercentage = 25,
  salesCount = "1.2k",
  rating = 5.0,
  isListMode = false,
}: ShopeeProductCardProps) {
  const nav = useNavigate();
  const { addToCart } = useAppStore();

  const finalPrice = product.salePrice ?? product.price;

  // Determine original price & discount percentage
  const realDiscount =
    product.salePrice && product.price > product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : discountPercentage;

  const displayOriginalPrice =
    product.salePrice && product.price > product.salePrice
      ? product.price
      : Math.round((finalPrice * (1 + realDiscount / 100)) / 1000) * 1000;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  if (isListMode) {
    return (
      <Box
        className="shopee-card"
        onClick={() => nav(`/product/${product.slug}`)}
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 10,
          gap: 12,
          marginBottom: 10,
        }}
      >
        {/* Discount Badge */}
        {realDiscount > 0 && (
          <Box className="shopee-discount-badge">
            Giảm {realDiscount}%
          </Box>
        )}

        {/* Product Image */}
        <Box
          style={{
            width: 100,
            height: 100,
            borderRadius: 8,
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
            />
          ) : (
            <Icon icon="zi-home" style={{ color: "#ee4d2d" }} size={36} />
          )}
        </Box>

        {/* Product Info */}
        <Box flex flexDirection="column" justifyContent="space-between" style={{ flex: 1, minWidth: 0 }}>
          <Box>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#1e293b",
                lineHeight: "1.3",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.name}
            </Text>

            {/* Badges Line */}
            <Box flex alignItems="center" style={{ gap: 6, marginTop: 4 }}>
              <Box
                style={{
                  background: "#e6f4ea",
                  padding: "1px 6px",
                  borderRadius: 4,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: 700, color: "#137333" }}>🚚 Freeship</Text>
              </Box>
            </Box>
          </Box>

          {/* Rating & Sales */}
          <Box flex alignItems="center" style={{ gap: 6, marginTop: 4 }}>
            <Text style={{ fontSize: 11, color: "#eab308", fontWeight: 700 }}>★ {rating.toFixed(1)}</Text>
            <Text style={{ fontSize: 11, color: "#94a3b8" }}>|</Text>
            <Text style={{ fontSize: 11, color: "#64748b" }}>Đã bán {salesCount}</Text>
          </Box>

          {/* Price & Cart Button */}
          <Box flex justifyContent="space-between" alignItems="flex-end" style={{ marginTop: 6 }}>
            <Box>
              <Text style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through", display: "block" }}>
                {formatPrice(displayOriginalPrice)}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: 800, color: "#ee4d2d" }}>
                {formatPrice(finalPrice)}
              </Text>
            </Box>

            <Box className="shopee-cart-btn" onClick={handleAddToCart}>
              <Icon icon="zi-cart" style={{ color: "#ee4d2d" }} size={16} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      className="shopee-card"
      onClick={() => nav(`/product/${product.slug}`)}
    >
      {/* Discount Tag */}
      {realDiscount > 0 && (
        <Box className="shopee-discount-badge">
          Giảm {realDiscount}%
        </Box>
      )}

      {/* Product Image Square Container */}
      <Box
        style={{
          width: "100%",
          paddingTop: "100%", // 1:1 Aspect ratio
          position: "relative",
          background: "#ffffff",
          borderBottom: "1px solid #f8fafc",
        }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 10,
            }}
          />
        ) : (
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="zi-home" style={{ color: "#ee4d2d" }} size={40} />
          </Box>
        )}
      </Box>

      {/* Product Body */}
      <Box style={{ padding: 10, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <Box>
          {/* Title 2 lines max */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#1e293b",
              lineHeight: "1.35",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: 35,
            }}
          >
            {product.name}
          </Text>

          {/* Badges Line */}
          <Box flex alignItems="center" style={{ gap: 4, marginTop: 6, flexWrap: "wrap" }}>
            <Box
              style={{
                background: "#e6f4ea",
                padding: "2px 6px",
                borderRadius: 4,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: 700, color: "#137333" }}>🚚 Freeship</Text>
            </Box>
          </Box>

          {/* Rating & Sales count */}
          <Box flex alignItems="center" style={{ gap: 6, marginTop: 6 }}>
            <Text style={{ fontSize: 11, color: "#eab308", fontWeight: 700 }}>★ {rating.toFixed(1)}</Text>
            <Text style={{ fontSize: 11, color: "#94a3b8" }}>|</Text>
            <Text style={{ fontSize: 11, color: "#64748b" }}>Đã bán {salesCount}</Text>
          </Box>
        </Box>

        {/* Price & Floating Cart Button */}
        <Box flex justifyContent="space-between" alignItems="flex-end" style={{ marginTop: 8 }}>
          <Box>
            <Text style={{ fontSize: 10, color: "#94a3b8", textDecoration: "line-through", display: "block" }}>
              {formatPrice(displayOriginalPrice)}
            </Text>
            <Text style={{ fontSize: 15, fontWeight: 800, color: "#ee4d2d" }}>
              {formatPrice(finalPrice)}
            </Text>
          </Box>

          {/* Cart Icon Round Button */}
          <Box className="shopee-cart-btn" onClick={handleAddToCart}>
            <Icon icon="zi-cart" style={{ color: "#ee4d2d" }} size={16} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
