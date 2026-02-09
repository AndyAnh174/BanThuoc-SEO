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
    Factory,
    Globe,
    ExternalLink,
} from 'lucide-react';
import { useManufacturersStore } from '../stores/manufacturers.store';
import { Manufacturer } from '../api/manufacturers.api';

export function ManufacturerTable() {
    const {
        manufacturers,
        isLoading,
        openCreateModal,
        openEditModal,
        deleteManufacturer,
        isDeleting,
    } = useManufacturersStore();

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Manufacturer | null>(null);

    const handleDelete = async () => {
        if (itemToDelete) {
            const success = await deleteManufacturer(itemToDelete.id);
            if (success) {
                setDeleteDialogOpen(false);
                setItemToDelete(null);
            }
        }
    };

    const confirmDelete = (item: Manufacturer) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">Quản lý nhà sản xuất</h2>
                <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm nhà sản xuất
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tên</TableHead>
                            <TableHead>Quốc gia</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                                    <p className="text-gray-500 mt-2">Đang tải...</p>
                                </TableCell>
                            </TableRow>
                        ) : manufacturers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <Factory className="h-12 w-12 mx-auto text-gray-300" />
                                    <p className="text-gray-500 mt-2">Chưa có nhà sản xuất nào</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            manufacturers.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {item.logo && (
                                                <img
                                                    src={item.logo}
                                                    alt={item.name}
                                                    className="h-8 w-8 rounded object-contain"
                                                />
                                            )}
                                            {item.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.country ? (
                                            <div className="flex items-center gap-1">
                                                <Globe className="h-4 w-4 text-gray-400" />
                                                {item.country}
                                            </div>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {item.website ? (
                                            <a
                                                href={item.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Link
                                            </a>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                            {item.is_active ? 'Hoạt động' : 'Ẩn'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditModal(item)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => confirmDelete(item)}
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
                            Bạn có chắc chắn muốn xóa nhà sản xuất "{itemToDelete?.name}"?
                            <br />
                            <span className="text-red-500 font-medium">Lưu ý:</span> Không thể xóa nếu đã có sản phẩm thuộc nhà sản xuất này.
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
