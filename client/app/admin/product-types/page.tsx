'use client';

import { useEffect } from 'react';
import { ProductTypeTable } from '@/src/features/admin/components/product-type-table';
import { ProductTypeModal } from '@/src/features/admin/components/product-type-modal';
import { useProductTypesStore } from '@/src/features/admin/stores/product-types.store';

export default function ProductTypesPage() {
    const { fetchTypes } = useProductTypesStore();

    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý loại sản phẩm</h1>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <ProductTypeTable />
            </div>

            <ProductTypeModal />
        </div>
    );
}
