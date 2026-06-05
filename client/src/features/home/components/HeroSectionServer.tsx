import { HeroSection } from './HeroSection';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  link_text: string;
  background_color: string;
  text_color: string;
}

const defaultBanner: Banner = {
  id: 'default',
  title: 'Sức khỏe là vàng,\nChăm sóc tận tâm',
  subtitle:
    'Hơn 10.000+ sản phẩm dược phẩm chính hãng, giao hàng nhanh toàn quốc. Đội ngũ dược sĩ tư vấn 24/7.',
  image_url: '/3.png',
  link_url: '/products',
  link_text: 'Mua ngay',
  background_color: '#ffffff',
  text_color: '#000000',
};

async function fetchBannersServer(): Promise<Banner[]> {
  const API_BASE =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://backend:8000/api';
  try {
    const res = await fetch(`${API_BASE}/banners/visible/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [defaultBanner];
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : [defaultBanner];
  } catch {
    return [defaultBanner];
  }
}

export async function HeroSectionServer() {
  const banners = await fetchBannersServer();
  return <HeroSection initialBanners={banners} />;
}
