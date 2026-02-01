'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/src/features/products';
import { getNewProducts } from '@/src/features/products';
import { mapApiProducts, MappedProduct } from '@/src/lib/api-mapper';
import { ArrowRight, Sparkles } from 'lucide-react';


export function NewProductsSection() {
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getNewProducts();
        let rawProducts = [];
        if (response.data?.results) {
          rawProducts = response.data.results.slice(0, 8);
        } else if (Array.isArray(response.data)) {
          rawProducts = response.data.slice(0, 8);
        }
        // Map API products to frontend format
        setProducts(mapApiProducts(rawProducts));
      } catch (error) {
        console.error('Failed to fetch new products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        {/* Section Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Colored Header - Solid green */}
          <div className="bg-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Custom Icon */}
                <div className="relative w-9 h-9 shrink-0">
                  <Image 
                    src="/vien-thuoc.svg" 
                    alt="Icon Sản phẩm mới" 
                    fill
                    className="object-contain brightness-0 invert"
                  />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Sản Phẩm Mới
                </h2>
              </div>
              <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm" asChild>
                <Link href="/products?ordering=-created_at">
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Products grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  salePrice={product.salePrice}
                  imageUrl={product.imageUrl || undefined}
                  category={product.category || undefined}
                  manufacturer={product.manufacturer || undefined}
                  unit={product.unit}
                  stockQuantity={product.stockQuantity}
                  isFeatured={product.isFeatured}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  short_description={product.short_description}
                  quantity_per_unit={product.quantity_per_unit}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewProductsSection;
