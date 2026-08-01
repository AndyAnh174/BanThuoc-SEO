import { create } from "zustand";
import { getUserInfo, getAccessToken, getPhoneNumber } from "zmp-sdk/apis";
import * as authApi from "@/services/auth.api";
import * as cartApi from "@/services/cart.api";
import * as productApi from "@/services/products.api";

// ── Types ─────────────────────────────────────────────
export interface Product {
  id: string; name: string; slug: string; price: number;
  salePrice?: number | null; imageUrl?: string; unit: string;
  category: { name: string; slug: string }; stockQuantity: number;
  manufacturer?: { name: string }; description?: string;
  images?: { image_url: string; is_primary?: boolean }[];
}

export interface CartItem { product: Product; quantity: number; }
export interface User {
  id: string; name: string; avatar: string; phone?: string;
  membershipTier: "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  loyaltyPoints: number; totalSpent: number;
}

interface AppState {
  user: User | null; isAuthenticated: boolean;
  cart: CartItem[]; products: Product[]; loading: boolean;

  login: () => Promise<void>; logout: () => void;
  loadProducts: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  cartTotal: () => number; cartCount: () => number;
}

// ── Mock fallback for dev (no Zalo app) ───────────────
export const MOCK_PRODUCTS: Product[] = [
  { id: "1", name: "Paracetamol 500mg", slug: "paracetamol-500mg", price: 55000, salePrice: 49000, unit: "Hộp", category: { name: "Giảm đau kháng viêm", slug: "giam-dau" }, stockQuantity: 100 },
  { id: "2", name: "Vitamin C 1000mg", slug: "vitamin-c-1000mg", price: 120000, salePrice: 99000, unit: "Hộp", category: { name: "Vitamin", slug: "vitamin" }, stockQuantity: 50 },
  { id: "3", name: "Panadol Extra", slug: "panadol-extra", price: 85000, unit: "Hộp", category: { name: "Giảm đau kháng viêm", slug: "giam-dau" }, stockQuantity: 80 },
  { id: "4", name: "Bổ não Ginkgo Biloba", slug: "ginkgo-biloba", price: 180000, salePrice: 155000, unit: "Hộp", category: { name: "Thực phẩm chức năng", slug: "tpcn" }, stockQuantity: 30 },
  { id: "5", name: "Kem chống nắng SPF50+", slug: "kem-chong-nang-spf50", price: 220000, salePrice: 189000, unit: "Tuýp", category: { name: "Dược mỹ phẩm", slug: "duoc-my-pham" }, stockQuantity: 45 },
  { id: "6", name: "Nước muối sinh lý 0.9%", slug: "nuoc-muoi-sinh-ly", price: 15000, unit: "Chai", category: { name: "Thiết bị y tế", slug: "tb-yt" }, stockQuantity: 200 },
  { id: "7", name: "Siro ho Prospan", slug: "siro-ho-prospan", price: 95000, salePrice: 79000, unit: "Chai", category: { name: "Hô hấp", slug: "ho-hap" }, stockQuantity: 60 },
  { id: "8", name: "Men tiêu hóa Enterogermina", slug: "enterogermina", price: 250000, salePrice: 215000, unit: "Hộp", category: { name: "Tiêu hóa", slug: "tieu-hoa" }, stockQuantity: 25 },
];

// ── Store ──────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  user: null, isAuthenticated: false, cart: [], products: [...MOCK_PRODUCTS], loading: false,

  login: async () => {
    try {
      const { userInfo } = await getUserInfo({ autoRequestPermission: true });
      let zaloToken = "dev_mock_access_token";
      try {
        const tokenRes = (await getAccessToken({}) as any);
        if (tokenRes && tokenRes.accessToken) zaloToken = tokenRes.accessToken;
      } catch {}

      let phone = "";
      try { const { number } = await getPhoneNumber({}); phone = number ?? ""; } catch {}

      // Call backend
      try {
        const data = await authApi.login(zaloToken, userInfo.name, userInfo.avatar);
        localStorage.setItem("zaloAccessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        set({ user: data.user, isAuthenticated: true });
        get().syncCart();
        return;
      } catch { /* backend not available, use mock */ }


      localStorage.setItem("zaloAccessToken", zaloToken);
      set({
        user: { id: userInfo.id, name: userInfo.name, avatar: userInfo.avatar, phone, membershipTier: "SILVER", loyaltyPoints: 0, totalSpent: 0 },
        isAuthenticated: true,
      });
    } catch {
      // Dev fallback
      set({
        user: { id: "dev-1", name: "Nguyễn Thị A", avatar: "", phone: "0901234567", membershipTier: "GOLD", loyaltyPoints: 25000, totalSpent: 3500000 },
        isAuthenticated: true,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("zaloAccessToken"); localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false, cart: [] });
  },

  loadProducts: async () => {
    set({ loading: true });
    try {
      const data = await productApi.getProducts({ page_size: "500" });

      if (data.results && data.results.length > 0) {

        const mapped: Product[] = data.results.map((p: any) => ({
          id: p.id, name: p.name, slug: p.slug,
          price: Number(p.retail_price || p.sale_price || p.price),
          salePrice: p.sale_price && Number(p.sale_price) < Number(p.retail_price || p.price) ? Number(p.sale_price) : null,
          unit: p.unit || "Hộp", stockQuantity: p.stock_quantity || 0,
          category: p.category || { name: "", slug: "" },
          imageUrl: p.primary_image?.image_url || "",
          manufacturer: p.manufacturer,
          images: p.images,
        }));
        set({ products: mapped });
      } else {
        set({ products: MOCK_PRODUCTS });
      }
    } catch {
      set({ products: MOCK_PRODUCTS });
    }
    set({ loading: false });
  },


  syncCart: async () => {
    try {
      const data = await cartApi.getCart();
      const items: CartItem[] = (data.items || []).map((i: any) => ({
        product: {
          id: i.product?.id, name: i.product?.name, slug: i.product?.slug,
          price: Number(i.product?.retail_price || i.product?.sale_price || i.product?.price || 0),
          salePrice: i.product?.sale_price && Number(i.product.sale_price) < Number(i.product?.retail_price || i.product?.price || 0) ? Number(i.product.sale_price) : null,
          unit: i.product?.unit || "Hộp", stockQuantity: 0,
          category: { name: "", slug: "" },
          imageUrl: i.product?.primary_image?.image_url || "",
        },
        quantity: i.quantity,
      }));
      set({ cart: items });
    } catch { /* offline */ }
  },

  addToCart: async (product, quantity = 1) => {
    const { cart } = get();
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      set({ cart: cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i) });
    } else {
      set({ cart: [...cart, { product, quantity }] });
    }
    try { await cartApi.addToCart(product.id, quantity); } catch {}
  },

  removeFromCart: async (productId) => {
    set({ cart: get().cart.filter(i => i.product.id !== productId) });
    try { await cartApi.removeCartItem(Number(productId)); } catch {}
  },

  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) { get().removeFromCart(productId); return; }
    set({ cart: get().cart.map(i => i.product.id === productId ? { ...i, quantity } : i) });
    try { await cartApi.updateCartItem(Number(productId), quantity); } catch {}
  },

  clearCart: async () => {
    set({ cart: [] });
    try { await cartApi.clearCart(); } catch {}
  },

  cartTotal: () => get().cart.reduce((s, i) => s + (i.product.salePrice ?? i.product.price) * i.quantity, 0),
  cartCount: () => get().cart.reduce((s, i) => s + i.quantity, 0),
}));

export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}
