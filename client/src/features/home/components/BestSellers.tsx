'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/src/features/products';
import { getBestSellingProducts } from '@/src/features/products';
import { mapApiProducts, MappedProduct } from '@/src/lib/api-mapper';
import { ArrowRight, Trophy, TrendingUp } from 'lucide-react';

export function BestSellers() {
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await getBestSellingProducts();
        let raw: any[] = [];
        if (response.data?.results) raw = response.data.results.slice(0, 8);
        else if (Array.isArray(response.data)) raw = response.data.slice(0, 8);
        setProducts(mapApiProducts(raw));
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <Skeleton className="h-10 w-56 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Sản Phẩm Bán Chạy</h2>
            <p className="text-sm text-gray-400">Được tin dùng nhất</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild
          className="rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 font-semibold">
          <Link href="/products?best_selling=true">Xem tất cả <ArrowRight className="w-4 h-4 ml-1.5" /></Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} id={product.id} name={product.name} slug={product.slug}
            price={product.price} salePrice={product.salePrice} imageUrl={product.imageUrl || undefined}
            category={product.category || undefined} manufacturer={product.manufacturer || undefined}
            unit={product.unit} stockQuantity={product.stockQuantity} isFeatured={product.isFeatured}
            rating={product.rating} reviewCount={product.reviewCount}
            short_description={product.short_description} quantity_per_unit={product.quantity_per_unit} />
        ))}
      </div>
    </section>
  );
}

export default BestSellers;
