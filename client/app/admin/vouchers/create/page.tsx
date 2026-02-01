"use client";

import { VoucherForm } from "@/src/features/admin/components/voucher-form";
import { TicketPercent } from "lucide-react";

export default function CreateVoucherPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <TicketPercent className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tạo Voucher Mới</h1>
          <p className="text-sm text-gray-500">
            Thiết lập thông tin mã giảm giá, thời gian và điều kiện áp dụng.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <VoucherForm />
      </div>
    </div>
  );
}
