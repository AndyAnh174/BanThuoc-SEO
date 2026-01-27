import { LoginForm } from "../../../src/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex w-full items-center justify-center py-10 md:py-20">
      <div className="w-full max-w-[1000px]">
        <LoginForm />
      </div>
    </div>
  )
}
