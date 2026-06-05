'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { getManufacturers } from '@/src/features/products';
import { Building2 } from 'lucide-react';

interface Manufacturer {
  id: string; name: string; slug: string; logo?: string;
}

export function BrandStrip() {
  const [brands, setBrands] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getManufacturers();
        const data = res.data?.results || (Array.isArray(res.data) ? res.data : []);
        setBrands(data.filter((b: Manufacturer) => b.logo).slice(0, 24));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <section className="py-8"><Skeleton className="h-24 rounded-2xl" /></section>;
  if (!brands.length) return null;

  return (
    <section className="py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
          Thương hiệu uy tín
        </h3>
        <div className="relative overflow-hidden">
          <div className="flex gap-8 animate-scroll">
            {[...brands, ...brands].map((brand, i) => (
              <Link key={`${brand.id}-${i}`} href={`/manufacturers/${brand.slug}`}
                className="flex-shrink-0 w-24 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-3 hover:shadow-md hover:border-teal-200 border border-transparent transition-all">
                {brand.logo ? (
                  <Image src={brand.logo} alt={brand.name} width={80} height={40} className="object-contain max-h-full opacity-70 hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                    <Building2 className="w-4 h-4" />{brand.name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scroll 30s linear infinite; display: flex; width: max-content; }
        .animate-scroll:hover { animation-play-state: paused; }
      `}</style>
    </section>
  );
}

export default BrandStrip;
