'use client';

import React from 'react';
import { ProductGallery, ProductImage } from './ProductGallery';
import { ProductInfo } from './ProductInfo';
import { AddToCart } from './AddToCart';
import { cn } from '@/lib/utils';

interface ProductDetailLayoutProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    price: number;
    salePrice?: number | null;
    flashSalePrice?: number | null;
    images?: ProductImage[];
    category?: {
      name: string;
      slug: string;
    };
    manufacturer?: {
      name: string;
      slug: string;
    };
    unit?: string;
    stockQuantity?: number;
    requiresPrescription?: boolean;
    isFeatured?: boolean;
    rating?: number;
    reviewCount?: number;
  };
  onAddToCart?: (productId: string, quantity: number) => Promise<boolean>;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export function ProductDetailLayout({
  product,
  onAddToCart,
  onAddToWishlist,
  className,
}: ProductDetailLayoutProps) {
  const currentPrice = product.flashSalePrice ?? product.salePrice ?? product.price;
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;

  return (
    <div className={cn('w-full', className)}>
      {/* 
        Responsive Layout:
        - Mobile: 100% width, stacked vertically
        - Desktop (md+): 50/50 split
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Left Column - Gallery */}
        <div className="w-full">
          <ProductGallery
            images={product.images || []}
            productName={product.name}
            className="sticky top-4"
          />
        </div>

        {/* Right Column - Product Info & Actions */}
        <div className="w-full space-y-6">
          {/* Product Info */}
          <ProductInfo
            name={product.name}
            price={product.price}
            salePrice={product.salePrice}
            flashSalePrice={product.flashSalePrice}
            category={product.category}
            manufacturer={product.manufacturer}
            sku={product.sku}
            unit={product.unit}
            rating={product.rating}
            reviewCount={product.reviewCount}
            stockQuantity={product.stockQuantity}
            requiresPrescription={product.requiresPrescription}
            isFeatured={product.isFeatured}
          />

          {/* Add to Cart */}
          <div className="bg-gray-50 rounded-xl p-4 md:p-6">
            <AddToCart
              productId={product.id}
              productName={product.name}
              price={currentPrice}
              maxQuantity={product.stockQuantity}
              isOutOfStock={isOutOfStock}
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
            />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-lg">🚚</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Giao hàng nhanh</p>
                <p className="text-xs">Trong 24h với đơn nội thành</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-lg">✅</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Chính hãng 100%</p>
                <p className="text-xs">Cam kết hàng chính hãng</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-lg">🔄</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Đổi trả dễ dàng</p>
                <p className="text-xs">Trong vòng 7 ngày</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-lg">💬</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Hỗ trợ 24/7</p>
                <p className="text-xs">Tư vấn miễn phí</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailLayout;
