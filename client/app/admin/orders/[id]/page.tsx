"use client";

import { OrderDetail } from "@/src/features/admin/components/order-detail";

import { useParams } from "next/navigation";

export default function AdminOrderDetailPage() {
    const params = useParams();

    // Safely extract ID and ensure it's a string, or handle undefined
    const rawId = params?.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id) {
        return <div className="p-8 text-center text-gray-500">Đang tải thông tin đơn hàng...</div>;
    }

    return <OrderDetail orderId={id} />;
}
