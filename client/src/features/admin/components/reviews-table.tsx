"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAdminReviews, moderateReview, Review } from "../api/reviews.api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

export function ReviewsTable() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("pending");
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const PAGE_SIZE = 10;

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchAdminReviews(page, filterStatus);
            const data = res.data;
            setReviews(data.results || data);
            setTotalCount(data.count || (data.results?.length ?? 0));
        } catch {
            toast.error("Không thể tải danh sách đánh giá");
        } finally {
            setIsLoading(false);
        }
    }, [page, filterStatus]);

    useEffect(() => { load(); }, [load]);

    const handleModerate = async (reviewId: string, action: "approve" | "reject") => {
        setProcessingId(reviewId);
        try {
            await moderateReview(reviewId, action);
            toast.success(action === "approve" ? "Đã duyệt đánh giá" : "Đã từ chối đánh giá");
            load();
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Thao tác thất bại");
        } finally {
            setProcessingId(null);
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
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="approved">Đã duyệt</SelectItem>
                        <SelectItem value="all">Tất cả</SelectItem>
                    </SelectContent>
                </Select>
                <span className="ml-auto text-sm text-gray-500">{totalCount} đánh giá</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead className="text-center">Sao</TableHead>
                            <TableHead>Nội dung</TableHead>
                            <TableHead className="text-center">Xác minh</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead className="text-center">Trạng thái</TableHead>
                            <TableHead className="text-center">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : reviews.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                                    Không có đánh giá nào
                                </TableCell>
                            </TableRow>
                        ) : reviews.map((review) => (
                            <TableRow key={review.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{review.user_name || `User #${review.user}`}</TableCell>
                                <TableCell className="max-w-[120px]">
                                    <span className="line-clamp-1 text-sm">{review.product_name || review.product}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-[200px]">
                                    {review.title && <p className="font-medium text-sm line-clamp-1">{review.title}</p>}
                                    <p className="text-xs text-gray-500 line-clamp-2">{review.content}</p>
                                </TableCell>
                                <TableCell className="text-center">
                                    {review.is_verified_purchase
                                        ? <Badge className="bg-green-100 text-green-700 text-xs">Đã mua</Badge>
                                        : <Badge variant="outline" className="text-xs text-gray-400">Chưa xác minh</Badge>}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">
                                    {format(new Date(review.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                </TableCell>
                                <TableCell className="text-center">
                                    {review.is_approved
                                        ? <Badge className="bg-blue-100 text-blue-700">Đã duyệt</Badge>
                                        : <Badge className="bg-yellow-100 text-yellow-700">Chờ duyệt</Badge>}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        {!review.is_approved && (
                                            <Button size="sm" variant="outline"
                                                className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                                                disabled={processingId === review.id}
                                                onClick={() => handleModerate(review.id, "approve")}>
                                                <Check className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline"
                                            className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                            disabled={processingId === review.id}
                                            onClick={() => handleModerate(review.id, "reject")}>
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border shadow-sm">
                    <span className="text-sm text-gray-500">
                        Trang {page}/{totalPages} — {totalCount} đánh giá
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
        </div>
    );
}
