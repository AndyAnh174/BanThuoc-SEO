"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAdminReturns, processReturnRequest, ReturnRequest } from "../api/returns.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Check, X, Eye } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    PENDING:   { label: "Chờ xử lý",  className: "bg-yellow-100 text-yellow-700" },
    APPROVED:  { label: "Đã duyệt",   className: "bg-blue-100 text-blue-700" },
    REJECTED:  { label: "Đã từ chối", className: "bg-red-100 text-red-700" },
    COMPLETED: { label: "Hoàn tất",   className: "bg-green-100 text-green-700" },
};

export function ReturnsTable() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("PENDING");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 10;

    // Action dialog state
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [refundAmount, setRefundAmount] = useState("");
    const [processing, setProcessing] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchAdminReturns(page, filterStatus);
            const data = res.data;
            setReturns(data.results || data);
            setTotalCount(data.count || (data.results?.length ?? 0));
        } catch {
            toast.error("Không thể tải danh sách yêu cầu trả hàng");
        } finally {
            setIsLoading(false);
        }
    }, [page, filterStatus]);

    useEffect(() => { load(); }, [load]);

    const openDialog = (ret: ReturnRequest, act: "approve" | "reject") => {
        setSelectedReturn(ret);
        setAction(act);
        setAdminNotes("");
        setRefundAmount(ret.refund_amount ? ret.refund_amount.toString() : "");
    };

    const closeDialog = () => {
        setSelectedReturn(null);
        setAction(null);
        setAdminNotes("");
        setRefundAmount("");
    };

    const handleConfirm = async () => {
        if (!selectedReturn || !action) return;
        setProcessing(true);
        try {
            const amount = action === "approve" && refundAmount ? parseFloat(refundAmount) : undefined;
            await processReturnRequest(selectedReturn.id, action, adminNotes, amount);
            toast.success(action === "approve" ? "Đã duyệt yêu cầu trả hàng" : "Đã từ chối yêu cầu trả hàng");
            closeDialog();
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Thao tác thất bại");
        } finally {
            setProcessing(false);
        }
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border">
                <span className="text-sm font-medium text-gray-600">Lọc theo trạng thái:</span>
                <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                        <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                        <SelectItem value="REJECTED">Đã từ chối</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn tất</SelectItem>
                        <SelectItem value="all">Tất cả</SelectItem>
                    </SelectContent>
                </Select>
                <span className="ml-auto text-sm text-gray-500">{totalCount} yêu cầu</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>Khách hàng</TableHead>
                            <TableHead className="text-center">Đơn hàng</TableHead>
                            <TableHead>Lý do</TableHead>
                            <TableHead className="text-right">Hoàn tiền</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : returns.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                                    Không có yêu cầu nào
                                </TableCell>
                            </TableRow>
                        ) : returns.map((ret) => {
                            const statusInfo = STATUS_LABELS[ret.status] || { label: ret.status, className: "bg-gray-100 text-gray-700" };
                            return (
                                <TableRow key={ret.id} className="hover:bg-gray-50">
                                    <TableCell className="font-medium">{ret.user_name || `User #${ret.user}`}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-sm font-mono">#{ret.order_id}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <p className="text-sm line-clamp-2 text-gray-600">{ret.reason}</p>
                                    </TableCell>
                                    <TableCell className="text-right text-sm font-medium">
                                        {ret.refund_amount > 0
                                            ? `${Number(ret.refund_amount).toLocaleString('vi-VN')}₫`
                                            : <span className="text-gray-400">—</span>
                                        }
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {format(new Date(ret.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            {ret.status === "PENDING" && (
                                                <>
                                                    <Button size="sm" variant="outline"
                                                        className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                                        onClick={() => openDialog(ret, "approve")}>
                                                        <Check className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button size="sm" variant="outline"
                                                        className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={() => openDialog(ret, "reject")}>
                                                        <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                            {ret.admin_notes && (
                                                <Button size="sm" variant="ghost"
                                                    className="h-7 px-2 text-gray-500"
                                                    title={ret.admin_notes}>
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border shadow-sm">
                    <span className="text-sm text-gray-500">
                        Trang {page}/{totalPages} — {totalCount} yêu cầu
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Action Dialog */}
            <Dialog open={!!selectedReturn} onOpenChange={(open) => { if (!open) closeDialog(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {action === "approve" ? "Duyệt yêu cầu trả hàng" : "Từ chối yêu cầu trả hàng"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {selectedReturn && (
                            <div className="rounded-lg bg-gray-50 p-3 text-sm">
                                <p><span className="font-medium">Khách:</span> {selectedReturn.user_name || `User #${selectedReturn.user}`}</p>
                                <p><span className="font-medium">Đơn hàng:</span> #{selectedReturn.order_id}</p>
                                <p><span className="font-medium">Lý do:</span> {selectedReturn.reason}</p>
                            </div>
                        )}
                        {action === "approve" && (
                            <div className="space-y-1.5">
                                <Label>Số tiền hoàn (₫)</Label>
                                <Input
                                    type="number"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(e.target.value)}
                                    placeholder="Nhập số tiền hoàn trả"
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label>Ghi chú admin</Label>
                            <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Ghi chú cho khách hàng (tùy chọn)"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDialog} disabled={processing}>Hủy</Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={processing}
                            className={action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                        >
                            {processing ? "Đang xử lý..." : action === "approve" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
