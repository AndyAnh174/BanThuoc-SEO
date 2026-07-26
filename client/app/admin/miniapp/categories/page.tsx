'use client';

import { useEffect } from 'react';
import { useCategoriesStore } from '@/src/features/admin/stores/categories.store';
import { CategoryTable } from '@/src/features/admin/components/category-table';
import { CategoryModal } from '@/src/features/admin/components/category-modal';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function MiniAppCategoriesPage() {
  const {
    categories, isLoading, totalCount,
    fetchCategories, fetchCategoryTree,
  } = useCategoriesStore();

  useEffect(() => {
    fetchCategories();
    fetchCategoryTree(false);
  }, [fetchCategories, fetchCategoryTree]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Danh mục Mini App"
        description={`${totalCount} danh mục — Quản lý danh mục hiển thị trên Mini App Zalo`}
      />
      <CategoryTable />
      <CategoryModal />
    </div>
  );
}
