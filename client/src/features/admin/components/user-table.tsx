"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "../stores/admin.store";
import { User, UserStatus } from "../types/admin.types";
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
import { Eye, Search } from "lucide-react";

import { useRouter } from "next/navigation";

export function UserListTable() {
    const router = useRouter();
    const { 
        users, 
        isLoading, 
        loadUsers, 
        filterStatus,
        setFilterStatus,
        setSearchQuery,
        page,
        totalCount,
        setPage
    } = useAdminStore();

    useEffect(() => {
        loadUsers();
    }, []);

    const handleViewDetail = (user: User) => {
        router.push(`/admin/users/${user.id}`);
    };

    const getStatusColor = (status: UserStatus) => {
        switch (status) {
            case UserStatus.ACTIVE: return "bg-green-100 text-green-700 hover:bg-green-100";
            case UserStatus.PENDING: return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
            case UserStatus.REJECTED: return "bg-red-100 text-red-700 hover:bg-red-100";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters ... (Keep existing layout) */}
            <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Tìm kiếm theo tên, email..." 
                        className="border-none shadow-none focus-visible:ring-0 pl-0"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tất cả trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value={UserStatus.PENDING}>Chờ duyệt</SelectItem>
                        <SelectItem value={UserStatus.ACTIVE}>Đang hoạt động</SelectItem>
                        <SelectItem value={UserStatus.REJECTED}>Đã từ chối</SelectItem>
                    </SelectContent>
                </Select>
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
                                            <span className="font-medium text-gray-900">{user.full_name}</span>
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
                                        <Badge variant="outline" className="capitalize">{user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'CUSTOMER' ? 'Khách hàng' : user.role}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(user.status)}>{user.status === 'PENDING' ? 'Chờ duyệt' : user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'REJECTED' ? 'Đã từ chối' : user.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleViewDetail(user); }}>
                                            <Eye className="w-4 h-4 text-gray-500" />
                                        </Button>
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
                    Trang {page} trên {Math.ceil(totalCount / 10)}
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
        </div>
    );
}
