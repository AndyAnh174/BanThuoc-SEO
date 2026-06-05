'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/src/features/layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Home, Package } from 'lucide-react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');
  const isSuccess = status === 'success';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        {status === null ? (
          <>
            <Loader2 className="w-16 h-16 text-teal-500 mx-auto mb-4 animate-spin" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Đang xử lý thanh toán</h1>
            <p className="text-sm text-gray-500">Vui lòng chờ trong giây lát...</p>
          </>
        ) : isSuccess ? (
          <>
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-sm text-gray-500 mb-2">
              Đơn hàng <span className="font-mono text-teal-700">{orderId}</span> đã được thanh toán.
            </p>
            {message && <p className="text-xs text-gray-400 mb-6">{message}</p>}
            <div className="flex flex-col gap-3">
              {orderId && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  <Package className="w-4 h-4" />
                  Xem đơn hàng
                </Button>
              )}
              <Link href="/">
                <Button variant="outline" className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Về trang chủ
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-sm text-gray-500 mb-6">
              {message || 'Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.'}
            </p>
            <div className="flex flex-col gap-3">
              {orderId && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => router.push(`/orders/${orderId}`)}
                >
                  <Package className="w-4 h-4" />
                  Xem đơn hàng
                </Button>
              )}
              <Link href="/checkout">
                <Button className="w-full gap-2 bg-teal-600 hover:bg-teal-700">
                  Thử lại
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <MainLayout>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        }
      >
        <PaymentResultContent />
      </Suspense>
    </MainLayout>
  );
}
