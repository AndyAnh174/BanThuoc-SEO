'use client';

import React from 'react';
import Link from 'next/link';
import { useFormContext } from 'react-hook-form';
import { Ticket, CreditCard, Banknote, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { formatCurrency } from '@/lib/utils';
import { CheckoutFormValues } from '../schema/checkout.schema';
import Image from 'next/image';

function ShippingCarrierSelector() {
  const { register, watch } = useFormContext<CheckoutFormValues>();
  const carrier = watch('shippingCarrier');

  return (
    <div className="flex gap-3">
      <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${carrier === 'VTP' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
        <input type="radio" value="VTP" {...register('shippingCarrier')} className="sr-only" />
        <Image src="/viettel-post.png" alt="Viettel Post" width={40} height={40} className="rounded object-contain" />
        <div>
          <span className="font-medium text-sm">Viettel Post</span>
          <p className="text-xs text-gray-500">Uy tín, toàn quốc</p>
        </div>
        <span className="text-xs text-primary font-medium bg-white px-2 py-0.5 rounded-full border border-primary/20 ml-auto">Mặc định</span>
      </label>
      <label className={`flex-1 flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${carrier === 'GHN' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
        <input type="radio" value="GHN" {...register('shippingCarrier')} className="sr-only" />
        <Image src="/ghn.jpg" alt="GHN" width={40} height={40} className="rounded object-contain" />
        <div>
          <span className="font-medium text-sm">Giao Hàng Nhanh</span>
          <p className="text-xs text-gray-500">Nhanh, rẻ, 63 tỉnh</p>
        </div>
      </label>
    </div>
  );
}

interface OrderSummaryProps {
  voucherCode?: string;
  setVoucherCode?: (code: string) => void;
  onApplyVoucher?: (code: string) => void;
  onRemoveVoucher?: () => void;
  appliedVoucher?: { code: string; discount: number } | null;
  loadingVoucher?: boolean;
}

export function OrderSummary({
  voucherCode,
  setVoucherCode,
  onApplyVoucher,
  onRemoveVoucher,
  appliedVoucher,
  loadingVoucher
}: OrderSummaryProps) {
  const { register, watch, formState: { isSubmitting } } = useFormContext<CheckoutFormValues>();
  const { cart } = useCartStore();
  const paymentMethod = watch('paymentMethod');
  const totalPrice = cart?.total_price || 0;

  // Calculate final price with discount
  const discountAmount = appliedVoucher ? appliedVoucher.discount : 0;
  // If cart total is different from reduced total (calculated by items), use that
  const cartTotal = cart!.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shippingFee = cartTotal >= 1000000 ? 0 : 30000;
  const finalPrice = Math.max(0, Number(totalPrice) - discountAmount + shippingFee);

  return (
    <div className="space-y-6">
       {/* Voucher */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-3">
               <span className="font-medium text-gray-900 text-sm">Mã giảm giá</span>
               <Ticket className="w-4 h-4 text-primary" />
           </div>
           
           {appliedVoucher ? (
               <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                   <div>
                       <div className="font-bold text-green-700">{appliedVoucher.code}</div>
                       <div className="text-xs text-green-600">Đã giảm {formatCurrency(appliedVoucher.discount)}</div>
                   </div>
                   <button 
                       type="button" 
                       onClick={onRemoveVoucher}
                       className="text-red-500 text-xs font-medium hover:underline"
                   >
                       Gỡ bỏ
                   </button>
               </div>
           ) : (
               <div className="flex gap-2">
                   <Input 
                       placeholder="Nhập mã voucher" 
                       value={voucherCode}
                       onChange={(e) => setVoucherCode?.(e.target.value.toUpperCase())}
                       className="uppercase"
                   />
                   <Button 
                       type="button" 
                       variant="outline" 
                       onClick={() => onApplyVoucher?.(voucherCode || '')}
                       disabled={loadingVoucher || !voucherCode}
                   >
                       {loadingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Áp dụng"}
                   </Button>
               </div>
           )}
       </div>

       {/* Shipping Carrier */}
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <span className="font-medium text-gray-900 text-sm mb-3 block">Đơn vị vận chuyển</span>
           <ShippingCarrierSelector />
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
                
                <label className={`flex items-center justify-between space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${paymentMethod === 'VNPAY' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <div className="flex items-center space-x-3">
                        <input
                            type="radio"
                            value="VNPAY"
                            {...register('paymentMethod')}
                            className="text-primary w-4 h-4"
                        />
                        <div className="flex items-center gap-2 font-medium">
                            <QrCode className="w-4 h-4" />
                            Thanh toán online (VNPay)
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <QrCode className="w-3.5 h-3.5 text-green-500" />
                        <Banknote className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs text-primary font-medium bg-white px-2 py-0.5 rounded-full border border-primary/20 ml-1">Khuyên dùng</span>
                    </div>
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
                   <span className="font-medium">{formatCurrency(cartTotal)}</span>
               </div>
               
               {/* Product Discount */}
               <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Giảm giá sản phẩm</span>
                   <span className="font-medium text-green-600">
                     -{formatCurrency(cartTotal - Number(totalPrice))}
                   </span>
               </div>

               {/* Voucher Discount */}
               {discountAmount > 0 && (
                   <div className="flex justify-between text-sm">
                       <span className="text-gray-600">Voucher giảm giá</span>
                       <span className="font-medium text-green-600">
                         -{formatCurrency(discountAmount)}
                       </span>
                   </div>
               )}

               <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Phí vận chuyển</span>
                   <span className="font-medium">
                       {shippingFee === 0 ? (
                           <span className="text-green-600">Miễn phí</span>
                       ) : (
                           formatCurrency(shippingFee)
                       )}
                   </span>
               </div>
               <Separator />
               <div className="flex justify-between items-end">
                   <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                   <div className="text-right">
                       <div className="text-sm text-gray-400 line-through mr-2 inline-block">
                           {formatCurrency(cartTotal)}
                       </div>
                       <span className="font-bold text-primary text-xl">{formatCurrency(finalPrice)}</span>
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
