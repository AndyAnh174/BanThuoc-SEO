"use client";

import { VoucherForm } from "@/src/features/admin/components/voucher-form";
import { TicketPercent } from "lucide-react";
import { useParams } from "next/navigation";

export default function EditVoucherPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <TicketPercent className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Chỉnh sửa Voucher</h1>
          <p className="text-sm text-gray-500">
            Cập nhật thông tin mã giảm giá.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <VoucherForm id={id} />
      </div>
    </div>
  );
}
