'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckoutFormValues } from '../schema/checkout.schema';

export function DeliveryInfo() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<CheckoutFormValues>();
  const deliveryMethod = watch('deliveryMethod');

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <Tabs 
        defaultValue="shipping" 
        value={deliveryMethod} 
        onValueChange={(val) => setValue('deliveryMethod', val as 'shipping' | 'pickup')}
        className="w-full"
      >
        <TabsList className="w-full grid w-full grid-cols-2 mb-6 h-12 p-1 bg-gray-50 rounded-lg">
          <TabsTrigger value="shipping" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
            Giao tại nhà
          </TabsTrigger>
          <TabsTrigger value="pickup" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
            Nhận tại cửa hàng
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
             {/* Common Fields */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-600 font-medium">Tên người nhận <span className="text-red-500">*</span></Label>
                    <Input id="fullName" {...register('fullName')} placeholder="Ví dụ: Nguyễn Văn A" className={`bg-gray-50/50 ${errors.fullName ? 'border-red-500 focus-visible:ring-red-200' : ''}`} />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-600 font-medium">Số điện thoại <span className="text-red-500">*</span></Label>
                    <Input id="phoneNumber" {...register('phoneNumber')} placeholder="Ví dụ: 0912345678" className={`bg-gray-50/50 ${errors.phoneNumber ? 'border-red-500 focus-visible:ring-red-200' : ''}`} />
                    {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
                </div>
             </div>

             <TabsContent value="shipping" className="space-y-4 mt-0 animate-in fade-in slide-in-from-left-2">
                 <div className="space-y-2">
                    <Label className="text-gray-600 font-medium">Địa chỉ <span className="text-red-500">*</span></Label>
                    {/* Mock Selectors - In real app use Select or Combobox */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                         <select {...register('city')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                             <option value="">Chọn Tỉnh/Thành</option>
                             <option value="HN">Hà Nội</option>
                             <option value="HCM">TP. Hồ Chí Minh</option>
                         </select>
                         <select {...register('district')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                             <option value="">Chọn Quận/Huyện</option>
                             <option value="BaDinh">Ba Đình</option>
                             <option value="Q1">Quận 1</option>
                         </select>
                         <select {...register('ward')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                             <option value="">Chọn Phường/Xã</option>
                             <option value="KimMa">Kim Mã</option>
                             <option value="BenNghe">Bến Nghé</option>
                         </select>
                    </div>
                    {errors.city && <p className="text-xs text-red-500">Vui lòng chọn địa chỉ đầy đủ</p>}

                    <Input {...register('streetAddress')} placeholder="Số nhà, tên đường..." className={`bg-gray-50/50 ${errors.streetAddress ? 'border-red-500 focus-visible:ring-red-200' : ''}`} />
                    {errors.streetAddress && <p className="text-xs text-red-500">{errors.streetAddress.message}</p>}
                 </div>
             </TabsContent>

             <TabsContent value="pickup" className="mt-0 animate-in fade-in slide-in-from-right-2">
                 <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm border border-blue-100 flex items-start gap-3">
                     <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-blue-600 font-bold text-xs">i</div>
                     <div>
                         <p className="font-semibold mb-1">Nhận tại nhà thuốc</p>
                         <p>Quý khách vui lòng đến trực tiếp nhà thuốc để nhận hàng sau khi xác nhận đơn hàng thành công.</p>
                     </div>
                 </div>
             </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
