import { z } from 'zod';

export const checkoutSchema = z.object({
  deliveryMethod: z.enum(['shipping', 'pickup']),
  
  // Receiver Info
  fullName: z.string().min(2, 'Vui lòng nhập họ tên đầy đủ'),
  phoneNumber: z.string().regex(/^(0|\+84)[0-9]{9}$/, 'Số điện thoại không hợp lệ'),
  
  // Address (Required if shipping)
  city: z.string().default(''),
  ward: z.string().default(''),
  streetAddress: z.string().default(''),
  
  // Note
  orderNote: z.string().optional(),
  
  // Payment
  paymentMethod: z.string().default('COD'),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === 'shipping') {
    if (!data.city || !data.ward || !data.streetAddress) {
      if (!data.city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn Tỉnh/Thành", path: ['city'] });
      if (!data.ward) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng chọn Phường/Xã", path: ['ward'] });
      // We can add more specific issues, but simplified validation logic here
      if (!data.streetAddress) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Vui lòng nhập địa chỉ cụ thể", path: ['streetAddress'] });
    }
  }
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
