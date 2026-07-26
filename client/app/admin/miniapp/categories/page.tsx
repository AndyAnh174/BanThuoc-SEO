'use client';

import { useEffect } from 'react';
import { useCategoriesStore } from '@/src/features/admin/stores/categories.store';
import { CategoryTable } from '@/src/features/admin/components/category-table';
import { CategoryModal } from '@/src/features/admin/components/category-modal';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function MiniAppCategoriesPage() {
  const {
    categories, isLoading, totalCount, currentPage, pageSize,
    fetchCategories, fetchCategoryTree,
  } = useCategoriesStore();

  useEffect(() => {
    fetchCategories();
    fetchCategoryTree(false);
  }, [fetchCategories, fetchCategoryTree]);

  const handleSearch = (query: string) => {
    fetchCategories({ search: query });
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Danh mục Mini App"
        description={`${totalCount} danh mục — Quản lý danh mục hiển thị trên Mini App Zalo`}
      />
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onSearch={handleSearch}
      />
      <CategoryModal />
    </div>
  );
}
