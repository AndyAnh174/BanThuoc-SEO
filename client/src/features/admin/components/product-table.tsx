'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, MoreHorizontal, Trash, Search, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { useState } from 'react';
import { useProductsStore } from '../stores/products.store';
import { Product } from '../types/product.types';

export function ProductTable() {
  const {
    products,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    searchTerm,
    openEditModal,
    deleteProduct,
    setPage,
    setFilters
  } = useProductsStore();

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return <Badge className="bg-green-500">Đang bán</Badge>;
      case 'DRAFT': return <Badge variant="secondary">Nháp</Badge>;
      case 'INACTIVE': return <Badge variant="destructive">Ngừng bán</Badge>;
      case 'OUT_OF_STOCK': return <Badge variant="outline" className="text-red-500 border-red-200">Hết hàng</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
            value={searchTerm}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-8"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên sản phẩm / SKU</TableHead>
              <TableHead>Danh mục / NSX</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={7} className="h-24 text-center">Đang tải...</TableCell>
               </TableRow>
            ) : products.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} className="h-24 text-center">Không có sản phẩm nào.</TableCell>
               </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {product.primary_image ? (
                            <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">{product.sku}</div>
                    {product.is_featured && <Badge variant="outline" className="mt-1 text-xs border-blue-200 text-blue-600">Nổi bật</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{product.category_name}</div>
                    <div className="text-xs text-muted-foreground">{product.manufacturer_name}</div>
                  </TableCell>
                  <TableCell>
                    {product.sale_price ? (
                        <>
                            <div className="font-bold text-red-600">{formatPrice(product.sale_price)}</div>
                            <div className="text-xs text-muted-foreground line-through">
                                {formatPrice(product.price)}
                            </div>
                        </>
                    ) : (
                        <div className="font-bold">{formatPrice(product.price)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className={product.stock_quantity <= product.low_stock_threshold ? 'text-red-500 font-bold' : ''}>
                        {product.stock_quantity} <span className="text-xs font-normal text-muted-foreground">{product.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(product.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditModal(product)}>
                          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(product.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
             Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} / {totalCount} sản phẩm
        </div>
        
        {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious 
                        onClick={() => currentPage > 1 && setPage(currentPage - 1)} 
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                     <PaginationItem key={page}>
                        <PaginationLink 
                             isActive={page === currentPage} 
                             onClick={() => setPage(page)}
                             className="cursor-pointer"
                        >
                            {page}
                        </PaginationLink>
                     </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext 
                         onClick={() => currentPage < totalPages && setPage(currentPage + 1)}
                         className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
