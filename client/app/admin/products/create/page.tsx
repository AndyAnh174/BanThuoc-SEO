'use client';

import { ProductForm } from '@/src/features/admin/components/product-form';
import { Package } from 'lucide-react';

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Thêm sản phẩm mới</h1>
          <p className="text-sm text-gray-500">Điền đầy đủ thông tin bên dưới để tạo sản phẩm mới.</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <ProductForm />
      </div>
    </div>
  );
}
