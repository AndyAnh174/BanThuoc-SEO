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
  image_url: '/3.png',
  link_url: '/products',
  link_text: 'Mua ngay',
  background_color: '#ffffff', // Changed to white to match image background if needed, or keep green if transparent
  text_color: '#000000',
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
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-full">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-5 border border-green-50 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">100% Chính hãng</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Cam kết sản phẩm nguồn gốc rõ ràng, đầy đủ hóa đơn</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-5 border border-orange-50 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Giao siêu tốc 2H</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Nhận hàng ngay trong ngày với đơn nội thành HCM</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Tư vấn 24/7</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Chat trực tiếp với Dược sĩ chuyên môn cao</p>
              </div>
            </div>
          </div>

          {/* Card 4 - Highlight */}
          <div className="bg-linear-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/3 translate-y-1/3 group-hover:scale-110 transition-transform duration-500" />
            
            <div className="relative flex items-center justify-between h-full">
              <div>
                 <div className="text-3xl font-extrabold mb-1 tracking-tight">10K+</div>
                 <p className="text-sm text-green-50 font-medium">Sản phẩm đa dạng</p>
              </div>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                 <Gift className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>


    </section>
  );
}

export default HeroSection;
