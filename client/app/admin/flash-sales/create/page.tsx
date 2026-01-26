'use client';

import { useFlashSaleStore } from '@/src/features/admin/stores/flash-sale.store';
import { FlashSaleForm } from '@/src/features/admin/components/flash-sale/flash-sale-form';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function CreateFlashSalePage() {
    const { createSession } = useFlashSaleStore();
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await createSession(data);
            toast.success('Tạo Flash Sale thành công');
            router.push('/admin/flash-sales');
        } catch (error) {
            // Error managed by store usually, or toast here
        }
    };

    return (
        <div className="space-y-6">
            <AdminHeader 
                title="Tạo Flash Sale Mới" 
                description="Thiết lập thông tin cho đợt giảm giá mới"
                showBack
                backUrl="/admin/flash-sales"
            />
            
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <FlashSaleForm 
                    onSubmit={handleSubmit} 
                    onCancel={() => router.push('/admin/flash-sales')}
                />
            </div>
        </div>
    );
}
