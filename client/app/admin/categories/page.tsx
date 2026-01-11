'use client';

import { useEffect, useState } from 'react';
import { useCategoriesStore } from '@/src/features/admin/stores/categories.store';
import { CategoryTable } from '@/src/features/admin/components/category-table';
import { CategoryModal } from '@/src/features/admin/components/category-modal';
import { FolderTree, List, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminCategoriesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    categories,
    categoryTree,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    fetchCategories,
    fetchCategoryTree,
  } = useCategoriesStore();

  // Fetch data on mount
  useEffect(() => {
    fetchCategories();
    fetchCategoryTree(false); // Get all categories for tree
  }, [fetchCategories, fetchCategoryTree]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchCategories({ search: query });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="h-7 w-7 text-green-600" />
            Quản lý danh mục
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý danh mục sản phẩm theo cấu trúc phân cấp
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <List className="h-4 w-4 mr-1" />
            Danh sách
          </Button>
          <Button
            variant={viewMode === 'tree' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('tree')}
            className={viewMode === 'tree' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <TreePine className="h-4 w-4 mr-1" />
            Cây thư mục
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Tổng danh mục</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Danh mục gốc</p>
          <p className="text-2xl font-bold text-green-600">
            {(categories || []).filter(c => !c.parent).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="text-2xl font-bold text-blue-600">
            {(categories || []).filter(c => c.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-500">Đã ẩn</p>
          <p className="text-2xl font-bold text-gray-400">
            {(categories || []).filter(c => !c.is_active).length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <CategoryTable
          categories={categories || []}
          isLoading={isLoading}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          onSearch={handleSearch}
        />
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Cấu trúc cây danh mục</h3>
          <CategoryTreeView tree={categoryTree || []} />
        </div>
      )}

      {/* Create/Edit Modal */}
      <CategoryModal categories={categories || []} categoryTree={categoryTree || []} />
    </div>
  );
}

// Simple Tree View Component
function CategoryTreeView({ tree, level = 0 }: { tree: any[]; level?: number }) {
  const { openEditModal } = useCategoriesStore();

  if (!tree || tree.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TreePine className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        Chưa có danh mục
      </div>
    );
  }

  return (
    <ul className={`space-y-1 ${level > 0 ? 'ml-6 border-l pl-4' : ''}`}>
      {tree.map((item) => (
        <li key={item.id}>
          <div
            className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
            onClick={() => openEditModal(item)}
          >
            <FolderTree className="h-4 w-4 text-green-600" />
            <span className="font-medium text-gray-700">{item.name}</span>
            <span className="text-xs text-gray-400 ml-auto opacity-0 group-hover:opacity-100">
              Click để sửa
            </span>
            {item.product_count > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {item.product_count} SP
              </span>
            )}
            {!item.is_active && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                Ẩn
              </span>
            )}
          </div>
          {item.children && item.children.length > 0 && (
            <CategoryTreeView tree={item.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}
