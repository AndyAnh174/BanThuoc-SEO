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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useProductTypesStore } from '../stores/product-types.store';

const formSchema = z.object({
    name: z.string().min(1, 'Vui lòng nhập tên loại sản phẩm'),
    code: z.string().min(1, 'Vui lòng nhập mã'),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ProductTypeModal() {
    const {
        isModalOpen,
        modalMode,
        selectedType,
        closeModal,
        createType,
        updateType,
        isCreating,
        isUpdating,
    } = useProductTypesStore();

    const isSaving = isCreating || isUpdating;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            code: '',
            description: '',
        },
    });

    useEffect(() => {
        if (isModalOpen && selectedType) {
            form.reset({
                name: selectedType.name,
                code: selectedType.code,
                description: selectedType.description || '',
            });
        } else if (isModalOpen && !selectedType) {
            form.reset({
                name: '',
                code: '',
                description: '',
            });
        }
    }, [isModalOpen, selectedType, form]);

    const onSubmit = async (values: FormValues) => {
        let success = false;
        if (modalMode === 'create') {
            success = await createType(values);
        } else if (selectedType) {
            success = await updateType(selectedType.id, values);
        }

        if (success) {
            form.reset();
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {modalMode === 'create' ? 'Thêm loại sản phẩm' : 'Chỉnh sửa loại sản phẩm'}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên loại sản phẩm</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Thuốc, Thực phẩm chức năng" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mã</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ví dụ: MEDICINE"
                                            {...field}
                                            disabled={modalMode === 'edit'} // Code usually shouldn't change
                                        />
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
                                            placeholder="Mô tả chi tiết..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
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
