'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { formatCurrency } from '@/lib/utils';
import { CartItem } from '@/src/features/cart/types/cart.types';

interface CheckoutItemProps {
  item: CartItem;
}

export function CheckoutItem({ item }: CheckoutItemProps) {
  const { updateItem, removeItem } = useCartStore();

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1) return;
    await updateItem(item.id, newQty);
  };

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0 relative group">
      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded-lg border border-gray-100 bg-white p-2">
         <Image
            src={item.product.primary_image?.image_url || '/images/product-placeholder.png'}
            alt={item.product.name}
            width={64}
            height={64}
            className="w-full h-full object-contain"
         />
      </div>

      {/* Info */}
      <div className="flex-1">
         <div className="flex justify-between items-start mb-1">
             <Link href={`/products/${item.product.slug}`} className="font-medium text-gray-900 hover:text-primary line-clamp-2 max-w-[80%]">
                 {item.product.name}
             </Link>
             <div className="text-right">
                 <div className="font-bold text-gray-900">{formatCurrency(Number(item.total_price))}</div>
                 <div className="text-xs text-gray-500">{formatCurrency(Number(item.product.price))}/sp</div>
             </div>
         </div>
         
         {/* Sub info */}
         <div className="text-xs text-gray-500 mb-2">
             Đơn vị: {item.product.unit || 'Hộp'}
         </div>

         {/* Controls */}
         <div className="flex justify-between items-center mt-2">
            {/* Note input placeholder - design shows "Ghi chú" */}
            <div className="flex items-center gap-2 cursor-pointer text-blue-500 hover:text-blue-600 text-sm">
                <span className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 border border-current rounded-sm flex items-center justify-center text-[10px]">✎</span>
                    Ghi chú
                </span>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-sm" onClick={() => handleQuantityChange(item.quantity - 1)}>
                    <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-sm" onClick={() => handleQuantityChange(item.quantity + 1)}>
                    <Plus className="w-3 h-3" />
                </Button>
            </div>
            
            {/* Remove */}
            <button 
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 text-sm flex items-center gap-1 ml-4"
            >
                Xóa
            </button>
         </div>
      </div>
    </div>
  );
}
