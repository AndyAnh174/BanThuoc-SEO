'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useCategoriesStore } from '../stores/categories.store';
import { ImageUpload } from './image-upload';
import type { Category, CategoryTree } from '../types/category.types';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc').max(200, 'Tên tối đa 200 ký tự'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parent: z.string().nullable().optional(),
  is_active: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryModalProps {
  categories: Category[];
  categoryTree: CategoryTree[];
}

// Flatten tree for select options
const flattenTree = (
  tree: CategoryTree[],
  level = 0,
  excludeId?: string
): { id: string; name: string; level: number }[] => {
  const result: { id: string; name: string; level: number }[] = [];
  
  for (const item of tree) {
    if (item.id !== excludeId) {
      result.push({ id: item.id, name: item.name, level });
      if (item.children?.length) {
        result.push(...flattenTree(item.children, level + 1, excludeId));
      }
    }
  }
  
  return result;
};

export function CategoryModal({ categories, categoryTree }: CategoryModalProps) {
  const {
    isModalOpen,
    modalMode,
    selectedCategory,
    isCreating,
    isUpdating,
    closeModal,
    createCategory,
    updateCategory,
  } = useCategoriesStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: '',
      parent: null,
      is_active: true,
    },
  });

  const isActive = watch('is_active');
  const parentValue = watch('parent');

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isModalOpen) {
      if (modalMode === 'edit' && selectedCategory) {
        reset({
          name: selectedCategory.name,
          slug: selectedCategory.slug,
          description: selectedCategory.description || '',
          image: selectedCategory.image || '',
          parent: selectedCategory.parent,
          is_active: selectedCategory.is_active,
        });
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          image: '',
          parent: null,
          is_active: true,
        });
      }
    }
  }, [isModalOpen, modalMode, selectedCategory, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    const payload = {
      ...data,
      slug: data.slug || undefined,
      image: data.image || undefined,
      parent: data.parent || null,
    };

    if (modalMode === 'create') {
      await createCategory(payload);
    } else if (selectedCategory) {
      await updateCategory(selectedCategory.slug, payload);
    }
  };

  // Get flattened options, excluding current category and its descendants
  const parentOptions = flattenTree(
    categoryTree,
    0,
    selectedCategory?.id
  );

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {modalMode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
          </DialogTitle>
          <DialogDescription>
            {modalMode === 'create'
              ? 'Điền thông tin để tạo danh mục mới'
              : `Chỉnh sửa danh mục: ${selectedCategory?.name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Thuốc giảm đau"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug (tự động tạo nếu để trống)
            </Label>
            <Input
              id="slug"
              placeholder="thuoc-giam-dau"
              {...register('slug')}
            />
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label>Danh mục cha</Label>
            <Select
              value={parentValue || 'none'}
              onValueChange={(value) => setValue('parent', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục cha" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Không có (Danh mục gốc) —</SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {'—'.repeat(option.level)} {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn về danh mục..."
              {...register('description')}
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Ảnh danh mục</Label>
            <ImageUpload
              value={watch('image') || ''}
              onChange={(url) => setValue('image', url)}
              folder="categories"
              disabled={isCreating || isUpdating}
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Kích hoạt</Label>
              <p className="text-sm text-gray-500">
                Danh mục sẽ hiển thị trên trang chủ
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked: boolean) => setValue('is_active', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {modalMode === 'create' ? 'Tạo danh mục' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
