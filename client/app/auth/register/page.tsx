import { RegisterForm } from "@/src/features/auth/components/register-form";
import { Globe } from "@/components/ui/globe";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 relative overflow-hidden">
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
