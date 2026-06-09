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

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsStore } from '../stores/products.store';
import { Product } from '../types/product.types';
import { getCategories } from '@/src/features/products/api/products.api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { ExportButton } from './export-button';
import { exportToCSV, exportToXLSX, timestampFilename, fetchAllPages } from '../utils/export';

export function ProductTable() {
  const router = useRouter();
  const {
    products,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    searchTerm,
    categoryFilter,
    manufacturerFilter,
    statusFilter,
    deleteProduct,
    setPage,
    setFilters
  } = useProductsStore();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [manufacturers, setManufacturers] = useState<{ name: string; id: string }[]>([]);
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [isExporting, setIsExporting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Product export columns
  const productColumns = [
    { key: 'name' as const, label: 'Tên sản phẩm' },
    { key: 'sku' as const, label: 'SKU' },
    { key: 'category_name' as const, label: 'Danh mục' },
    { key: 'manufacturer_name' as const, label: 'Nhà sản xuất' },
    { key: 'price' as const, label: 'Giá gốc' },
    { key: 'sale_price' as const, label: 'Giá sale' },
    { key: 'stock_quantity' as const, label: 'Tồn kho' },
    { key: 'unit' as const, label: 'Đơn vị' },
    { key: 'status' as const, label: 'Trạng thái' },
  ];

  const fetchAllProducts = async () => {
    return fetchAllPages('/admin/products/', {
      search: searchTerm || undefined,
      category: categoryFilter || undefined,
      manufacturer: manufacturerFilter || undefined,
      status: statusFilter || undefined,
    });
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const all = await fetchAllProducts();
      exportToCSV(all, productColumns, timestampFilename('san-pham'));
    } catch (e) {
      console.error('Export CSV failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXLSX = async () => {
    setIsExporting(true);
    try {
      const all = await fetchAllProducts();
      exportToXLSX(all, productColumns, timestampFilename('san-pham'));
    } catch (e) {
      console.error('Export XLSX failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    getCategories({ active_only: true }).then((res: any) => {
      const names: { name: string; slug: string }[] = [];
      const walk = (cats: any[]) => {
        cats.forEach((c: any) => {
          names.push({ name: c.name, slug: c.slug });
          if (c.children) walk(c.children);
        });
      };
      walk(Array.isArray(res.data) ? res.data : res.data?.results || []);
      setCategories(names);
    }).catch(() => {});
    // Fetch manufacturers list for filter
    import('@/src/features/products/api/products.api').then(({ getManufacturers }) => {
      getManufacturers().then((res: any) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setManufacturers(data.map((m: any) => ({ name: m.name, id: m.id })));
      }).catch(() => {});
    });
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ search: value || '' });
    }, 300);
  }, [setFilters]);

  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  const hasFilters = !!(searchTerm || categoryFilter || manufacturerFilter || statusFilter);

  const clearAllFilters = () => {
    setSearchInput('');
    setFilters({ search: '', category: '', manufacturer: '', status: '' });
  };

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
      {/* Search & Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên sản phẩm hoặc SKU..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select
          value={categoryFilter || 'all'}
          onValueChange={(v) => setFilters({ category: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={manufacturerFilter || 'all'}
          onValueChange={(v) => setFilters({ manufacturer: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Nhà sản xuất" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả NSX</SelectItem>
            {manufacturers.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter || 'all'}
          onValueChange={(v) => setFilters({ status: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="ACTIVE">Đang bán</SelectItem>
            <SelectItem value="DRAFT">Nháp</SelectItem>
            <SelectItem value="INACTIVE">Ngừng bán</SelectItem>
            <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9">
            <X className="mr-1 h-4 w-4" /> Xóa lọc
          </Button>
        )}

        <div className="flex-1" />

        <ExportButton
          onExportXLSX={handleExportXLSX}
          onExportCSV={handleExportCSV}
          disabled={isExporting}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên sản phẩm / SKU</TableHead>
              <TableHead>Danh mục / NSX</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead>Trạng thái</TableHead>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(product.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
                
                {(() => {
                  const pages: (number | 'ellipsis')[] = [];
                  const maxVisible = 3;
                  const rangeStart = Math.max(2, currentPage - 1);
                  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

                  pages.push(1);
                  if (rangeStart > 2) pages.push('ellipsis');
                  for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
                  if (rangeEnd < totalPages - 1) pages.push('ellipsis');
                  if (totalPages > 1) pages.push(totalPages);

                  return pages.map((page, i) =>
                    page === 'ellipsis' ? (
                      <PaginationItem key={`e-${i}`}>
                        <span className="flex size-9 items-center justify-center text-muted-foreground">...</span>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setPage(page)}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  );
                })()}

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
