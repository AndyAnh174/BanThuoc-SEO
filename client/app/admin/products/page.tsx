'use client';

import { useEffect, useState } from 'react';
import { useProductsStore } from '@/src/features/admin/stores/products.store';
import { ProductTable } from '@/src/features/admin/components/product-table';
import { ProductModal } from '@/src/features/admin/components/product-modal';
import { BulkImportDialog } from '@/src/features/admin/components/bulk-import-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminProductsPage() {
  const { fetchProducts, openCreateModal, totalCount, isLoading } = useProductsStore();
  const [bulkOpen, setBulkOpen] = useState(false);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Sản phẩm</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <Upload className="mr-2 h-4 w-4" /> Nhập Excel/CSV
          </Button>
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
          </Button>
        </div>
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
      <BulkImportDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        onSuccess={() => fetchProducts()}
      />
    </div>
  );
}
