'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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
import { Loader2, Plus, X, Package, Tag, DollarSign, FileText, Image as ImageIcon, Star, AlertTriangle, GripVertical } from 'lucide-react';
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

import { useProductsStore } from '../stores/products.store';
import { useProductTypesStore } from '@/src/features/admin/stores/product-types.store';
import { useCategoriesStore } from '../stores/categories.store';
import { ImageUpload } from './image-upload';
import { CategorySelector } from './category-selector';
import type { ProductCreateInput, ProductType, ProductStatus } from '../types/product.types';
import { getManufacturers } from '@/src/features/products/api/products.api';
import { http } from '@/lib/http';

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

const TAB_CONFIG = [
    { value: 'general', label: 'Thông tin', icon: Package },
    { value: 'pricing', label: 'Giá & Kho', icon: DollarSign },
    { value: 'details', label: 'Chi tiết', icon: FileText },
    { value: 'images', label: 'Hình ảnh', icon: ImageIcon },
];

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

function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 pt-1">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{children}</p>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    );
}

function SortableImageItem({ id, img, idx, onRemove }: {
    id: string;
    img: { image_url: string; is_primary: boolean; sort_order: number };
    idx: number;
    onRemove: (index: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

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
            <img
                src={img.image_url}
                alt={`Product image ${idx + 1}`}
                className="w-full h-full object-contain p-2"
            />
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-white/90 rounded-md p-1 cursor-grab active:cursor-grabbing shadow transition-opacity"
            >
                <GripVertical size={14} className="text-gray-500" />
            </div>
            {/* Hover overlay */}
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
                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Ảnh chính
                </div>
            )}
        </div>
    );
}

export function ProductModal() {
    const {
        isModalOpen,
        modalMode,
        selectedProduct,
        isCreating,
        isUpdating,
        closeModal,
        createProduct,
        updateProduct
    } = useProductsStore();

    const { categoryTree, fetchCategoryTree } = useCategoriesStore();
    const { types: productTypes, fetchTypes: fetchProductTypes } = useProductTypesStore();
    const [manufacturers, setManufacturers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('general');

    // Flatten active categories for select
    const flattenCategories = (nodes: any[], level = 0, res: any[] = []) => {
        for (const node of nodes) {
            res.push({ ...node, level });
            if (node.children) flattenCategories(node.children, level + 1, res);
        }
        return res;
    };
    const categoryOptions = flattenCategories(categoryTree);

    // Form Setup
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
            images: []
        }
    });

    // Fetch initial data
    useEffect(() => {
        if (isModalOpen) {
            if (categoryTree.length === 0) fetchCategoryTree(false);
            if (productTypes.length === 0) fetchProductTypes();
            getManufacturers()
                .then(res => setManufacturers(res.data.results || []))
                .catch(err => console.error(err));
        }
    }, [isModalOpen]);

    // Reset/Set form when modal opens/closes or selection changes
    useEffect(() => {
        if (isModalOpen) {
            if (modalMode === 'edit' && selectedProduct) {
                const { getProductById } = require('../api/products.api');

                getProductById(selectedProduct.id)
                    .then((fullProduct: any) => {
                        const safeStatus = String(fullProduct.status || 'DRAFT').toUpperCase();

                        let pType = fullProduct.product_type;
                        if (typeof pType === 'object' && pType !== null) {
                            pType = pType.id;
                        }

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

                        setActiveTab('general');
                    })
                    .catch((err: any) => {
                        console.error("Failed to fetch full product details", err);
                        toast.error("Không thể tải chi tiết sản phẩm đầy đủ");
                        reset({
                            ...selectedProduct,
                            unit: selectedProduct.unit || 'Hộp',
                            stock_quantity: selectedProduct.stock_quantity ?? 0,
                        });
                    });

            } else {
                reset({
                    status: 'DRAFT',
                    product_type: productTypes.length > 0 ? productTypes[0].id : '',
                    unit: 'Hộp',
                    stock_quantity: 0,
                    price: 0,
                    low_stock_threshold: 10,
                    is_featured: false,
                    requires_prescription: false,
                    images: []
                });
                setActiveTab('general');
            }
        }
    }, [isModalOpen, modalMode, selectedProduct, reset, productTypes]);

    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        console.log('Submitting Form Data:', data);
        if (modalMode === 'create') {
            await createProduct(data as ProductCreateInput);
        } else if (selectedProduct) {
            await updateProduct(selectedProduct.id, data);
        }
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
        urls.forEach((url, i) => {
            newImages.push({
                image_url: url,
                is_primary: newImages.length === 0,
                sort_order: newImages.length,
            });
        });
        setValue('images', newImages);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        if (images[index].is_primary && newImages.length > 0) {
            newImages[0].is_primary = true;
        }
        setValue('images', newImages);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = images.findIndex((_, i) => `img-${i}` === active.id);
        const newIndex = images.findIndex((_, i) => `img-${i}` === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
            const reordered = arrayMove([...images], oldIndex, newIndex).map((img, i) => ({
                ...img,
                is_primary: i === 0,
                sort_order: i,
            }));
            setValue('images', reordered);
        }
    };

    const onError = (errors: any) => {
        console.error('Form Validation Errors:', errors);
        const invalidFields = Object.keys(errors).join(', ');
        if (errors.product_type) {
            toast.error(`Lỗi loại sản phẩm: ${errors.product_type.message}`);
        } else {
            toast.error(`Vui lòng kiểm tra lại: ${invalidFields}`);
        }
    };

    const activeTabConfig = TAB_CONFIG.find(t => t.value === activeTab);
    const isLoading = isCreating || isUpdating;

    return (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
            <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {modalMode === 'create' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {modalMode === 'create' ? 'Điền đầy đủ thông tin để tạo sản phẩm' : 'Chỉnh sửa thông tin sản phẩm'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit, onError)} className="flex flex-col flex-1 overflow-hidden min-h-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden min-h-0">
                        {/* Tab navigation */}
                        <div className="px-6 pt-4 shrink-0">
                            <TabsList className="flex gap-1 bg-gray-100 p-1 rounded-xl h-auto w-full">
                                {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                                    <TabsTrigger
                                        key={value}
                                        value={value}
                                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all
                                            data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 data-[state=active]:font-medium
                                            data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-700"
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        <span>{label}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {/* Scrollable content area */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">

                            {/* ── Tab 1: General ── */}
                            <TabsContent value="general" className="mt-0 space-y-5">
                                <div className="space-y-4">
                                    <SectionHeader>Định danh sản phẩm</SectionHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel required>Tên sản phẩm</FieldLabel>
                                            <Input className="h-9" {...register('name')} placeholder="Nhập tên sản phẩm" />
                                            <FieldError message={errors.name?.message} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <FieldLabel required>Mã SKU</FieldLabel>
                                            <Input className="h-9" {...register('sku')} placeholder="VD: SKU-001" />
                                            <FieldError message={errors.sku?.message} />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <FieldLabel required>Slug URL</FieldLabel>
                                        <Input className="h-9" {...register('slug')} placeholder="ten-san-pham-viet-thuong" />
                                        <FieldError message={errors.slug?.message} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader>Phân loại</SectionHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel required>Loại sản phẩm</FieldLabel>
                                            <Controller
                                                control={control}
                                                name="product_type"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                                        <SelectTrigger className="h-9"><SelectValue placeholder="Chọn loại sản phẩm" /></SelectTrigger>
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
                                                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ACTIVE">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                                                    Đang bán
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="DRAFT">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                                                                    Nháp
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="INACTIVE">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                                                                    Ngừng kinh doanh
                                                                </span>
                                                            </SelectItem>
                                                            <SelectItem value="OUT_OF_STOCK">
                                                                <span className="flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-red-400" />
                                                                    Hết hàng
                                                                </span>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel required>Danh mục</FieldLabel>
                                            <Controller
                                                control={control}
                                                name="category"
                                                render={({ field }) => (
                                                    <CategorySelector
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        tree={categoryTree}
                                                        error={errors.category?.message}
                                                    />
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
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="flex-1 h-9">
                                                                <SelectValue placeholder="Chọn nhà sản xuất" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {manufacturers.map((m: any) => (
                                                                    <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 shrink-0"
                                                    title="Thêm nhà sản xuất mới"
                                                    onClick={async () => {
                                                        const name = prompt("Nhập tên Nhà sản xuất mới:");
                                                        if (name) {
                                                            try {
                                                                const { http } = require('@/lib/http');
                                                                const res = await http.post('/admin/manufacturers/', { name });
                                                                const newM = res.data;
                                                                setManufacturers(prev => [...prev, newM]);
                                                                setValue('manufacturer', newM.id);
                                                                toast.success(`Đã thêm NSX: ${name}`);
                                                            } catch (e) {
                                                                console.error(e);
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
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader>Mô tả</SectionHeader>
                                    <div className="space-y-1.5">
                                        <FieldLabel>Mô tả ngắn</FieldLabel>
                                        <Textarea
                                            {...register('short_description')}
                                            rows={3}
                                            className="resize-none text-sm"
                                            placeholder="Mô tả ngắn gọn về sản phẩm (tối đa 500 ký tự)..."
                                        />
                                        <FieldError message={errors.short_description?.message} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ── Tab 2: Pricing & Inventory ── */}
                            <TabsContent value="pricing" className="mt-0 space-y-5">
                                <div className="space-y-4">
                                    <SectionHeader>Giá bán</SectionHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel required>Giá bán lẻ (VNĐ)</FieldLabel>
                                            <Input className="h-9" type="number" step="1000" {...register('price')} placeholder="0" />
                                            <FieldError message={errors.price?.message} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <FieldLabel>Giá khuyến mãi (VNĐ)</FieldLabel>
                                            <Input className="h-9" type="number" step="1000" {...register('sale_price')} placeholder="Để trống nếu không có" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader>Kho hàng</SectionHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel>Số lượng trong kho</FieldLabel>
                                            <Input className="h-9" type="number" {...register('stock_quantity')} placeholder="0" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <FieldLabel>Ngưỡng cảnh báo sắp hết</FieldLabel>
                                            <Input className="h-9" type="number" {...register('low_stock_threshold')} placeholder="10" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader>Đóng gói</SectionHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel>Đơn vị tính</FieldLabel>
                                            <Input className="h-9" {...register('unit')} placeholder="VD: Hộp, Chai, Vỉ" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <FieldLabel>Quy cách đóng gói</FieldLabel>
                                            <Input className="h-9" {...register('quantity_per_unit')} placeholder="VD: 10 vỉ x 10 viên" />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ── Tab 3: Details & SEO ── */}
                            <TabsContent value="details" className="mt-0 space-y-5">
                                <div className="space-y-4">
                                    <SectionHeader>Thuộc tính đặc biệt</SectionHeader>
                                    <div className="flex flex-col gap-3">
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
                                            <Controller
                                                control={control}
                                                name="requires_prescription"
                                                render={({ field }) => (
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                )}
                                            />
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
                                            <Controller
                                                control={control}
                                                name="is_featured"
                                                render={({ field }) => (
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                )}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader>Thông tin dược phẩm</SectionHeader>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel>Thành phần</FieldLabel>
                                            <Textarea className="resize-none text-sm" {...register('ingredients')} rows={3} placeholder="Liệt kê các hoạt chất..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <FieldLabel>Cách dùng</FieldLabel>
                                            <Textarea className="resize-none text-sm" {...register('usage')} rows={3} placeholder="Hướng dẫn sử dụng..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel>Liều dùng</FieldLabel>
                                            <Textarea className="resize-none text-sm" {...register('dosage')} rows={3} placeholder="Liều dùng hàng ngày..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <FieldLabel>Tác dụng phụ</FieldLabel>
                                            <Textarea className="resize-none text-sm" {...register('side_effects')} rows={3} placeholder="Các tác dụng phụ có thể xảy ra..." />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <FieldLabel>Bảo quản</FieldLabel>
                                            <Textarea className="resize-none text-sm" {...register('storage')} rows={2} placeholder="Điều kiện bảo quản..." />
                                        </div>
                                        <div className="space-y-1.5">
                                            <FieldLabel>Chống chỉ định</FieldLabel>
                                            <Textarea className="resize-none text-sm" {...register('contraindications')} rows={2} placeholder="Các trường hợp chống chỉ định..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <SectionHeader>Mô tả & SEO</SectionHeader>
                                    <div className="space-y-1.5">
                                        <FieldLabel>Mô tả chi tiết</FieldLabel>
                                        <Textarea
                                            className="resize-none text-sm"
                                            {...register('description')}
                                            rows={5}
                                            placeholder="Mô tả đầy đủ về sản phẩm, công dụng, lợi ích..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* ── Tab 4: Images ── */}
                            <TabsContent value="images" className="mt-0 space-y-4">
                                <SectionHeader>Hình ảnh sản phẩm</SectionHeader>
                                <p className="text-xs text-gray-500">Ảnh đầu tiên sẽ là ảnh chính. Kéo để sắp xếp thứ tự hiển thị.</p>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={images.map((_, i) => `img-${i}`)} strategy={rectSortingStrategy}>
                                        <div className="grid grid-cols-3 gap-3">
                                            {images.map((img, idx) => (
                                                <SortableImageItem
                                                    key={`img-${idx}`}
                                                    id={`img-${idx}`}
                                                    img={img}
                                                    idx={idx}
                                                    onRemove={removeImage}
                                                />
                                            ))}

                                            {/* Upload area */}
                                            <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center aspect-square bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors">
                                                <ImageUpload
                                                    value=""
                                                    onChange={addImage}
                                                    onMultipleChange={addMultipleImages}
                                                    folder="products"
                                                    multiple
                                                />
                                            </div>
                                        </div>
                                    </SortableContext>
                                </DndContext>
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    Hình ảnh · {images.length}/{images.length > 0 ? images.length : 0}
                                </p>
                                {images.length === 0 && (
                                    <div className="text-center py-4">
                                        <p className="text-xs text-gray-400">Chưa có hình ảnh. Upload ảnh để hiển thị sản phẩm đẹp hơn.</p>
                                    </div>
                                )}
                            </TabsContent>

                        </div>
                    </Tabs>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            {activeTabConfig && (
                                <>
                                    <activeTabConfig.icon className="w-3.5 h-3.5" />
                                    <span>{activeTabConfig.label}</span>
                                    <span className="text-gray-200">•</span>
                                    <span>
                                        {TAB_CONFIG.findIndex(t => t.value === activeTab) + 1}/{TAB_CONFIG.length}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={closeModal}
                                disabled={isLoading}
                                className="h-8 px-4 text-sm"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isLoading}
                                className="h-8 px-5 text-sm bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isLoading && <Loader2 className="animate-spin w-3.5 h-3.5 mr-1.5" />}
                                {modalMode === 'create' ? 'Tạo sản phẩm' : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
