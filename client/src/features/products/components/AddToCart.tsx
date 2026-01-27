'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Minus, Plus, Heart, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface AddToCartProps {
  productId: string;
  productName: string;
  price: number;
  maxQuantity?: number;
  isOutOfStock?: boolean;
  onAddToCart?: (productId: string, quantity: number) => Promise<boolean>;
  onAddToWishlist?: (productId: string) => void;
  className?: string;
}

export function AddToCart({
  productId,
  productName,
  price,
  maxQuantity = 99,
  isOutOfStock = false,
  onAddToCart,
  onAddToWishlist,
  className,
}: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Quantity handlers
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > maxQuantity) {
      setQuantity(maxQuantity);
      toast.warning(`Số lượng tối đa là ${maxQuantity}`);
    } else {
      setQuantity(value);
    }
  };

  // Format price
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (isOutOfStock) return;

    setIsLoading(true);
    
    try {
      if (onAddToCart) {
        const success = await onAddToCart(productId, quantity);
        if (success) {
          setIsAdded(true);
          toast.success('Đã thêm vào giỏ hàng', {
            description: `${productName} x${quantity}`,
          });
          
          // Reset after 2 seconds
          setTimeout(() => setIsAdded(false), 2000);
        }
      } else {
        // Default behavior: save to localStorage
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find((item: any) => item.productId === productId);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          cart.push({
            productId,
            productName,
            price,
            quantity,
            addedAt: new Date().toISOString(),
          });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        
        setIsAdded(true);
        toast.success('Đã thêm vào giỏ hàng', {
          description: `${productName} x${quantity}`,
        });
        
        // Dispatch custom event for cart update
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
        
        setTimeout(() => setIsAdded(false), 2000);
      }
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng', {
        description: 'Vui lòng thử lại sau',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add to wishlist handler
  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(productId);
    } else {
      // Default behavior: save to localStorage
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (wishlist.includes(productId)) {
        toast.info('Sản phẩm đã có trong danh sách yêu thích');
        return;
      }

      wishlist.push(productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      
      toast.success('Đã thêm vào yêu thích', {
        description: productName,
      });
    }
  };

  const router = useRouter();

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Số lượng:</span>
        <div className="flex items-center border rounded-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={decreaseQuantity}
            disabled={quantity <= 1 || isOutOfStock}
            className="h-10 w-10 rounded-none rounded-l-lg"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            disabled={isOutOfStock}
            className="w-16 h-10 text-center border-0 rounded-none focus-visible:ring-0"
            min={1}
            max={maxQuantity}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={increaseQuantity}
            disabled={quantity >= maxQuantity || isOutOfStock}
            className="h-10 w-10 rounded-none rounded-r-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Total price */}
      <div className="flex items-center justify-between py-3 px-4 bg-green-50 rounded-lg">
        <span className="text-sm text-gray-700">Tạm tính:</span>
        <span className="text-xl font-bold text-primary">
          {formatPrice(price * quantity)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
          className={cn(
            'flex-1 h-12 text-base font-semibold transition-all',
            isAdded
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-primary hover:bg-primary/90'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Đang thêm...
            </>
          ) : isAdded ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Đã thêm vào giỏ
            </>
          ) : isOutOfStock ? (
            'Hết hàng'
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleAddToWishlist}
          className="h-12 w-12 border-2"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5" />
        </Button>
      </div>

      {/* Buy now button */}
      <Button
        variant="outline"
        onClick={handleBuyNow}
        disabled={isOutOfStock || isLoading}
        className="w-full h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
      >
        Mua ngay
      </Button>
    </div>
  );
}

export default AddToCart;
