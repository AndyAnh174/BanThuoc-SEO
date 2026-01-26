import { MainLayout } from '@/src/features/layout';
import { HeroSection, CategoryShowcase, FeaturedProducts, FlashSaleSection } from '@/src/features/home';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section with banner + store info */}
      <HeroSection />

      {/* Product Categories */}
      <CategoryShowcase />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Flash Sale */}
      <FlashSaleSection />

      {/* Trust badges */}
      <section className="py-12 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <p className="text-gray-600">Sản phẩm đa dạng</p>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary mb-2">500K+</div>
              <p className="text-gray-600">Khách hàng tin tưởng</p>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <p className="text-gray-600">Chi nhánh toàn quốc</p>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <p className="text-gray-600">Hỗ trợ tư vấn</p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}


