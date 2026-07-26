'use client';

import { useEffect } from 'react';
import { useProductTypesStore } from '@/src/features/admin/stores/product-types.store';
import { ProductTypeTable } from '@/src/features/admin/components/product-type-table';
import { ProductTypeModal } from '@/src/features/admin/components/product-type-modal';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function MiniAppProductTypesPage() {
  const { productTypes, fetchProductTypes, isLoading, totalCount } = useProductTypesStore();

  useEffect(() => { fetchProductTypes(); }, [fetchProductTypes]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Loại sản phẩm Mini App"
        description={`${totalCount} loại sản phẩm — Phân loại sản phẩm cho Mini App`}
      />
      <ProductTypeTable />
      <ProductTypeModal />
    </div>
  );
}
