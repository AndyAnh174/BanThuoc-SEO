"use client";

import { OrderTable } from "@/src/features/admin/components/order-table";

export default function AdminOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý đơn hàng</h2>
                    <p className="text-gray-500">Xem và quản lý tất cả đơn hàng từ khách hàng.</p>
                </div>
            </div>

            <OrderTable />
        </div>
    );
}
