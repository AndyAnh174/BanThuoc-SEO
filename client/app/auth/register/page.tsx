import { Metadata } from 'next';
import { RegisterForm } from "@/src/features/auth/components/register-form";
import { Globe } from "@/components/ui/globe";

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản',
  description: 'Tạo tài khoản BanThuoc để mua thuốc online, theo dõi đơn hàng và nhận ưu đãi độc quyền.',
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="w-full flex items-center justify-center py-10 relative overflow-hidden">
        {/* Background Globe subtle effect */}
        <div className="absolute inset-x-0 bottom-[-200px] h-[500px] z-0 opacity-10 pointer-events-none">
             <Globe />
        </div>
        
        {/* Main Content */}
        <div className="z-10 w-full flex justify-center">
            <RegisterForm />
        </div>
    </div>
  );
}
