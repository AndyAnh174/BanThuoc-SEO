import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 5;

export const registerSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z.string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại Việt Nam không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
  confirmPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),

  // Business Info
  businessName: z.string().min(1, "Vui lòng nhập tên nhà thuốc/doanh nghiệp"),
  licenseNumber: z.string().min(1, "Vui lòng nhập số giấy phép kinh doanh"),
  taxId: z.string().min(1, "Vui lòng nhập mã số thuế"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ kinh doanh"),

  // File Upload (optional, max 5 files, any type)
  licenseFiles: z
    .array(z.instanceof(File))
    .max(MAX_FILES, `Tối đa ${MAX_FILES} file`)
    .refine(
      (files) => files.every((f) => f.size <= MAX_FILE_SIZE),
      { message: `Mỗi file không được vượt quá 10MB` }
    )
    .optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
