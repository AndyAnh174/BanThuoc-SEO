'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';

import { checkoutSchema, CheckoutFormValues } from '../schema/checkout.schema';
import { DeliveryInfo } from './DeliveryInfo';
import { OrderSummary } from './OrderSummary';
import { CheckoutItem } from './CheckoutItem';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { getProducts } from '@/src/features/products';
import { ProductCard } from '@/src/features/products/components/ProductCard';
import { Product } from '@/src/features/products/types/product.types';

export function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading } = useCartStore();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: 'shipping',
      paymentMethod: 'COD',
      city: '',
      district: '',
      ward: '',
    }
  });

  // Fetch related products
  useEffect(() => {
    async function fetchRelated() {
        try {
            const res = await getProducts({ page_size: 4 });
            if (res.data?.results) {
                setRelatedProducts(res.data.results);
            }
        } catch (e) {
            console.error(e);
        }
    }
    fetchRelated();
  }, []);

  // Redirect if empty
  useEffect(() => {
    if (!isLoading && cart && cart.items.length === 0) {
        toast.error("Giỏ hàng trống, vui lòng chọn sản phẩm");
        router.push('/products');
    }
  }, [cart, isLoading, router]);

  const onSubmit = async (data: CheckoutFormValues) => {
    console.log("Checkout Data:", data);
    console.log("Cart Items:", cart?.items);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success("Đặt hàng thành công! Đơn hàng đang được xử lý.");
    router.push('/checkout/success'); // Or success modal
  };

  if (!cart || cart.items.length === 0) {
      return (
          <div className="min-h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
      );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
       <FormProvider {...methods}>
           <form onSubmit={methods.handleSubmit(onSubmit)} className="container mx-auto px-4 py-6">
                
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <span className="cursor-pointer hover:text-primary" onClick={() => router.push('/')}>Trang chủ</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="cursor-pointer hover:text-primary" onClick={() => router.push('/cart')}>Giỏ hàng</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="font-semibold text-gray-900">Thanh toán</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* LEFT COLUMN */}
                     <div className="lg:col-span-2 space-y-6">
                          {/* Delivery Info */}
                          <DeliveryInfo />

                          {/* Cart Items */}
                          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                               <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
                                   <span>Sản phẩm ({cart.items.length})</span>
                                   <span className="text-sm font-normal text-gray-500">Kéo sang trái để xem thêm nếu cần</span>
                               </h3>
                               <div className="space-y-0 divide-y divide-gray-100">
                                   {cart.items.map(item => (
                                       <CheckoutItem key={item.id} item={item} />
                                   ))}
                               </div>
                          </div>

                          {/* Related Products */}
                          {relatedProducts.length > 0 && (
                              <div className="relative">
                                  <h3 className="font-semibold text-gray-900 mb-4 px-1">Thường được mua kèm với</h3>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                      {relatedProducts.map(product => (
                                          <ProductCard key={product.id} data={product} /> // Assuming simple usage
                                      ))}
                                  </div>
                              </div>
                          )}
                     </div>

                     {/* RIGHT COLUMN */}
                     <div className="lg:col-span-1">
                          <OrderSummary />
                     </div>
                </div>
           </form>
       </FormProvider>
    </div>
  );
}
