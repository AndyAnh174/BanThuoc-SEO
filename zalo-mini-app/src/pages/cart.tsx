import React, { useState } from "react";
import { Box, Text, Icon, Button, useNavigate } from "zmp-ui";
import { useAppStore, formatPrice } from "@/stores/app.store";
import Logo from "@/components/logo";

export default function CartPage() {
  const nav = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useAppStore();

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    cart.forEach((i) => {
      init[i.product.id] = true;
    });
    return init;
  });

  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>({
    code: "NGOCKIMNGAN20K",
    discount: 20000,
  });

  const toggleSelectAll = () => {
    const allSelected = cart.every((i) => selectedIds[i.product.id]);
    const updated: Record<string, boolean> = {};
    cart.forEach((i) => {
      updated[i.product.id] = !allSelected;
    });
    setSelectedIds(updated);
  };

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedItems = cart.filter((i) => selectedIds[i.product.id]);
  const subtotal = selectedItems.reduce(
    (s, i) => s + (i.product.salePrice ?? i.product.price) * i.quantity,
    0
  );
  const discountAmount = appliedVoucher ? Math.min(appliedVoucher.discount, subtotal) : 0;
  const shippingFee = subtotal >= 200000 || subtotal === 0 ? 0 : 15000;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
      return;
    }
    alert(`Đặt hàng thành công! Tổng thanh toán: ${formatPrice(finalTotal)}. Dược sĩ sẽ liên hệ giao hàng.`);
    clearCart();
    nav("/");
  };

  return (
    <Box style={{ background: "#f5f5f5", minHeight: "100vh", paddingBottom: 110 }}>
      {/* Top Bar Header */}
      <Box
        style={{
          padding: "14px 16px",
          paddingTop: 50,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box flex alignItems="center" style={{ gap: 12 }}>
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
            }}
          >
            <Icon icon="zi-chevron-left" style={{ color: "#334155" }} size={20} />
          </Box>
          <Text style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Giỏ hàng của bạn ({cart.length})
          </Text>
        </Box>

        {cart.length > 0 && (
          <Text style={{ fontSize: 12, color: "#ef4444", cursor: "pointer" }} onClick={clearCart}>
            Xóa tất cả
          </Text>
        )}
      </Box>

      {/* Cart Content */}
      <Box style={{ padding: 16 }}>
        {cart.length === 0 ? (
          /* Empty Cart */
          <Box
            style={{
              background: "white",
              borderRadius: 16,
              padding: 40,
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              marginTop: 20,
            }}
          >
            <Text style={{ fontSize: 50, marginBottom: 12 }}>🛒</Text>
            <Text style={{ fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
              Giỏ hàng đang trống
            </Text>
            <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, marginBottom: 20 }}>
              Hãy chọn thêm sản phẩm thuốc & TPCN chính hãng vào giỏ hàng ngay
            </Text>
            <Button
              variant="primary"
              style={{ background: "#ee4d2d", borderRadius: 24, padding: "10px 28px" }}
              onClick={() => nav("/")}
            >
              Khám phá sản phẩm
            </Button>
          </Box>
        ) : (
          <>
            {/* Delivery Address Summary Banner */}
            <Box
              style={{
                background: "white",
                borderRadius: 14,
                padding: 14,
                marginBottom: 12,
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <Box flex justifyContent="space-between" alignItems="center">
                <Box flex alignItems="center" style={{ gap: 8 }}>
                  <Icon icon="zi-location" style={{ color: "#0d9488" }} size={18} />
                  <Text style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                    Giao tới: NGUYỄN THỊ A (0901234567)
                  </Text>
                </Box>
                <Text style={{ fontSize: 11, color: "#ee4d2d", fontWeight: 600 }}>Đổi</Text>
              </Box>
              <Text style={{ fontSize: 12, color: "#64748b", marginTop: 4, paddingLeft: 26 }}>
                123 Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh
              </Text>
            </Box>

            {/* Select All Checkbox Header */}
            <Box
              flex
              alignItems="center"
              justifyContent="space-between"
              style={{
                background: "white",
                borderRadius: "14px 14px 0 0",
                padding: "12px 14px",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <Box flex alignItems="center" style={{ gap: 10, cursor: "pointer" }} onClick={toggleSelectAll}>
                <input
                  type="checkbox"
                  checked={cart.length > 0 && cart.every((i) => selectedIds[i.product.id])}
                  onChange={toggleSelectAll}
                  style={{ accentColor: "#ee4d2d", width: 18, height: 18 }}
                />
                <Text style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                  Chọn tất cả ({cart.length} sản phẩm)
                </Text>
              </Box>
            </Box>

            {/* Cart Items List */}
            <Box style={{ background: "white", borderRadius: "0 0 14px 14px", marginBottom: 14 }}>
              {cart.map((item, index) => {
                const isSelected = !!selectedIds[item.product.id];
                const finalPrice = item.product.salePrice ?? item.product.price;
                return (
                  <Box
                    key={item.product.id || index}
                    flex
                    alignItems="center"
                    style={{
                      padding: 14,
                      gap: 12,
                      borderBottom: index < cart.length - 1 ? "1px solid #f8fafc" : "none",
                    }}
                  >
                    {/* Item Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.product.id)}
                      style={{ accentColor: "#ee4d2d", width: 18, height: 18, flexShrink: 0 }}
                    />

                    {/* Image */}
                    <Box
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: 8,
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        overflow: "hidden",
                      }}
                    >
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                        />
                      ) : (
                        <Icon icon="zi-home" style={{ color: "#ee4d2d" }} size={28} />
                      )}
                    </Box>

                    {/* Product Details */}
                    <Box flex flexDirection="column" justifyContent="space-between" style={{ flex: 1, minWidth: 0 }}>
                      <Box flex justifyContent="space-between" alignItems="flex-start">
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1e293b",
                            truncate: true,
                          }}
                        >
                          {item.product.name}
                        </Text>
                        <Icon
                          icon="zi-delete"
                          style={{ color: "#cbd5e1", cursor: "pointer", marginLeft: 6 }}
                          size={18}
                          onClick={() => removeFromCart(item.product.id)}
                        />
                      </Box>

                      <Text style={{ fontSize: 14, fontWeight: 800, color: "#ee4d2d", marginTop: 4 }}>
                        {formatPrice(finalPrice)}
                      </Text>

                      {/* Quantity Controls */}
                      <Box flex justifyContent="space-between" alignItems="center" style={{ marginTop: 6 }}>
                        <Text style={{ fontSize: 11, color: "#94a3b8" }}>
                          Đơn vị: {item.product.unit || "Hộp"}
                        </Text>

                        <Box flex alignItems="center" style={{ border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <Box
                            style={{
                              width: 28,
                              height: 26,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#475569",
                              cursor: "pointer",
                              background: "#f8fafc",
                            }}
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            -
                          </Box>
                          <Box
                            style={{
                              width: 32,
                              height: 26,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                            }}
                          >
                            {item.quantity}
                          </Box>
                          <Box
                            style={{
                              width: 28,
                              height: 26,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 700,
                              color: "#475569",
                              cursor: "pointer",
                              background: "#f8fafc",
                            }}
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            +
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Voucher Section */}
            <Box
              style={{
                background: "white",
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
                border: "1px solid #f1f5f9",
              }}
            >
              <Box flex justifyContent="space-between" alignItems="center">
                <Box flex alignItems="center" style={{ gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>🎟️</Text>
                  <Text style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>
                    Voucher nhà thuốc
                  </Text>
                </Box>

                {appliedVoucher ? (
                  <Box flex alignItems="center" style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: 700, color: "#ee4d2d" }}>
                      -{formatPrice(appliedVoucher.discount)}
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: "#94a3b8", cursor: "pointer" }}
                      onClick={() => setAppliedVoucher(null)}
                    >
                      Xóa
                    </Text>
                  </Box>
                ) : (
                  <Text
                    style={{ fontSize: 12, color: "#ee4d2d", fontWeight: 700, cursor: "pointer" }}
                    onClick={() =>
                      setAppliedVoucher({ code: "NGOCKIMNGAN20K", discount: 20000 })
                    }
                  >
                    Chọn hoặc nhập mã ›
                  </Text>
                )}
              </Box>
            </Box>

            {/* Payment Summary Box */}
            <Box
              style={{
                background: "white",
                borderRadius: 14,
                padding: 14,
                marginBottom: 14,
                border: "1px solid #f1f5f9",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                Chi tiết thanh toán
              </Text>

              <Box flex justifyContent="space-between" style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: "#64748b" }}>Tiền hàng ({selectedItems.length} sp)</Text>
                <Text style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                  {formatPrice(subtotal)}
                </Text>
              </Box>

              <Box flex justifyContent="space-between" style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: "#64748b" }}>Giảm giá Voucher</Text>
                <Text style={{ fontSize: 13, fontWeight: 600, color: "#ee4d2d" }}>
                  -{formatPrice(discountAmount)}
                </Text>
              </Box>

              <Box flex justifyContent="space-between" style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: "#64748b" }}>Phí vận chuyển</Text>
                <Text style={{ fontSize: 13, fontWeight: 600, color: shippingFee === 0 ? "#16a34a" : "#1e293b" }}>
                  {shippingFee === 0 ? "Freeship 0đ" : formatPrice(shippingFee)}
                </Text>
              </Box>

              <Box
                style={{
                  borderTop: "1px dashed #e2e8f0",
                  marginTop: 8,
                  paddingTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Tổng thanh toán</Text>
                <Text style={{ fontSize: 18, fontWeight: 800, color: "#ee4d2d" }}>
                  {formatPrice(finalTotal)}
                </Text>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Fixed Bottom Checkout Bar */}
      {cart.length > 0 && (
        <Box
          style={{
            position: "fixed",
            bottom: 50,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid #e2e8f0",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.06)",
            zIndex: 100,
          }}
        >
          <Box>
            <Text style={{ fontSize: 11, color: "#64748b" }}>
              Đã chọn {selectedItems.length} sản phẩm
            </Text>
            <Text style={{ fontSize: 16, fontWeight: 800, color: "#ee4d2d" }}>
              {formatPrice(finalTotal)}
            </Text>
          </Box>

          <Button
            variant="primary"
            style={{
              background: "linear-gradient(135deg, #ee4d2d, #ff7337)",
              borderRadius: 24,
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: 14,
            }}
            onClick={handleCheckout}
          >
            Mua Hàng ({selectedItems.length})
          </Button>
        </Box>
      )}
    </Box>
  );
}
