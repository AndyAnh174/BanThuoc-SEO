/**
 * GET /api/payment/return
 * Handles VNPay redirect after payment (user returns from VNPay page).
 * Verifies hash, updates order payment status via Django, redirects to frontend result.
 */
import { NextRequest, NextResponse } from 'next/server';
import { vnpay, FRONTEND_RESULT_URL, API_BASE } from '@/src/lib/vnpay';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  // Verify return data from VNPay
  const result = vnpay.verifyReturnUrl(searchParams as any);

  const txnRef = (searchParams['vnp_TxnRef'] as string) || '';
  // Extract order ID from txnRef (format: orderId-timestamp)
  const orderId = txnRef.split('-').slice(0, -1).join('-') || txnRef;

  if (result.isSuccess) {
    // Mark order as paid in Django backend
    try {
      await fetch(`${API_BASE}/orders/${orderId}/mark-paid/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_SECRET || '',
        },
        body: JSON.stringify({
          txn_ref: txnRef,
        }),
      });
    } catch (err) {
      console.error('Failed to mark order as paid:', err);
    }

    // Redirect to frontend success page
    const successUrl = new URL(FRONTEND_RESULT_URL, request.url);
    successUrl.searchParams.set('orderId', orderId);
    successUrl.searchParams.set('status', 'success');
    successUrl.searchParams.set('txnRef', txnRef);
    return NextResponse.redirect(successUrl);
  }

  // Payment failed — redirect to frontend result with failure status
  const failUrl = new URL(FRONTEND_RESULT_URL, request.url);
  failUrl.searchParams.set('orderId', orderId);
  failUrl.searchParams.set('status', 'failed');
  failUrl.searchParams.set('message', result.message || 'Thanh toán thất bại');
  return NextResponse.redirect(failUrl);
}
