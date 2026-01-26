'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Shield, 
  Truck, 
  Clock, 
  GraduationCap,
  Gift,
  FileText,
  ChevronRight,
  ChevronLeft
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Default banner when no banners exist
const defaultBanner: Banner = {
  id: 'default',
  title: 'Sức khỏe là vàng,\nChăm sóc tận tâm',
  subtitle: 'Hơn 10.000+ sản phẩm dược phẩm chính hãng, giao hàng nhanh toàn quốc. Đội ngũ dược sĩ tư vấn 24/7.',
  image_url: '',
  link_url: '/products',
  link_text: 'Mua ngay',
  background_color: '#16a34a',
  text_color: '#ffffff',
};

export function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch banners
  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch(`${API_URL}/banners/visible/`);
        if (res.ok) {
          const data = await res.json();
          setBanners(data.length > 0 ? data : [defaultBanner]);
        } else {
          setBanners([defaultBanner]);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        setBanners([defaultBanner]);
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  // Auto-rotate banners
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

  return (
    <section className="py-6">
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Main Banner Carousel */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[300px] lg:min-h-[350px]">
          {loading ? (
            <Skeleton className="absolute inset-0" />
          ) : (
            <>
              {/* Banner Content */}
                <Link href={currentBanner.link_url || '#'} className="absolute inset-0 block">
                  <div 
                    className="absolute inset-0 transition-colors duration-500"
                    style={{ backgroundColor: currentBanner.background_color }}
                  >
                    {/* Background Image */}
                    {currentBanner.image_url && (
                      <Image
                        src={currentBanner.image_url}
                        alt={currentBanner.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                </Link>

              {/* Navigation Arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-white/90 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 group"
                    aria-label="Previous banner"
                  >
                    <ChevronLeft className="w-6 h-6 text-green-700 transition-transform group-hover:-translate-x-0.5" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-white/90 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 group"
                    aria-label="Next banner"
                  >
                    <ChevronRight className="w-6 h-6 text-green-700 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </>
              )}

              {/* Dots */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Info Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">100% Chính hãng</h3>
            <p className="text-sm text-gray-500">Cam kết sản phẩm chính hãng, nguồn gốc rõ ràng</p>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Giao hàng nhanh</h3>
            <p className="text-sm text-gray-500">Giao hàng trong 2h với đơn nội thành</p>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tư vấn 24/7</h3>
            <p className="text-sm text-gray-500">Đội ngũ dược sĩ sẵn sàng tư vấn mọi lúc</p>
          </div>

          <div className="bg-primary rounded-xl p-4 text-white">
            <div className="text-2xl font-bold mb-1">10K+</div>
            <p className="text-sm text-white/80">Sản phẩm đa dạng, đầy đủ các danh mục</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <Link 
          href="/about#courses"
          className="bg-white rounded-xl p-4 border flex items-center gap-3 hover:border-primary transition-colors"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Khóa học</div>
            <div className="font-semibold text-sm">Học cùng Sĩ</div>
            <div className="text-xs text-primary">20+ Khóa học</div>
          </div>
        </Link>

        <Link 
          href="/vouchers"
          className="bg-white rounded-xl p-4 border flex items-center gap-3 hover:border-primary transition-colors"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Giới thiệu bạn mới</div>
            <div className="font-semibold text-sm">Voucher 500K</div>
            <div className="text-xs text-primary">Mời bạn ngay</div>
          </div>
        </Link>

        <Link 
          href="/prescription"
          className="bg-white rounded-xl p-4 border flex items-center gap-3 hover:border-primary transition-colors"
        >
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Bệnh viện tin dùng</div>
            <div className="font-semibold text-sm">DS Theo Đơn BV</div>
            <div className="text-xs text-primary">Khám phá ngay</div>
          </div>
        </Link>
      </div>
    </section>
  );
}

export default HeroSection;
