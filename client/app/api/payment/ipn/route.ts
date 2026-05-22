/**
 * GET /api/payment/ipn
 * Handles VNPay IPN (Instant Payment Notification) — server-to-server callback.
 * This is the authoritative payment confirmation regardless of user redirect.
 * Must respond with VNPay-compatible format: { RspCode: '00', Message: '...' }
 */
import { NextRequest, NextResponse } from 'next/server';
import { vnpay, API_BASE } from '@/src/lib/vnpay';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  // Verify IPN data
  const result = vnpay.verifyIpnCall(searchParams as any);

  const txnRef = (searchParams['vnp_TxnRef'] as string) || '';
  const orderId = txnRef.split('-').slice(0, -1).join('-') || txnRef;

  if (result.isSuccess) {
    // Mark order as paid
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
      console.error('IPN: Failed to mark order as paid:', err);
      return NextResponse.json({
        RspCode: '99',
        Message: 'Internal error',
      });
    }

    return NextResponse.json({
      RspCode: '00',
      Message: 'Confirm Success',
    });
  }

  // Payment failed or verification failed
  return NextResponse.json({
    RspCode: '00', // VNPay expects '00' even for failures (acknowledgement)
    Message: result.message || 'Confirm Success',
  });
}
