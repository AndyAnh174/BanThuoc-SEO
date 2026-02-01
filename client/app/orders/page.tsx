'use client';

import React from 'react';
import { OrderList } from '@/src/features/orders/components/OrderList';
import { Footer } from '@/src/features/layout/components/Footer';
import { Header } from '@/src/features/layout/components/Header';
// import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute'; // Optional: Use if you have it, else handle auth in component or middleware

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
            {/* Breadcrumb or Back button could go here */}
            <React.Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
                <OrderList />
            </React.Suspense>
      </main>

      <Footer />
    </div>
  );
}
