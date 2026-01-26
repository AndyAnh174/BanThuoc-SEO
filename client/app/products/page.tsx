import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { ProductsClient } from '@/src/features/products/components/ProductsClient';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Sản phẩm | BanThuoc - Nhà thuốc online uy tín',
  description: 'Khám phá hơn 10.000+ sản phẩm dược phẩm chính hãng: thuốc kê đơn, thuốc không kê đơn, thực phẩm chức năng, dược mỹ phẩm tại BanThuoc.',
  openGraph: {
    title: 'Sản phẩm | BanThuoc',
    description: 'Khám phá hơn 10.000+ sản phẩm dược phẩm chính hãng',
  },
};

function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64">
          <Skeleton className="h-[600px] rounded-lg" />
        </aside>
        <div className="flex-1">
          <div className="flex justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <MainLayout>
      <Suspense fallback={<ProductsLoading />}>
        <ProductsClient />
      </Suspense>
    </MainLayout>
  );
}
