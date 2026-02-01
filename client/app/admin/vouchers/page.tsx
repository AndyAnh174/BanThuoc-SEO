"use client";

import { VoucherTable } from "@/src/features/admin/components/voucher-table";
import { TicketPercent } from "lucide-react";

export default function VouchersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <TicketPercent className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Voucher</h1>
          <p className="text-sm text-gray-500">
            Tạo và quản lý các mã giảm giá cho khách hàng.
          </p>
        </div>
      </div>

      <VoucherTable />
    </div>
  );
}
