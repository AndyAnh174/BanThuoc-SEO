# BanThuoc - Pharmaceutical E-Commerce Platform

## Project Overview
BanThuoc is a B2B/B2C e-commerce platform for pharmaceutical products. Vietnamese language UI.

## Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Shadcn/UI, Zustand, pnpm
- **Backend**: Django 6, DRF, PostgreSQL 15, Redis, Elasticsearch, MinIO (S3)
- **Infra**: Docker Compose, Nginx, Prometheus, Cloudflare Tunnel

## Project Structure
```
client/                     # Next.js frontend (App Router)
  app/                      # Pages (auth/, admin/, orders/, products/, etc.)
  src/features/             # Feature-based architecture (api/, components/, stores/, types/)
  components/ui/            # Shadcn/UI components
  lib/http.ts               # Axios instance with JWT interceptor
server/                     # Django backend
  apps/                     # Django apps (users, products, orders, vouchers, cart, files)
  core/                     # Settings (base.py, local.py, prod.py), urls.py, middleware
  templates/                # Email templates, invoice template
docker-compose.yml          # Dev environment
docker-compose.prod.yml     # Production environment
```

## Environment
- **This is the PRODUCTION server** - deploy directly, no staging
- **Domain**: https://banthuoc.andyanh.id.vn (via Cloudflare Tunnel)
- **API**: https://banthuoc.andyanh.id.vn/api
- **Admin credentials**: admin / admin
- Docker Compose services: db, redis, minio, backend, frontend, nginx, prometheus

## Common Commands
```bash
# Deploy changes (on this production server)
docker compose up -d --build backend    # Rebuild & restart backend
docker compose up -d --build frontend   # Rebuild & restart frontend
docker compose restart nginx            # Restart reverse proxy

# Database
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py collectstatic --noinput

# Logs
docker compose logs backend --tail=50
docker compose logs frontend --tail=50

# Django shell
docker compose exec backend python manage.py shell
```

## Key Architecture Decisions
- Feature-first frontend structure: each feature has api/, components/, stores/, types/
- JWT auth with SimpleJWT (access: 60min, refresh: 1 day)
- Volume mount `./server:/app` in dev docker-compose = code changes reflect on restart
- Settings split: `core.settings.local` (dev), `core.settings.prod` (production)
- `manage.py` defaults to `core.settings.local`, `wsgi.py` also defaults to `core.settings.local`
- Redis in dev docker-compose has NO password; production uses `requirepass`
- Email via Gmail SMTP (app password configured in .env)
- Elasticsearch disabled in local mode (`ELASTICSEARCH_DSL_AUTOSYNC = False`)

## API Patterns
- REST endpoints under `/api/` prefix
- Admin endpoints: `/api/admin/...`
- Auth: `/api/auth/token/` (login), `/api/auth/token/refresh/`
- User profile: `/api/me/`, `/api/me/update/`, `/api/me/addresses/`
- Products: `/api/products/`, `/api/products/<slug>/`
- Orders: `/api/orders/`, `/api/orders/<id>/cancel/`, `/api/orders/<id>/return/`
- Reviews: `/api/products/<id>/reviews/`, `/api/admin/reviews/<id>/moderate/`
- Dashboard: `/api/admin/dashboard/stats/`, `/api/admin/dashboard/revenue-chart/`

## Testing
- Test credentials: admin/admin (Super Admin)
- TESTING.md has full test cases
- API can be tested with curl against http://localhost:8000/api/ or https://banthuoc.andyanh.id.vn/api

## Important Notes
- Checkout creates order in `transaction.atomic()` with stock validation
- Order status changes trigger email notifications automatically
- Reviews require admin approval before showing publicly (pharma moderation)
- Return requests limited to 7 days after delivery
- Rate limiting: anon 30/min, user 120/min, login 5/min
