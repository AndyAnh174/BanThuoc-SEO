'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/src/features/products';
import { Pill, Apple, Heart, Baby, Stethoscope, Sparkles, Brain, Ear, Bone, Activity, Shield, Droplet, ChevronRight } from 'lucide-react';

interface Category {
  id: string; name: string; slug: string; description?: string;
  productCount?: number; product_count?: number; icon?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'thuoc-ke-don': <Pill className="w-6 h-6" />, 'thuoc-khong-ke-don': <Pill className="w-6 h-6" />,
  'thuc-pham-chuc-nang': <Apple className="w-6 h-6" />, 'duoc-my-pham': <Sparkles className="w-6 h-6" />,
  'thiet-bi-y-te': <Stethoscope className="w-6 h-6" />, 'cham-soc-ca-nhan': <Heart className="w-6 h-6" />,
  'san-pham-me-be': <Baby className="w-6 h-6" />, 'vitamin': <Apple className="w-6 h-6" />,
  'tim-mach': <Activity className="w-6 h-6" />, 'nao-than-kinh': <Brain className="w-6 h-6" />,
  'tai-mui-hong': <Ear className="w-6 h-6" />, 'co-xuong-khop': <Bone className="w-6 h-6" />,
  'mau-huyet-hoc': <Droplet className="w-6 h-6" />, 'khang-vi-sinh-vat': <Shield className="w-6 h-6" />,
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
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {[...Array(14)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
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

        <div className="relative grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {categories.map(cat => {
            const icon = categoryIcons[cat.slug] || <Pill className="w-6 h-6" />;
            const count = cat.productCount ?? cat.product_count;
            return (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-teal-300/50 hover:-translate-y-0.5">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-teal-100 transition-all">
                  <span className="text-teal-600">{icon}</span>
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-800 line-clamp-2 leading-tight min-h-[2.5em]">{cat.name}</h3>
                <span className="text-xs text-gray-400 mt-1">{count ? `${count} SP` : ''}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;
