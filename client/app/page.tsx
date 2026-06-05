import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { HeroSectionServer, BannerRow, BestSellers, BrandStrip, Testimonials, TrustBadges, CategoryShowcase, FeaturedProducts, NewProductsSection, FlashSaleSection, CategoryProductsSection } from '@/src/features/home';

export const metadata: Metadata = {
  title: 'Bán Thuốc Sỉ - Ngọc Kim Ngân Pharma (NKN) | BanThuocSi.vn',
  description:
    'BanThuocSi.vn - Sàn dược phẩm sỉ B2B của Công ty Dược phẩm Ngọc Kim Ngân (NKN Pharma). 10.000+ sản phẩm thuốc sỉ chính hãng, giá cạnh tranh, giao nhanh toàn quốc cho nhà thuốc, phòng khám.',
  keywords: [
    'bán thuốc sỉ',
    'thuốc sỉ',
    'banthuocsi.vn',
    'ngọc kim ngân',
    'nkn pharma',
    'nkn',
    'dược phẩm ngọc kim ngân',
    'công ty ngọc kim ngân',
    'nhà thuốc ngọc kim ngân',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bán Thuốc Sỉ - Ngọc Kim Ngân Pharma (NKN) | BanThuocSi.vn',
    description:
      'Sàn dược phẩm sỉ B2B của Công ty Dược phẩm Ngọc Kim Ngân (NKN Pharma). 10.000+ sản phẩm thuốc sỉ chính hãng.',
    type: 'website',
  },
};

const pharmacyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Pharmacy',
  name: 'BanThuocSi - Ngọc Kim Ngân Pharma',
  alternateName: [
    'BanThuocSi',
    'Bán Thuốc Sỉ',
    'Ngọc Kim Ngân',
    'Ngọc Kim Ngân Pharma',
    'NKN Pharma',
    'NKN',
    'Công ty Dược phẩm Ngọc Kim Ngân',
  ],
  description:
    'Sàn dược phẩm sỉ B2B của Công ty Dược phẩm Ngọc Kim Ngân (NKN Pharma) - bán thuốc sỉ chính hãng cho nhà thuốc, phòng khám toàn quốc.',
  url: 'https://banthuocsi.vn',
  logo: 'https://banthuocsi.vn/2.png',
  image: 'https://banthuocsi.vn/2.png',
  priceRange: '$$',
  areaServed: 'VN',
};

export default function Home() {
  return (
    <MainLayout fullWidth>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pharmacyJsonLd) }}
      />
      <link
        rel="preload"
        as="image"
        href="/_next/image?url=%2F3.png&w=828&q=65"
        fetchPriority="high"
      />
      <h1 className="sr-only">Bán Thuốc Sỉ - Ngọc Kim Ngân Pharma (NKN) - Sàn Dược Phẩm Sỉ B2B Chính Hãng</h1>

      {/* Hero + Banner Row — full width */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <HeroSectionServer />
        <BannerRow />
      </div>

      {/* Brand Strip — auto-scrolling manufacturers */}
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <BrandStrip />
        </div>
      </div>

      {/* Trust Badges — green tint background */}
      <div className="bg-gradient-to-r from-green-50 via-white to-green-50 py-2">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <TrustBadges />
        </div>
      </div>

      {/* Categories — white background */}
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <CategoryShowcase />
        </div>
      </div>

      {/* Flash Sale — gradient background */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <FlashSaleSection />
        </div>
      </div>

      {/* Best Sellers — amber gradient background */}
      <div className="bg-gradient-to-b from-amber-50/50 to-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <BestSellers />
        </div>
      </div>

      {/* Featured Products — white background */}
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <FeaturedProducts />
        </div>
      </div>

      {/* New Products — gray tint background */}
      <div className="bg-gradient-to-b from-gray-50 to-green-50/50">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <NewProductsSection />
        </div>
      </div>

      {/* Testimonials — gradient background */}
      <div className="bg-gradient-to-b from-green-50/50 to-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <Testimonials />
        </div>
      </div>

      {/* Category Products — white background */}
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <CategoryProductsSection />
        </div>
      </div>

    </MainLayout>
  );
}


