'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/src/features/products';
import { 
  Pill, 
  Apple, 
  Heart, 
  Baby, 
  Stethoscope, 
  Sparkles,
  Brain,
  Ear,
  Bone,
  Activity,
  Shield,
  Droplet,
  ChevronRight,
  PlayCircle
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  productCount?: number;
  product_count?: number;
  icon?: string;
}

// Icon mapping for categories (Fallback only)
const categoryIcons: Record<string, React.ReactNode> = {
  'thuoc-ke-don': <Pill className="w-8 h-8" />,
  'thuoc-khong-ke-don': <Pill className="w-8 h-8" />,
  'thuc-pham-chuc-nang': <Apple className="w-8 h-8" />,
  'duoc-my-pham': <Sparkles className="w-8 h-8" />,
  'thiet-bi-y-te': <Stethoscope className="w-8 h-8" />,
  'cham-soc-ca-nhan': <Heart className="w-8 h-8" />,
  'san-pham-me-be': <Baby className="w-8 h-8" />,
  'vitamin': <Apple className="w-8 h-8" />,
  'tim-mach': <Activity className="w-8 h-8" />,
  'nao-than-kinh': <Brain className="w-8 h-8" />,
  'tai-mui-hong': <Ear className="w-8 h-8" />,
  'co-xuong-khop': <Bone className="w-8 h-8" />,
  'mau-huyet-hoc': <Droplet className="w-8 h-8" />,
  'khang-vi-sinh-vat': <Shield className="w-8 h-8" />,
};

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories({ active_only: true });
        if (response.data?.results) {
          setCategories(response.data.results.slice(0, 14));
        } else if (Array.isArray(response.data)) {
          setCategories(response.data.slice(0, 14));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <div className="bg-linear-to-br from-green-50 via-green-100/50 to-teal-50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
            {[...Array(14)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Background with pattern */}
      <div className="relative bg-linear-to-br from-green-50 via-emerald-50/80 to-teal-50 rounded-2xl p-6 overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-linear-to-br from-primary/10 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-linear-to-tl from-teal-100/50 to-transparent rounded-full translate-x-1/4 translate-y-1/4" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Nhóm sản phẩm
          </h2>
          <Link 
            href="/products"
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            Xem tất cả
            <PlayCircle className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories grid */}
        <div className="relative grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {categories.map((category) => {
            // Keep fallback icon if no image
            const IconComponent = categoryIcons[category.slug] || <Pill className="w-8 h-8" />;
            const count = category.productCount ?? category.product_count;

            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 overflow-hidden group-hover:scale-105 transition-transform border">
                  {(category as any).image ? (
                     <img 
                       src={(category as any).image} 
                       alt={category.name}
                       className="w-full h-full object-cover"
                     />
                  ) : (
                    <div className="text-gray-300">
                      {IconComponent}
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-semibold text-center text-gray-800 line-clamp-2 leading-tight min-h-[2.5em]">
                  {category.name}
                </h3>
                <span className="text-[10px] text-gray-500 mt-1">
                  {count !== undefined ? `${count} sản phẩm` : 'Sản phẩm'}
                </span>
              </Link>
            );
          }).slice(0, 14)}
        </div>
      </div>
    </section>
  );
}

export default CategoryShowcase;

