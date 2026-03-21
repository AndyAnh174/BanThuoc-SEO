"use client";

import { ReturnsTable } from "@/src/features/admin/components/returns-table";

export default function AdminReturnsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý trả hàng</h2>
                <p className="text-gray-500">Xem xét và xử lý các yêu cầu trả hàng từ khách hàng.</p>
            </div>
            <ReturnsTable />
        </div>
    );
}
