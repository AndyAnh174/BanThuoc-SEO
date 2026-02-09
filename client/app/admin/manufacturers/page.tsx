'use client';

import { useEffect } from 'react';
import { ManufacturerTable } from '@/src/features/admin/components/manufacturer-table';
import { ManufacturerModal } from '@/src/features/admin/components/manufacturer-modal';
import { useManufacturersStore } from '@/src/features/admin/stores/manufacturers.store';

export default function ManufacturersPage() {
    const { fetchManufacturers } = useManufacturersStore();

    useEffect(() => {
        fetchManufacturers();
    }, [fetchManufacturers]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Quản lý nhà sản xuất</h1>
            </div>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <ManufacturerTable />
            </div>

            <ManufacturerModal />
        </div>
    );
}
