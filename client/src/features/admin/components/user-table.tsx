"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "../stores/admin.store";
import { User, UserStatus, UserRole } from "../types/admin.types";
import { UserModal } from "./user-modal";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, Search, Plus, Pencil, Trash2 } from "lucide-react";

import { useRouter } from "next/navigation";

export function UserListTable() {
    const router = useRouter();
    const { 
        users, 
        isLoading, 
        loadUsers, 
        filterStatus,
        filterRole,
        setFilterStatus,
        setFilterRole,
        setSearchQuery,
        deleteUser,
        page,
        totalCount,
        setPage
    } = useAdminStore();

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    // Delete confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const handleViewDetail = (user: User) => {
        router.push(`/admin/users/${user.id}`);
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (user: User, e: React.MouseEvent) => {
        e.stopPropagation();
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            await deleteUser(userToDelete.id);
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return "bg-green-100 text-green-700 hover:bg-green-100";
            case UserStatus.PENDING: return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
            case UserStatus.REJECTED: return "bg-red-100 text-red-700 hover:bg-red-100";
            case UserStatus.LOCKED: return "bg-gray-100 text-gray-700 hover:bg-gray-100";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getRoleColor = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return "bg-purple-100 text-purple-700";
            case UserRole.CUSTOMER: return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN: return "Quản trị viên";
            case UserRole.CUSTOMER: return "Khách hàng";
            default: return role;
        }
    };

    const getStatusLabel = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return "Hoạt động";
            case UserStatus.PENDING: return "Chờ duyệt";
            case UserStatus.REJECTED: return "Đã từ chối";
            case UserStatus.LOCKED: return "Đã khóa";
            default: return status;
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Tìm kiếm theo tên, email..." 
                        className="border-none shadow-none focus-visible:ring-0 pl-0"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterRole || "all"} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Tất cả vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả vai trò</SelectItem>
                            <SelectItem value={UserRole.ADMIN}>Quản trị viên</SelectItem>
                            <SelectItem value={UserRole.CUSTOMER}>Khách hàng</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value={UserStatus.PENDING}>Chờ duyệt</SelectItem>
                            <SelectItem value={UserStatus.ACTIVE}>Hoạt động</SelectItem>
                            <SelectItem value={UserStatus.REJECTED}>Đã từ chối</SelectItem>
                            <SelectItem value={UserStatus.LOCKED}>Đã khóa</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleCreateUser}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo người dùng
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead>Thông tin người dùng</TableHead>
                            <TableHead>Thông tin doanh nghiệp</TableHead>
                            <TableHead>Vai trò</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Đang tải...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">Không tìm thấy người dùng nào</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => handleViewDetail(user)}>
                                    <TableCell className="font-medium text-gray-500">#{user.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{user.full_name || user.username}</span>
                                            <span className="text-gray-500 text-xs">{user.email}</span>
                                            <span className="text-gray-500 text-xs">{user.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.business_profile ? (
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{user.business_profile.business_name}</span>
                                                <span className="text-gray-500 text-xs">GPKD: {user.business_profile.license_number}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Không có hồ sơ</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`capitalize ${getRoleColor(user.role)}`}>
                                            {getRoleLabel(user.role)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(user.status)}>
                                            {getStatusLabel(user.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDetail(user); }}>
                                                <Eye className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={(e) => handleEditUser(user, e)}>
                                                <Pencil className="w-4 h-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={(e) => handleDeleteClick(user, e)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Trước
                </Button>
                <div className="text-sm text-gray-500">
                    Trang {page} trên {Math.ceil(totalCount / 10) || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(totalCount / 10)}
                >
                    Sau
                </Button>
            </div>

            {/* User Modal */}
            <UserModal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                user={editingUser}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.full_name || userToDelete?.email}</strong>? 
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

