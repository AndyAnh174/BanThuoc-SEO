# AGENTS.md — BanThuoc-SEO Project Context for AI Agents

## Environment

- **OS**: Windows 11 Home 10.0.26200
- **Shell**: PowerShell (primary), Git Bash available
- **Package Managers**: pnpm (client/), npm (zalo-mini-app/), pip (server/)
- **Repo**: `D:\Freelance\BanThuoc-SEO\`

## Project Overview

BanThuoc-SEO is a **dual-platform pharmaceutical e-commerce** system:
- `banthuocsi.vn` — B2B wholesale drug trading (Next.js 16)
- **Ngọc Kim Ngân Pharmacy Mini App** — B2C retail on Zalo Mini App (React 18 + ZaUI)
- Backend: Django 6 + DRF, shared PostgreSQL

## Zalo Mini App (`zalo-mini-app/`)

### Dev Commands
```powershell
cd D:\Freelance\BanThuoc-SEO\zalo-mini-app
npm install
npx zmp start     # Dev server at http://localhost:3000
npx zmp deploy    # Deploy to Zalo platform
```

### Architecture
```
zalo-mini-app/
├── src/
│   ├── components/
│   │   └── layout.tsx          # Root: ZMPRouter + AnimationRoutes + BottomNavigation (5 tabs)
│   ├── pages/
│   │   ├── index.tsx           # Homepage (banners, flash sale, products, quick actions)
│   │   ├── categories.tsx      # Category listing
│   │   ├── search.tsx          # Product search
│   │   ├── cart.tsx            # Shopping cart
│   │   ├── profile.tsx         # User profile + menu
│   │   ├── product-detail.tsx  # Product detail with image gallery
│   │   ├── blog.tsx            # 🆕 Blog list (card grid, tag filter, load more)
│   │   └── blog-detail.tsx     # 🆕 Blog detail (HTML content render, related posts)
│   ├── services/
│   │   ├── api.ts              # Base API: `api` (auth) + `publicApi` (no auth)
│   │   ├── auth.api.ts         # Zalo OAuth login
│   │   ├── products.api.ts     # Product listing, search, suggestions
│   │   ├── cart.api.ts         # Cart CRUD
│   │   ├── orders.api.ts       # Order CRUD
│   │   ├── banners.api.ts      # Hero/row banners
│   │   ├── flashsale.api.ts    # Flash sale data
│   │   ├── membership.api.ts   # Profile, tiers, points, addresses
│   │   └── blog.api.ts         # 🆕 Blog posts (public API, no auth)
│   ├── stores/
│   │   └── app.store.ts        # Zustand: user, products, cart, login/logout
│   └── css/
│       ├── app.scss            # Custom styles
│       └── blog-content.css    # 🆕 Blog HTML content rendering styles
├── app-config.json             # Zalo Mini App manifest
└── zmp-cli.json
```

### Routing & Navigation
- Uses `zmp-ui` ZMPRouter + AnimationRoutes (hash-based routing via `/#/path`)
- 5 BottomNavigation tabs: Trang chủ (`/`), Danh mục (`/categories`), Tìm kiếm (`/search`), Giỏ hàng (`/cart`), Cá nhân (`/profile`)
- Blog routes added: `/blog` and `/blog/:slug` (NOT in bottom tabs, accessible via Quick Actions)
- Navigate with: `const nav = useNavigate(); nav("/blog");`
- Route params: `const { slug } = useParams<{ slug: string }>();`

### API Clients (`src/services/api.ts`)
```typescript
// Authenticated client (with JWT auto-refresh) — base: /api/miniapp/
api.get<T>(path), api.post<T>(path, body), api.patch<T>(path, body), api.delete<T>(path)

// Public client (no auth required) — base: /api/
publicApi.get<T>(path), publicApi.post<T>(path, body), publicApi.patch<T>(path, body)
```
- For Mini App endpoints: use `api` (e.g. `api.get("/products/")`)
- For public/shared endpoints (banners, blog): use `publicApi` (e.g. `publicApi.get("/blog/")`)
- Blog API is at `/api/blog/` — fully public, no auth needed

### ZaUI Components (zmp-ui)
```tsx
import { Box, Text, Icon, Button, Header, useNavigate, useParams } from "zmp-ui";
```
- `Box` — div replacement with style prop (camelCase CSS), `flex`, `justifyContent`, `alignItems`
- `Text` — text component, props: `style`, `className`, `size`
- `Text.Title` — large title variant
- `Icon` — ZaUI icons: `zi-home`, `zi-heart`, `zi-star`, `zi-note`, `zi-search`, `zi-cart`, `zi-user`, `zi-chat`, `zi-ticket`, `zi-location`, `zi-shield`, `zi-document`, `zi-call`, `zi-clock`, `zi-chevron-left`, `zi-chevron-right`, `zi-share`, `zi-file`, `zi-star-solid`, `zi-calendar`, `zi-list-1`
- `Button` — with `variant="primary"|"secondary"`
- No CSS-in-JS — use inline `style` objects (camelCase) or Tailwind CSS v3 classes via `className`

### State Management (Zustand)
- Single store in `src/stores/app.store.ts`
- User: `{ id, name, avatar, phone, membershipTier, loyaltyPoints, totalSpent }`
- Product: `{ id, name, slug, price, salePrice, imageUrl, unit, category, stockQuantity, manufacturer, description, images }`
- CartItem: `{ product: Product, quantity: number }`
- Key actions: `login()`, `logout()`, `loadProducts()`, `addToCart()`, `removeFromCart()`, `syncCart()`
- `formatPrice(price: number): string` — formats to VND "49.000đ"
- Mock data fallback: `MOCK_PRODUCTS` array used when API fails
- Dev login fallback creates a mock user when Zalo SDK unavailable

### Design Patterns

**Page structure** (all pages follow this):
```tsx
import React, { useEffect, useState } from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";

export default function SomePage() {
  const nav = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { /* fetch data */ }, []);

  return (
    <Box style={{ background: "#f9fafb", minHeight: "100vh", paddingBottom: 80 }}>
      {/* Header with teal gradient */}
      <Box style={{ paddingTop: 50, padding: 16, background: "linear-gradient(135deg, #0d9488, #0f766e)", borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
        <Box flex alignItems="center" style={{ gap: 10 }}>
          <Box onClick={() => nav("/")} style={backButtonStyle}>
            <Icon icon="zi-chevron-left" style={{ color: "white" }} size={20} />
          </Box>
          <Text style={{ color: "white", fontSize: 18, fontWeight: 700 }}>Page Title</Text>
        </Box>
      </Box>
      {/* Content */}
    </Box>
  );
}
```

**Back button style**:
```typescript
const backButtonStyle = {
  width: 36, height: 36, borderRadius: 10,
  background: "rgba(255,255,255,0.2)",
  display: "flex", alignItems: "center", justifyContent: "center"
};
```

**Brand colors**:
- Primary: `#0d9488` (teal-600), `#0f766e` (teal-700)
- Light bg: `#ccfbf1` (teal-100), `#f0fdfa` (teal-50)
- Page bg: `#f9fafb` (gray-50)
- Text: `#111827` (gray-900), `#374151` (gray-700), `#9ca3af` (gray-400)

**Styling approach**: Mix of inline `style` objects (for dynamic/one-off styles) and Tailwind CSS `className` (for layout utilities like `flex`, `space-x-3`, `text-white`). No component library beyond ZaUI. All CSS is custom — NO shadcn/ui in Mini App.

### Blog Feature (just added)

**Files created**:
- `src/services/blog.api.ts` — `getBlogPosts()`, `getBlogPost()`, `getLatestPosts()`, `recordView()`
- `src/pages/blog.tsx` — Blog list with tag filter chips + 2-column card grid + "Xem thêm" pagination
- `src/pages/blog-detail.tsx` — Blog detail with HTML content via `dangerouslySetInnerHTML`, author card, related posts
- `src/css/blog-content.css` — ~90 lines CSS for all HTML elements (h1-h4, p, a, img, ul/ol, blockquote, table, pre/code, iframe, figure, hr, checklist, warning callout)

**Files modified**:
- `src/components/layout.tsx` — added `import BlogPage/BlogDetailPage` + 2 routes
- `src/pages/index.tsx` — replaced "Chat dược sĩ" with "Tin tức" in QUICK_ACTIONS, added subtitle + improved styling
- `src/pages/profile.tsx` — added `useNavigate`, "Tin tức & Kiến thức" menu item

**QUICK_ACTIONS** (homepage):
```typescript
const QUICK_ACTIONS = [
  { n: "Đơn hàng", d: "Theo dõi đơn", i: "zi-note", c: "#f97316", bg: "#fff7ed", nav: "/cart" },
  { n: "Voucher", d: "Mã giảm giá", i: "zi-star", c: "#06b6d4", bg: "#ecfeff", nav: "" },
  { n: "Tin tức", d: "Kiến thức sức khỏe", i: "zi-note", c: "#0d9488", bg: "#ccfbf1", nav: "/blog" },
  { n: "Điểm thưởng", d: "Tích & đổi điểm", i: "zi-star", c: "#eab308", bg: "#fefce8", nav: "/profile" },
];
```

**Blog API response types**:
```typescript
interface BlogPostItem {
  id: number; title: string; slug: string; excerpt: string;
  cover_image: string; og_image_url: string;
  author_name: string; tags: string[];
  reading_time_minutes: number; view_count: number;
  published_at: string | null; created_at: string;
}
interface BlogPostDetail extends BlogPostItem {
  content: string; // HTML from EditorJS
  seo_title: string; seo_description: string; updated_at: string;
}
```

### Critical Gotchas
1. **Never use `window.location.href`** for navigation — always use `useNavigate()`
2. **Bottom padding** always `paddingBottom: 80` to clear the 5-tab nav bar
3. **Header padding** always `paddingTop: 50` to clear the Zalo status bar
4. **Images from MinIO** have full URLs in `image_url` fields — just use `<img src={url}>`
5. **API calls** must use `api.get<T>()` or `publicApi.get<T>()` from `@/services/api`, NOT raw fetch
6. **Content is HTML** (not markdown) — render with `dangerouslySetInnerHTML` + CSS class
7. **Dev mock fallback**: store has `MOCK_PRODUCTS` and dev login creates fake user when Zalo SDK unavailable
8. **File naming**: pages in `src/pages/`, services in `src/services/`, use kebab-case for multi-word files

### MCP Server (`mcp/banthuoc-api-server/`)
- TypeScript MCP server exposing BanThuoc API documentation
- 26 domain files in `src/apis/`, 165 endpoints
- Mini App APIs: `miniapp-auth.ts`, `miniapp-profile.ts`, `miniapp-products.ts`, `miniapp-cart.ts`, `miniapp-orders.ts`, `miniapp-membership.ts`, `miniapp-vouchers.ts`, `miniapp-chat.ts`, `miniapp-banners.ts`, `miniapp-flashsale.ts`, `miniapp-search.ts`, `miniapp-admin.ts`
- Build: `npx tsc`, Test: `node test.js`
