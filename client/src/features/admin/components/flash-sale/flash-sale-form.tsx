'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useEffect } from 'react';
import { FlashSaleSession } from '../../types/flash-sale.types';

const flashSaleSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc'),
    description: z.string().optional(),
    start_time: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
    end_time: z.string().min(1, 'Thời gian kết thúc là bắt buộc'),
    is_active: z.boolean().default(true),
});

interface FlashSaleFormProps {
    initialData?: FlashSaleSession | null;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting?: boolean;
    onCancel?: () => void;
}

export const FlashSaleForm = ({ initialData, onSubmit, isSubmitting, onCancel }: FlashSaleFormProps) => {
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(flashSaleSchema),
        defaultValues: {
            name: '',
            description: '',
            start_time: '',
            end_time: '',
            is_active: true,
        }
    });

    useEffect(() => {
        if (initialData) {
            const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                const pad = (n:number) => n < 10 ? '0'+n : n;
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };

            reset({
                name: initialData.name,
                description: initialData.description || '',
                start_time: formatDate(initialData.start_time),
                end_time: formatDate(initialData.end_time),
                is_active: initialData.is_active,
            });
        }
    }, [initialData, reset]);

    const handleFormSubmit = async (data: any) => {
        const payload = {
            ...data,
            start_time: new Date(data.start_time).toISOString(),
            end_time: new Date(data.end_time).toISOString(),
        };
        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Tên chương trình *</Label>
                    <Input {...register('name')} placeholder="Flash Sale 11/11..." />
                    {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <div className="flex items-center space-x-2 h-10 border rounded-md px-3 bg-gray-50">
                        <Controller
                            control={control}
                            name="is_active"
                            render={({ field }) => (
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <span className="text-sm font-medium">{control._formValues.is_active ? 'Đang kích hoạt' : 'Tạm ẩn'}</span>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Bắt đầu *</Label>
                    <Input type="datetime-local" {...register('start_time')} />
                    {errors.start_time && <p className="text-red-500 text-sm">{String(errors.start_time.message)}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Kết thúc *</Label>
                    <Input type="datetime-local" {...register('end_time')} />
                    {errors.end_time && <p className="text-red-500 text-sm">{String(errors.end_time.message)}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea {...register('description')} placeholder="Mô tả chi tiết chương trình..." rows={4} />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
                {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>}
                <Button type="submit" disabled={isSubmitting}>
                    {initialData ? 'Lưu thay đổi' : 'Tạo mới'}
                </Button>
            </div>
        </form>
    );
};
