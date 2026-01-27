'use client';

import React from 'react';
import MainLayout from '@/src/features/layout/components/MainLayout';
import { CheckoutPage } from '@/src/features/checkout/components/CheckoutPage';

export default function Page() {
  return (
    <MainLayout>
        <CheckoutPage />
    </MainLayout>
  );
}
