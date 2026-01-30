"use client";

import { OrderDetail } from "@/src/features/admin/components/order-detail";

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    return <OrderDetail orderId={params.id} />;
}
