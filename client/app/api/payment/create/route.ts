/**
 * POST /api/payment/create
 * Creates a VNPay payment URL for an existing order.
 * Body: { orderId: string, amount: number, orderInfo?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { vnpay, RETURN_URL, API_BASE } from '@/src/lib/vnpay';
import { VnpLocale } from 'vnpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Thiếu orderId hoặc amount' }, { status: 400 });
    }

    // Verify order exists in Django backend
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
      }
    } catch {
      // Internal API unreachable — proceed anyway (order was just created)
    }

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const orderInfo =
      body.orderInfo ||
      `Thanh toan don hang ${orderId}`;

    // Generate unique transaction reference: orderId-timestamp
    const txnRef = `${orderId}-${Date.now()}`;

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: clientIp,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: orderInfo,
      vnp_ReturnUrl: RETURN_URL,
      vnp_Locale: VnpLocale.VN,
    });

    return NextResponse.json({
      paymentUrl,
      txnRef,
    });
  } catch (error: any) {
    console.error('VNPay create error:', error);
    return NextResponse.json(
      { error: 'Lỗi tạo thanh toán VNPay' },
      { status: 500 },
    );
  }
}
