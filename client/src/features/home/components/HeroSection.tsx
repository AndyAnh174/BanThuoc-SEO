'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/src/features/products';
import {
  Shield, Truck, Clock, Gift, ChevronRight, ChevronLeft,
  Pill, Apple, Heart, Stethoscope, Sparkles, Baby, Brain, Ear, Bone, Activity, Droplet,
  Leaf, Zap
} from 'lucide-react';

interface Banner {
  id: string; title: string; subtitle: string; image_url: string;
  link_url: string; link_text: string; background_color: string; text_color: string;
}

interface Category {
  id: string; name: string; slug: string; description?: string;
  productCount?: number; product_count?: number; icon?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const defaultBanner: Banner = {
  id: 'default',
  title: 'Sức khỏe là vàng,\nChăm sóc tận tâm',
  subtitle: 'Hơn 10.000+ sản phẩm dược phẩm chính hãng, giao hàng nhanh toàn quốc. Đội ngũ dược sĩ tư vấn 24/7.',
  image_url: '',
  link_url: '/products', link_text: 'Mua ngay',
  background_color: '#f0fdf4', text_color: '#0f766e',
};

const categoryIcons: Record<string, React.ReactNode> = {
  'thuoc-ke-don': <Pill className="w-5 h-5" />,
  'thuoc-khong-ke-don': <Pill className="w-5 h-5" />,
  'thuc-pham-chuc-nang': <Apple className="w-5 h-5" />,
  'duoc-my-pham': <Sparkles className="w-5 h-5" />,
  'thiet-bi-y-te': <Stethoscope className="w-5 h-5" />,
  'cham-soc-ca-nhan': <Heart className="w-5 h-5" />,
  'san-pham-me-be': <Baby className="w-5 h-5" />,
  'vitamin': <Apple className="w-5 h-5" />,
  'tim-mach': <Activity className="w-5 h-5" />,
  'nao-than-kinh': <Brain className="w-5 h-5" />,
  'tai-mui-hong': <Ear className="w-5 h-5" />,
  'co-xuong-khop': <Bone className="w-5 h-5" />,
  'mau-huyet-hoc': <Droplet className="w-5 h-5" />,
  'khang-vi-sinh-vat': <Shield className="w-5 h-5" />,
};

interface HeroSectionProps { initialBanners?: Banner[]; }

export function HeroSection({ initialBanners }: HeroSectionProps = {}) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners?.length ? initialBanners : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerLoading, setBannerLoading] = useState(!(initialBanners?.length));
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  // Fetch banners
  useEffect(() => {
    if (initialBanners?.length) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/banners/visible/`);
        const data = await res.json();
        setBanners(data?.length ? data : [defaultBanner]);
      } catch { setBanners([defaultBanner]); }
      finally { setBannerLoading(false); }
    })();
  }, [initialBanners]);

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const response = await getCategories({ active_only: true });
        const cats = response.data?.results || (Array.isArray(response.data) ? response.data : []);
        setCategories(cats.slice(0, 8));
      } catch {} finally { setCatLoading(false); }
    })();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setCurrentIndex(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrev = useCallback(() => setCurrentIndex(p => (p - 1 + banners.length) % banners.length), [banners.length]);
  const goToNext = useCallback(() => setCurrentIndex(p => (p + 1) % banners.length), [banners.length]);
  const currentBanner = banners[currentIndex] || defaultBanner;

  if (bannerLoading) {
    return (
      <section className="py-6">
        <div className="flex gap-4">
          <Skeleton className="hidden lg:block w-[280px] h-[420px] rounded-2xl shrink-0" />
          <Skeleton className="flex-1 h-[420px] rounded-2xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <div className="flex gap-4">
        {/* ── Left: Category Sidebar (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-teal-50 to-teal-50">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-gray-900">Danh mục sản phẩm</h3>
            </div>
          </div>
          <nav className="flex-1">
            {catLoading ? (
              <div className="p-4 space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
            ) : (
              <ul className="py-1">
                {categories.map(cat => {
                  const icon = categoryIcons[cat.slug] || <Pill className="w-5 h-5" />;
                  const count = cat.productCount ?? cat.product_count;
                  return (
                    <li key={cat.id}>
                      <Link href={`/products?category=${cat.slug}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-teal-50/60 transition-colors group/item">
                        <span className="w-9 h-9 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 shrink-0 group-hover/item:bg-teal-100 transition-colors">
                          {icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                          <p className="text-xs text-gray-400 truncate">{count ? `${count} sản phẩm` : cat.description || ''}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:text-teal-600 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>
          <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
            <Link href="/products"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm">
              Xem tất cả danh mục <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>

        {/* ── Right: Banner Carousel ── */}
        <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] bg-gradient-to-br from-teal-50 via-white to-teal-50 shadow-sm border border-gray-100">
          <Link href={currentBanner.link_url || '#'} className="absolute inset-0 block">
            {currentBanner.image_url && (
              <Image src={currentBanner.image_url} alt={currentBanner.title} fill
                sizes="(max-width: 768px) 100vw, 75vw" className="object-contain"
                priority fetchPriority="high" quality={90} />
            )}
          </Link>

          {/* Nav arrows */}
          {banners.length > 1 && (<>
            <button onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 group backdrop-blur-sm">
              <ChevronLeft className="w-5 h-5 text-gray-700 transition-transform group-hover:-translate-x-0.5" /></button>
            <button onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 group backdrop-blur-sm">
              <ChevronRight className="w-5 h-5 text-gray-700 transition-transform group-hover:translate-x-0.5" /></button>
          </>)}

          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {banners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentIndex(idx)}
                  className={`transition-all rounded-full ${idx === currentIndex ? 'bg-white w-6 h-2' : 'bg-white/40 hover:bg-white/60 w-2 h-2'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Category Pills ── */}
      <div className="lg:hidden mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {catLoading ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />) :
          categories.slice(0, 8).map(cat => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 shrink-0 transition-colors">
              <span className="text-teal-600">{categoryIcons[cat.slug] || <Pill className="w-3.5 h-3.5" />}</span>
              {cat.name}
            </Link>
          ))}
        <Link href="/products"
          className="flex items-center gap-1 px-3 py-2 bg-teal-600 text-white rounded-full text-xs font-semibold shrink-0 hover:bg-teal-700 transition-colors">
          Tất cả <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
