import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { HeroSection, CategoryShowcase, FeaturedProducts, NewProductsSection, FlashSaleSection, CategoryProductsSection } from '@/src/features/home';

export const metadata: Metadata = {
  title: 'BanThuoc - Nhà thuốc online uy tín | Mua thuốc chính hãng',
  description: 'Mua thuốc online tại BanThuoc. Hơn 10.000+ sản phẩm dược phẩm, thực phẩm chức năng, thiết bị y tế chính hãng. Giao hàng nhanh toàn quốc, giá cạnh tranh.',
  openGraph: {
    title: 'BanThuoc - Nhà thuốc online uy tín',
    description: 'Mua thuốc online chính hãng. 10.000+ sản phẩm, giao nhanh toàn quốc.',
    type: 'website',
  },
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Pharmacy',
  name: 'BanThuoc',
  description: 'Nhà thuốc online uy tín - Dược phẩm chính hãng',
  url: 'https://banthuocsi.vn',
  logo: 'https://banthuocsi.vn/logo.png',
  sameAs: [],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://banthuocsi.vn/products?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function Home() {
  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Hero Section with banner + store info */}
      <HeroSection />

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


