# BanThuoc - Pharmaceutical E-Commerce Platform

## Project Overview
BanThuoc-SEO is a **dual-platform** pharmaceutical e-commerce system:
- **banthuocsi.vn** — B2B wholesale drug trading for pharmacies/businesses
- **Ngọc Kim Ngân Pharmacy Mini App** — B2C retail on Zalo Mini App for end consumers

Both share the same PostgreSQL database but serve different markets with different pricing and user models.

## Tech Stack
- **Frontend**: Next.js 16 (app router) + TypeScript + Tailwind CSS + shadcn/ui + Zustand + pnpm
- **Backend**: Django 6 REST Framework (Python 3.13) + SimpleJWT auth
- **Mini App Frontend**: React 18 + ZaUI + Tailwind + Zustand + zmp-sdk (vite + zmp-cli v4)
- **Database**: PostgreSQL 15 (shared between B2B and B2C)
- **Cache**: Redis
- **Object Storage**: MinIO (S3-compatible)
- **Container**: Docker (BuildKit) + Kubernetes k3s (production)
- **CI/CD**: Jenkins pipeline — auto triggered by GitHub webhook on push to main
- **Monitoring**: Prometheus + Grafana + kube-state-metrics
- **Domain**: banthuocsi.vn (SSL via Let's Encrypt)

## Project Structure
```
BanThuoc-SEO/
├── client/                        # Next.js B2B frontend + admin
│   ├── app/
│   │   ├── admin/                 # Admin dashboard (/admin)
│   │   │   ├── miniapp/           # 🆕 Mini App admin (8 pages)
│   │   │   │   ├── products/      #   - Sản phẩm (retail_price, toggle)
│   │   │   │   ├── categories/    #   - Danh mục (Mini App filter)
│   │   │   │   ├── manufacturers/ #   - Nhà sản xuất (Mini App filter)
│   │   │   │   ├── product-types/ #   - Loại sản phẩm (Mini App filter)
│   │   │   │   ├── banners/       #   - Banner (full CRUD)
│   │   │   │   ├── flash-sales/   #   - Flash Sale (toggle Mini App)
│   │   │   │   ├── vouchers/      #   - Voucher (B2C filter)
│   │   │   │   └── membership-tiers/ # - Hạng thành viên (edit)
│   │   │   ├── products/          # B2B product management
│   │   │   ├── categories/        # B2B category management
│   │   │   ├── vouchers/          # B2B voucher management
│   │   │   └── ...                # orders, users, banners, flash-sales, etc.
│   │   ├── auth/login/            # Login page (restored)
│   │   ├── auth/register/         # Register page (restored)
│   │   └── products/, cart/, ...  # Public B2B pages
│   ├── src/features/              # Feature-based architecture
│   │   ├── admin/                 # Admin stores, components, types
│   │   ├── auth/                  # Auth stores, login/register forms
│   │   ├── layout/                # Header, UserDropdownMenu, footer
│   │   └── products/              # Product API, stores, types
│   └── components/ui/             # shadcn/ui components
│
├── server/                        # Django backend
│   ├── core/settings/             # base.py, local.py, prod.py
│   ├── core/urls.py               # Main URL routing
│   ├── apps/
│   │   ├── users/                 # B2B User model (AbstractUser)
│   │   ├── products/              # Product catalog (shared B2B + B2C)
│   │   │   ├── models/product.py  # Product: price (B2B), retail_price (B2C), show_on_miniapp
│   │   │   └── serializers/public.py  # ProductListSerializer, ProductDetailSerializer
│   │   ├── orders/                # B2B orders
│   │   ├── vouchers/              # Voucher system
│   │   ├── miniapp/               # 🆕 Zalo Mini App backend
│   │   │   ├── models.py          # 12 Mini App models (prefixed miniapp_)
│   │   │   ├── views.py           # 25+ API endpoints + Admin CRUD
│   │   │   └── urls.py            # Public + Admin URL patterns
│   │   └── ...
│
├── zalo-mini-app/                 # 🆕 Zalo Mini App frontend (B2C)
│   ├── src/
│   │   ├── pages/                 # Home, product-detail, cart, search, profile...
│   │   ├── stores/app.store.ts    # Zustand: auth, products, cart
│   │   └── services/              # API client + domain APIs
│   ├── app-config.json            # Zalo Mini App manifest
│   └── zmp-cli.json               # ZMP CLI config
│
├── k8s/                           # Kubernetes manifests (applied in order)
├── docs/
│   ├── miniapp/                   # Mini App design docs (6 files)
│   └── zalo/                      # Zalo Platform docs (5 files)
├── mcp/banthuoc-api-server/       # MCP server for API documentation
├── Jenkinsfile                    # CI/CD pipeline
└── .gitleaks.toml                 # Secret scanning config
```

## Mini App Admin System (`/admin/miniapp`)

### Overview
The Mini App admin is a **separate management interface** within the B2B admin dashboard for controlling the B2C Zalo Mini App. It appears as a "📱 Mini App" sidebar section with 8 sub-pages.

### Key Design Decisions
1. **Shared DB, Separate Views**: Products, categories, manufacturers, and product types share tables with B2B. Mini App admin pages filter/cross-reference to show only Mini App-relevant data.
2. **B2C vs B2B Pricing**: `price` = wholesale (B2B), `retail_price` = retail (B2C), `sale_price` = promotion. Mini App uses `retail_price > sale_price > price` priority.
3. **Toggle, don't delete**: The `show_on_miniapp` boolean controls visibility. Trash icon removes from Mini App (sets flag to false). Toggle switch turns on/off silently without confirmation.

### Pages

| Page | Path | CRUD | Data Source | Notes |
|------|------|------|-------------|-------|
| **Sản phẩm** | `/admin/miniapp/products` | Add/Edit/Remove | `GET /api/products/?show_on_miniapp=true` | Inline retail_price, edit dialog (name, desc, unit), toggle Mini App, trash to remove |
| **Danh mục** | `/admin/miniapp/categories` | View only | `GET /api/categories/tree/` + cross-ref Mini App products | Shows only categories with Mini App products by default, toggle to show all |
| **Nhà sản xuất** | `/admin/miniapp/manufacturers` | View only | `GET /api/manufacturers/` + cross-ref Mini App products | Filtered to NSX with Mini App products |
| **Loại sản phẩm** | `/admin/miniapp/product-types` | View only | `GET /api/product-types/` + cross-ref Mini App products | Filtered to types with Mini App products |
| **Banner** | `/admin/miniapp/banners` | **Full CRUD** | `GET/POST/PUT/DELETE /api/banners/` | Card grid + create/edit dialog, image preview, position filter |
| **Flash Sale** | `/admin/miniapp/flash-sales` | Toggle | `GET /api/flash-sale/sessions/` | show_on_miniapp toggle, link to B2B detail page |
| **Voucher** | `/admin/miniapp/vouchers` | View + Link | `GET /api/vouchers/manage/` | **B2C/ALL only** (excludes B2B), link to B2B create/edit |
| **Hạng thành viên** | `/admin/miniapp/membership-tiers` | **Edit** | `GET /api/miniapp/membership/tiers/` + `PATCH /api/admin/miniapp/membership-tiers/:id/` | 4 tier cards (Silver/Gold/Platinum/Diamond), edit ngưỡng chi tiêu & % hoàn điểm |

### Product States
- **Toggle ON (Switch)**: Sets `show_on_miniapp=true` — shows product on Mini App. No confirmation.
- **Toggle OFF (Switch)**: Sets `show_on_miniapp=false` — hides from Mini App. **No confirmation** (product stays in B2B).
- **Trash icon (🗑️)**: Shows confirmation dialog → removes from Mini App (`show_on_miniapp=false`).
- **Pencil icon (✏️)**: Opens edit dialog → edit name, description, retail_price, unit.

## Mini App Frontend (`zalo-mini-app/`)

### Dev Commands
```bash
cd zalo-mini-app
npm install
npx zmp start     # Start dev server at http://localhost:3000
npx zmp deploy    # Deploy to Zalo platform
```

### Architecture
- **Framework**: React 18 + ZaUI components (Box, Text, Icon, Button, Header, BottomNavigation)
- **Routing**: ZaUI Router + AnimationRoutes (hash-based)
- **State**: Zustand store (`app.store.ts`) — auth, products, cart
- **API Base**: `https://banthuocsi.vn/api/miniapp` (auto JWT + refresh on 401)
- **Auth Flow**: Zalo SDK (`getUserInfo` → `getAccessToken`) → POST `/api/miniapp/auth/login/` → JWT

### Pages & Tabs
| Tab | Path | Content |
|-----|------|---------|
| Trang chủ | `/` | Header + banner carousel + membership card + quick actions + categories + flash sale + product grid |
| Danh mục | `/categories` | Category listing |
| Tìm kiếm | `/search` | Search with suggestions |
| Giỏ hàng | `/cart` | Cart with quantity controls |
| Cá nhân | `/profile` | User profile, orders, points |

### Key Files
| File | Purpose |
|------|---------|
| `src/stores/app.store.ts` | Zustand store — auth (Zalo OAuth → backend JWT), products (API + mock fallback), cart (API sync) |
| `src/services/api.ts` | Base API client — auto JWT attach, 401 refresh, error handling |
| `src/services/products.api.ts` | Products API — getProducts, getProduct, search, suggestions |
| `src/pages/index.tsx` | Home page — loadProducts() on mount, real product images from MinIO, formatPrice() |
| `src/pages/product-detail.tsx` | Product detail — image gallery with auto-rotate, price display, add to cart |

### Image Display
- Products show **real images from MinIO** (`primary_image.image_url`) if available
- Fallback: ZaUI `Icon` component with placeholder icon
- Prices: `retail_price || sale_price || price` priority (B2C first)

## Backend API Structure

### Mini App Public API (`/api/miniapp/`)
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login/` | POST | Public | Zalo OAuth → JWT |
| `/auth/refresh/` | POST | Public | Refresh JWT |
| `/me/` | GET | JWT | User profile + membership |
| `/products/` | GET | Public | Products with `show_on_miniapp=true` |
| `/products/:slug/` | GET | Public | Product detail |
| `/cart/` | GET | JWT | Cart items |
| `/cart/add/` | POST | JWT | Add to cart |
| `/cart/items/:id/` | PATCH/DELETE | JWT | Update/remove cart item |
| `/orders/` | GET/POST | JWT | List/create orders |
| `/orders/:id/cancel/` | POST | JWT | Cancel order |
| `/membership/tiers/` | GET | Public | All membership tiers |
| `/membership/my/` | GET | JWT | My membership status |
| `/vouchers/available/` | GET | Public | Available vouchers |
| `/search/` | GET | Public | Search products |
| `/chat/threads/` | GET/POST | JWT | Chat with pharmacist |

### Mini App Admin API (`/api/admin/miniapp/`)
| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/membership-tiers/` | GET/POST | Admin | List/Create tiers |
| `/membership-tiers/:id/` | GET/PUT/PATCH/DELETE | Admin | CRUD single tier |

### Product Model (shared B2B + B2C)
```python
# Key fields for Mini App
retail_price = DecimalField(null=True)      # B2C retail price
show_on_miniapp = BooleanField(default=False) # Show on Mini App
price = DecimalField()                       # B2B wholesale price
sale_price = DecimalField(null=True)         # Sale/promotion price
```

### Price Priority (Mini App)
```
retail_price ?? sale_price ?? price  →  displayed as "Giá lẻ"
sale_price (if < retail_price)        →  displayed as "Giá sale" (strikethrough original)
```

### Product Serializer
`ProductListSerializer` includes: `price`, `sale_price`, `retail_price`, `current_price`, `primary_image`, `category`, `manufacturer`, `show_on_miniapp` (via admin filter), `stock_quantity`, `unit`

## CI/CD Pipeline (Jenkins)

### Stages
```
Checkout → Gitleaks → Create GitHub Deployment → Detect Changes → Build Images (parallel) → Push DockerHub → Deploy K8s
```

### Detect Changes Optimization
```groovy
// Only build what changed
env.BUILD_FRONTEND = changedFiles.contains('client/') ? 'true' : 'false'
env.BUILD_BACKEND  = changedFiles.contains('server/') ? 'true' : 'false'
```
- Backend only builds if `server/` files changed
- Frontend only builds if `client/` files changed
- K8s manifests only re-applied if `k8s/` files changed
- Saves 5-8 min per skipped build

### Build Commands (for local testing before push)
```bash
# Frontend
cd client
pnpm install
pnpm build      # Next.js build + TypeScript check

# Backend (Docker)
cd server
docker build -t banthuoc-backend .

# Mini App
cd zalo-mini-app
npm install
npx zmp start   # Dev server at localhost:3000
```

## Coding Conventions (MUST FOLLOW)

1. **Split files by domain** — mỗi domain/module 1 file riêng. Không dồn hết vào 1 file dài.
   - ✅ `apis/auth.ts`, `apis/products.ts`, `apis/orders.ts` — mỗi file ~50-100 dòng
   - ❌ 1 file `all-apis.ts` 1500 dòng
2. **Feature-based structure** — code nằm trong `src/features/<ten-feature>/` gồm: `components/`, `api/`, `stores/`, `types/`, `utils/`
3. **TypeScript type riêng** — `types/<domain>.types.ts`, không để type lẫn trong component
4. **Giữ file ngắn** — nếu file > 300 dòng thì cân nhắc tách nhỏ
5. **Build local trước khi push** — `pnpm build` trong `client/` để bắt lỗi TypeScript trước khi Jenkins fail

## Development Tools

### vibe-hnindex — Codebase Index & Search (MUST USE)
Project is indexed at `banthuoc-client` (`D:\Freelance\BanThuoc-SEO\client`). After any file change, the watcher auto-reindexes.

**🚫 BANNED for this project (use MCP tools instead):**
| ❌ BANNED | ✅ MCP Tool |
|---|---|
| `grep` / `rg` / `git grep` | `search(query, project_name="banthuoc-client")` |
| `cat` / `Read` / `View` | `smart_context(file_path=...)` or `code_session(task=...)` |
| `Glob` / `ls` / `find` | `search(file_pattern="src/**")` |
| Multi-step manual `Edit` | `code_session(...)` → `code_apply(edits=[...])` |

### Tavily — Web Search MCP (MUST USE)
Dùng Tavily để search web khi kiến thức chưa biết, outdated, hoặc cần thông tin real-time.

### BanThuoc API MCP Server
MCP server local (~125 endpoints) cho phép tra cứu API không cần Swagger.
- `list_endpoints(tag?, method?)` — Xem tất cả API
- `get_endpoint(path, method?)` — Chi tiết params/body/response
- `search_api(query)` — Tìm API bằng keyword

## Infrastructure

### Server Layout
- **K8s Server** (222.253.80.30, SSH port 76, key auth)
- **Jenkins Server** (222.253.80.30, SSH port 515, key auth)
- **K8s Node** (192.168.1.76): k3s cluster

### K8s Namespaces
- `banthuoc`: All app workloads
- `monitoring`: Prometheus, Grafana, kube-state-metrics

### Exposed Services (NodePort)
- 30080: K8s Nginx (routes by Host header)
- 30090: Prometheus
- 30030: Grafana

### Domain Routing
- `banthuocsi.vn` → frontend (Next.js)
- `banthuocsi.vn/api/*` → backend (Django)
- `banthuocsi.vn/api/miniapp/*` → Mini App backend
- `banthuocsi.vn/api/admin/miniapp/*` → Mini App admin API
- `minio.banthuocsi.vn` → minio-service:9000
- `grafana.andyanh.id.vn` → grafana-service:3000
- `jenkins.andyanh.id.vn` → Jenkins

## Authentication

### B2B (banthuocsi.vn)
- Custom User model at `users.User` (NOT `auth.User`)
- JWT via SimpleJWT at `/api/auth/token/` (access: 1 day, refresh: 7 days)
- User has `status` (PENDING/ACTIVE/REJECTED/LOCKED) + `is_verified`
- Admin routes protected by middleware + layout auth guard

### B2C (Mini App)
- `MiniAppUser` model (separate from B2B User)
- Auth via Zalo OAuth: `getUserInfo` → `getAccessToken` → POST `/api/miniapp/auth/login/` → JWT
- Django User auto-created with `username=zalo_id` for JWT compatibility
- No email/password/business license required

### Auth Tokens
- Store in both **localStorage** AND **cookie** (for middleware access)
- Keys: `accessToken`, `refreshToken`
- Logout: clear both localStorage + cookie via `useAuthStore().logout()`
- Auto-refresh on 401 via interceptor

## Mini App Database (12 tables, prefix `miniapp_`)

| Table | Purpose |
|-------|---------|
| `miniapp_user` | B2C users (auth via Zalo OAuth, zalo_id) |
| `miniapp_membership_tier` | SILVER/GOLD/PLATINUM/DIAMOND config |
| `miniapp_address` | Delivery addresses |
| `miniapp_cart_item` | Shopping cart |
| `miniapp_order` | Retail orders |
| `miniapp_order_item` | Order line items |
| `miniapp_point_transaction` | Loyalty point history |
| `miniapp_chat_thread` | Chat with pharmacist |
| `miniapp_chat_message` | Chat messages |
| `miniapp_notification` | Push notifications |
| `miniapp_search_history` | Search history |
| `miniapp_combo` + `miniapp_combo_item` | Product combos |

### Membership Tier Logic
```
SILVER   (0đ):      1.0% cashback
GOLD     (2,000,000đ): 1.2% cashback
PLATINUM (5,000,000đ): 1.5% cashback
DIAMOND  (10,000,000đ): 2.0% cashback

Points = FLOOR(order_final_amount × cashback_percent / 100)
1 point = 1 VND for next order
Tier upgrades based on total_spent (lifetime accumulated)
```

## Mini App Admin — Common Patterns

### Adding a new Mini App admin page
1. Create `client/app/admin/miniapp/<name>/page.tsx` (client component)
2. Add sidebar entry in `client/src/features/admin/components/admin-sidebar.tsx`
3. Use `const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api'`
4. Get token: `localStorage.getItem('accessToken')`
5. Auth headers: `{ 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }`
6. Add backend API if needed (in `server/apps/miniapp/views.py` + `urls.py`)
7. Register admin URLs in `server/core/urls.py` with `include()`
8. `pnpm build` in `client/` before pushing to catch TS errors

### Backend admin URL registration
```python
# In core/urls.py — IMPORT: import list directly, DON'T use string include()
from miniapp.urls import admin_urlpatterns as miniapp_admin_urls
urlpatterns = [path('api/admin/miniapp/', include(miniapp_admin_urls))]
```

## Common Issues & Fixes

1. **MinIO SignatureDoesNotMatch**: Presigned URLs must use public endpoint Minio client
2. **Backend 500 after URL change**: `include('module.attr')` fails — must import list and pass directly to `include(list)`
3. **User can't login (400/401)**: Check user.status == 'ACTIVE' and user.is_verified == True
4. **Admin page 404**: Check sidebar href matches page directory path
5. **TypeScript errors in CI**: Run `pnpm build` locally before pushing
6. **Component props mismatch**: Check store/component interfaces for correct field names
7. **Mini App images not showing**: Ensure `primary_image.image_url` is mapped in store; check CORS headers
8. **Toggle switch shows delete confirm**: Toggle should call PATCH directly; only trash icon triggers AlertDialog

## Credentials
- **Jenkins**: admin / 1742005Sinhnhat (jenkins.andyanh.id.vn)
- **SSH K8s Server**: root@222.253.80.30:76 / 1742005AA
- **Grafana**: admin / banthuoc2024 (grafana.andyanh.id.vn)
- **Web Admin**: admin / banthuoc2024 (banthuocsi.vn)
- **DockerHub**: andyanh174
- **K8s Dashboard**: k8s.andyanh.id.vn (permanent token)

## DevOps Roadmap

### Completed
- [x] K8s cluster (k3s) deployment
- [x] CI/CD Jenkins pipeline with auto-deploy
- [x] Domain + SSL
- [x] Monitoring (Prometheus + Grafana)
- [x] GitHub Deployments API
- [x] MinIO presigned URL fix
- [x] Django migrate automation
- [x] Security audit (permissions fixed: OrderViewSet, AdminVoucherViewSet, BannerViewSet)
- [x] Admin auth guard (middleware + layout check)
- [x] Login/register features restored
- [x] Gitleaks secret scanning in CI/CD
- [x] Detect Changes optimization (incremental builds)
- [x] Mini App backend (12 models, 25+ API endpoints)
- [x] Mini App frontend (React + ZaUI, real API data)
- [x] Mini App admin (8 pages with CRUD)
- [x] Membership tier admin CRUD API
- [x] CORS headers for Mini App dev server

### TODO
- [ ] ZaloPay payment integration
- [ ] ZNS notification service
- [ ] GHN shipping integration for Mini App
- [ ] Log Management — Loki + Promtail
- [ ] Database Backup — PostgreSQL CronJob (daily 2AM, 7-day retention)
- [ ] Alerting — Grafana email alerts (CPU > 80%, RAM > 85%)
