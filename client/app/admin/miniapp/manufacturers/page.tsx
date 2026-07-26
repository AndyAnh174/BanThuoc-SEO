'use client';

import { useEffect } from 'react';
import { useManufacturersStore } from '@/src/features/admin/stores/manufacturers.store';
import { ManufacturerTable } from '@/src/features/admin/components/manufacturer-table';
import { ManufacturerModal } from '@/src/features/admin/components/manufacturer-modal';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function MiniAppManufacturersPage() {
  const { manufacturers, fetchManufacturers, isLoading, totalCount } = useManufacturersStore();

  useEffect(() => { fetchManufacturers(); }, [fetchManufacturers]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Nhà sản xuất Mini App"
        description={`${totalCount} nhà sản xuất — Quản lý nhà sản xuất hiển thị trên Mini App`}
      />
      <ManufacturerTable />
      <ManufacturerModal />
    </div>
  );
}
