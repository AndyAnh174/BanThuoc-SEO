'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlashSaleStore } from '@/src/features/admin/stores/flash-sale.store';
import { FlashSaleList } from '@/src/features/admin/components/flash-sale/flash-sale-list';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function AdminFlashSalesPage() {
    const { fetchSessions } = useFlashSaleStore();
    const router = useRouter();

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleCreate = () => {
        router.push('/admin/flash-sales/create');
    };

    const handleEdit = (session: any) => {
        router.push(`/admin/flash-sales/${session.id}`);
    };

    const handleManage = (session: any) => {
        // Manage also goes to detail page, maybe defaults to products tab?
        // Currently page defaults to 'info', but we can add query param ?tab=products later if needed.
        router.push(`/admin/flash-sales/${session.id}`);
    };

    return (
        <div className="space-y-6">
            <AdminHeader 
                title="Quản lý Flash Sale" 
                description="Tạo và quản lý các đợt giảm giá Flash Sale"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4" /> Tạo đợt mới
                    </Button>
                }
            />

            <FlashSaleList onEdit={handleEdit} onManage={handleManage} />
        </div>
    );
}
