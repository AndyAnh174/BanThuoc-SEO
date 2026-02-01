'use client';

import React from 'react';
import { useParams } from 'next/navigation'; // Correct hook for Next.js 13+ App Router client components
import { OrderDetail } from '@/src/features/orders/components/OrderDetail';
import { Footer } from '@/src/features/layout/components/Footer';
import { Header } from '@/src/features/layout/components/Header';

export default function OrderDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-8">
                {id ? (
                    <OrderDetail orderId={id} />
                ) : (
                    <div className="text-center py-12">Đang tải...</div>
                )}
            </main>

            <Footer />
        </div>
    );
}
