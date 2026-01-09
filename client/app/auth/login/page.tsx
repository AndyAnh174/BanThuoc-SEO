import { LoginForm } from "../../../src/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/50 p-6 md:p-10">
      <div className="w-full max-w-[1000px]">
        <LoginForm />
      </div>
    </div>
  )
}
