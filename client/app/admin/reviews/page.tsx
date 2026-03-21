"use client";

import { ReviewsTable } from "@/src/features/admin/components/reviews-table";

export default function AdminReviewsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý đánh giá</h2>
                <p className="text-gray-500">Duyệt hoặc từ chối các đánh giá sản phẩm từ khách hàng.</p>
            </div>
            <ReviewsTable />
        </div>
    );
}
