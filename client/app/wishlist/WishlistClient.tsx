'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/src/features/products/components/ProductCard';
import { getFavorites } from '@/src/features/products/api/products.api';
import { MappedProduct } from '@/src/lib/api-mapper';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import { toast } from 'sonner';

export function WishlistClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, checkAuth } = useAuthStore();
  const [products, setProducts] = useState<MappedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  // Initial auth check
  useEffect(() => {
    checkAuth();
    setIsChecking(false);
  }, [checkAuth]);

  useEffect(() => {
    if (!isChecking && !isAuthLoading && !isAuthenticated) {
        toast.error("Vui lòng đăng nhập để xem sản phẩm yêu thích");
        router.push('/auth/login?from=/wishlist');
        return;
    }

    if (isAuthenticated) {
        loadFavorites();
    }
  }, [isAuthenticated, isAuthLoading, isChecking, router]);

  const loadFavorites = async () => {
    try {
        setIsLoading(true);
        const res = await getFavorites();
        if (res.data?.results) {
            setProducts(res.data.results);
        }
    } catch (error) {
        console.error("Failed to load favorites", error);
        toast.error("Không thể tải danh sách yêu thích");
    } finally {
        setIsLoading(false);
    }
  };

  if (isAuthLoading || (isAuthenticated && isLoading)) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
    );
  }

  if (!isAuthenticated) {
      return null; // Will redirect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-50 rounded-full">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Sản phẩm yêu thích</h1>
        <span className="text-gray-500 font-medium">({products.length})</span>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <ProductCard 
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    salePrice={product.salePrice}
                    imageUrl={product.imageUrl}
                    category={product.category}
                    manufacturer={product.manufacturer}
                    unit={product.unit}
                    stockQuantity={product.stockQuantity}
                    requiresPrescription={product.requiresPrescription}
                    isFeatured={product.isFeatured}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    short_description={product.short_description}
                    quantity_per_unit={product.quantity_per_unit}
                    isLiked={true} // Since this is wishlist page
                /> 
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Danh sách yêu thích trống</h3>
            <p className="text-gray-500 mb-6 max-w-md text-center">
                Bạn chưa lưu sản phẩm nào. Hãy khám phá và thả tim cho các sản phẩm bạn quan tâm nhé!
            </p>
            <Link href="/products">
                <Button className="bg-green-600 hover:bg-green-700">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Khám phá sản phẩm
                </Button>
            </Link>
        </div>
      )}
    </div>
  );
}
