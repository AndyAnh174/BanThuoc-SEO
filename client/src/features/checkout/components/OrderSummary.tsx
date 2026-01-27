'use client';

import React from 'react';
import Link from 'next/link';
import { useFormContext } from 'react-hook-form';
import { Ticket, CreditCard, Banknote, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { formatCurrency } from '@/lib/utils';
import { CheckoutFormValues } from '../schema/checkout.schema';

export function OrderSummary() {
  const { register, watch, formState: { isSubmitting } } = useFormContext<CheckoutFormValues>();
  const { cart } = useCartStore();
  const paymentMethod = watch('paymentMethod');
  const totalPrice = cart?.total_price || 0;

  return (
    <div className="space-y-6">
       {/* Voucher */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-3">
               <span className="font-medium text-gray-900 text-sm">Mã giảm giá</span>
               <button type="button" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                   <Ticket className="w-4 h-4" />
                   Thêm mã giảm
               </button>
           </div>
           {/* Mock input if expanded */}
           {/* For now simplified as design */}
       </div>

       {/* Payment Method */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex flex-col gap-3">
                <label className={`flex items-center justify-between space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-3">
                        <input 
                            type="radio" 
                            value="COD" 
                            {...register('paymentMethod')}
                            className="text-primary w-4 h-4"
                        />
                        <div className="flex items-center gap-2 font-medium">
                            <Banknote className="w-4 h-4" />
                            Thanh toán tiền mặt (COD)
                        </div>
                    </div>
                    <span className="text-xs text-primary font-medium bg-white px-2 py-0.5 rounded-full border border-primary/20">Mặc định</span>
                </label>
                
                <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-100 bg-gray-50 cursor-not-allowed opacity-60">
                     <div className="flex items-center space-x-3">
                        <input 
                            type="radio" 
                            value="BANKING" 
                            disabled
                            className="w-4 h-4"
                        />
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Chuyển khoản ngân hàng
                        </div>
                     </div>
                     <span className="text-xs text-gray-400 ml-auto">Sắp ra mắt</span>
                </label>
           </div>
       </div>

       {/* Order Note */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <Label className="text-sm font-medium text-gray-900 mb-2 block">Ghi chú đơn hàng</Label>
           <Textarea 
             {...register('orderNote')} 
             placeholder="Mô tả chi tiết (ví dụ: giao giờ hành chính...)" 
             className="bg-gray-50/50 resize-none min-h-[80px]"
           />
       </div>

       {/* Summary & Action */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
           <h3 className="font-semibold text-gray-900 mb-4">Thông tin thanh toán</h3>
           <div className="space-y-3 mb-6">
               <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Tổng {cart?.total_items || 0} sản phẩm</span>
                   <span className="font-medium">{formatCurrency(cart!.items.reduce((total, item) => total + (item.product.price * item.quantity), 0))}</span>
               </div>
               <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Giảm giá</span>
                   <span className="font-medium text-green-600">
                     -{formatCurrency(cart!.items.reduce((total, item) => total + (item.product.price * item.quantity), 0) - Number(totalPrice))}
                   </span>
               </div>
               <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Phí vận chuyển</span>
                   <span className="font-medium text-green-600">Miễn phí</span>
               </div>
               <Separator />
               <div className="flex justify-between items-end">
                   <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                   <div className="text-right">
                       <div className="text-sm text-gray-400 line-through mr-2 inline-block">
                           {formatCurrency(cart!.items.reduce((total, item) => total + (item.product.price * item.quantity), 0))}
                       </div>
                       <span className="font-bold text-primary text-xl">{formatCurrency(Number(totalPrice))}</span>
                   </div>
               </div>
           </div>

           <Button type="submit" className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 rounded-xl transition-all" disabled={isSubmitting || !cart || cart.items.length === 0}>
               {isSubmitting ? (
                   <>
                     <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                     Đang xử lý...
                   </>
               ) : (
                   "Xác nhận đặt hàng"
               )}
           </Button>
           
           <p className="text-center text-xs text-gray-400 mt-4">
               Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của chúng tôi
           </p>
       </div>
    </div>
  );
}
