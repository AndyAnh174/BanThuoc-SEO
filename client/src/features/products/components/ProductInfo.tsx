'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Star, Pill, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductInfoProps {
  name: string;
  price: number;
  salePrice?: number | null;
  flashSalePrice?: number | null;
  category?: {
    name: string;
    slug: string;
  };
  manufacturer?: {
    name: string;
    slug: string;
  };
  sku?: string;
  unit?: string;
  rating?: number;
  reviewCount?: number;
  stockQuantity?: number;
  requiresPrescription?: boolean;
  isFeatured?: boolean;
  className?: string;
}

export function ProductInfo({
  name,
  price,
  salePrice,
  flashSalePrice,
  category,
  manufacturer,
  sku,
  unit = 'Hộp',
  rating,
  reviewCount = 0,
  stockQuantity = 0,
  requiresPrescription = false,
  isFeatured = false,
  className,
}: ProductInfoProps) {
  // Calculate current price and discount
  const currentPrice = flashSalePrice ?? salePrice ?? price;
  const isOnSale = currentPrice < price;
  const discountPercent = isOnSale
    ? Math.round((1 - currentPrice / price) * 100)
    : 0;
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 10;

  // Format price to VND
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Badges row */}
      <div className="flex flex-wrap gap-2">
        {flashSalePrice && (
          <Badge className="bg-red-500 hover:bg-red-600 text-white animate-pulse">
            ⚡ Flash Sale
          </Badge>
        )}
        {isOnSale && !flashSalePrice && (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
            Giảm {discountPercent}%
          </Badge>
        )}
        {isFeatured && (
          <Badge className="bg-primary hover:bg-primary/90 text-white">
            Nổi bật
          </Badge>
        )}
        {requiresPrescription && (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Pill className="w-3 h-3 mr-1" />
            Thuốc kê đơn
          </Badge>
        )}
      </div>

      {/* Category breadcrumb */}
      {category && (
        <div className="text-sm">
          <Link
            href={`/categories/${category.slug}`}
            className="text-primary hover:underline"
          >
            {category.name}
          </Link>
        </div>
      )}

      {/* Product name */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
        {name}
      </h1>

      {/* Manufacturer & SKU */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {manufacturer && (
          <div>
            Thương hiệu:{' '}
            <Link
              href={`/manufacturers/${manufacturer.slug}`}
              className="text-primary hover:underline font-medium"
            >
              {manufacturer.name}
            </Link>
          </div>
        )}
        {sku && (
          <div>
            SKU: <span className="font-medium">{sku}</span>
          </div>
        )}
      </div>

      {/* Rating */}
      {rating !== undefined && rating > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-5 h-5',
                  i < Math.round(rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {rating.toFixed(1)} ({reviewCount} đánh giá)
          </span>
        </div>
      )}

      {/* Price section */}
      <div className="py-4 border-y border-gray-100">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl md:text-4xl font-bold text-primary">
            {formatPrice(currentPrice)}
          </span>
          {isOnSale && (
            <span className="text-xl text-gray-400 line-through">
              {formatPrice(price)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Giá đã bao gồm VAT / {unit}
        </p>
      </div>

      {/* Stock status */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <span className="text-red-600 font-medium">❌ Hết hàng</span>
        ) : isLowStock ? (
          <span className="text-orange-600 font-medium">
            ⚠️ Chỉ còn {stockQuantity} sản phẩm
          </span>
        ) : (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Còn hàng
          </span>
        )}
      </div>
    </div>
  );
}

export default ProductInfo;
