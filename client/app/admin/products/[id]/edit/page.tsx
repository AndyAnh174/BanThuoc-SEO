'use client';

import { useParams } from 'next/navigation';
import { ProductForm } from '@/src/features/admin/components/product-form';
import { Package } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chỉnh sửa sản phẩm</h1>
          <p className="text-sm text-gray-500">Cập nhật thông tin sản phẩm.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <ProductForm id={id} />
      </div>
    </div>
  );
}
