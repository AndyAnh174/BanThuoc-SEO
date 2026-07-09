# BanThuoc - Pharmaceutical E-Commerce Platform

## Project Overview
BanThuoc-SEO is a B2B pharmaceutical e-commerce platform (banthuocsi.vn) for wholesale drug trading. Vietnamese language UI. Connects pharmacies and pharmaceutical businesses.

## Tech Stack
- **Frontend**: Next.js (app router) + TypeScript + Tailwind CSS + shadcn/ui + Zustand + pnpm
- **Backend**: Django 6 REST Framework (Python 3.13) + SimpleJWT auth
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Object Storage**: MinIO (S3-compatible, for file uploads like business licenses)
- **Container**: Docker (build) + Kubernetes k3s (production)
- **CI/CD**: Jenkins pipeline (Jenkinsfile) - auto triggered by GitHub webhook
- **Monitoring**: Prometheus + Grafana + kube-state-metrics
- **Domain**: banthuocsi.vn (SSL via Let's Encrypt)

## Coding Conventions (MUST FOLLOW)

1. **Split files by domain** — mỗi domain/module 1 file riêng. Không dồn hết vào 1 file dài.
   - ✅ `apis/auth.ts`, `apis/products.ts`, `apis/orders.ts` — mỗi file ~50-100 dòng
   - ❌ 1 file `all-apis.ts` 1500 dòng
2. **Feature-based structure** — code nằm trong `src/features/<ten-feature>/` gồm: `components/`, `api/`, `stores/`, `types/`, `utils/`
3. **TypeScript type riêng** — `types/<domain>.types.ts`, không để type lẫn trong component
4. **Giữ file ngắn** — nếu file > 300 dòng thì cân nhắc tách nhỏ

## Development Tools

### vibe-hnindex — Codebase Index & Search (MUST USE)
Project is indexed at `banthuoc-client` (`D:\Freelance\BanThuoc-SEO\client`). After any file change, the watcher auto-reindexes.

**🚫 BANNED for this project (use MCP tools instead):**
| ❌ BANNED | ✅ MCP Tool |
|---|---|
| `grep` / `rg` / `git grep` | `search(query, project_name="banthuoc-client", stream=true)` |
| `cat` / `Read` / `View` | `smart_context(project_name="banthuoc-client", file_path=...)` or `code_session(project_name="banthuoc-client", task=...)` |
| `Glob` / `ls` / `find` | `search(project_name="banthuoc-client", file_pattern="src/**")` |
| Multi-step manual `Edit` | `code_session(...)` → `code_apply(project_name="banthuoc-client", edits=[...], verify=true)` |

**Key workflows:**
- **Understand code**: `smart_context(project_name="banthuoc-client", file_path=..., task=...)`
- **Make changes**: `code_session(project_name="banthuoc-client", task=...)` → gather context, then `code_apply(project_name="banthuoc-client", session_id=..., edits=[...])`
- **Find by concept**: `search(query="...", project_name="banthuoc-client", mode="hybrid", stream=true)`
- **Check impact**: `impact_analysis(project_name="banthuoc-client", file_path=..., depth=3)`

### Tavily — Web Search MCP (MUST USE)

Dùng Tavily để search web khi:
1. **Kiến thức chưa biết** — công nghệ, library, API bên thứ 3 không rõ
2. **Kiến thức có thể outdated** — version mới, breaking changes, best practice đã thay đổi
3. **Cần thông tin real-time** — news, releases, security advisories mới nhất

**Tools:**
| Tool | Dùng khi |
|------|----------|
| `tavily_search(query)` | Tìm nhanh thông tin, tin tức, docs |
| `tavily_extract(urls)` | Lấy nội dung chi tiết từ URL cụ thể |
| `tavily_crawl(url)` | Crawl toàn bộ site/docs |
| `tavily_research(input)` | Nghiên cứu sâu, có citations |

> 🚫 **Không đoán** — đặc biệt khi knowledge cutoff có thể đã cũ (API version, security, pricing).

### BanThuoc API MCP Server — API Tra Cứu Cho AI (`mcp/banthuoc-api-server/`)

MCP server local (~125 endpoints từ Django backend) cho phép AI tra cứu API không cần Swagger.

**Cài đặt (1 lần):**
```bash
cd mcp/banthuoc-api-server && npm install && npm run build
```

**Tools:**
| Tool | Dùng khi |
|------|----------|
| `list_endpoints(tag?, method?)` | Muốn xem tất cả API, filter theo nhóm |
| `get_endpoint(path, method?)` | Cần chi tiết params/body/response của 1 endpoint |
| `search_api(query)` | Tìm API bằng keyword (vd: "login", "order", "voucher") |

**Cấu trúc code:** `src/apis/` chia 14 file theo domain (auth.ts, products.ts, orders.ts, cart.ts, vouchers.ts, flash-sale.ts, blog.ts, shipping.ts, banners.ts, admin.ts, search.ts, reviews.ts, users.ts, files.ts). Khi backend thay đổi API → sửa file tương ứng → `npm run build`.

**Đã config trong `.mcp.json`** — AI agent tự động load được.

## Infrastructure Architecture
```
Internet -> Nginx (222.253.80.30:443) -> K8s Nginx Pod (192.168.1.76:30080) -> Services
```

### Server Layout
- **K8s Server** (222.253.80.30, SSH port 76, key auth — no password): k3s cluster + Nginx reverse proxy
- **Jenkins Server** (222.253.80.30, SSH port 515, key auth — no password): Jenkins CI/CD
- **K8s Node** (192.168.1.76): k3s cluster running all workloads

### K8s Namespaces
- `banthuoc`: All app workloads (frontend, backend, postgres, redis, minio, nginx)
- `monitoring`: Prometheus, Grafana, kube-state-metrics

### Exposed Services (via NodePort)
- 30080: K8s Nginx (routes by Host header to frontend/backend/minio)
- 30090: Prometheus
- 30030: Grafana

### Domain Routing (all through K8s Nginx at 30080)
- `banthuocsi.vn` -> frontend (Next.js)
- `banthuocsi.vn/api/*` -> backend (Django)
- `minio.banthuocsi.vn` -> minio-service:9000
- `grafana.andyanh.id.vn` -> grafana-service:3000
- `jenkins.andyanh.id.vn` -> Jenkins (direct on main server)
- `k8s.andyanh.id.vn` -> K8s Dashboard

## Project Structure
```
k8s/                          # Kubernetes manifests (applied in order by filename)
  01-secrets.yaml             # K8s secrets (DB creds, MinIO creds)
  02-configmap.yaml           # App config (Django settings, MinIO endpoints)
  03-pvc.yaml                 # Persistent volume claims
  04-postgres.yaml            # PostgreSQL deployment
  05-redis.yaml               # Redis deployment
  06-minio.yaml               # MinIO (MINIO_SERVER_URL set for presigned URLs)
  07-backend.yaml             # Django backend deployment
  08-frontend.yaml            # Next.js frontend deployment
  09-nginx.yaml               # Nginx reverse proxy (routes by Host header)
  10-monitoring-namespace.yaml
  11-prometheus-rbac.yaml
  12-prometheus-config.yaml
  13-prometheus.yaml
  14-grafana.yaml             # Credentials via K8s secret "grafana-secret"
client/                       # Next.js frontend
  app/                        # App router pages (auth/, admin/, orders/, products/, etc.)
  src/features/               # Feature-based architecture (api/, components/, stores/, types/)
  components/ui/              # Shadcn/UI components
  lib/http.ts                 # Axios instance with JWT interceptor
  public/2.png                # Main logo image
server/                       # Django backend
  core/settings/              # Settings (base.py, local.py, prod.py)
  apps/users/                 # User management (custom User model)
    models.py                 # User: role (ADMIN/CUSTOMER), status (PENDING/ACTIVE/REJECTED/LOCKED)
    utils/file_upload.py      # MinIO handler (upload, presigned URLs with public endpoint)
    serializers/admin.py      # Admin CRUD serializers (no password validation for admin)
    views/                    # Auth, admin, registration, profile, file upload views
  apps/products/              # Product catalog
  apps/orders/                # Order management
  apps/cart/                  # Shopping cart
  apps/vouchers/              # Voucher system
  apps/files/                 # File management
Jenkinsfile                   # CI/CD pipeline with GitHub Deployments API
```

## Important Implementation Details

### Authentication
- Custom User model at `users.User` (NOT `auth.User`)
- Use `get_user_model()` instead of `from django.contrib.auth.models import User`
- JWT auth via SimpleJWT at `/api/auth/token/` (access: 1 day, refresh: 7 days)
- User has `status` field (PENDING/ACTIVE/REJECTED/LOCKED) - must be ACTIVE to login
- User has `is_verified` field - must be True
- Admin password validation is disabled (admin can set any password)

### MinIO File Storage
- Internal endpoint: `http://minio-service:9000` (for backend pod communication)
- Public endpoint: `https://minio.banthuocsi.vn` (for browser access)
- `MINIO_SERVER_URL` env var set on MinIO pod
- **CRITICAL**: Presigned URLs MUST be generated using a Minio client initialized with the PUBLIC endpoint (`minio.banthuocsi.vn`), otherwise signature will mismatch (SignatureDoesNotMatch error). See `file_upload.py` get_presigned_url()
- Bucket: `banthuoc-storage`

### Secrets Management
- Sensitive credentials stored in K8s Secrets (NOT in yaml files committed to git)
- `grafana-secret`: admin_user, admin_password, smtp_user, smtp_password
- `banthuoc-secrets`: DB credentials, MinIO credentials
- **Repo is PUBLIC** - never hardcode passwords in committed files

### Jenkins CI/CD Pipeline
- Triggered by GitHub webhook on push to main
- Stages: Checkout -> Create GitHub Deployment -> Build Frontend/Backend -> Push DockerHub -> Deploy K8s
- Uses `credentials('github-pat')` for GitHub API (deployments + commit status)
- Uses `KUBECONFIG=/var/lib/jenkins/.kube/config` for kubectl
- GitHub Deployments API: creates deployment entry + updates status (success/failure)
- Build takes ~7-20 minutes depending on cache

### Running kubectl via Jenkins Script Console
When you can't SSH directly, use Jenkins REST API:
1. GET `/crumbIssuer/api/json` for CSRF crumb
2. POST `/scriptText` with Groovy script containing kubectl commands
3. Prefix kubectl with `KUBECONFIG=/var/lib/jenkins/.kube/config /usr/local/bin/kubectl`

## API Patterns
- REST endpoints under `/api/` prefix
- Admin endpoints: `/api/admin/...`
- Auth: `/api/auth/token/` (login), `/api/auth/token/refresh/`
- User profile: `/api/me/`, `/api/me/update/`, `/api/me/addresses/`
- Products: `/api/products/`, `/api/products/<slug>/`
- Orders: `/api/orders/`, `/api/orders/<id>/cancel/`, `/api/orders/<id>/return/`
- Reviews: `/api/products/<id>/reviews/`, `/api/admin/reviews/<id>/moderate/`
- Dashboard: `/api/admin/dashboard/stats/`, `/api/admin/dashboard/revenue-chart/`

## Credentials
- **Jenkins**: admin / 1742005Sinhnhat (web: jenkins.andyanh.id.vn)
- **SSH K8s Server**: root@222.253.80.30:76 / 1742005AA
- **Grafana**: admin / banthuoc2024 (web: grafana.andyanh.id.vn)
- **Web Admin**: admin / banthuoc2024 (web: banthuocsi.vn)
- **DockerHub**: andyanh174
- **K8s Dashboard**: k8s.andyanh.id.vn (permanent token)

## DevOps Roadmap

### Completed
- [x] K8s cluster (k3s) deployment
- [x] CI/CD Jenkins pipeline with auto-deploy
- [x] Domain + SSL (banthuocsi.vn, minio.banthuocsi.vn)
- [x] Monitoring (Prometheus + Grafana + kube-state-metrics)
- [x] GitHub Deployments API (deployment status + commit checks)
- [x] K8s Dashboard with permanent token
- [x] Django migrate automation
- [x] MinIO presigned URL fix (public endpoint client for correct signing)
- [x] Grafana SMTP email config (via K8s secret, Gmail hovietanh147@gmail.com)

### In Progress
- [ ] Alerting - Grafana email alerts (SMTP configured, create rules in Grafana UI)
  - Contact Point: Email to hovietanh147@gmail.com
  - Rules: CPU > 80%, RAM > 85%, Pod crash

### TODO
- [ ] Log Management - Loki + Promtail (centralized logs on Grafana)
- [ ] Database Backup - PostgreSQL CronJob (daily at 2AM, 7-day retention)

## Common Issues & Fixes
1. **MinIO SignatureDoesNotMatch**: Presigned URLs must use public endpoint Minio client (see `file_upload.py`)
2. **kubectl permission denied**: Prefix with `KUBECONFIG=/var/lib/jenkins/.kube/config`
3. **User can't login (400/401)**: Check user.status == 'ACTIVE' and user.is_verified == True
4. **Grafana 502 on first start**: SQLite migrations take ~12 min, just wait
5. **Pod metrics N/A in Grafana**: Deploy kube-state-metrics in monitoring namespace
6. **GitHub deploy status not showing**: PAT needs `repo` scope (full control)

## Important Notes
- This is PRODUCTION - deploy directly via Jenkins, no staging environment
- Checkout creates order in `transaction.atomic()` with stock validation
- Order status changes trigger email notifications automatically
- Reviews require admin approval before showing publicly
- Return requests limited to 7 days after delivery
- Rate limiting: anon 30/min, user 120/min, login 5/min
