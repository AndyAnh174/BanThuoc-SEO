'use client';

import React from 'react';
import MainLayout from '@/src/features/layout/components/MainLayout';
import { CheckoutSuccessPage } from '@/src/features/checkout/components/CheckoutSuccessPage';

export default function Page() {
  return (
    <MainLayout>
        <CheckoutSuccessPage />
    </MainLayout>
  );
}
