'use client';

import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';

import { checkoutSchema, CheckoutFormValues } from '../schema/checkout.schema';
import locationData from '@/src/data/db.json';
import { DeliveryInfo } from './DeliveryInfo';
import { OrderSummary } from './OrderSummary';
import { CheckoutItem } from './CheckoutItem';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { getProducts } from '@/src/features/products';
import { ProductCard } from '@/src/features/products/components/ProductCard';
import { Product } from '@/src/features/products/types/product.types';
import { createOrder } from '@/src/features/orders/api/orders.api';

export function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading } = useCartStore();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      deliveryMethod: 'shipping',
      paymentMethod: 'COD',
      city: '',
      ward: '',
    }
  });

  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, discount: number} | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

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

  const handleApplyVoucher = async (code: string) => {
      if (!code || !cart) return;
      setVoucherLoading(true);
      try {
          const { checkVoucher } = await import('@/src/features/checkout/api/vouchers.api');
          const totalOrder = cart.items.reduce((total, item) => total + (item.product.sale_price ?? item.product.price) * item.quantity, 0);
          
          const res = await checkVoucher(code, totalOrder, cart.items);
          
          if (res.valid) {
              setAppliedVoucher({
                  code: code,
                  discount: res.discount_amount
              });
              toast.success(`Áp dụng mã ${code} thành công, giảm ${res.discount_amount.toLocaleString()}đ`);
          } else {
              setAppliedVoucher(null);
              toast.error(res.error_message || "Mã giảm giá không hợp lệ");
          }
      } catch (error: any) {
          setAppliedVoucher(null);
          toast.error(error.response?.data?.error_message || "Lỗi khi kiểm tra mã giảm giá");
      } finally {
          setVoucherLoading(false);
      }
  };

  const handleRemoveVoucher = () => {
      setAppliedVoucher(null);
      setVoucherCode('');
      toast.info("Đã gỡ bỏ mã giảm giá");
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) return;

      
    // Map IDs to Names
    const cityId = data.city;
    const wardId = data.ward;
    
    // Import json dynamically or assume it's available. To be safe, let's use the one we imported.
    // Or simpler: We need to import it here too to look up names.
    // Let's rely on importing it at top level
    
    const provinceName = (locationData.province as any[]).find(p => p.idProvince === cityId)?.name || cityId;
    const wardName = (locationData.commune as any[]).find(w => w.idCommune === wardId)?.name || wardId;

    try {
        const orderData = {
            // Map 'shipping_address' to 'address' as required by backend
            address: data.deliveryMethod === 'pickup' 
                ? 'Nhận tại cửa hàng' 
                : `${data.streetAddress}, ${wardName}, ${provinceName}`,
            province: provinceName,
            ward: wardName,
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            payment_method: data.paymentMethod, // Ensure this matches backend choices or map it
            items_input: cart.items.map(item => ({
                product: item.product.id,
                quantity: item.quantity,
                price: item.product.sale_price ?? item.product.price // Use current price
            })),
            voucher_code: appliedVoucher?.code || undefined
        };
        
        await createOrder(orderData);
        
        
        toast.success("Đặt hàng thành công! Đơn hàng đang được xử lý.");
        // Clear cart
        useCartStore.getState().clearCart(); 
        
        // Redirect with params
        // Redirect with params
        // createOrder returns AxiosResponse, so we need .data
        const newOrder = await createOrder(orderData); 
        const orderId = newOrder.data?.id;
        
        router.push(`/checkout/success?orderId=${orderId}&method=${data.paymentMethod}`);
    } catch (error: any) {
        console.error("Order creation failed:", error);
        
        let errorMessage = "Đặt hàng thất bại, vui lòng thử lại.";
        if (error.response?.data) {
             // Try to extract specific validation messages
             if (typeof error.response.data === 'object') {
                 // Join values of the first key or general details
                 const details = Object.values(error.response.data).flat().join(', ');
                 if (details) errorMessage = `Lỗi: ${details}`;
             }
        }
        
        toast.error(errorMessage);
    }
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
                                          <ProductCard 
                                            key={product.id}
                                            id={product.id}
                                            name={product.name}
                                            slug={product.slug}
                                            price={product.price}
                                            salePrice={product.salePrice}
                                            imageUrl={product.imageUrl || undefined}
                                            category={product.category}
                                            manufacturer={product.manufacturer}
                                            unit={product.unit}
                                            stockQuantity={product.stockQuantity}
                                            requiresPrescription={product.requiresPrescription}
                                            isFeatured={product.isFeatured}
                                            rating={product.rating}
                                            reviewCount={product.reviewCount}
                                            short_description={product.shortDescription}
                                          /> 
                                      ))}
                                  </div>
                              </div>
                          )}
                     </div>

                     {/* RIGHT COLUMN */}
                     <div className="lg:col-span-1">
                          <OrderSummary 
                            voucherCode={voucherCode}
                            setVoucherCode={setVoucherCode}
                            onApplyVoucher={handleApplyVoucher}
                            onRemoveVoucher={handleRemoveVoucher}
                            appliedVoucher={appliedVoucher}
                            loadingVoucher={voucherLoading}
                          />
                     </div>
                </div>
           </form>
       </FormProvider>
    </div>
  );
}
