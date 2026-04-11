import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { HeroSectionServer, CategoryShowcase, FeaturedProducts, NewProductsSection, FlashSaleSection, CategoryProductsSection } from '@/src/features/home';

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
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pharmacyJsonLd) }}
      />
      {/* Hero Section with banner + store info (server-fetched for LCP) */}
      <HeroSectionServer />

      {/* Product Categories */}
      <CategoryShowcase />

      {/* Flash Sale - placed right after categories */}
      <FlashSaleSection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* New Products (added within 30 days) */}
      <NewProductsSection />

      {/* Products by root category - dynamic, tu dong them khi co danh muc moi */}
      <CategoryProductsSection />

    </MainLayout>
  );
}


