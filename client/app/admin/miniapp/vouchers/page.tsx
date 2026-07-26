'use client';

import { VoucherTable } from '@/src/features/admin/components/voucher-table';
import { TicketPercent } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function MiniAppVouchersPage() {
  return (
    <div className="space-y-6">
      <AdminHeader
        title="Voucher Mini App"
        description="Quản lý mã giảm giá cho khách hàng Mini App B2C"
      />
      <VoucherTable />
    </div>
  );
}
