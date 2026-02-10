# BanThuoc Project

## Overview
This project is a comprehensive e-commerce platform for selling pharmaceutical products ("Bán Thuốc"). It utilizes a modern tech stack with a Django backend, Next.js frontend, and a robust Dockerized infrastructure.

## Prerequisites

-   **Docker Desktop**: Ensure Docker Engine is running.
-   **Python 3.13+**: For backend scripts and tooling.
-   **Node.js 22+**: For the frontend application.

## Getting Started

### 1. Environment Configuration

The project relies on a `.env` file for configuration. A standard file has been created for you.

*   PostgreSQL Credentials
*   Redis Configuration
*   MinIO (S3) Keys and Buckets
*   Django & Next.js Settings

### 2. Infrastructure Setup (Docker)

We use Docker Compose to manage core services (PostgreSQL, Redis, MinIO).

**Start Services:**
```bash
docker compose up -d
```

This will start:
*   **Postgres**: Port `5432`
*   **Redis**: Port `6379`
*   **MinIO**: API `9000`, Console `9001`
    *   *Credential*: `minioadmin` / `minioadmin`
    *   *Buckets*: Automatically creates `banthuoc-media` with public read access.

**Stop Services:**
```bash
docker compose down
```

### 3. Backend Setup & Scripts

Always use the virtual environment for python scripts.

**Activate Virtual Environment:**

*   **Windows (PowerShell):**
    ```powershell
    .\venv\Scripts\activate
    ```
*   **Linux/Mac:**
    ```bash
    source venv/bin/activate
    ```

**Test MinIO Connection:**
After starting Docker, you can verify the storage service:
```bash
pip install minio requests
python scripts/test_minio.py
```

## Project Structure

```
BanThuoc-SEO/
├── .env.example                          # Mẫu biến môi trường
├── .gitignore
├── README.md
├── TESTING.md
├── docker-compose.yml                    # Docker Compose cho môi trường dev
├── docker-compose.prod.yml               # Docker Compose cho môi trường production
├── skills_index.json
├── test_output.pdf
│
├── nginx/
│   └── nginx.conf                        # Cấu hình Nginx reverse proxy
│
├── prometheus/
│   └── prometheus.yml                    # Cấu hình Prometheus monitoring
│
├── scripts/                              # Scripts tiện ích chung
│   ├── create_admin.py
│   ├── debug_product_update.py
│   ├── generate_index.py
│   ├── seed_data.py
│   ├── skills_manager.py
│   ├── sync_recommended_skills.sh
│   ├── test_email.py
│   ├── test_minio.py
│   └── validate_skills.py
│
├── client/                               # Frontend - Next.js (TypeScript)
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile
│   ├── README.md
│   ├── components.json                   # shadcn/ui config
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── postcss.config.mjs
│   ├── tsconfig.json
│   │
│   ├── public/                           # Static assets
│   │   ├── 2.png
│   │   ├── 3.png
│   │   ├── 4.png
│   │   ├── LOGO219T7-NGỌC-KIM-NGÂN.pdf.zip
│   │   ├── file.svg
│   │   ├── globe.svg
│   │   ├── next.svg
│   │   ├── noi-bat.svg
│   │   ├── qr-bank.jpg
│   │   ├── vercel.svg
│   │   ├── vien-thuoc.svg
│   │   ├── window.svg
│   │   ├── yeu-thich.svg
│   │   └── images/
│   │       └── placeholder.png
│   │
│   ├── app/                              # Next.js App Router pages
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Trang chủ
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx
│   │   │
│   │   ├── admin/                        # Trang quản trị
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # Dashboard
│   │   │   ├── banners/
│   │   │   │   └── page.tsx
│   │   │   ├── categories/
│   │   │   │   └── page.tsx
│   │   │   ├── flash-sales/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── manufacturers/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── product-types/
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   └── vouchers/
│   │   │       ├── page.tsx
│   │   │       ├── create/
│   │   │       │   └── page.tsx
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   │
│   │   ├── auth/                         # Xác thực
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── verify-email/
│   │   │       └── page.tsx
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   │
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   │
│   │   ├── flash-sale/
│   │   │   └── page.tsx
│   │   │
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── ProductDetailClient.tsx
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   │
│   │   └── wishlist/
│   │       ├── page.tsx
│   │       └── WishlistClient.tsx
│   │
│   ├── components/                       # Shared UI components (shadcn/ui)
│   │   └── ui/
│   │       ├── alert-dialog.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── dropzone-upload.tsx
│   │       ├── form.tsx
│   │       ├── globe.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── pagination.tsx
│   │       ├── progress.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── sonner.tsx
│   │       ├── success-modal.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── textarea.tsx
│   │
│   └── src/
│       ├── data/
│       │   └── db.json
│       │
│       ├── hooks/
│       │   └── use-debounce.ts
│       │
│       ├── lib/
│       │   └── api-mapper.ts
│       │
│       └── features/                     # Feature-based modules
│           │
│           ├── admin/                    # Admin feature
│           │   ├── api/
│           │   │   ├── admin.api.ts
│           │   │   ├── categories.api.ts
│           │   │   ├── flash-sale.api.ts
│           │   │   ├── manufacturers.api.ts
│           │   │   ├── products.api.ts
│           │   │   └── vouchers.api.ts
│           │   ├── components/
│           │   │   ├── admin-header.tsx
│           │   │   ├── admin-sidebar.tsx
│           │   │   ├── banner-manager.tsx
│           │   │   ├── category-modal.tsx
│           │   │   ├── category-selector.tsx
│           │   │   ├── category-table.tsx
│           │   │   ├── image-upload.tsx
│           │   │   ├── manufacturer-modal.tsx
│           │   │   ├── manufacturer-table.tsx
│           │   │   ├── order-detail.tsx
│           │   │   ├── order-table.tsx
│           │   │   ├── product-modal.tsx
│           │   │   ├── product-table.tsx
│           │   │   ├── product-type-modal.tsx
│           │   │   ├── product-type-table.tsx
│           │   │   ├── user-detail.tsx
│           │   │   ├── user-modal.tsx
│           │   │   ├── user-table.tsx
│           │   │   ├── voucher-form.tsx
│           │   │   ├── voucher-table.tsx
│           │   │   └── flash-sale/
│           │   │       ├── flash-sale-form.tsx
│           │   │       ├── flash-sale-list.tsx
│           │   │       ├── flash-sale-modal.tsx
│           │   │       └── flash-sale-products.tsx
│           │   ├── stores/
│           │   │   ├── admin.store.ts
│           │   │   ├── categories.store.ts
│           │   │   ├── flash-sale.store.ts
│           │   │   ├── manufacturers.store.ts
│           │   │   ├── orders.store.ts
│           │   │   ├── product-types.store.ts
│           │   │   └── products.store.ts
│           │   └── types/
│           │       ├── admin.types.ts
│           │       ├── category.types.ts
│           │       ├── flash-sale.types.ts
│           │       ├── product.types.ts
│           │       └── voucher.types.ts
│           │
│           ├── auth/                     # Authentication feature
│           │   ├── api/
│           │   │   └── auth.api.ts
│           │   ├── components/
│           │   │   ├── login-form.tsx
│           │   │   └── register-form.tsx
│           │   ├── stores/
│           │   │   └── auth.store.ts
│           │   └── types/
│           │       ├── login.schema.ts
│           │       └── register.schema.ts
│           │
│           ├── cart/                      # Cart feature
│           │   ├── api/
│           │   │   └── cart.api.ts
│           │   ├── components/
│           │   │   ├── AddToCartButton.tsx
│           │   │   └── CartHoverContent.tsx
│           │   ├── stores/
│           │   │   └── cart.store.ts
│           │   └── types/
│           │       └── cart.types.ts
│           │
│           ├── checkout/                 # Checkout feature
│           │   ├── api/
│           │   │   └── vouchers.api.ts
│           │   ├── components/
│           │   │   ├── CheckoutItem.tsx
│           │   │   ├── CheckoutPage.tsx
│           │   │   ├── CheckoutSuccessPage.tsx
│           │   │   ├── DeliveryInfo.tsx
│           │   │   └── OrderSummary.tsx
│           │   └── schema/
│           │       └── checkout.schema.ts
│           │
│           ├── flash-sale/               # Flash Sale feature
│           │   └── api/
│           │       └── flash-sale.api.ts
│           │
│           ├── home/                     # Home page feature
│           │   ├── index.ts
│           │   └── components/
│           │       ├── CategoryShowcase.tsx
│           │       ├── FeaturedProducts.tsx
│           │       ├── FlashSaleSection.tsx
│           │       ├── HeroBanner.tsx
│           │       ├── HeroSection.tsx
│           │       └── NewProductsSection.tsx
│           │
│           ├── layout/                   # Layout feature
│           │   ├── index.ts
│           │   └── components/
│           │       ├── Footer.tsx
│           │       ├── Header.tsx
│           │       ├── MainLayout.tsx
│           │       └── UserDropdownMenu.tsx
│           │
│           ├── orders/                   # Orders feature
│           │   ├── api/
│           │   │   └── orders.api.ts
│           │   └── components/
│           │       ├── OrderDetail.tsx
│           │       └── OrderList.tsx
│           │
│           ├── products/                 # Products feature
│           │   ├── index.ts
│           │   ├── api/
│           │   │   ├── index.ts
│           │   │   ├── product-types.api.ts
│           │   │   └── products.api.ts
│           │   ├── components/
│           │   │   ├── index.ts
│           │   │   ├── AddToCart.tsx
│           │   │   ├── CategorySidebar.tsx
│           │   │   ├── ProductCard.tsx
│           │   │   ├── ProductDetailLayout.tsx
│           │   │   ├── ProductGallery.tsx
│           │   │   ├── ProductInfo.tsx
│           │   │   ├── ProductList.tsx
│           │   │   ├── ProductsClient.tsx
│           │   │   └── filters/
│           │   │       ├── index.ts
│           │   │       ├── filter.types.ts
│           │   │       ├── CategoryFilter.tsx
│           │   │       ├── ManufacturerFilter.tsx
│           │   │       ├── OtherFilters.tsx
│           │   │       └── PriceFilter.tsx
│           │   ├── stores/
│           │   │   ├── index.ts
│           │   │   └── products.store.ts
│           │   ├── types/
│           │   │   ├── index.ts
│           │   │   └── product.types.ts
│           │   └── utils/
│           │       └── transformer.ts
│           │
│           └── profile/                  # Profile feature
│               ├── index.ts
│               ├── api/
│               │   └── profile.api.ts
│               ├── components/
│               │   ├── AvatarUpload.tsx
│               │   └── ProfileForm.tsx
│               └── types/
│                   └── profile.types.ts
│
└── server/                               # Backend - Django (Python)
    ├── .dockerignore
    ├── .gitignore
    ├── Dockerfile
    ├── README.md
    ├── manage.py
    ├── requirements.txt
    ├── entrypoint.sh
    ├── start.sh
    ├── Roboto-Regular.ttf
    ├── Times New Roman - Bold.ttf
    ├── download_font.py
    ├── fix_minio_urls.py
    ├── reset_password.py
    ├── test_pdf.py
    ├── test_rewards.py
    ├── test_settings.py
    ├── test_token.py
    ├── update_role.py
    ├── verify_minio.py
    │
    ├── core/                             # Django project settings
    │   ├── __init__.py
    │   ├── asgi.py
    │   ├── wsgi.py
    │   ├── urls.py                       # Root URL configuration
    │   ├── middleware.py
    │   ├── pagination.py
    │   └── settings/
    │       ├── __init__.py
    │       ├── base.py                   # Base settings
    │       ├── local.py                  # Local dev settings
    │       └── prod.py                   # Production settings
    │
    ├── apps/                             # Django applications
    │   ├── __init__.py
    │   │
    │   ├── core/                         # Core utilities
    │   │   └── utils/
    │   │       ├── __init__.py
    │   │       └── number_reader.py
    │   │
    │   ├── cart/                         # Cart app
    │   │   ├── __init__.py
    │   │   ├── admin.py
    │   │   ├── apps.py
    │   │   ├── models.py
    │   │   ├── serializers.py
    │   │   ├── tests.py
    │   │   ├── urls.py
    │   │   ├── views.py
    │   │   └── migrations/
    │   │       ├── __init__.py
    │   │       └── 0001_initial.py
    │   │
    │   ├── files/                        # File upload app
    │   │   ├── __init__.py
    │   │   ├── apps.py
    │   │   ├── services.py
    │   │   ├── urls.py
    │   │   └── views.py
    │   │
    │   ├── orders/                       # Orders app
    │   │   ├── __init__.py
    │   │   ├── admin.py
    │   │   ├── apps.py
    │   │   ├── models.py
    │   │   ├── serializers.py
    │   │   ├── tests.py
    │   │   ├── urls.py
    │   │   ├── views.py
    │   │   └── migrations/
    │   │       ├── __init__.py
    │   │       └── 0001_initial.py
    │   │
    │   ├── products/                     # Products app
    │   │   ├── __init__.py
    │   │   ├── admin.py
    │   │   ├── apps.py
    │   │   ├── documents.py              # Elasticsearch documents
    │   │   ├── signals.py
    │   │   ├── test_category_count.py
    │   │   ├── tests.py
    │   │   ├── urls.py
    │   │   ├── management/
    │   │   │   ├── __init__.py
    │   │   │   └── commands/
    │   │   │       ├── __init__.py
    │   │   │       ├── index_products.py
    │   │   │       ├── seed_flash_sales.py
    │   │   │       ├── seed_products.py
    │   │   │       ├── sync_elasticsearch.py
    │   │   │       └── update_flash_sale_status.py
    │   │   ├── migrations/
    │   │   │   ├── __init__.py
    │   │   │   ├── 0001_initial.py
    │   │   │   ├── 0002_flashsalesession_flashsaleitem_and_more.py
    │   │   │   ├── 0003_banner.py
    │   │   │   ├── 0004_alter_banner_link_url.py
    │   │   │   ├── 0005_megamenuitem.py
    │   │   │   ├── 0006_delete_megamenuitem.py
    │   │   │   ├── 0007_favorite.py
    │   │   │   ├── 0008_producttype_remove_product_product_type_and_more.py
    │   │   │   └── 0009_product_product_type.py
    │   │   ├── models/
    │   │   │   ├── __init__.py
    │   │   │   ├── banner.py
    │   │   │   ├── category.py
    │   │   │   ├── favorite.py
    │   │   │   ├── flash_sale.py
    │   │   │   ├── manufacturer.py
    │   │   │   ├── product.py
    │   │   │   └── product_type.py
    │   │   ├── serializers/
    │   │   │   ├── __init__.py
    │   │   │   ├── banner.py
    │   │   │   ├── category.py
    │   │   │   ├── flash_sale.py
    │   │   │   ├── flash_sale_admin.py
    │   │   │   ├── manufacturer.py
    │   │   │   ├── product.py
    │   │   │   ├── product_type.py
    │   │   │   ├── public.py
    │   │   │   └── search.py
    │   │   ├── utils/
    │   │   │   ├── __init__.py
    │   │   │   └── slug.py
    │   │   └── views/
    │   │       ├── __init__.py
    │   │       ├── banner.py
    │   │       ├── category.py
    │   │       ├── favorite.py
    │   │       ├── flash_sale.py
    │   │       ├── flash_sale_admin.py
    │   │       ├── manufacturer.py
    │   │       ├── product.py
    │   │       ├── product_type.py
    │   │       ├── public.py
    │   │       └── search.py
    │   │
    │   ├── users/                        # Users app
    │   │   ├── __init__.py
    │   │   ├── admin.py
    │   │   ├── apps.py
    │   │   ├── models.py
    │   │   ├── signals.py
    │   │   ├── tests.py
    │   │   ├── urls.py
    │   │   ├── validators.py
    │   │   ├── migrations/
    │   │   │   ├── __init__.py
    │   │   │   ├── 0001_initial.py
    │   │   │   ├── 0002_alter_user_role_emailverificationtoken.py
    │   │   │   ├── 0003_user_loyalty_points.py
    │   │   │   └── 0004_rewardpointlog.py
    │   │   ├── serializers/
    │   │   │   ├── __init__.py
    │   │   │   ├── admin.py
    │   │   │   ├── loyalty.py
    │   │   │   ├── profile.py
    │   │   │   └── registration.py
    │   │   ├── templates/
    │   │   │   └── emails/
    │   │   │       ├── approved.html
    │   │   │       ├── rejected.html
    │   │   │       ├── verify_email.html
    │   │   │       └── welcome.html
    │   │   ├── utils/
    │   │   │   └── file_upload.py
    │   │   └── views/
    │   │       ├── __init__.py
    │   │       ├── admin.py
    │   │       ├── auth.py
    │   │       ├── file_upload.py
    │   │       ├── loyalty.py
    │   │       ├── profile.py
    │   │       ├── registration.py
    │   │       └── verify_email.py
    │   │
    │   └── vouchers/                     # Vouchers app
    │       ├── __init__.py
    │       ├── admin.py
    │       ├── apps.py
    │       ├── models.py
    │       ├── serializers.py
    │       ├── services.py
    │       ├── urls.py
    │       ├── views.py
    │       └── migrations/
    │           ├── __init__.py
    │           └── 0001_initial.py
    │
    ├── scripts/                          # Server utility scripts
    │   ├── check_api.py
    │   ├── check_parent.py
    │   ├── create_product_types.py
    │   ├── debug_featured.py
    │   ├── fix_banner_dates.py
    │   ├── fix_category_parents.py
    │   └── verify_roots.py
    │
    ├── static/                           # Static files
    │   ├── fonts/
    │   │   ├── Roboto-Regular.ttf
    │   │   ├── TimesNewRoman-Bold.ttf
    │   │   ├── UTM-Avo.ttf
    │   │   ├── UTM-AvoBold.ttf
    │   │   ├── UTM-AvoBold_Italic.ttf
    │   │   ├── UTM-AvoItalic.ttf
    │   │   └── arial.ttf
    │   └── images/
    │       ├── 2.png
    │       └── logo-placeholder.svg
    │
    ├── staticfiles/                      # Collected static files (Django)
    │
    └── templates/
        └── invoice.html                  # Invoice template
```

## Troubleshooting
*   **MinIO Connection Refused**: Ensure the `createbuckets` container in Docker Compose has finished running. It waits for MinIO to be ready before creating buckets.
*   **Python Module Not Found**: Ensure you have activated the virtual environment (`venv`) and installed dependencies (`pip install ...`).
