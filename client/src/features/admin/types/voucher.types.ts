import { z } from 'zod';

export const voucherSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(3),
  name: z.string().min(3),
  description: z.string().optional(),
  discount_type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discount_value: z.number().min(0),
  max_discount: z.number().optional().nullable(),
  min_spend: z.number().min(0),
  start_date: z.string(),
  end_date: z.string(),
  usage_limit: z.number().optional().nullable(),
  usage_limit_per_user: z.number().min(1),
  usage_count: z.number().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'USED_UP']),
  is_valid: z.boolean().optional(),
});

export type Voucher = z.infer<typeof voucherSchema>;

export interface VoucherListResponse {
  count: number;
  results: Voucher[];
}

export type CreateVoucherParams = Omit<Voucher, 'id' | 'usage_count' | 'status' | 'is_valid'> & {
  status?: string;
};

export type UpdateVoucherParams = Partial<CreateVoucherParams>;
