'use client';

import { useEffect } from 'react';
import { useProductsStore } from '@/src/features/admin/stores/products.store';
import { ProductTable } from '@/src/features/admin/components/product-table';
import { ProductModal } from '@/src/features/admin/components/product-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProductsPage() {
  const { fetchProducts, openCreateModal, totalCount, isLoading } = useProductsStore();

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Sản phẩm</h1>
        <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => {}} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">sản phẩm trong hệ thống</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
           <ProductTable />
        </CardContent>
      </Card>

      <ProductModal />
    </div>
  );
}
