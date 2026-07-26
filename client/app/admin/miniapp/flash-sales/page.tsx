'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlashSaleStore } from '@/src/features/admin/stores/flash-sale.store';
import { FlashSaleList } from '@/src/features/admin/components/flash-sale/flash-sale-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function MiniAppFlashSalesPage() {
  const { fetchSessions } = useFlashSaleStore();
  const router = useRouter();

  useEffect(() => { fetchSessions(); }, []);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Flash Sale Mini App"
        description="Quản lý các đợt Flash Sale hiển thị trên Mini App Zalo"
        action={
          <Button onClick={() => router.push('/admin/flash-sales/create')}>
            <Plus className="mr-2 h-4 w-4" /> Tạo đợt mới
          </Button>
        }
      />
      <FlashSaleList
        onEdit={(s: any) => router.push(`/admin/flash-sales/${s.id}`)}
        onManage={(s: any) => router.push(`/admin/flash-sales/${s.id}`)}
      />
    </div>
  );
}
