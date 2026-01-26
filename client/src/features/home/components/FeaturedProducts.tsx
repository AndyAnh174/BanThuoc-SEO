'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/src/features/products';
import { getFeaturedProducts } from '@/src/features/products';
import { mapApiProducts, MappedProduct } from '@/src/lib/api-mapper';
import { ArrowRight, Star } from 'lucide-react';


export function FeaturedProducts() {
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getFeaturedProducts();
        let rawProducts = [];
        if (response.data?.results) {
          rawProducts = response.data.results.slice(0, 8);
        } else if (Array.isArray(response.data)) {
          rawProducts = response.data.slice(0, 8);
        }
        // Map API products to frontend format
        setProducts(mapApiProducts(rawProducts));
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
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
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Sản phẩm nổi bật
            </h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products?featured=true">
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Products grid */}
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
