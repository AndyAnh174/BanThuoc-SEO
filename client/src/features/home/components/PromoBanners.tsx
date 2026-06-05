'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

interface Banner {
  id: string; title: string; subtitle: string; image_url: string;
  link_url: string; link_text: string; background_color: string; text_color: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function PromoBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/banners/promo/`);
        if (res.ok) {
          const data = await res.json();
          setBanners(Array.isArray(data) ? data : []);
        }
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return null; // silently skip — don't show skeleton for optional banners
  if (!banners.length) return null;

  const cols = banners.length <= 2 ? 'md:grid-cols-2' : banners.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
    <section className="py-6">
      <div className={`grid grid-cols-2 ${cols} gap-4`}>
        {banners.map(banner => (
          <Link key={banner.id} href={banner.link_url || '#'}
            className="relative rounded-2xl overflow-hidden h-36 sm:h-44 group shadow-sm hover:shadow-md transition-shadow"
            style={{ backgroundColor: banner.background_color || '#f0fdf4' }}>
            {banner.image_url && (
              <Image src={banner.image_url} alt={banner.title} fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-5">
              <h3 className="text-base sm:text-lg font-bold drop-shadow-sm"
                style={{ color: banner.text_color || '#ffffff' }}>{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-xs opacity-90 drop-shadow-sm line-clamp-1 mt-1"
                  style={{ color: banner.text_color || '#ffffff' }}>{banner.subtitle}</p>
              )}
              {banner.link_text && (
                <span className="inline-block mt-2 px-3 py-1 bg-white/90 text-gray-900 rounded-full text-xs font-semibold group-hover:bg-white transition-colors w-fit">
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

export default PromoBanners;
