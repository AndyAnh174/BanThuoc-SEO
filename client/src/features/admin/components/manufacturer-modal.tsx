'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useManufacturersStore } from '../stores/manufacturers.store';

const formSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập tên nhà sản xuất'),
    description: z.string().optional(),
    logo: z.string().url('URL logo không hợp lệ').optional().or(z.literal('')),
    website: z.string().url('URL website không hợp lệ').optional().or(z.literal('')),
    country: z.string().optional(),
    is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function ManufacturerModal() {
    const {
        isModalOpen,
        modalMode,
        selectedManufacturer,
        closeModal,
        createManufacturer,
        updateManufacturer,
        isCreating,
        isUpdating,
    } = useManufacturersStore();

    const isSaving = isCreating || isUpdating;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            logo: '',
            website: '',
            country: '',
            is_active: true,
        },
    });

    useEffect(() => {
        if (isModalOpen && selectedManufacturer) {
            form.reset({
                name: selectedManufacturer.name,
                description: selectedManufacturer.description || '',
                logo: selectedManufacturer.logo || '',
                website: selectedManufacturer.website || '',
                country: selectedManufacturer.country || '',
                is_active: selectedManufacturer.is_active,
            });
        } else if (isModalOpen && !selectedManufacturer) {
            form.reset({
                name: '',
                description: '',
                logo: '',
                website: '',
                country: '',
                is_active: true,
            });
        }
    }, [isModalOpen, selectedManufacturer, form]);

    const onSubmit = async (values: FormValues) => {
        // Clean empty strings to undefined
        const cleanData = {
            ...values,
            logo: values.logo || undefined,
            website: values.website || undefined,
            description: values.description || undefined,
            country: values.country || undefined,
        };

        let success = false;
        if (modalMode === 'create') {
            success = await createManufacturer(cleanData);
        } else if (selectedManufacturer) {
            success = await updateManufacturer(selectedManufacturer.id, cleanData);
        }

        if (success) {
            form.reset();
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {modalMode === 'create' ? 'Thêm nhà sản xuất' : 'Chỉnh sửa nhà sản xuất'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên nhà sản xuất *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Dược Hậu Giang" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quốc gia</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Việt Nam" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="logo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/logo.png" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Mô tả về nhà sản xuất..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Hoạt động</FormLabel>
                                        <FormDescription>
                                            Hiển thị nhà sản xuất này trong danh sách
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeModal}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
