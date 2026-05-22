/**
 * VNPay payment gateway configuration (server-side only).
 * Uses the vnpay npm package v2.x — must only be imported in Next.js API routes or server components.
 */
import { VNPay, ignoreLogger, HashAlgorithm } from 'vnpay';

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || '2QXUI4B4';
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || 'your-secret-key';
const VNPAY_SANDBOX = process.env.VNPAY_SANDBOX !== 'false'; // default sandbox for dev
const VNPAY_HOST = process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn';

export const vnpay = new VNPay({
  tmnCode: VNPAY_TMN_CODE,
  secureSecret: VNPAY_HASH_SECRET,
  vnpayHost: VNPAY_HOST,
  testMode: VNPAY_SANDBOX,
  hashAlgorithm: HashAlgorithm.SHA512,
  enableLog: false,
  loggerFn: ignoreLogger,
});

export const RETURN_URL =
  process.env.VNPAY_RETURN_URL ||
  process.env.NEXT_PUBLIC_SITE_URL + '/api/payment/return' ||
  'http://localhost:3000/api/payment/return';

export const FRONTEND_RESULT_URL =
  process.env.VNPAY_FRONTEND_RESULT_URL ||
  process.env.NEXT_PUBLIC_SITE_URL + '/payment/result' ||
  'http://localhost:3000/payment/result';

export const IPN_URL =
  process.env.VNPAY_IPN_URL ||
  process.env.NEXT_PUBLIC_SITE_URL + '/api/payment/ipn' ||
  'http://localhost:3000/api/payment/ipn';

export const API_BASE =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://backend:8000/api';
