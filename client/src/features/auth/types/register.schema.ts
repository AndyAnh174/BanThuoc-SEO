import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const registerSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z.string()
    .min(10, "Số điện thoại không hợp lệ")
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại Việt Nam không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  
  // Business Info
  businessName: z.string().min(1, "Vui lòng nhập tên nhà thuốc/doanh nghiệp"),
  licenseNumber: z.string().min(1, "Vui lòng nhập số giấy phép kinh doanh"),
  taxId: z.string().min(1, "Vui lòng nhập mã số thuế"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ kinh doanh"),
  
  // File Validation
  licenseFile: z
    .instanceof(File, { message: "Vui lòng tải lên giấy phép kinh doanh" })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Kích thước tệp không được vượt quá 5MB",
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Chỉ chấp nhận định dạng .jpg, .png hoặc .pdf",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
