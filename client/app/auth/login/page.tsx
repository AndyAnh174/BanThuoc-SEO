import { Metadata } from 'next';
import { LoginForm } from "../../../src/features/auth/components/login-form";

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào tài khoản BanThuoc để mua thuốc, theo dõi đơn hàng và nhận ưu đãi.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex w-full items-center justify-center py-10 md:py-20">
      <div className="w-full max-w-[1000px]">
        <LoginForm />
      </div>
    </div>
  )
}
