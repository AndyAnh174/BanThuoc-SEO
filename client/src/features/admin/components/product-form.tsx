'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Plus,
  X,
  Package,
  Tag,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Star,
  AlertTriangle,
  GripVertical,
  ArrowLeft,
  Save,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useProductTypesStore } from '@/src/features/admin/stores/product-types.store';
import { useCategoriesStore } from '../stores/categories.store';
import { ImageUpload } from './image-upload';
import { CategorySelector } from './category-selector';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SeoPreview } from './seo-preview';
import { getProductById, createProduct, updateProduct } from '../api/products.api';
import { getManufacturers } from '@/src/features/products/api/products.api';
import { http } from '@/lib/http';
import type { ProductCreateInput } from '../types/product.types';

// --- Zod Schema ---
const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  sku: z.string().min(1, 'SKU là bắt buộc'),
  slug: z.string().min(1, 'Slug là bắt buộc'),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
  manufacturer: z.string().min(1, 'Nhà sản xuất là bắt buộc'),
  price: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0;
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    },
    z.number().min(0, 'Giá phải lớn hơn hoặc bằng 0')
  ),
  sale_price: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      const n = Number(val);
      return isNaN(n) ? null : n;
    },
    z.number().min(0).nullable().optional()
  ),
  stock_quantity: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0;
      const n = Number(val);
      return isNaN(n) ? 0 : n;
    },
    z.number().int().min(0)
  ),
  low_stock_threshold: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 10;
      const n = Number(val);
      return isNaN(n) ? 10 : n;
    },
    z.number().int().min(0).default(10)
  ),
  product_type: z.string().min(1, 'Loại sản phẩm là bắt buộc'),
  unit: z.string().min(1, 'Đơn vị tính là bắt buộc').default('Hộp'),
  quantity_per_unit: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
  description: z.string().optional(),
  short_description: z.string().max(500, 'Mô tả ngắn tối đa 500 ký tự').optional(),
  ingredients: z.string().optional(),
  dosage: z.string().optional(),
  usage: z.string().optional(),
  contraindications: z.string().optional(),
  side_effects: z.string().optional(),
  storage: z.string().optional(),
  requires_prescription: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  images: z.array(z.object({
    image_url: z.string(),
    is_primary: z.boolean(),
    sort_order: z.number()
  })).optional()
});

type ProductFormData = z.infer<typeof productSchema>;

function SectionHeader({ icon: Icon, children }: { icon: React.ComponentType<any>; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-green-600" />
      </div>
      <h2 className="text-base font-semibold text-gray-900">{children}</h2>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <Label className="text-sm font-medium text-gray-700">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

function SortableImageItem({ id, img, idx, onRemove }: {
  id: string;
  img: { image_url: string; is_primary: boolean; sort_order: number };
  idx: number;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-square"
    >
      <img src={img.image_url} alt={`Product image ${idx + 1}`} className="w-full h-full object-contain p-2" />
      <div {...attributes} {...listeners} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 rounded-md p-1 cursor-grab active:cursor-grabbing shadow transition-opacity">
        <GripVertical size={14} className="text-gray-500" />
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center pointer-events-none">
        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="opacity-0 group-hover:opacity-100 bg-white text-red-500 rounded-full p-1.5 shadow-lg transition-all duration-200 hover:bg-red-50 pointer-events-auto"
        >
          <X size={14} />
        </button>
      </div>
      {img.is_primary && (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Ảnh chính</div>
      )}
    </div>
  );
}

interface ProductFormProps {
  id?: string;
}

export function ProductForm({ id }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [manufacturers, setManufacturers] = useState<any[]>([]);

  const { categoryTree, fetchCategoryTree } = useCategoriesStore();
  const { types: productTypes, fetchTypes: fetchProductTypes } = useProductTypesStore();

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      status: 'DRAFT',
      product_type: '',
      unit: 'Hộp',
      requires_prescription: false,
      is_featured: false,
      stock_quantity: 0,
      low_stock_threshold: 10,
      images: [],
    },
  });

  // Fetch reference data on mount
  useEffect(() => {
    if (categoryTree.length === 0) fetchCategoryTree(false);
    if (productTypes.length === 0) fetchProductTypes();
    getManufacturers()
      .then(res => setManufacturers(res.data.results || []))
      .catch(() => {});
  }, []);

  // Fetch product data for edit mode
  useEffect(() => {
    if (!id) return;
    setFetching(true);
    getProductById(id)
      .then((fullProduct: any) => {
        const safeStatus = String(fullProduct.status || 'DRAFT').toUpperCase();
        let pType = fullProduct.product_type;
        if (typeof pType === 'object' && pType !== null) pType = pType.id;
        reset({
          ...fullProduct,
          stock_quantity: fullProduct.stock_quantity ?? 0,
          low_stock_threshold: fullProduct.low_stock_threshold ?? 10,
          unit: fullProduct.unit || 'Hộp',
          product_type: pType || '',
          status: ['ACTIVE', 'DRAFT', 'INACTIVE', 'OUT_OF_STOCK'].includes(safeStatus)
            ? safeStatus as any
            : 'DRAFT',
        });
      })
      .catch(() => {
        toast.error('Không thể tải chi tiết sản phẩm');
        router.push('/admin/products');
      })
      .finally(() => setFetching(false));
  }, [id, reset, router]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateProduct(id!, data as ProductCreateInput);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await createProduct(data as ProductCreateInput);
        toast.success('Tạo sản phẩm thành công');
      }
      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      let message = isEdit ? 'Không thể cập nhật sản phẩm' : 'Không thể tạo sản phẩm';
      if (error.response?.data) {
        if (typeof error.response.data.detail === 'string') {
          message = error.response.data.detail;
        } else if (typeof error.response.data === 'object') {
          message = Object.entries(error.response.data)
            .map(([k, v]: any) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('\n');
        }
      }
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    const invalidFields = Object.keys(errors).join(', ');
    toast.error(`Vui lòng kiểm tra lại: ${invalidFields}`);
  };

  const images = watch('images') || [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const addImage = (url: string) => {
    const newImages = [...images, { image_url: url, is_primary: images.length === 0, sort_order: images.length }];
    setValue('images', newImages);
  };

  const addMultipleImages = (urls: string[]) => {
    const newImages = [...images];
    urls.forEach((url) => {
      newImages.push({ image_url: url, is_primary: newImages.length === 0, sort_order: newImages.length });
    });
    setValue('images', newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (images[index]?.is_primary && newImages.length > 0) newImages[0].is_primary = true;
    setValue('images', newImages);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((_, i) => `img-${i}` === active.id);
    const newIndex = images.findIndex((_, i) => `img-${i}` === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove([...images], oldIndex, newIndex).map((img, i) => ({
        ...img, is_primary: i === 0, sort_order: i,
      }));
      setValue('images', reordered);
    }
  };

  // Watch SEO fields for live preview
  const watchedMetaTitle = watch('meta_title') || '';
  const watchedSlug = watch('slug') || '';
  const watchedMetaDesc = watch('meta_description') || '';

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 pb-24">
      {/* ── 1. Thông tin cơ bản ── */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Package}>Thông tin cơ bản</SectionHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel required>Tên sản phẩm</FieldLabel>
              <Input {...register('name')} placeholder="Nhập tên sản phẩm" />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel required>Mã SKU</FieldLabel>
              <Input {...register('sku')} placeholder="VD: SKU-001" />
              <FieldError message={errors.sku?.message} />
            </div>
          </div>
          <div className="space-y-1.5">
            <FieldLabel required>Slug URL</FieldLabel>
            <Input {...register('slug')} placeholder="ten-san-pham-viet-thuong" />
            <FieldError message={errors.slug?.message} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Mô tả ngắn</FieldLabel>
            <Textarea {...register('short_description')} rows={3} className="resize-none" placeholder="Mô tả ngắn gọn về sản phẩm (tối đa 500 ký tự)..." />
            <FieldError message={errors.short_description?.message} />
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Phân loại & Trạng thái ── */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Tag}>Phân loại & Trạng thái</SectionHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel required>Loại sản phẩm</FieldLabel>
              <Controller
                control={control}
                name="product_type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger><SelectValue placeholder="Chọn loại sản phẩm" /></SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={errors.product_type?.message} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel required>Trạng thái</FieldLabel>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || 'DRAFT'}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" />Đang bán</span>
                      </SelectItem>
                      <SelectItem value="DRAFT">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400" />Nháp</span>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-400" />Ngừng kinh doanh</span>
                      </SelectItem>
                      <SelectItem value="OUT_OF_STOCK">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400" />Hết hàng</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel required>Danh mục</FieldLabel>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <CategorySelector value={field.value} onChange={field.onChange} tree={categoryTree} error={errors.category?.message} />
                )}
              />
              <FieldError message={errors.category?.message} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel required>Nhà sản xuất</FieldLabel>
              <div className="flex gap-2">
                <Controller
                  control={control}
                  name="manufacturer"
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onChange={field.onChange}
                      items={manufacturers.map((m: any) => ({ id: String(m.id), name: m.name }))}
                      placeholder="Chọn nhà sản xuất"
                      emptyText="Không tìm thấy nhà sản xuất"
                      error={errors.manufacturer?.message}
                      className="flex-1"
                    />
                  )}
                />
                <Button
                  type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0"
                  title="Thêm nhà sản xuất mới"
                  onClick={async () => {
                    const name = prompt('Nhập tên Nhà sản xuất mới:');
                    if (name) {
                      try {
                        const res = await http.post('/admin/manufacturers/', { name });
                        const newM = res.data;
                        setManufacturers(prev => [...prev, newM]);
                        setValue('manufacturer', newM.id);
                        toast.success(`Đã thêm NSX: ${name}`);
                      } catch {
                        toast.error('Lỗi thêm NSX. Vui lòng thử lại.');
                      }
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <FieldError message={errors.manufacturer?.message} />
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Yêu cầu đơn thuốc</p>
                  <p className="text-xs text-gray-500">Bắt buộc có toa bác sĩ khi mua</p>
                </div>
              </div>
              <Controller control={control} name="requires_prescription" render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Sản phẩm nổi bật</p>
                  <p className="text-xs text-gray-500">Hiển thị trên trang chủ và đầu danh sách</p>
                </div>
              </div>
              <Controller control={control} name="is_featured" render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )} />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Giá & Kho hàng ── */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={DollarSign}>Giá & Kho hàng</SectionHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel required>Giá bán lẻ (VNĐ)</FieldLabel>
              <Input type="number" step="1000" {...register('price')} placeholder="0" />
              <FieldError message={errors.price?.message} />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Giá khuyến mãi (VNĐ)</FieldLabel>
              <Input type="number" step="1000" {...register('sale_price')} placeholder="Để trống nếu không có" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel>Số lượng trong kho</FieldLabel>
              <Input type="number" {...register('stock_quantity')} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Ngưỡng cảnh báo sắp hết</FieldLabel>
              <Input type="number" {...register('low_stock_threshold')} placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel>Đơn vị tính</FieldLabel>
              <Input {...register('unit')} placeholder="VD: Hộp, Chai, Vỉ" />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Quy cách đóng gói</FieldLabel>
              <Input {...register('quantity_per_unit')} placeholder="VD: 10 vỉ x 10 viên" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Thông tin dược phẩm ── */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={FileText}>Thông tin dược phẩm</SectionHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <FieldLabel>Mô tả chi tiết</FieldLabel>
            <Textarea {...register('description')} rows={5} className="resize-none" placeholder="Mô tả đầy đủ về sản phẩm, công dụng, lợi ích..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel>Thành phần</FieldLabel>
              <Textarea {...register('ingredients')} rows={3} className="resize-none" placeholder="Liệt kê các hoạt chất..." />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Cách dùng</FieldLabel>
              <Textarea {...register('usage')} rows={3} className="resize-none" placeholder="Hướng dẫn sử dụng..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel>Liều dùng</FieldLabel>
              <Textarea {...register('dosage')} rows={3} className="resize-none" placeholder="Liều dùng hàng ngày..." />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Tác dụng phụ</FieldLabel>
              <Textarea {...register('side_effects')} rows={3} className="resize-none" placeholder="Các tác dụng phụ có thể xảy ra..." />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FieldLabel>Bảo quản</FieldLabel>
              <Textarea {...register('storage')} rows={2} className="resize-none" placeholder="Điều kiện bảo quản..." />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Chống chỉ định</FieldLabel>
              <Textarea {...register('contraindications')} rows={2} className="resize-none" placeholder="Các trường hợp chống chỉ định..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. Tối ưu SEO ── */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={Star}>Tối ưu SEO</SectionHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel>Tiêu đề SEO (meta_title)</FieldLabel>
                <Input {...register('meta_title')} placeholder="Tiêu đề hiển thị trên Google (nên 50-60 ký tự)" />
                <p className="text-xs text-gray-400">Để trống để dùng tên sản phẩm làm tiêu đề SEO.</p>
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Mô tả SEO (meta_description)</FieldLabel>
                <Textarea {...register('meta_description')} rows={3} className="resize-none" placeholder="Mô tả hiển thị trên Google (nên 120-160 ký tự)" />
                <p className="text-xs text-gray-400">Để trống để dùng mô tả ngắn làm mô tả SEO.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <SeoPreview title={watchedMetaTitle} slug={watchedSlug} description={watchedMetaDesc} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 6. Hình ảnh ── */}
      <Card>
        <CardHeader className="pb-3">
          <SectionHeader icon={ImageIcon}>Hình ảnh sản phẩm</SectionHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">Ảnh đầu tiên sẽ là ảnh chính. Kéo để sắp xếp thứ tự hiển thị.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((_, i) => `img-${i}`)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((img, idx) => (
                  <SortableImageItem key={`img-${idx}`} id={`img-${idx}`} img={img} idx={idx} onRemove={removeImage} />
                ))}
                <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center aspect-square bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                  <ImageUpload value="" onChange={addImage} onMultipleChange={addMultipleImages} folder="products" multiple />
                </div>
              </div>
            </SortableContext>
          </DndContext>
          {images.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">Chưa có hình ảnh. Upload ảnh để hiển thị sản phẩm đẹp hơn.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 7. Bottom bar sticky ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between shadow-lg">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Hủy
        </Button>
        <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700 text-white min-w-[160px]">
          {submitting ? (
            <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Đang lưu...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}</>
          )}
        </Button>
      </div>
    </form>
  );
}
