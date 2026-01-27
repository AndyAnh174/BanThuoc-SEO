import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '../stores/cart.store';
import { formatCurrency } from '@/lib/utils';

export function CartHoverContent() {
  const { cart, removeItem } = useCartStore();
  const items = cart?.items || [];
  const itemCount = cart?.total_items || 0;
  const totalPrice = cart?.total_price || 0;

  if (itemCount === 0) {
    return (
      <div className="w-80 bg-white rounded-xl shadow-xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-900 font-medium mb-1">Giỏ hàng trống</p>
        <p className="text-sm text-gray-500 mb-4">Bạn chưa thêm sản phẩm nào</p>
        <Button asChild className="w-full">
            <Link href="/products">Mua sắm ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Giỏ hàng ({itemCount})</h3>
        <Link href="/cart" className="text-xs text-primary font-medium hover:underline">
          Xem tất cả
        </Link>
      </div>

      {/* Items List */}
      <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-2 space-y-1">
        {items.slice(0, 5).map((item) => (
          <div key={item.id} className="group/item flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors relative">
             {/* Image */}
             <div className="relative w-16 h-16 rounded-md border border-gray-100 bg-white shrink-0 overflow-hidden">
                <Image
                  src={item.product.primary_image?.image_url || '/images/product-placeholder.png'}
                  alt={item.product.name}
                  fill
                  className="object-contain p-1"
                />
             </div>
             
             {/* Info */}
             <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary transition-colors mb-1">
                    {item.product.name}
                </Link>
                <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs text-gray-500">
                         SL: <span className="font-medium text-gray-900">{item.quantity}</span>
                    </div>
                    <div className="font-semibold text-sm text-primary">
                        {formatCurrency(Number(item.total_price))}
                    </div>
                </div>
             </div>

             {/* Remove Button (Hover only) */}
             <button 
                onClick={(e) => {
                    e.preventDefault();
                    removeItem(item.id);
                }}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover/item:opacity-100 transition-all"
                title="Xóa sản phẩm"
             >
                <X className="w-3.5 h-3.5" />
             </button>
          </div>
        ))}
        {items.length > 5 && (
            <div className="p-2 text-center text-xs text-gray-500 italic">
                Còn {items.length - 5} sản phẩm khác...
            </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50/30 border-t border-gray-100">
         <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Tổng cộng:</span>
            <span className="text-lg font-bold text-primary">{formatCurrency(Number(totalPrice))}</span>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild className="w-full">
               <Link href="/cart">Xem giỏ hàng</Link>
            </Button>
            <Button asChild className="w-full bg-primary hover:bg-primary/90">
               <Link href="/checkout">Thanh toán</Link>
            </Button>
         </div>
      </div>
    </div>
  );
}
