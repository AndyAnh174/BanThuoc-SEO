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
import { createOrder } from '@/src/features/orders/api/orders.api';

export function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading } = useCartStore();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      deliveryMethod: 'shipping',
      paymentMethod: 'COD',
      shippingCarrier: 'GHN',
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

  // Redirect if empty (but not when order was just placed - that clears the cart intentionally)
  useEffect(() => {
    if (!orderPlaced && !isLoading && cart && cart.items.length === 0) {
        toast.error("Giỏ hàng trống, vui lòng chọn sản phẩm");
        router.push('/products');
    }
  }, [cart, isLoading, orderPlaced, router]);

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const resolveName = async (url: string, id: string): Promise<string> => {
    try {
      const r = await fetch(`${API_URL}${url}`);
      const items = await r.json();
      const found = (Array.isArray(items) ? items : []).find(
        (item: any) => String(item.id || item.code) === String(id)
      );
      return found?.name || id;
    } catch { return id; }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) return;

    // Resolve IDs to names via GHN API
    const provinceName = data.city ? await resolveName('/shipping/provinces/', data.city) : '';
    const districtName = data.district ? await resolveName('/shipping/districts/?province_id=' + data.city, data.district) : '';
    const wardName = data.ward ? await resolveName('/shipping/wards/?district_id=' + data.district, data.ward) : '';

    // Calculate real shipping fee via GHN
    let shippingFee = 30000; // default
    if (data.deliveryMethod === 'shipping' && data.district && data.ward) {
      try {
        const feeRes = await fetch(`${API_URL}/shipping/calculate-fee/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_district_id: data.district,
            to_ward_code: data.ward,
            weight: 500,
            cod_value: data.paymentMethod === 'COD' ? Math.round(Number(cart.total_price) || 0) : 0,
          }),
        });
        const feeData = await feeRes.json();
        shippingFee = feeData.total || shippingFee;
      } catch { /* keep default */ }
    } else if (data.deliveryMethod === 'pickup') {
      shippingFee = 0;
    }

    try {
        const cartTotal = cart.items.reduce((total, item) => total + (item.product.sale_price ?? item.product.price) * item.quantity, 0);

        const orderData = {
            address: data.deliveryMethod === 'pickup'
                ? 'Nhận tại cửa hàng'
                : `${data.streetAddress}, ${wardName}, ${districtName}, ${provinceName}`,
            province: provinceName,
            district: districtName,
            ward: wardName,
            full_name: data.fullName,
            phone_number: data.phoneNumber,
            payment_method: data.paymentMethod,
            shipping_carrier: data.shippingCarrier || 'GHN',
            shipping_fee: shippingFee,
            items_input: cart.items.map(item => ({
                product: item.product.id,
                quantity: item.quantity,
                price: item.product.sale_price ?? item.product.price // Use current price
            })),
            voucher_code: appliedVoucher?.code || undefined
        };
        
        const newOrder = await createOrder(orderData);
        const orderId = newOrder.data?.id;

        // If VNPay, redirect to payment gateway
        if (data.paymentMethod === 'VNPAY') {
          const payRes = await fetch('/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              amount: Math.round(Number(newOrder.data?.final_amount || cart.total_price || 0)),
              orderInfo: `Thanh toan don hang ${orderId}`,
            }),
          });
          const payData = await payRes.json();
          if (payData.paymentUrl) {
            useCartStore.getState().clearCart();
            router.push(payData.paymentUrl);
            return;
          }
          toast.error('Không thể tạo liên kết thanh toán VNPay');
        }

        toast.success("Đặt hàng thành công! Đơn hàng đang được xử lý.");
        setOrderPlaced(true);
        useCartStore.getState().clearCart();

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
