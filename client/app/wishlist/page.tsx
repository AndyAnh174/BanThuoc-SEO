import { MainLayout } from '@/src/features/layout';
import { Metadata } from 'next';
import { WishlistClient } from './WishlistClient';

export const metadata: Metadata = {
  title: 'Sản phẩm yêu thích | Nhà thuốc',
  description: 'Danh sách các sản phẩm bạn đã lưu lại để mua sau.',
};

export default function WishlistPage() {
  return (
    <MainLayout>
      <WishlistClient />
    </MainLayout>
  );
}
