'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckoutFormValues } from '../schema/checkout.schema';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import locationData from '@/src/data/db.json';

export function DeliveryInfo() {
  const { register, setValue, watch, control, formState: { errors } } = useFormContext<CheckoutFormValues>();
  const deliveryMethod = watch('deliveryMethod');
  const selectedCity = watch('city'); 
  
  const availableWards = React.useMemo(() => {
     if (!selectedCity) return [];
     return locationData.commune.filter((c: any) => c.idProvince === selectedCity);
  }, [selectedCity]);

  // Reset ward when city changes
  React.useEffect(() => {
      setValue('ward', '');
  }, [selectedCity, setValue]);

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
                    
                    {/* Address Selectors using shadcn Select */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                         <FormField
                            control={control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Chọn Tỉnh/Thành" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper">
                                            {locationData.province.map((p: any) => (
                                                <SelectItem key={p.idProvince} value={p.idProvince}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         
                         <FormField
                            control={control}
                            name="ward"
                            render={({ field }) => (
                                <FormItem>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        defaultValue={field.value} 
                                        value={field.value}
                                        disabled={!selectedCity}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Chọn Phường/Xã" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper">
                                            {availableWards.map((w: any) => (
                                                <SelectItem key={w.idCommune} value={w.idCommune}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                    </div>

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
