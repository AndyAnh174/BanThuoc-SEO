"use client";

import { useEffect, useState } from "react";
import { useOrdersStore } from "../stores/orders.store";
import { Order, OrderStatus } from "../types/admin.types";
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
import { Eye, Search, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function OrderTable() {
    const router = useRouter();
    const { 
        orders, 
        isLoading, 
        loadOrders, 
        filterStatus,
        setFilterStatus,
        setSearchQuery,
        page,
        totalCount,
        setPage,
        downloadInvoice
    } = useOrdersStore();

    useEffect(() => {
        loadOrders();
    }, []);

    const handleViewDetail = (order: Order) => {
        router.push(`/admin/orders/${order.id}`);
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED: return "bg-green-100 text-green-700 hover:bg-green-100";
            case OrderStatus.PENDING: return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
            case OrderStatus.CONFIRMED: return "bg-blue-100 text-blue-700 hover:bg-blue-100";
            case OrderStatus.SHIPPING: return "bg-purple-100 text-purple-700 hover:bg-purple-100";
            case OrderStatus.CANCELLED: return "bg-red-100 text-red-700 hover:bg-red-100";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.COMPLETED: return "Hoàn thành";
            case OrderStatus.PENDING: return "Chờ xử lý";
            case OrderStatus.CONFIRMED: return "Đã xác nhận";
            case OrderStatus.SHIPPING: return "Đang giao";
            case OrderStatus.CANCELLED: return "Đã hủy";
            default: return status;
        }
    };

    const handleDownloadInvoice = async (e: React.MouseEvent, orderId: number) => {
        e.stopPropagation();
        await downloadInvoice(orderId);
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Tìm theo Mã đơn, Tên KH, SĐT..." 
                        className="border-none shadow-none focus-visible:ring-0 pl-0"
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filterStatus || "all"} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tất cả trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value={OrderStatus.PENDING}>Chờ xử lý</SelectItem>
                            <SelectItem value={OrderStatus.CONFIRMED}>Đã xác nhận</SelectItem>
                            <SelectItem value={OrderStatus.SHIPPING}>Đang giao hàng</SelectItem>
                            <SelectItem value={OrderStatus.COMPLETED}>Hoàn thành</SelectItem>
                            <SelectItem value={OrderStatus.CANCELLED}>Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[80px]">Mã ĐH</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Đang tải...</TableCell>
                            </TableRow>
                        ) : orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    Không tìm thấy đơn hàng nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => handleViewDetail(order)}>
                                    <TableCell className="font-medium text-blue-600">#{order.id}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{order.full_name}</span>
                                            <span className="text-gray-500 text-xs">{order.phone_number}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-gray-600 text-sm">
                                            {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(order.final_amount)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`capitalize ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={(e) => handleDownloadInvoice(e, order.id)}
                                                title="Tải hóa đơn"
                                            >
                                                <FileText className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={(e) => { e.stopPropagation(); handleViewDetail(order); }}
                                            >
                                                <Eye className="w-4 h-4 text-gray-500" />
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
        </div>
    );
}
