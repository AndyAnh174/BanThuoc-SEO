import { MainLayout } from '@/src/features/layout';
import { HeroSection, CategoryShowcase, FeaturedProducts, NewProductsSection, FlashSaleSection } from '@/src/features/home';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section with banner + store info */}
      <HeroSection />

      {/* Product Categories */}
      <CategoryShowcase />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* New Products (added within 30 days) */}
      <NewProductsSection />

      {/* Flash Sale */}
      <FlashSaleSection />


    </MainLayout>
  );
}


