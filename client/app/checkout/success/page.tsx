import React, { Suspense } from 'react';
import MainLayout from '@/src/features/layout/components/MainLayout';
import { CheckoutSuccessPage } from '@/src/features/checkout/components/CheckoutSuccessPage';

export default function Page() {
  return (
    <MainLayout>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
            <CheckoutSuccessPage />
        </Suspense>
    </MainLayout>
  );
}
