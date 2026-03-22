import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import { ProductsClient } from '@/src/features/products/components/ProductsClient';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Danh sách sản phẩm',
  description: 'Khám phá hơn 10.000+ sản phẩm dược phẩm chính hãng: thuốc, thực phẩm chức năng, thiết bị y tế tại BanThuoc. Lọc theo danh mục, giá, nhà sản xuất. Giao hàng nhanh toàn quốc.',
  keywords: ['mua thuốc online', 'dược phẩm chính hãng', 'thực phẩm chức năng', 'thiết bị y tế', 'thuốc không kê đơn', 'banthuoc'],
  alternates: { canonical: 'https://banthuocsi.vn/products' },
  openGraph: {
    type: 'website',
    url: 'https://banthuocsi.vn/products',
    siteName: 'BanThuoc',
    locale: 'vi_VN',
    title: 'Danh sách sản phẩm | BanThuoc',
    description: 'Khám phá hơn 10.000+ sản phẩm dược phẩm chính hãng. Giao hàng nhanh, giá tốt.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Danh sách sản phẩm | BanThuoc',
    description: 'Khám phá hơn 10.000+ sản phẩm dược phẩm chính hãng tại BanThuoc.',
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
