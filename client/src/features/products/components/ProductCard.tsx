'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Eye, Star, Pill } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string;
  category?: {
    name: string;
    slug: string;
  };
  manufacturer?: {
    name: string;
  };
  unit?: string;
  stockQuantity?: number;
  requiresPrescription?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  // Flash sale info
  flashSale?: {
    flashSalePrice: number;
    soldPercentage: number;
    remainingQuantity: number;
  };
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  imageUrl,
  category,
  manufacturer,
  unit = 'Hộp',
  stockQuantity = 0,
  requiresPrescription = false,
  isFeatured = false,
  rating,
  reviewCount = 0,
  flashSale,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  // Calculate current price and discount
  const currentPrice = flashSale?.flashSalePrice ?? salePrice ?? price;
  const isOnSale = currentPrice < price;
  const discountPercent = isOnSale
    ? Math.round((1 - currentPrice / price) * 100)
    : 0;
  const isOutOfStock = stockQuantity <= 0;

  // Format price to VND
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 bg-white">
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {flashSale && (
          <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold animate-pulse">
            ⚡ Flash Sale
          </Badge>
        )}
        {isOnSale && !flashSale && (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold">
            -{discountPercent}%
          </Badge>
        )}
        {isFeatured && (
          <Badge className="bg-primary hover:bg-primary/90 text-white text-xs">
            Nổi bật
          </Badge>
        )}
        {requiresPrescription && (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
            <Pill className="w-3 h-3 mr-1" />
            Kê đơn
          </Badge>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={() => onAddToWishlist?.(id)}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
        aria-label="Add to wishlist"
      >
        <Heart className="w-4 h-4 text-gray-500 hover:text-red-500 transition-colors" />
      </button>

      {/* Product Image */}
      <Link href={`/products/${slug}`} className="block relative pt-[100%] overflow-hidden bg-gray-50">
        <Image
          src={imageUrl || '/images/product-placeholder.png'}
          alt={name}
          fill
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/70 px-3 py-1 rounded">
              Hết hàng
            </span>
          </div>
        )}
        {/* Quick view on hover */}
        <div className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="sm"
            className="w-full bg-white/90 hover:bg-white shadow"
          >
            <Eye className="w-4 h-4 mr-2" />
            Xem nhanh
          </Button>
        </div>
      </Link>

      <CardContent className="p-3 space-y-2">
        {/* Category */}
        {category && (
          <Link
            href={`/categories/${category.slug}`}
            className="text-xs text-primary hover:underline line-clamp-1"
          >
            {category.name}
          </Link>
        )}

        {/* Product name */}
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-sm text-gray-800 line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>

        {/* Manufacturer */}
        {manufacturer && (
          <p className="text-xs text-gray-500 line-clamp-1">{manufacturer.name}</p>
        )}

        {/* Rating */}
        {rating !== undefined && rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(rating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-500">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price section */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary">
              {formatPrice(currentPrice)}
            </span>
            {isOnSale && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">/{unit}</p>
        </div>

        {/* Flash sale progress bar */}
        {flashSale && (
          <div className="space-y-1">
            <div className="relative h-4 bg-red-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(flashSale.soldPercentage, 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow">
                Đã bán {flashSale.soldPercentage}%
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Còn {flashSale.remainingQuantity} sản phẩm
            </p>
          </div>
        )}

        {/* Add to cart button */}
        <Button
          onClick={() => onAddToCart?.(id)}
          disabled={isOutOfStock}
          className="w-full mt-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default ProductCard;
