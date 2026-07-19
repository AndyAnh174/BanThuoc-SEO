import React from "react";
import { Box, Text, Icon, Button, useNavigate } from "zmp-ui";
import { useAppStore, formatPrice } from "@/stores/app.store";

export default function CartPage() {
  const nav = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart } = useAppStore();
  const total = cartTotal();

  return (
    <Box style={{ background: "#f3f4f6", minHeight: "100vh", paddingBottom: 80 }}>
      <Box style={{ padding: "14px 16px", paddingTop: 50, background: "white", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Box onClick={() => nav("/")} style={{ width: 36, height: 36, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon icon="zi-chevron-left" style={{ color: "#4b5563" }} size={22} />
        </Box>
        <Text.Title style={{ fontSize: 20, fontWeight: 700 }}>Gio hang ({cartCount()} SP)</Text.Title>
      </Box>

      {cart.length === 0 ? (
        <Box className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Icon icon="zi-cart" size={60} className="mb-4 opacity-30" />
          <Text.Title className="text-gray-400 mb-2">Giỏ hàng trống</Text.Title>
          <Button variant="primary" onClick={() => nav("/")}>Tiếp tục mua sắm</Button>
        </Box>
      ) : (
        <>
          <Box className="p-4 space-y-3">
            {cart.map((item) => (
              <Box key={item.product.id} className="bg-white rounded-xl p-3">
                <Box flex className="space-x-3">
                  <Box className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon icon="zi-pill" className="text-teal-400" size={28} />
                  </Box>
                  <Box className="flex-1">
                    <span className="text-sm font-medium line-clamp-2">{item.product.name}</span>
                    <span className="text-red-500 font-bold text-sm">{formatPrice((item.product.salePrice ?? item.product.price) * item.quantity)}</span>
                    <Box flex alignItems="center" justifyContent="space-between" className="mt-2">
                      <Box flex alignItems="center" className="border rounded-lg">
                        <Box className="w-8 h-8 flex items-center justify-center text-lg" onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>−</Box>
                        <Box className="w-10 h-8 flex items-center justify-center font-medium text-sm">{item.quantity}</Box>
                        <Box className="w-8 h-8 flex items-center justify-center text-lg" onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</Box>
                      </Box>
                      <Icon icon="zi-delete" className="text-red-400" size={20} onClick={() => removeFromCart(item.product.id)} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          <Box className="bg-white mx-4 rounded-xl p-4 space-y-2 mb-4">
            <Box flex justifyContent="space-between"><span className="text-gray-500">Tạm tính</span><span>{formatPrice(total)}</span></Box>
            <Box flex justifyContent="space-between"><span className="text-gray-500">Phí ship</span><span className="text-teal-500">Tính sau</span></Box>
            <Box flex justifyContent="space-between" className="pt-2 border-t"><span className="font-bold">Tổng</span><span className="text-red-500 font-bold text-lg">{formatPrice(total)}</span></Box>
          </Box>

          <Box className="px-4 space-y-2 mb-4">
            <Button variant="primary" size="large" className="w-full" onClick={() => nav("/")}>Thanh toán</Button>
            <Button variant="secondary" size="small" className="w-full text-gray-400" onClick={clearCart}>Xóa toàn bộ</Button>
          </Box>
        </>
      )}
    </Box>
  );
}
