'use client';

import { useFlashSaleStore } from '../../stores/flash-sale.store';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlashSaleProducts } from './flash-sale-products';

const flashSaleSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc'),
    description: z.string().optional(),
    start_time: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
    end_time: z.string().min(1, 'Thời gian kết thúc là bắt buộc'),
    is_active: z.boolean().default(true),
});

interface FlashSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'manage';
}

export const FlashSaleModal = ({ isOpen, onClose, mode }: FlashSaleModalProps) => {
    const { createSession, updateSession, currentSession } = useFlashSaleStore();
    const [activeTab, setActiveTab] = useState('info');

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

    // Effect 1: Handle Modal Open/Close & Tab Initialization
    useEffect(() => {
        if (isOpen) {
            if (mode === 'create') {
                setActiveTab('info');
            } else {
                if (mode === 'manage') setActiveTab('products');
                else setActiveTab('info');
            }
        }
    }, [isOpen, mode]);

    // Effect 2: Update Form Data when currentSession changes
    useEffect(() => {
        if (isOpen && currentSession && mode !== 'create') {
            const formatDate = (dateStr: string) => {
                if (!dateStr) return '';
                const d = new Date(dateStr);
                const pad = (n:number) => n < 10 ? '0'+n : n;
                return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            };

            reset({
                name: currentSession.name,
                description: currentSession.description || '',
                start_time: formatDate(currentSession.start_time),
                end_time: formatDate(currentSession.end_time),
                is_active: currentSession.is_active,
            });
        } else if (isOpen && mode === 'create') {
             reset({
                name: '',
                description: '',
                start_time: '',
                end_time: '',
                is_active: true,
            });
        }
    }, [currentSession, isOpen, mode, reset]);

    const onSubmit = async (data: any) => {
        // Convert local time back to ISO if needed, but backend handles ISO strings well usually.
        // Or simply send as is if backend expects ISO.
        // Actually datetime-local input value is "yyyy-MM-ddThh:mm", closest to ISO without timezone Z.
        // We might need to ensure backend treats it as local time or add timezone.
        // For simplicity let's assume backend handles it or we append ":00Z" (UTC) or let backend parse.
        // Better: `new Date(data.start_time).toISOString()`
        
        const payload = {
            ...data,
            start_time: new Date(data.start_time).toISOString(),
            end_time: new Date(data.end_time).toISOString(),
        };

        if (mode === 'create') {
            await createSession(payload);
            onClose();
        } else if (currentSession) {
            await updateSession(currentSession.id, payload);
            if (mode === 'edit') onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Tạo đợt Flash Sale mới' : `Chi tiết Flash Sale: ${currentSession?.name}`}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Thông tin chung</TabsTrigger>
                        <TabsTrigger value="products" disabled={!currentSession?.id}>Sản phẩm bán</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tên chương trình *</Label>
                                    <Input {...register('name')} placeholder="Flash Sale 11/11..." />
                                    {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Trạng thái</Label>
                                    <div className="flex items-center space-x-2 h-10">
                                        <Controller
                                            control={control}
                                            name="is_active"
                                            render={({ field }) => (
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                        <span>{control._formValues.is_active ? 'Kích hoạt' : 'Tạm ẩn'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
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
                                <Textarea {...register('description')} placeholder="Mô tả chi tiết chương trình..." />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose}>Đóng</Button>
                                <Button type="submit">Lưu thông tin</Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="products">
                        {currentSession && <FlashSaleProducts session={currentSession} />}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
