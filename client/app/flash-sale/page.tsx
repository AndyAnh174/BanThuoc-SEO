import { Metadata } from 'next';
import { FlashSaleClient } from './FlashSaleClient';
import type { CurrentFlashSaleResponse } from '@/src/features/flash-sale/api/flash-sale.api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://backend:8000/api';

async function fetchFlashSaleData(): Promise<CurrentFlashSaleResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/flash-sale/`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchFlashSaleData();
  const session = data?.current_session || data?.upcoming_session;
  const isActive = !!data?.current_session;

  const title = session
    ? `${session.name} - Flash Sale | BanThuocSi`
    : 'Flash Sale - Săn deal thuốc sỉ giá sốc | BanThuocSi';

  const description = session?.description
    ? session.description.slice(0, 160)
    : isActive
      ? 'Flash Sale đang diễn ra! Săn ngay sản phẩm dược phẩm giá sốc, giảm sâu tại BanThuocSi.vn. Số lượng có hạn.'
      : 'Flash Sale dược phẩm giá siêu rẻ tại BanThuocSi.vn. Deal hot mỗi ngày cho nhà thuốc, phòng khám.';

  const canonical = 'https://banthuocsi.vn/flash-sale';

  return {
    title: session ? session.name : 'Flash Sale',
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      siteName: 'Bán Thuốc Sỉ - NKN Pharma',
      locale: 'vi_VN',
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function FlashSalePage() {
  const data = await fetchFlashSaleData();

  return (
    <FlashSaleClient
      initialData={data}
      serverTime={data?.server_time || new Date().toISOString()}
    />
  );
}
