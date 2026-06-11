'use client';

import React, { useState, useEffect } from 'react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface AddressOption {
  id?: number;
  code?: number | string;
  name: string;
}

export function DeliveryInfo() {
  const { register, setValue, watch, control, formState: { errors } } = useFormContext<CheckoutFormValues>();
  const deliveryMethod = watch('deliveryMethod');
  const shippingCarrier = watch('shippingCarrier') || 'GHN';
  const selectedProvince = watch('city');
  const selectedDistrict = watch('district');

  const isVTP = shippingCarrier === 'VTP'; // VTP V3 = 2-level (no district)
  const provUrl = isVTP ? `${API_URL}/shipping/vtp/provinces/` : `${API_URL}/shipping/provinces/`;
  const wardUrlBase = isVTP ? `${API_URL}/shipping/vtp/wards/?province_id=` : `${API_URL}/shipping/wards/?district_id=`;
  const distUrl = (id: string) => `${API_URL}/shipping/districts/?province_id=${id}`;

  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);

  // Fetch provinces when carrier changes
  useEffect(() => {
    fetch(provUrl)
      .then(r => r.json())
      .then(data => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [provUrl]);

  // Fetch districts when province changes (GHN only)
  useEffect(() => {
    if (isVTP) { setDistricts([]); return; }
    if (!selectedProvince) { setDistricts([]); return; }
    fetch(distUrl(selectedProvince))
      .then(r => r.json())
      .then(data => setDistricts(Array.isArray(data) ? data : []))
      .catch(() => setDistricts([]));
  }, [selectedProvince, isVTP]);

  // Fetch wards
  useEffect(() => {
    if (isVTP) {
      // VTP V3: wards by province directly
      if (!selectedProvince) { setWards([]); return; }
      fetch(`${wardUrlBase}${selectedProvince}`)
        .then(r => r.json())
        .then(data => setWards(Array.isArray(data) ? data : []))
        .catch(() => setWards([]));
    } else {
      // GHN: wards by district
      if (!selectedDistrict) { setWards([]); return; }
      fetch(`${wardUrlBase}${selectedDistrict}`)
        .then(r => r.json())
        .then(data => setWards(Array.isArray(data) ? data : []))
        .catch(() => setWards([]));
    }
  }, [selectedProvince, selectedDistrict, isVTP]);

  // Reset downstream
  useEffect(() => { setValue('district', ''); setValue('ward', ''); }, [selectedProvince, shippingCarrier, setValue]);
  useEffect(() => { if (!isVTP) setValue('ward', ''); }, [selectedDistrict, setValue]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <Tabs
        defaultValue="shipping"
        value={deliveryMethod}
        onValueChange={(val) => setValue('deliveryMethod', val as 'shipping' | 'pickup')}
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-2 mb-6 h-12 p-1 bg-gray-50 rounded-lg">
          <TabsTrigger value="shipping" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
            Giao tại nhà
          </TabsTrigger>
          <TabsTrigger value="pickup" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-medium transition-all">
            Nhận tại cửa hàng
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
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

                    <div className={`grid gap-3 mb-3 ${isVTP ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                         {/* Province */}
                         <FormField
                            control={control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Tỉnh/Thành" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper">
                                            {provinces.map((p: any) => (
                                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />

                         {/* District — GHN only */}
                         {!isVTP && (
                         <FormField
                            control={control}
                            name="district"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedProvince}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Quận/Huyện" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper">
                                            {districts.map((d: any) => (
                                                <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                         />
                         )}

                         {/* Ward */}
                         <FormField
                            control={control}
                            name="ward"
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        disabled={isVTP ? !selectedProvince : !selectedDistrict}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white">
                                                <SelectValue placeholder="Phường/Xã" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent position="popper">
                                            {wards.map((w: any) => (
                                                <SelectItem key={w.id || w.code} value={String(w.id || w.code)}>{w.name}</SelectItem>
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
