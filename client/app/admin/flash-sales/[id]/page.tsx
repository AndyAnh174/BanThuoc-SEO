'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFlashSaleStore } from '@/src/features/admin/stores/flash-sale.store';
import { FlashSaleForm } from '@/src/features/admin/components/flash-sale/flash-sale-form';
import { FlashSaleProducts } from '@/src/features/admin/components/flash-sale/flash-sale-products';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditFlashSalePage() {
    const params = useParams();
    const router = useRouter();
    const { fetchSessionDetail, currentSession, updateSession } = useFlashSaleStore();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    const id = params.id as string;

    useEffect(() => {
        if (id) {
            fetchSessionDetail(id).then(() => setIsLoading(false)).catch(() => setIsLoading(false));
        }
    }, [id]);

    const handleUpdate = async (data: any) => {
        try {
            await updateSession(id, data);
            toast.success('Cập nhật thông tin thành công');
        } catch (error) {}
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>;
    }

    if (!currentSession) {
        return <div>Không tìm thấy dữ liệu Flash Sale</div>;
    }

    return (
        <div className="space-y-6">
            <AdminHeader 
                title={`Chi tiết: ${currentSession.name}`} 
                description="Quản lý thông tin và sản phẩm trong đợt giảm giá"
                showBack
                backUrl="/admin/flash-sales"
            />
            
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="info">Thông tin chung</TabsTrigger>
                        <TabsTrigger value="products">Sản phẩm bán</TabsTrigger>
                    </TabsList>
                    
                    <div className="mt-6">
                        <TabsContent value="info">
                            <div className="bg-white p-6 rounded-lg border shadow-sm">
                                <h3 className="text-lg font-medium mb-4">Thông tin chương trình</h3>
                                <FlashSaleForm 
                                    initialData={currentSession} 
                                    onSubmit={handleUpdate} 
                                    onCancel={() => router.push('/admin/flash-sales')}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="products">
                            <div className="bg-white p-6 rounded-lg border shadow-sm min-h-[500px]">
                                <FlashSaleProducts session={currentSession} />
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
