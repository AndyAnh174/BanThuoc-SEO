'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

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

export function BannerRow() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await fetch(`${API_URL}/banners/row/`);
        if (res.ok) {
          const data = await res.json();
          setBanners(Array.isArray(data) ? data : []);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <section className="py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  if (banners.length === 0) return null;

  return (
    <section className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.slice(0, 2).map((banner) => (
          <Link
            key={banner.id}
            href={banner.link_url || '#'}
            className="relative rounded-2xl overflow-hidden h-40 sm:h-48 shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: banner.background_color || '#f0fdf4' }}
          >
            {banner.image_url && (
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8">
              <h3
                className="text-lg sm:text-xl font-bold mb-1 drop-shadow-sm"
                style={{ color: banner.text_color || '#ffffff' }}
              >
                {banner.title}
              </h3>
              {banner.subtitle && (
                <p
                  className="text-sm opacity-90 drop-shadow-sm line-clamp-2"
                  style={{ color: banner.text_color || '#ffffff' }}
                >
                  {banner.subtitle}
                </p>
              )}
              {banner.link_text && (
                <span className="inline-block mt-3 px-4 py-1.5 bg-white/90 text-gray-900 rounded-full text-xs font-semibold group-hover:bg-white transition-colors w-fit">
                  {banner.link_text}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default BannerRow;
