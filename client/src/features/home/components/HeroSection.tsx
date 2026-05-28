'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/src/features/products';
import {
  Shield,
  Truck,
  Clock,
  ChevronRight,
  ChevronLeft,
  Pill,
  Apple,
  Heart,
  Stethoscope,
  Sparkles,
  Baby,
  Brain,
  Ear,
  Bone,
  Activity,
  Droplet,
} from 'lucide-react';

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

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  product_count?: number;
  icon?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const defaultBanner: Banner = {
  id: 'default',
  title: 'Sức khỏe là vàng,\nChăm sóc tận tâm',
  subtitle: 'Hơn 10.000+ sản phẩm dược phẩm chính hãng, giao hàng nhanh toàn quốc. Đội ngũ dược sĩ tư vấn 24/7.',
  image_url: '/3.png',
  link_url: '/products',
  link_text: 'Mua ngay',
  background_color: '#ffffff',
  text_color: '#000000',
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

const trustBadges = [
  { icon: <Shield className="w-5 h-5" />, text: '100% Hàng chính hãng' },
  { icon: <Truck className="w-5 h-5" />, text: 'Giá tốt, chiết khấu cao' },
  { icon: <Clock className="w-5 h-5" />, text: 'Giao hàng toàn quốc' },
];

interface HeroSectionProps {
  initialBanners?: Banner[];
}

export function HeroSection({ initialBanners }: HeroSectionProps = {}) {
  const [banners, setBanners] = useState<Banner[]>(
    initialBanners && initialBanners.length > 0 ? initialBanners : []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerLoading, setBannerLoading] = useState(
    !(initialBanners && initialBanners.length > 0)
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Fetch banners ──────────────────────────────────────────
  useEffect(() => {
    if (initialBanners && initialBanners.length > 0) return;
    async function fetchBanners() {
      try {
        const res = await fetch(`${API_URL}/banners/visible/`);
        if (res.ok) {
          const data = await res.json();
          setBanners(data.length > 0 ? data : [defaultBanner]);
        } else {
          setBanners([defaultBanner]);
        }
      } catch {
        setBanners([defaultBanner]);
      } finally {
        setBannerLoading(false);
      }
    }
    fetchBanners();
  }, [initialBanners]);

  // ─── Fetch categories ───────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories({ active_only: true });
        if (response.data?.results) {
          setCategories(response.data.results.slice(0, 10));
        } else if (Array.isArray(response.data)) {
          setCategories(response.data.slice(0, 10));
        }
      } catch {
        // silent fail — categories are not critical
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ─── Auto-rotate banners ────────────────────────────────────
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const currentBanner = banners[currentIndex] || defaultBanner;

  // ─── Loading state ──────────────────────────────────────────
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
        {/* ─── Left: Category Sidebar (desktop only) ─────────── */}
        <aside className="hidden lg:flex flex-col w-[280px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">
          {/* Sidebar Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Danh mục sản phẩm</h3>
          </div>

          {/* Category List */}
          <nav className="flex-1">
            {catLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <ul className="py-1">
                {categories.map((cat) => {
                  const icon = categoryIcons[cat.slug] || <Pill className="w-5 h-5" />;
                  const count = cat.productCount ?? cat.product_count;
                  return (
                    <li key={cat.id}>
                      <Link
                        href={`/products?category=${cat.slug}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-green-50/60 transition-colors group/item"
                      >
                        <span className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center text-green-600 shrink-0 group-hover/item:bg-green-100 transition-colors">
                          {icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {cat.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {count ? `${count} sản phẩm` : cat.description || ''}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover/item:text-green-600 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-4 py-3 border-t border-gray-100">
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Xem tất cả danh mục
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </aside>

        {/* ─── Right: Hero Banner Carousel ───────────────────── */}
        <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[320px] sm:min-h-[360px] lg:min-h-[420px] bg-white shadow-sm border border-gray-100">
          {/* Banner Content */}
          <Link href={currentBanner.link_url || '#'} className="absolute inset-0 block">
            <div
              className="absolute inset-0 transition-colors duration-500"
              style={{ backgroundColor: currentBanner.background_color }}
            >
              {currentBanner.image_url && (
                <Image
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 900px"
                  className="object-cover"
                  priority
                  fetchPriority="high"
                  quality={65}
                />
              )}
            </div>

            {/* Overlay content on the left side of banner */}
            <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 lg:px-12 max-w-[55%]">
              {/* Subtitle label */}
              <span className="inline-block text-xs font-bold tracking-[0.2em] text-green-700 uppercase mb-3 bg-green-50 px-3 py-1 rounded-full self-start">
                Dược phẩm B2B
              </span>

              {/* Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-4"
                style={{ color: currentBanner.text_color }}>
                {currentBanner.title.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < currentBanner.title.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-gray-500 mb-6 line-clamp-2"
                style={{ color: currentBanner.text_color === '#000000' ? '#6b7280' : currentBanner.text_color }}>
                {currentBanner.subtitle}
              </p>

              {/* CTA Button */}
              <Button
                className="w-fit px-8 py-6 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-600/25 transition-all hover:shadow-green-600/40 hover:-translate-y-0.5"
                size="lg"
              >
                {currentBanner.link_text || 'Mua ngay'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-5 mt-8">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-green-600 shadow-sm">
                      {badge.icon}
                    </span>
                    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                      {badge.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); goToPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 group backdrop-blur-sm"
                aria-label="Previous banner"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700 transition-transform group-hover:-translate-x-0.5" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); goToNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 group backdrop-blur-sm"
                aria-label="Next banner"
              >
                <ChevronRight className="w-5 h-5 text-gray-700 transition-transform group-hover:translate-x-0.5" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-white w-6 shadow-sm'
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Mobile Category Quick Links ─────────────────────── */}
      <div className="lg:hidden mt-4">
        {catLoading ? (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-green-300 hover:text-green-700 hover:bg-green-50 shrink-0 transition-colors"
              >
                <span className="text-green-600">
                  {categoryIcons[cat.slug] || <Pill className="w-3.5 h-3.5" />}
                </span>
                {cat.name}
              </Link>
            ))}
            <Link
              href="/products"
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-full text-xs font-semibold shrink-0 hover:bg-green-700 transition-colors"
            >
              Tất cả
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;
