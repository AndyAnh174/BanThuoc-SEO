'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Plus, X } from 'lucide-react';

import { useProductsStore } from '../stores/products.store';
import { useCategoriesStore } from '../stores/categories.store';
import { ImageUpload } from './image-upload';
import { CategorySelector } from './category-selector';
import type { ProductCreateInput, ProductType, ProductStatus } from '../types/product.types';
import axios from 'axios';


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
  product_type: z.enum(['MEDICINE', 'SUPPLEMENT', 'MEDICAL_DEVICE', 'COSMETIC', 'OTHER']),
  unit: z.string().min(1, 'Đơn vị tính là bắt buộc').default('Hộp'),
  quantity_per_unit: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
  description: z.string().optional(),
  short_description: z.string().optional(),
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
      product_type: 'MEDICINE', // Default
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
      // Fetch manufacturers (public endpoint)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      axios.get(`${API_URL}/api/manufacturers/`)
           .then(res => setManufacturers(res.data.results || []))
           .catch(err => console.error(err));
    }
  }, [isModalOpen]);

  // Reset/Set form when modal opens/closes or selection changes
  useEffect(() => {
     if (isModalOpen) {
         if (modalMode === 'edit' && selectedProduct) {
             console.log('Editing Product Data:', selectedProduct);
             
             // Fetch full product details to ensure we have all fields (ingredients, desc, etc.)
             const { getProductById } = require('../api/products.api'); // Dynamic import to avoid cycles if any, or just import top level
             
             getProductById(selectedProduct.id)
                .then((fullProduct: any) => {
                     // Safely map enum values (ensure uppercase)
                     const safeProductType = String(fullProduct.product_type || 'MEDICINE').toUpperCase();
                     const safeStatus = String(fullProduct.status || 'DRAFT').toUpperCase();

                     // Map product data to form
                     reset({
                         ...fullProduct,
                         // Ensure optional keys exist with defaults if null
                         stock_quantity: fullProduct.stock_quantity ?? 0,
                         low_stock_threshold: fullProduct.low_stock_threshold ?? 10,
                         unit: fullProduct.unit || 'Hộp',
                         // Enum checks
                         product_type: ['MEDICINE', 'SUPPLEMENT', 'MEDICAL_DEVICE', 'COSMETIC', 'OTHER'].includes(safeProductType) 
                            ? safeProductType as any 
                            : 'MEDICINE',
                         status: ['ACTIVE', 'DRAFT', 'INACTIVE', 'OUT_OF_STOCK'].includes(safeStatus)
                            ? safeStatus as any
                            : 'DRAFT',
                     });
                     
                     // Force tab to general
                     setActiveTab('general');
                })
                .catch((err: any) => {
                    console.error("Failed to fetch full product details", err);
                    toast.error("Không thể tải chi tiết sản phẩm đầy đủ");
                    // Fallback to selectedProduct
                     reset({
                         ...selectedProduct,
                         unit: selectedProduct.unit || 'Hộp',
                         stock_quantity: selectedProduct.stock_quantity ?? 0,
                     });
                });

         } else {
             reset({
                status: 'DRAFT',
                product_type: 'MEDICINE',
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
  }, [isModalOpen, modalMode, selectedProduct, reset]);

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // Clean up empty optional strings to null/undefined if needed
    console.log('Submitting Form Data:', data);
    
    if (modalMode === 'create') {
      await createProduct(data as ProductCreateInput);
    } else if (selectedProduct) {
      await updateProduct(selectedProduct.id, data);
    }
  };

  const images = watch('images') || [];
  
  const addImage = (url: string) => {
      const newImages = [...images, { image_url: url, is_primary: images.length === 0, sort_order: images.length }];
      setValue('images', newImages);
  };

  const removeImage = (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      // Reassign primary if needed
      if (images[index].is_primary && newImages.length > 0) {
          newImages[0].is_primary = true;
      }
      setValue('images', newImages);
  };

  const onError = (errors: any) => {
      console.error('Form Validation Errors:', errors);
      const invalidFields = Object.keys(errors).join(', ');
      
      // Show specific message for product_type
      if (errors.product_type) {
          toast.error(`Lỗi loại sản phẩm: ${errors.product_type.message} (Có thể do giá trị không hợp lệ)`);
      } else {
          toast.error(`Vui lòng kiểm tra lại: ${invalidFields}`);
      }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{modalMode === 'create' ? 'Thêm sản phẩm mới' : 'Cập nhật sản phẩm'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
             <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Thông tin chung</TabsTrigger>
                <TabsTrigger value="pricing">Giá & Kho</TabsTrigger>
                <TabsTrigger value="details">Chi tiết & SEO</TabsTrigger>
                <TabsTrigger value="images">Hình ảnh</TabsTrigger>
             </TabsList>

             {/* Tab 1: General Info */}
             <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tên sản phẩm *</Label>
                        <Input {...register('name')} placeholder="Nhập tên sản phẩm" />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Mã SKU *</Label>
                        <Input {...register('sku')} placeholder="SKU-001" />
                        {errors.sku && <p className="text-red-500 text-sm">{errors.sku.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Loại sản phẩm *</Label>
                        <Controller
                            control={control}
                            name="product_type"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || 'MEDICINE'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MEDICINE">Thuốc</SelectItem>
                                        <SelectItem value="SUPPLEMENT">Thực phẩm chức năng</SelectItem>
                                        <SelectItem value="MEDICAL_DEVICE">Thiết bị y tế</SelectItem>
                                        <SelectItem value="COSMETIC">Mỹ phẩm</SelectItem>
                                        <SelectItem value="OTHER">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {errors.product_type && <p className="text-red-500 text-sm">{errors.product_type.message}</p>}
                     </div>
                     <div className="space-y-2">
                        <Label>Trạng thái *</Label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || 'DRAFT'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Đang bán</SelectItem>
                                        <SelectItem value="DRAFT">Nháp</SelectItem>
                                        <SelectItem value="INACTIVE">Ngừng kinh doanh</SelectItem>
                                        <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                     </div>
                </div>
                
                <div className="space-y-2">
                    <Label>Slug URL *</Label>
                    <Input {...register('slug')} placeholder="ten-san-pham" />
                    {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Danh mục *</Label>
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
                        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Nhà sản xuất *</Label>
                        <div className="flex gap-2">
                            <Controller
                                control={control}
                                name="manufacturer"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Chọn nhà sản xuất" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {manufacturers.map((m: any) => (
                                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                             <Button 
                                type="button" 
                                variant="outline" 
                                size="icon"
                                onClick={async () => {
                                    const name = prompt("Nhập tên Nhà sản xuất mới:");
                                    if (name) {
                                        try {
                                            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                                            const res = await axios.post(`${API_URL}/api/admin/manufacturers/`, { name }, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
                                            });
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
                        {errors.manufacturer && <p className="text-red-500 text-sm">{errors.manufacturer.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Mô tả ngắn</Label>
                    <Textarea {...register('short_description')} rows={3} />
                </div>
             </TabsContent>

             {/* Tab 2: Pricing & Inventory */}
             <TabsContent value="pricing" className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Giá bán lẻ (VNĐ) *</Label>
                        <Input type="number" step="1000" {...register('price')} />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Giá khuyến mãi (VNĐ)</Label>
                        <Input type="number" step="1000" {...register('sale_price')} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Số lượng trong kho</Label>
                        <Input type="number" {...register('stock_quantity')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Cảnh báo sắp hết hàng (ngưỡng)</Label>
                        <Input type="number" {...register('low_stock_threshold')} />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Đơn vị tính (VD: Hộp, Chai)</Label>
                        <Input {...register('unit')} />
                    </div>
                    <div className="space-y-2">
                        <Label>Quy cách đóng gói (VD: 10 vỉ x 10 viên)</Label>
                        <Input {...register('quantity_per_unit')} />
                    </div>
                 </div>
             </TabsContent>

             {/* Tab 3: Details & SEO */}
             <TabsContent value="details" className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="requires_prescription"
                            render={({ field }) => (
                                <Switch 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                />
                            )}
                        />
                        <Label>Yêu cầu đơn thuốc bác sĩ</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Controller
                            control={control}
                            name="is_featured"
                            render={({ field }) => (
                                <Switch 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label>Sản phẩm nổi bật</Label>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label>Thành phần</Label>
                    <Textarea {...register('ingredients')} rows={2} />
                 </div>
                 <div className="space-y-2">
                    <Label>Cách dùng</Label>
                    <Textarea {...register('usage')} rows={2} />
                 </div>
                 <div className="space-y-2">
                    <Label>Liều dùng</Label>
                    <Textarea {...register('dosage')} rows={2} />
                 </div>
                 <div className="space-y-2">
                    <Label>Tác dụng phụ</Label>
                    <Textarea {...register('side_effects')} rows={2} />
                 </div>
                 <div className="space-y-2">
                    <Label>Bảo quản</Label>
                    <Textarea {...register('storage')} rows={2} />
                 </div>
                 <div className="space-y-2">
                    <Label>Chống chỉ định</Label>
                    <Textarea {...register('contraindications')} rows={2} />
                 </div>
                 
                 <div className="space-y-2">
                    <Label>Mô tả chi tiết (SEO)</Label>
                    <Textarea {...register('description')} rows={5} />
                 </div>
             </TabsContent>

             {/* Tab 4: Images */}
             <TabsContent value="images" className="space-y-4">
                 <div className="grid grid-cols-4 gap-4">
                     {images.map((img, idx) => (
                         <div key={idx} className="relative group border rounded-lg p-2">
                             <img src={img.image_url} alt="Product" className="w-full h-32 object-cover rounded" />
                             <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                             >
                                <X size={12} />
                             </button>
                             {img.is_primary && (
                                 <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">Primary</div>
                             )}
                         </div>
                     ))}
                     
                     <div className="border-2 border-dashed rounded-lg flex items-center justify-center h-32 bg-gray-50">
                          <ImageUpload
                              value=""
                              onChange={addImage}
                              folder="products"
                          />
                     </div>
                 </div>
             </TabsContent>

          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeModal} disabled={isCreating || isUpdating}>Hủy</Button>
            <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
                {modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
