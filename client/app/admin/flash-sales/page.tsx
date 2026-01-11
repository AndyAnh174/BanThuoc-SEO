'use client';

import { useEffect, useState } from 'react';
import { useFlashSaleStore } from '@/src/features/admin/stores/flash-sale.store';
import { FlashSaleList } from '@/src/features/admin/components/flash-sale/flash-sale-list';
import { FlashSaleModal } from '@/src/features/admin/components/flash-sale/flash-sale-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function AdminFlashSalesPage() {
    const { fetchSessions, fetchSessionDetail } = useFlashSaleStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'manage'>('create');

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleCreate = () => {
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = async (session: any) => {
        await fetchSessionDetail(session.id);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleManage = async (session: any) => {
        await fetchSessionDetail(session.id);
        setModalMode('manage');
        setIsModalOpen(true);
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

            <FlashSaleModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                mode={modalMode} 
            />
        </div>
    );
}
