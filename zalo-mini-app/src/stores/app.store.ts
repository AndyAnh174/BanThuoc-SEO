import { create } from "zustand";
import { getUserInfo, getAccessToken, getPhoneNumber } from "zmp-sdk/apis";

// ── Types ─────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  imageUrl?: string;
  unit: string;
  category: { name: string; slug: string };
  stockQuantity: number;
  isLiked?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  membershipTier: "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  loyaltyPoints: number;
  totalSpent: number;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;
}

// ── Mock products for demo ──────────────────────────────
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1", name: "Paracetamol 500mg", slug: "paracetamol-500mg",
    price: 55000, salePrice: 49000, unit: "Hộp",
    category: { name: "Giảm đau kháng viêm", slug: "giam-dau" },
    stockQuantity: 100, imageUrl: "https://cdn-icons-png.flaticon.com/512/10556/10556830.png",
  },
  {
    id: "2", name: "Vitamin C 1000mg", slug: "vitamin-c-1000mg",
    price: 120000, salePrice: 99000, unit: "Hộp",
    category: { name: "Vitamin", slug: "vitamin" },
    stockQuantity: 50, imageUrl: "https://cdn-icons-png.flaticon.com/512/2913/2913464.png",
  },
  {
    id: "3", name: "Panadol Extra", slug: "panadol-extra",
    price: 85000, unit: "Hộp",
    category: { name: "Giảm đau kháng viêm", slug: "giam-dau" },
    stockQuantity: 80, imageUrl: "https://cdn-icons-png.flaticon.com/512/10556/10556830.png",
  },
  {
    id: "4", name: "Bổ não Ginkgo Biloba", slug: "ginkgo-biloba",
    price: 180000, salePrice: 155000, unit: "Hộp",
    category: { name: "Thực phẩm chức năng", slug: "tpcn" },
    stockQuantity: 30, imageUrl: "https://cdn-icons-png.flaticon.com/512/2913/2913464.png",
  },
  {
    id: "5", name: "Kem chống nắng SPF50+", slug: "kem-chong-nang-spf50",
    price: 220000, salePrice: 189000, unit: "Tuýp",
    category: { name: "Dược mỹ phẩm", slug: "duoc-my-pham" },
    stockQuantity: 45, imageUrl: "https://cdn-icons-png.flaticon.com/512/1903/1903417.png",
  },
  {
    id: "6", name: "Nước muối sinh lý 0.9%", slug: "nuoc-muoi-sinh-ly",
    price: 15000, unit: "Chai",
    category: { name: "Thiết bị y tế", slug: "tb-yt" },
    stockQuantity: 200, imageUrl: "https://cdn-icons-png.flaticon.com/512/1903/1903417.png",
  },
  {
    id: "7", name: "Siro ho Prospan", slug: "siro-ho-prospan",
    price: 95000, salePrice: 79000, unit: "Chai",
    category: { name: "Hô hấp", slug: "ho-hap" },
    stockQuantity: 60, imageUrl: "https://cdn-icons-png.flaticon.com/512/10556/10556830.png",
  },
  {
    id: "8", name: "Men tiêu hóa Enterogermina", slug: "enterogermina",
    price: 250000, salePrice: 215000, unit: "Hộp",
    category: { name: "Tiêu hóa", slug: "tieu-hoa" },
    stockQuantity: 25, imageUrl: "https://cdn-icons-png.flaticon.com/512/2913/2913464.png",
  },
];

// ── Store ──────────────────────────────────────────────
export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  cart: [],

  login: async () => {
    try {
      const { userInfo } = await getUserInfo({ autoRequestPermission: true });
      const token = await getAccessToken({});
      let phone = "";
      try {
        const { number } = await getPhoneNumber({});
        phone = number ?? "";
      } catch { /* phone optional */ }

      const user: User = {
        id: userInfo.id,
        name: userInfo.name,
        avatar: userInfo.avatar,
        phone,
        membershipTier: "SILVER",
        loyaltyPoints: 0,
        totalSpent: 0,
      };

      // Persist token for API calls
      localStorage.setItem("zaloAccessToken", token as unknown as string);

      set({ user, isAuthenticated: true });
    } catch (err) {
      console.error("Login failed:", err);
      // Use mock user for dev without Zalo
      set({
        user: {
          id: "dev-user-1",
          name: "Nguyễn Thị A",
          avatar: "",
          phone: "0901234567",
          membershipTier: "GOLD",
          loyaltyPoints: 25000,
          totalSpent: 3500000,
        },
        isAuthenticated: true,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("zaloAccessToken");
    set({ user: null, isAuthenticated: false, cart: [] });
  },

  addToCart: (product, quantity = 1) => {
    const { cart } = get();
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { product, quantity }] });
    }
  },

  removeFromCart: (productId) => {
    set({ cart: get().cart.filter((item) => item.product.id !== productId) });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  clearCart: () => set({ cart: [] }),

  cartTotal: () =>
    get().cart.reduce(
      (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
      0
    ),

  cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
}));

function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN") + "đ";
}

export { formatPrice };
