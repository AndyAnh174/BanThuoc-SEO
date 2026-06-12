'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/src/features/products';
import { ChevronRight } from 'lucide-react';
import { getCategoryIcon } from '@/src/features/products/utils/category-icons';

interface Category {
  id: string; name: string; slug: string; description?: string;
  productCount?: number; product_count?: number; icon?: string;
}

// Vibrant color per root category
const catColors: Record<string, { bg: string; iconBg: string; icon: string }> = {
  'chăm-sóc-cá-nhân':      { bg: 'hover:bg-sky-50',     iconBg: 'bg-sky-100',      icon: 'text-sky-600' },
  'dược-mỹ-phẩm':          { bg: 'hover:bg-pink-50',     iconBg: 'bg-pink-100',     icon: 'text-pink-600' },
  'thiết-bị-y-tế':         { bg: 'hover:bg-blue-50',     iconBg: 'bg-blue-100',     icon: 'text-blue-600' },
  'thuốc':                 { bg: 'hover:bg-teal-50',     iconBg: 'bg-teal-100',     icon: 'text-teal-600' },
  'thực-phẩm-chức-năng':   { bg: 'hover:bg-emerald-50',  iconBg: 'bg-emerald-100',  icon: 'text-emerald-600' },
};

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await getCategories({ active_only: true });
        const cats = response.data?.results || (Array.isArray(response.data) ? response.data : []);
        setCategories(cats.slice(0, 14));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="bg-gradient-to-br from-teal-50 via-teal-50/80 to-teal-50 rounded-2xl p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (!categories.length) return null;

  return (
    <section className="py-8">
      <div className="relative bg-gradient-to-br from-teal-50 via-teal-50/80 to-teal-50 rounded-2xl p-6 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-teal-200/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-teal-200/30 rounded-full translate-x-1/4 translate-y-1/4 blur-2xl" />

        <div className="relative flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Nhóm sản phẩm</h2>
          <Link href="/products" className="inline-flex items-center gap-1 text-teal-700 font-semibold text-sm hover:underline">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {categories.map(cat => {
            const CatIcon = getCategoryIcon(cat.slug);
            const count = cat.productCount ?? cat.product_count;
            const colors = catColors[cat.slug] || catColors['thuốc'];
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className={`group flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-transparent hover:-translate-y-1 ${colors.bg}`}>
                <div className={`w-16 h-16 ${colors.iconBg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <CatIcon className={`w-7 h-7 ${colors.icon}`} />
                </div>
                <h3 className="text-sm font-bold text-center text-gray-800 leading-tight">{cat.name}</h3>
                <span className="text-xs text-gray-400 mt-1.5 font-medium">{count ? `${count} sản phẩm` : ''}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;
