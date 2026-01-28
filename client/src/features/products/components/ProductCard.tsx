'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Pill, Loader2 } from 'lucide-react';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import { toast } from 'sonner';

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
  quantity_per_unit?: string;
  short_description?: string;
  // Flash sale info
  flashSale?: {
    flashSalePrice: number;
    soldPercentage: number;
    remainingQuantity: number;
  };
  onAddToCart?: (id: string) => void;
  onAddToWishlist?: (id: string) => void;
  isLiked?: boolean;
}

import { toggleFavorite } from '@/src/features/products/api/products.api';

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
  quantity_per_unit,
  short_description,
  onAddToCart,
  onAddToWishlist,
  isLiked = false,
}: ProductCardProps) {
  const { cart, addToCart, updateItem, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [localLoading, setLocalLoading] = useState(false);
  const [isLikedState, setIsLikedState] = useState(isLiked);

  // No need to parse ID if it is UUID string
  const productId = id;
  
  useEffect(() => {
    setIsLikedState(isLiked);
  }, [isLiked]);
  
  // Find item in cart
  const cartItem = cart?.items.find(item => item.product.id === productId || String(item.product_id) === productId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  // Logic handlers
  const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const hasToken = typeof window !== 'undefined' && (!!localStorage.getItem('accessToken') || !!localStorage.getItem('access_token'));

      if (!hasToken) {
          toast.error("Vui lòng đăng nhập để mua hàng");
          router.push("/auth/login");
          return;
      }

      setLocalLoading(true);
      await addToCart(productId, 1);
      setLocalLoading(false);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const hasToken = typeof window !== 'undefined' && (!!localStorage.getItem('accessToken') || !!localStorage.getItem('access_token'));
      if (!hasToken) {
          toast.error("Vui lòng đăng nhập để thực hiện chức năng này");
          router.push("/auth/login");
          return;
      }

      // Optimistic update
      const previousState = isLikedState;
      setIsLikedState(!previousState);

      try {
          await toggleFavorite(id);
          toast.success(!previousState ? "Đã thêm vào yêu thích" : "Đã xoá khỏi yêu thích");
          onAddToWishlist?.(id); // Call parent if provided
      } catch (error) {
          setIsLikedState(previousState);
          toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
  };

  const handleUpdateQuantity = async (e: React.MouseEvent, newQty: number) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!cartItem) return;

      setLocalLoading(true);
      // Optimistic update could happen here, but let's wait for API
      if (newQty <= 0) {
          // Typically remove item if qty 0
          // But here we might just reduce to 0 (remove) via updateItem handling or removeItem.
          // Store's updateItem might not handle remove. 
          // Let's assume we want to remove if qty = 0? Or just min 1.
          // Segmented control usually allows going to 0 -> remove.
          // Let's check store updateItem implementation. 
          // It calls PATCH. If backend handles 0 as delete? Usually no.
          // Better use removeItem for 0.
          if (newQty === 0) {
             // We can check if we have removeItem in scope. Yes we do need it.
             // But simpler: updateItem with 0 -> Backend?
             // Let's safe side: if newQty is 0, we can implementation remove logic here but I didn't import removeItem.
             // Let's allow update to 0 if backend supports or just stop at 1.
             // But UI shows "-" button. If click "-" when 1, it becomes 0 (back to "Add").
             // Handled by logic below?
      }
      // Actually simpler:
      // If current is 1 and click "-", newQty = 0.
      // We should call removeItem.
      // I need to import removeItem from store.
      }
      
      await updateItem(cartItem.id, newQty);
      setLocalLoading(false);
  };

  const { removeItem } = useCartStore();
  const handleRemove = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!cartItem) return;
      setLocalLoading(true);
      await removeItem(cartItem.id);
      setLocalLoading(false);
  }


  // Calculate current price and discount
  const currentPrice = flashSale?.flashSalePrice ?? salePrice ?? price;
  const isOnSale = currentPrice < price;
  const discountPercent = isOnSale
    ? Math.round((1 - currentPrice / price) * 100)
    : 0;
  const isOutOfStock = stockQuantity <= 0;
  const isLoading = isCartLoading && localLoading;

  // Format price to VND
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden bg-white hover:shadow-md transition-all duration-300 h-full">
      <div className="relative p-3 pb-0 flex-1 flex flex-col">
        {/* Wishlist button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-10 transition-colors ${isLikedState ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
          aria-label={isLikedState ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-5 h-5 ${isLikedState ? 'fill-current' : ''}`} />
        </button>

        {/* Product Image */}
        <Link href={`/products/${slug}`} className="block relative aspect-square mb-3">
          <Image
            src={imageUrl || '/images/product-placeholder.png'}
            alt={name}
            fill
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <span className="text-white font-semibold text-sm bg-black/70 px-3 py-1 rounded">
                Hết hàng
              </span>
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="flex flex-col gap-1 items-start mb-2 min-h-[24px]">
          {requiresPrescription && (
            <div className="bg-[#0057B7] text-[#FFD700] text-[10px] font-bold px-2 py-1 uppercase leading-tight inline-block rounded-sm">
              Theo đơn<br />bệnh viện
            </div>
          )}
          {flashSale && (
             <Badge className="bg-red-600 hover:bg-red-700 text-white rounded-sm px-1.5 py-0.5 text-[10px]">
               Flash Sale
             </Badge>
          )}
           {!flashSale && isFeatured && (
             <Badge className="bg-green-600 hover:bg-green-700 text-white rounded-sm px-1.5 py-0.5 text-[10px]">
               MỚI
             </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mb-2 h-[46px] flex flex-col justify-end">
           <span className="text-xl font-bold text-green-600 block leading-tight">
              {formatPrice(currentPrice)}
           </span>
           <span className="text-xs text-gray-400 line-through h-[16px] block">
              {isOnSale ? formatPrice(price) : '\u00A0'}
           </span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${slug}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 h-[40px] mb-1 hover:text-primary transition-colors text-sm leading-tight" title={name}>
            {name}
          </h3>
        </Link>
        
        {/* Short Description */}
        <p className="text-xs text-gray-500 line-clamp-1 mb-1 h-[18px] leading-relaxed">
            {short_description || '\u00A0'}
        </p>
        
        {/* Unit & Packaging */}
        <p className="text-xs text-gray-500 mb-2 h-[18px] leading-relaxed line-clamp-1">
            {quantity_per_unit ? quantity_per_unit : unit}
        </p>

        {/* Manufacturer */}
        <div className="mt-auto">
          {manufacturer && (
             <div className="flex items-center gap-1.5 mb-3">
               <div className="w-4 h-4 rounded bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Pill className="w-3 h-3" />
               </div>
               <p className="text-xs font-semibold text-blue-700 uppercase line-clamp-1">
                 {manufacturer.name}
               </p>
             </div>
          )}
          {!manufacturer && <div className="h-7 mb-3"></div>} 
        </div>
      </div>

      {/* Bottom Segmented Action Bar */}
      <div className="mt-auto border-t border-gray-100 grid grid-cols-[40px_1fr_40px]">
         {/* Minus Button */}
         <button 
           className="flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-100 h-10 text-gray-500 disabled:opacity-50"
           disabled={isOutOfStock || quantityInCart === 0 || isLoading}
           onClick={(e) => {
               if (quantityInCart === 1) {
                   handleRemove(e);
               } else {
                   handleUpdateQuantity(e, quantityInCart - 1);
               }
           }}
         >
            <span className="text-xl font-medium leading-none mb-0.5">–</span>
         </button>

         {/* Center - Cart/Count */}
         <button 
             onClick={quantityInCart === 0 ? handleAddToCart : undefined}
             className="flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors h-10 text-gray-500 disabled:opacity-50"
             disabled={isOutOfStock || isLoading}
         >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : quantityInCart > 0 ? (
                <span className="text-sm font-semibold text-primary">{quantityInCart}</span>
            ) : (
                <>
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Thêm</span>
                </>
            )}
         </button>

         {/* Plus Button */}
         <button 
           onClick={quantityInCart === 0 ? handleAddToCart : (e) => handleUpdateQuantity(e, quantityInCart + 1)}
           className="flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-100 h-10 text-green-600 font-medium disabled:opacity-50"
           disabled={isOutOfStock || isLoading}
         >
            <span className="text-xl leading-none mb-0.5">+</span>
         </button>
      </div>
    </Card>
  );
}

export default ProductCard;
