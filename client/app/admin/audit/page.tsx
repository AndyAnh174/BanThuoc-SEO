"use client";

import { useEffect, useMemo, useState } from "react";
import { http } from "@/lib/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
    id: number;
    user_id: number | null;
    username: string;
    user_email: string;
    user_role: string;
    action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT";
    target_type: string;
    target_id: string;
    target_repr: string;
    changes: Record<string, any>;
    ip_address: string | null;
    user_agent: string;
    created_at: string;
}

interface PaginatedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: AuditLog[];
}

const ACTION_COLORS: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    LOGIN: "bg-purple-100 text-purple-700",
    LOGOUT: "bg-gray-100 text-gray-700",
};

const ACTION_LABELS: Record<string, string> = {
    CREATE: "Tạo mới",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
    LOGIN: "Đăng nhập",
    LOGOUT: "Đăng xuất",
};

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState<string>("all");
    const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [selected, setSelected] = useState<AuditLog | null>(null);

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(count / pageSize)),
        [count, pageSize]
    );

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page,
                page_size: pageSize,
            };
            if (search) params.search = search;
            if (actionFilter !== "all") params.action = actionFilter;
            if (targetTypeFilter !== "all") params.target_type = targetTypeFilter;
            if (fromDate) params.from_date = fromDate;
            if (toDate) params.to_date = toDate;

            const res = await http.get<PaginatedResponse>("/admin/audit-logs/", { params });
            setLogs(res.data.results);
            setCount(res.data.count);
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail || "Không tải được audit log";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, actionFilter, targetTypeFilter]);

    const handleSearch = () => {
        setPage(1);
        fetchLogs();
    };

    const handleReset = () => {
        setSearch("");
        setActionFilter("all");
        setTargetTypeFilter("all");
        setFromDate("");
        setToDate("");
        setPage(1);
        setTimeout(fetchLogs, 0);
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleString("vi-VN");
        } catch {
            return iso;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                        Audit Log
                    </h2>
                    <p className="text-gray-500">
                        Lịch sử thao tác của tất cả người dùng (chỉ admin xem được).
                    </p>
                </div>
                <Button onClick={fetchLogs} variant="outline" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Làm mới
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                    <Input
                        placeholder="Tìm theo email, IP, target..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Hành động" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả hành động</SelectItem>
                        <SelectItem value="CREATE">Tạo mới</SelectItem>
                        <SelectItem value="UPDATE">Cập nhật</SelectItem>
                        <SelectItem value="DELETE">Xóa</SelectItem>
                        <SelectItem value="LOGIN">Đăng nhập</SelectItem>
                        <SelectItem value="LOGOUT">Đăng xuất</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
                    <SelectTrigger>
                        <SelectValue placeholder="Loại đối tượng" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        <SelectItem value="users.User">User</SelectItem>
                        <SelectItem value="products.Product">Product</SelectItem>
                        <SelectItem value="products.Category">Category</SelectItem>
                        <SelectItem value="products.Manufacturer">Manufacturer</SelectItem>
                        <SelectItem value="products.Banner">Banner</SelectItem>
                        <SelectItem value="orders.Order">Order</SelectItem>
                        <SelectItem value="vouchers.Voucher">Voucher</SelectItem>
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    placeholder="Từ"
                />
                <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    placeholder="Đến"
                />
                <div className="md:col-span-6 flex gap-2">
                    <Button onClick={handleSearch}>
                        <Search className="w-4 h-4 mr-2" />
                        Lọc
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                        Reset
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                        <tr className="text-left text-gray-700">
                            <th className="px-4 py-3">Thời gian</th>
                            <th className="px-4 py-3">Người dùng</th>
                            <th className="px-4 py-3">Vai trò</th>
                            <th className="px-4 py-3">Hành động</th>
                            <th className="px-4 py-3">Đối tượng</th>
                            <th className="px-4 py-3">IP</th>
                            <th className="px-4 py-3 text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin inline" />
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-500">
                                    Không có log nào.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {formatDate(log.created_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{log.username || "—"}</div>
                                        <div className="text-xs text-gray-500">{log.user_email}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {log.user_role && (
                                            <Badge variant="outline">{log.user_role}</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium ${
                                                ACTION_COLORS[log.action] || "bg-gray-100"
                                            }`}
                                        >
                                            {ACTION_LABELS[log.action] || log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{log.target_repr || "—"}</div>
                                        <div className="text-xs text-gray-500">
                                            {log.target_type}
                                            {log.target_id && ` #${log.target_id}`}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-600">
                                        {log.ip_address || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setSelected(log)}
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Tổng {count} dòng — Trang {page}/{totalPages}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Trước
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Sau
                    </Button>
                </div>
            </div>

            {/* Detail dialog */}
            <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết audit log #{selected?.id}</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <div className="text-gray-500">Thời gian</div>
                                    <div className="font-medium">
                                        {formatDate(selected.created_at)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Hành động</div>
                                    <div className="font-medium">
                                        {ACTION_LABELS[selected.action] || selected.action}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Người dùng</div>
                                    <div className="font-medium">
                                        {selected.username} ({selected.user_email})
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Vai trò</div>
                                    <div className="font-medium">{selected.user_role || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Đối tượng</div>
                                    <div className="font-medium">
                                        {selected.target_type}
                                        {selected.target_id && ` #${selected.target_id}`}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500">Hiển thị</div>
                                    <div className="font-medium">{selected.target_repr || "—"}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500">IP</div>
                                    <div className="font-medium">{selected.ip_address || "—"}</div>
                                </div>
                                <div className="col-span-2">
                                    <div className="text-gray-500">User agent</div>
                                    <div className="font-mono text-xs break-all">
                                        {selected.user_agent || "—"}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-gray-500 mb-1">Thay đổi</div>
                                {selected.action === "UPDATE" &&
                                Object.keys(selected.changes || {}).length > 0 ? (
                                    <div className="border rounded overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-2 py-1 text-left">Trường</th>
                                                    <th className="px-2 py-1 text-left">Trước</th>
                                                    <th className="px-2 py-1 text-left">Sau</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(selected.changes).map(
                                                    ([field, val]: [string, any]) => (
                                                        <tr key={field} className="border-b">
                                                            <td className="px-2 py-1 font-medium">
                                                                {field}
                                                            </td>
                                                            <td className="px-2 py-1 text-red-600 break-all">
                                                                {String(val?.old ?? "—")}
                                                            </td>
                                                            <td className="px-2 py-1 text-green-600 break-all">
                                                                {String(val?.new ?? "—")}
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto max-h-80">
                                        {JSON.stringify(selected.changes, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
