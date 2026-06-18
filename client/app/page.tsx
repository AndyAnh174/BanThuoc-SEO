import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { HeroSectionServer, BannerRow, BestSellers, PromoBanners, TrustBadges, CategoryShowcase, FeaturedProducts, NewProductsSection, FlashSaleSection, CategoryProductsSection, PartnerLogos } from '@/src/features/home';

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
  logo: 'https://banthuocsi.vn/logo-rm-phong.png',
  image: 'https://banthuocsi.vn/logo-rm-phong.png',
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
      <h1 className="sr-only">Bán Thuốc Sỉ - Ngọc Kim Ngân Pharma (NKN) - Sàn Dược Phẩm Sỉ B2B Chính Hãng</h1>

      {/* Hero + Banner Row — full width, no padding */}
      <div className="max-w-screen-2xl mx-auto">
        <HeroSectionServer />
        <BannerRow />
      </div>

      {/* Flash Sale — moved right after hero for maximum visibility */}
      <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <FlashSaleSection />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white py-2">
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

      {/* Promo Banners — inline promotional grid */}
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <PromoBanners />
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
      <div className="bg-gradient-to-b from-gray-50 to-teal-50/50">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <NewProductsSection />
        </div>
      </div>

      {/* Category Products — white background */}
      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <CategoryProductsSection />
        </div>
      </div>

      {/* Partner Logos */}
      <div className="bg-gray-50">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
          <PartnerLogos />
        </div>
      </div>

    </MainLayout>
  );
}


