import * as z from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Vui lòng nhập Email hoặc Tên đăng nhập.",
  }),
  password: z.string().min(1, {
    message: "Vui lòng nhập mật khẩu.",
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
