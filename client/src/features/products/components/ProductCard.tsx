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
  id: string; name: string; slug: string; price: number; salePrice?: number | null;
  imageUrl?: string; category?: { name: string; slug: string }; manufacturer?: { name: string };
  unit?: string; stockQuantity?: number; requiresPrescription?: boolean; isFeatured?: boolean;
  rating?: number; reviewCount?: number; quantity_per_unit?: string; short_description?: string;
  soldCount?: number; flashSale?: { flashSalePrice: number; soldPercentage: number; remainingQuantity: number };
  onAddToCart?: (id: string) => void; onAddToWishlist?: (id: string) => void; isLiked?: boolean;
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

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('accessToken') && !localStorage.getItem('access_token')) {
      toast.error("Vui lòng đăng nhập để mua hàng"); router.push("/auth/login"); return;
    }
    setLocalLoading(true); await addToCart(productId, 1); setLocalLoading(false);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('accessToken') && !localStorage.getItem('access_token')) {
      toast.error("Vui lòng đăng nhập"); router.push("/auth/login"); return;
    }
    const prev = isLikedState; setIsLikedState(!prev);
    try { await toggleFavorite(id); toast.success(!prev ? "Đã thêm yêu thích" : "Đã xoá yêu thích"); }
    catch { setIsLikedState(prev); toast.error("Có lỗi xảy ra"); }
  };

  const handleQty = async (e: React.MouseEvent, qty: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!cartItem) return;
    setLocalLoading(true);
    if (qty <= 0) await removeItem(cartItem.id); else await updateItem(cartItem.id, qty);
    setLocalLoading(false);
  };

  const currentPrice = flashSale?.flashSalePrice ?? salePrice ?? price;
  const isOnSale = currentPrice < price;
  const discountPercent = isOnSale ? Math.round((1 - currentPrice / price) * 100) : 0;
  const outOfStock = stockQuantity <= 0;
  const lowStock = stockQuantity > 0 && stockQuantity <= 10;
  const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v);

  return (
    <div className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col h-full">
      {/* Image */}
      <Link href={`/products/${slug}`} className="block relative aspect-square bg-gray-50/50 overflow-hidden">
        <Image src={imageUrl || '/images/product-placeholder.png'} alt={name} fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 200px" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercent > 0 && <span className="bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>}
          {flashSale && <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">FLASH SALE</span>}
          {!flashSale && isFeatured && <span className="bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NỔI BẬT</span>}
        </div>

        {/* Wishlist */}
        <button onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${isLikedState ? 'bg-red-50 text-red-500' : 'bg-white/90 text-gray-400 opacity-0 group-hover:opacity-100'}`}>
          <Heart className={`w-4 h-4 ${isLikedState ? 'fill-current' : ''}`} /></button>

        {outOfStock && <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <span className="bg-white/90 text-gray-800 text-sm font-semibold px-4 py-1.5 rounded-full">Hết hàng</span></div>}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${slug}`}>
          <h3 className="text-[13px] text-gray-800 line-clamp-2 leading-snug min-h-[2.5em] mb-1.5 hover:text-teal-700 transition-colors">{name}</h3>
        </Link>

        {rating && rating > 0 ? (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex">{Array.from({length:5}).map((_,i)=><Star key={i} className={`w-3 h-3 ${i<Math.round(rating)?'text-amber-400 fill-amber-400':'text-gray-200'}`}/>)}</div>
            <span className="text-[11px] text-gray-400">({reviewCount||0})</span>
          </div>) : null}

        <div className="mb-1.5">
          <span className="text-[15px] font-bold text-red-600">{fmt(currentPrice)}đ</span>
          <span className="text-[10px] text-gray-400 ml-1">/{unit}</span>
          {isOnSale && <p className="text-[11px] text-gray-400 line-through">{fmt(price)}đ</p>}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-1.5">
          {soldCount && soldCount > 0 && <span>Đã bán {fmt(soldCount)}</span>}
          {lowStock ? <span className="text-orange-500 font-medium flex items-center gap-1"><Circle className="w-1.5 h-1.5 fill-orange-500"/>Sắp hết</span>
            : !outOfStock && <span className="flex items-center gap-1"><Circle className="w-1.5 h-1.5 fill-teal-500 text-teal-500"/>Còn hàng</span>}
        </div>

        {manufacturer && <div className="mt-auto pt-1 border-t border-gray-50 flex items-center gap-1"><Pill className="w-3 h-3 text-gray-300"/><p className="text-[11px] text-gray-400 truncate">{manufacturer.name}</p></div>}
      </div>

      {/* Always-visible quantity selector */}
      <div className="border-t border-gray-100 grid grid-cols-[36px_1fr_36px] h-10">
        <button onClick={(e)=>handleQty(e,quantityInCart-1)}
          disabled={quantityInCart===0||outOfStock}
          className="flex items-center justify-center text-gray-500 hover:bg-gray-50 border-r border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium">–</button>
        {quantityInCart > 0 ? (
          <span className="flex items-center justify-center text-sm font-bold text-teal-700">{quantityInCart}</span>
        ) : (
          <button onClick={handleAdd} disabled={outOfStock}
            className="flex items-center justify-center gap-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 disabled:text-gray-300 disabled:cursor-not-allowed">
            <ShoppingCart className="w-3.5 h-3.5" />Thêm
          </button>
        )}
        <button onClick={(e)=>quantityInCart===0?handleAdd(e):handleQty(e,quantityInCart+1)}
          disabled={outOfStock}
          className="flex items-center justify-center text-teal-600 hover:bg-teal-50 border-l border-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-lg font-medium">+</button>
      </div>
    </div>
  );
}

export default ProductCard;
