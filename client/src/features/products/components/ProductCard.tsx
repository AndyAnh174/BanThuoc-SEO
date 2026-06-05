'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Pill, Loader2, Star, Circle } from 'lucide-react';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import { toast } from 'sonner';
import { toggleFavorite } from '@/src/features/products/api/products.api';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string;
  category?: { name: string; slug: string };
  manufacturer?: { name: string };
  unit?: string;
  stockQuantity?: number;
  requiresPrescription?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  quantity_per_unit?: string;
  short_description?: string;
  soldCount?: number;
  flashSale?: { flashSalePrice: number; soldPercentage: number; remainingQuantity: number };
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
  isLiked?: boolean;
}

export function ProductCard({
  id, name, slug, price, salePrice, imageUrl, category, manufacturer,
  unit = 'Hộp', stockQuantity = 0, requiresPrescription = false, isFeatured = false,
  rating, reviewCount = 0, flashSale, quantity_per_unit, short_description,
  soldCount, onAddToCart, onAddToWishlist, isLiked = false,
}: ProductCardProps) {
  const { cart, addToCart, updateItem, removeItem, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [localLoading, setLocalLoading] = useState(false);
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const productId = id;

  useEffect(() => { setIsLikedState(isLiked); }, [isLiked]);

  const cartItem = cart?.items.find(item => item.product.id === productId || String(item.product_id) === productId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const hasToken = typeof window !== 'undefined' && !!(localStorage.getItem('accessToken') || localStorage.getItem('access_token'));
    if (!hasToken) { toast.error("Vui lòng đăng nhập để mua hàng"); router.push("/auth/login"); return; }
    setLocalLoading(true); await addToCart(productId, 1); setLocalLoading(false);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const hasToken = typeof window !== 'undefined' && !!(localStorage.getItem('accessToken') || localStorage.getItem('access_token'));
    if (!hasToken) { toast.error("Vui lòng đăng nhập"); router.push("/auth/login"); return; }
    const prev = isLikedState; setIsLikedState(!prev);
    try { await toggleFavorite(id); toast.success(!prev ? "Đã thêm vào yêu thích" : "Đã xoá khỏi yêu thích"); onAddToWishlist?.(id); }
    catch { setIsLikedState(prev); toast.error("Có lỗi xảy ra"); }
  };

  const handleUpdate = async (e: React.MouseEvent, qty: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!cartItem) return;
    setLocalLoading(true);
    if (qty <= 0) await removeItem(cartItem.id);
    else await updateItem(cartItem.id, qty);
    setLocalLoading(false);
  };

  // Pricing
  const currentPrice = flashSale?.flashSalePrice ?? salePrice ?? price;
  const isOnSale = currentPrice < price;
  const discountPercent = isOnSale ? Math.round((1 - currentPrice / price) * 100) : 0;
  const isOutOfStock = stockQuantity <= 0;
  const isLowStock = stockQuantity > 0 && stockQuantity <= 10;
  const isLoading = isCartLoading && localLoading;

  const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-green-100/50 hover:border-green-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* ── Image area ── */}
      <Link href={`/products/${slug}`} className="block relative aspect-square bg-gray-50 overflow-hidden">
        <Image src={imageUrl || '/images/product-placeholder.png'} alt={name} fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-110" sizes="(max-width: 640px) 50vw, 200px" />

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">-{discountPercent}%</span>
          )}
          {flashSale && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">FLASH SALE</span>
          )}
          {!flashSale && isFeatured && (
            <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">NỔI BẬT</span>
          )}
        </div>

        {/* Wishlist button */}
        <button onClick={handleToggleWishlist}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${isLikedState ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100'}`}>
          <Heart className={`w-4 h-4 ${isLikedState ? 'fill-current' : ''}`} />
        </button>

        {/* Quick add overlay on hover */}
        {!isOutOfStock && quantityInCart === 0 && (
          <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <button onClick={handleAddToCart}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" />Thêm vào giỏ
            </button>
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-black/70 text-white text-sm font-semibold px-4 py-1.5 rounded-full">Hết hàng</span>
          </div>
        )}
      </Link>

      {/* ── Info area ── */}
      <div className="p-3 flex flex-col flex-1">
        {/* Name */}
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm text-gray-800 line-clamp-2 leading-snug min-h-[2.6em] mb-1.5 hover:text-green-700 transition-colors">{name}</h3>
        </Link>

        {/* Rating */}
        {rating && rating > 0 ? (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
            </div>
            <span className="text-xs text-gray-400">({reviewCount || 0})</span>
          </div>
        ) : null}

        {/* Price */}
        <div className="mb-2">
          <span className="text-base font-bold text-green-700 leading-tight">{fmt(currentPrice)}đ</span>
          <span className="text-[10px] text-gray-400 ml-1">/{unit}</span>
          {isOnSale && <p className="text-xs text-gray-400 line-through">{fmt(price)}đ</p>}
        </div>

        {/* Sold + Stock */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
          {soldCount && soldCount > 0 ? <span>Đã bán {fmt(soldCount)}</span> : null}
          {isLowStock && !isOutOfStock && <span className="text-orange-500 font-medium flex items-center gap-1"><Circle className="w-2 h-2 fill-orange-500" />Sắp hết</span>}
          {!isOutOfStock && !isLowStock && <span className="flex items-center gap-1"><Circle className="w-2 h-2 fill-green-500 text-green-500" />Còn hàng</span>}
        </div>

        {/* Manufacturer */}
        <div className="mt-auto">
          {manufacturer && (
            <div className="flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-gray-400" />
              <p className="text-xs text-gray-500 truncate">{manufacturer.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom action bar (when in cart) ── */}
      {quantityInCart > 0 && (
        <div className="border-t border-gray-100 grid grid-cols-[36px_1fr_36px] h-9">
          <button onClick={(e) => handleUpdate(e, quantityInCart - 1)}
            className="flex items-center justify-center hover:bg-gray-50 text-gray-500 border-r border-gray-100 text-lg">–</button>
          <span className="flex items-center justify-center text-sm font-semibold text-green-700">{quantityInCart}</span>
          <button onClick={(e) => handleUpdate(e, quantityInCart + 1)}
            className="flex items-center justify-center hover:bg-gray-50 text-green-600 border-l border-gray-100 text-lg">+</button>
        </div>
      )}
    </div>
  );
}

export default ProductCard;
