# Mini App API Integration — Workflow Plan

## Trạng thái hiện tại

| Layer | Status |
|-------|--------|
| Backend Models | ✅ 12 models — `server/apps/miniapp/models.py` |
| Backend Views | ✅ 25 endpoints — `server/apps/miniapp/views.py` |
| Backend URLs | ✅ Registered at `/api/miniapp/*` |
| Frontend UI | ✅ 6 pages — ZaUI + React |
| Frontend Data | ❌ Đang dùng mock data (`MOCK_PRODUCTS`) |
| Frontend API | ❌ Chưa có service layer |
| Auth Integration | ❌ Chưa connect Zalo OAuth → JWT |

---

## Step 1: API Service Layer

Tạo thư mục `src/services/` với các file:

```
src/services/
├── api.ts          # Base client: axios instance + Zalo token interceptor
├── auth.api.ts     # login(), refresh()
├── products.api.ts # getProducts(), getProduct(), searchProducts()
├── cart.api.ts     # getCart(), addToCart(), updateItem(), removeItem(), clearCart()
├── orders.api.ts   # getOrders(), createOrder(), getOrderDetail(), cancelOrder()
├── vouchers.api.ts # getVouchers(), checkVoucher(), applyVoucher()
├── membership.api.ts # getTiers(), getMyMembership()
├── chat.api.ts     # getThreads(), createThread(), getMessages(), sendMessage()
└── search.api.ts   # search(), suggest(), hotkeys()
```

**Base URL**: `https://banthuocsi.vn/api/miniapp` (production)  
**Auth**: `Authorization: Bearer <zalo_jwt_token>`  
**Dev fallback**: `VITE_API_BASE_URL` env var

---

## Step 2: Auth Flow

```
User mở app → getUserInfo() → getAccessToken()
  → POST /api/miniapp/auth/login/ { zalo_access_token, name, avatar }
    ← { access, refresh, user }
      → Lưu JWT vào localStorage + cookie
        → Gắn Bearer token vào mọi API call
```

Update `stores/app.store.ts`:
- `login()`: gọi Zalo SDK → POST /api/miniapp/auth/login/
- Lưu token → set user state
- Refresh token tự động khi 401

---

## Step 3: Replace Mock Data

| Component | Hiện tại | Sau |
|-----------|----------|-----|
| `pages/index.tsx` | `MOCK_PRODUCTS` | `useEffect → getProducts()` |
| `pages/search.tsx` | `MOCK_PRODUCTS.filter()` | `searchProducts(query)` |
| `pages/product-detail.tsx` | `MOCK_PRODUCTS.find()` | `getProduct(slug)` |
| `pages/cart.tsx` | `useAppStore.cart` | `getCart() + addToCart() API` |
| `pages/profile.tsx` | `useAppStore.user` | `GET /me/ + GET /membership/my/` |
| `pages/categories.tsx` | Static list | `GET /categories/tree/` (from B2B API) |

---

## Step 4: Cart Flow (Real API)

```
Add to cart → POST /api/miniapp/cart/add/ { product_id, quantity }
   ← { message: "Added to cart" }
View cart  → GET /api/miniapp/cart/
   ← { items: [...], total_items, total_amount }
Update qty → PATCH /api/miniapp/cart/items/{id}/ { quantity }
Remove     → DELETE /api/miniapp/cart/items/{id}/
Clear      → POST /api/miniapp/cart/clear/
```

---

## Step 5: Order Flow

```
Checkout → POST /api/miniapp/orders/
  Body: { items: [{product_id, quantity}], full_name, phone, address, ... }
    ← { id, order_number, status, final_amount, points_earned }
```

---

## Step 6: Testing Checklist

- [ ] Auth: login bằng Zalo token → nhận JWT
- [ ] Products: load danh sách sản phẩm từ API
- [ ] Search: gọi search API với query
- [ ] Product Detail: load chi tiết sản phẩm
- [ ] Cart: thêm/sửa/xóa sản phẩm qua API
- [ ] Order: tạo đơn hàng, xem lịch sử
- [ ] Membership: xem hạng + điểm
- [ ] Vouchers: check/apply voucher
- [ ] Error handling: hiển thị lỗi khi API fail
- [ ] Loading states: skeleton/spinner khi đang load

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/services/api.ts` | CREATE | Base API client |
| `src/services/auth.api.ts` | CREATE | Auth endpoints |
| `src/services/products.api.ts` | CREATE | Product endpoints |
| `src/services/cart.api.ts` | CREATE | Cart endpoints |
| `src/services/orders.api.ts` | CREATE | Order endpoints |
| `src/services/membership.api.ts` | CREATE | Membership endpoints |
| `src/stores/app.store.ts` | MODIFY | Replace mock with real API |
| `src/pages/index.tsx` | MODIFY | Fetch products from API |
| `src/pages/search.tsx` | MODIFY | Search via API |
| `src/pages/product-detail.tsx` | MODIFY | Load from API |
| `src/pages/cart.tsx` | MODIFY | Real cart API |
| `src/pages/profile.tsx` | MODIFY | Load user from API |
