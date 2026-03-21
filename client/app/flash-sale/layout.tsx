import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Flash Sale - Giảm giá sốc mỗi ngày',
    description: 'Flash Sale tại BanThuoc - Săn ngay ưu đãi khủng, giảm đến 40% dược phẩm và thực phẩm chức năng chính hãng. Số lượng có hạn, nhanh tay kẻo hết!',
    keywords: ['flash sale thuốc', 'giảm giá thuốc', 'ưu đãi dược phẩm', 'mua thuốc giá rẻ', 'flash sale banthuoc'],
    openGraph: {
        title: '⚡ Flash Sale BanThuoc - Giảm đến 40%',
        description: 'Săn ngay ưu đãi khủng! Giảm đến 40% dược phẩm và thực phẩm chức năng chính hãng. Số lượng có hạn!',
        type: 'website',
        locale: 'vi_VN',
    },
    twitter: {
        card: 'summary_large_image',
        title: '⚡ Flash Sale BanThuoc - Giảm đến 40%',
        description: 'Săn ngay ưu đãi khủng tại BanThuoc!',
    },
};

export default function FlashSaleLayout({ children }: { children: React.ReactNode }) {
    return children;
}
