'use client';

import React from 'react';
import { ProductCard, ProductCardProps } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

export interface ProductListProps {
  products: ProductCardProps[];
  isLoading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onAddToCart?: (productId: string) => void;
  onAddToWishlist?: (productId: string) => void;
}

export function ProductList({
  products,
  isLoading = false,
  columns = 4,
  emptyMessage = 'Không tìm thấy sản phẩm nào',
  emptyIcon,
  onAddToCart,
  onAddToWishlist,
}: ProductListProps) {
  // Grid columns class mapping
  const gridColsClass: Record<number, string> = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`grid ${gridColsClass[columns]} gap-4`}>
        {[...Array(columns * 2)].map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          {emptyIcon || <Package className="w-10 h-10 text-gray-400" />}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không có sản phẩm
        </h3>
        <p className="text-gray-500 max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridColsClass[columns]} gap-4`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
}

// Skeleton component for loading state
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border">
      {/* Image skeleton */}
      <Skeleton className="w-full pt-[100%]" />
      
      {/* Content skeleton */}
      <div className="p-3 space-y-2">
        {/* Category */}
        <Skeleton className="h-3 w-16" />
        
        {/* Name */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Manufacturer */}
        <Skeleton className="h-3 w-24" />
        
        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-3 rounded-full" />
          ))}
        </div>
        
        {/* Price */}
        <Skeleton className="h-6 w-28" />
        
        {/* Unit */}
        <Skeleton className="h-3 w-12" />
        
        {/* Button */}
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}

export default ProductList;
