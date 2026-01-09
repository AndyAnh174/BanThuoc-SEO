"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Leaf, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../stores/auth.store";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterFormValues } from "../types/register.schema";
import { DropzoneUpload } from "@/components/ui/dropzone-upload";
import { SuccessModal } from "@/components/ui/success-modal";

// Custom Floating Label Input Component
const FloatingLabelInput = ({ field, label, type = "text" }: any) => {
  return (
      <div className="relative group">
          <input
              {...field}
              id={`input-${field.name}`}
              type={type}
              placeholder=" "
              className="peer block w-full px-6 h-14 rounded-full border border-gray-200 bg-green-50/30 text-base text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:bg-white transition-all outline-none placeholder-shown:pt-0 pt-0"
          />
          <label
              htmlFor={`input-${field.name}`}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-base transition-all duration-300 pointer-events-none 
              peer-focus:top-0 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-focus:text-green-700 peer-focus:bg-white peer-focus:px-2 peer-focus:ml-[-8px]
              peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:translate-y-[-50%] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-green-700 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-2 peer-not-placeholder-shown:ml-[-8px]"
          >
              {label}
          </label>
      </div>
  )
}

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      licenseNumber: "",
      taxId: "",
      address: "",
    },
    mode: "onChange",
  });

  const { trigger, handleSubmit, setValue, formState: { errors } } = form;

  const handleNextStep = async () => {
    const fieldsStep1: (keyof RegisterFormValues)[] = [
      "fullName", "email", "phone", "password", "confirmPassword"
    ];
    const isStep1Valid = await trigger(fieldsStep1);
    
    if (isStep1Valid) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const onFileSelect = (file: File | null) => {
    if (file) {
      setValue("licenseFile", file, { shouldValidate: true });
      
      // Fake progress animation for UX
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 10;
        });
      }, 100);
    } else {
        setValue("licenseFile", undefined as any);
        setUploadProgress(0);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    const success = await register(data);
    if (success) {
        setShowSuccessModal(true);
    }
  };

  const handleSuccessClose = () => {
      setShowSuccessModal(false);
      // Redirect to login or stay on page? User said "Congradulations... Continue". 
      // Usually "Continue" leads to Login or Dashboard.
      router.push("/auth/login"); 
  };

  return (
    <>
    <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleSuccessClose} 
    />
    
    <div className="flex flex-col lg:flex-row w-full max-w-[1200px] h-auto lg:min-h-[700px] bg-white rounded-[30px] shadow-xl overflow-hidden ring-1 ring-black/5 mx-4">
        
        {/* LEFT SIDE - BRANDING */}
        <div className="lg:w-[450px] bg-green-600 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full border-[20px] border-white" />
                <div className="absolute bottom-[50px] left-[-30px] w-32 h-32 rounded-full bg-white opacity-20" />
            </div>

            <div className="relative z-10 mb-8 lg:mb-0">
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <span className="text-2xl font-bold tracking-wide">BanThuoc</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">Chào mừng đến với hệ thống!</h2>
                <p className="text-green-50 text-base lg:text-lg opacity-90">Chúng tôi kết nối các nhà thuốc và doanh nghiệp dược phẩm hàng đầu.</p>
            </div>

            <div className="relative z-10 text-center mt-auto">
                <p className="mb-4 text-green-100 font-medium">Đã có tài khoản?</p>
                <Button 
                    variant="outline" 
                    className="w-full rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-green-700 h-12 text-base transition-all duration-300 font-semibold"
                    asChild
                >
                    <Link href="/auth/login">
                        Đăng nhập ngay
                    </Link>
                </Button>
            </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="flex-1 p-6 md:p-8 lg:p-14 relative bg-white">
            <div className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-2">
                 {/* Step Indicator (Minimal) */}
                 <span className={`text-sm font-bold ${step === 1 ? 'text-green-600' : 'text-gray-300'}`}>01</span>
                 <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-green-500"
                        initial={{ width: "0%" }}
                        animate={{ width: step === 2 ? "100%" : "50%" }}
                    />
                 </div>
                 <span className={`text-sm font-bold ${step === 2 ? 'text-green-600' : 'text-gray-300'}`}>02</span>
            </div>

            <div className="mt-8 mb-10">
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Đăng ký Đối Tác</h3>
                <p className="text-gray-500 mt-2">Điền thông tin bên dưới để tạo tài khoản doanh nghiệp</p>
            </div>

            <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-8 py-2 h-full flex flex-col justify-center"
                    >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Họ và tên" />
                            </FormControl>
                            <FormMessage className="ml-4" />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                 <FloatingLabelInput field={field} label="Số điện thoại" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                            </FormItem>
                        )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Email" type="email" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                        </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Mật khẩu" type="password" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Xác nhận mật khẩu" type="password" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                            </FormItem>
                        )}
                        />
                    </div>

                    <div className="pt-8 flex justify-end">
                        <Button type="button" onClick={handleNextStep} className="h-14 px-10 rounded-full bg-green-700 hover:bg-green-800 text-white text-lg font-semibold shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2">
                            Tiếp tục <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>

                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-8 py-2 h-full flex flex-col justify-center"
                    >
                     <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Tên Nhà Thuốc / Doanh Nghiệp" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                        </FormItem>
                        )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Số giấy phép KD" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="taxId"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Mã số thuế" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                            </FormItem>
                        )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <FloatingLabelInput field={field} label="Địa chỉ kinh doanh" />
                            </FormControl>
                             <FormMessage className="ml-4" />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="licenseFile"
                        render={({ field: { value, onChange, ...field } }) => (
                        <FormItem>
                             <FormLabel className="ml-1 text-sm font-semibold text-gray-700 block mb-2">Giấy phép kinh doanh</FormLabel>
                            <FormControl>
                                <DropzoneUpload 
                                    onFileChange={onFileSelect}
                                    value={value as File}
                                    progress={uploadProgress}
                                />
                            </FormControl>
                             <FormMessage className="ml-4" />
                        </FormItem>
                        )}
                    />

                    <div className="pt-8 flex justify-between items-center">
                        <Button type="button" variant="ghost" onClick={handlePrevStep} disabled={isLoading} className="text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-full px-6 h-12 text-base font-medium">
                             Quay lại
                        </Button>
                        <Button type="submit" disabled={isLoading} className="h-14 px-10 rounded-full bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95 text-lg font-semibold inline-flex items-center justify-center">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Hoàn tất đăng ký"
                            )}
                        </Button>
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </form>
            </Form>
        </div>
    </div>
    </>
  );
}
