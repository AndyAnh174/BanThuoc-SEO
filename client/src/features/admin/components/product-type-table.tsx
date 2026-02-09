'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
    MoreHorizontal,
    Pencil,
    Trash2,
    Plus,
    Loader2,
    Package,
} from 'lucide-react';
import { useProductTypesStore } from '../stores/product-types.store';
import { ProductType } from '@/src/features/products/api/product-types.api';

export function ProductTypeTable() {
    const {
        types,
        isLoading,
        openCreateModal,
        openEditModal,
        deleteType,
        isDeleting,
    } = useProductTypesStore();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [typeToDelete, setTypeToDelete] = useState<ProductType | null>(null);

    const handleDelete = async () => {
        if (typeToDelete) {
            const success = await deleteType(typeToDelete.id);
            if (success) {
                setDeleteDialogOpen(false);
                setTypeToDelete(null);
            }
        }
    };

    const confirmDelete = (type: ProductType) => {
        setTypeToDelete(type);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Quản lý loại sản phẩm</h2>
                <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm loại
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên loại</TableHead>
                            <TableHead>Mã</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                                    <p className="text-gray-500 mt-2">Đang tải...</p>
                                </TableCell>
                            </TableRow>
                        ) : types.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <Package className="h-12 w-12 mx-auto text-gray-300" />
                                    <p className="text-gray-500 mt-2">Chưa có loại sản phẩm nào</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            types.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell className="font-medium">{type.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{type.code}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-md truncate" title={type.description}>
                                        {type.description || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditModal(type)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => confirmDelete(type)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Xóa
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa loại sản phẩm "{typeToDelete?.name}"?
                            <br />
                            <span className="text-red-500 font-medium">Lưu ý:</span> Không thể xóa nếu đã có sản phẩm thuộc loại này.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
