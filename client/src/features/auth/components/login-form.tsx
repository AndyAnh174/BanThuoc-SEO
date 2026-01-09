"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Leaf } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../stores/auth.store";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "../types/login.schema";

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

export function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data);
    if (success) {
      router.push("/admin/users");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col md:flex-row w-full max-w-[1000px] h-auto md:min-h-[600px] bg-white rounded-[30px] shadow-xl overflow-hidden ring-1 ring-black/5"
    >
        {/* LEFT SIDE - BRANDING (Unchanged) */}
        <div className="md:w-[400px] bg-green-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden shrink-0">
             {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full border-[20px] border-white" />
                <div className="absolute bottom-[50px] left-[-30px] w-32 h-32 rounded-full bg-white opacity-20" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <span className="text-2xl font-bold tracking-wide">BanThuoc</span>
                </div>
                <h2 className="text-3xl font-bold leading-tight mb-4">Chào mừng trở lại!</h2>
                <p className="text-green-50 text-base opacity-90">Đăng nhập để tiếp tục quản lý và kết nối.</p>
            </div>
            
             <div className="relative z-10 text-center mt-8 md:mt-auto">
                <p className="mb-4 text-green-100 font-medium">Chưa có tài khoản?</p>
                <Button 
                    variant="outline" 
                    className="w-full rounded-full border-2 border-white bg-transparent text-white hover:bg-white hover:text-green-700 h-12 text-base transition-all duration-300 font-semibold"
                    asChild
                >
                    <Link href="/auth/register">
                        Đăng ký ngay
                    </Link>
                </Button>
            </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="flex-1 p-6 md:p-14 flex flex-col justify-center bg-white">
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Đăng Nhập</h3>
                <p className="text-gray-500 mt-2">Vui lòng nhập thông tin đăng nhập của bạn</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <FloatingLabelInput field={field} label="Email hoặc Tên đăng nhập" type="text" />
                                </FormControl>
                                <FormMessage className="ml-4" />
                            </FormItem>
                        )}
                    />
                    
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

                    <div className="flex justify-end">
                        <Link href="/auth/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-full bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95 text-lg font-semibold inline-flex items-center justify-center">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            "Đăng Nhập"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    </motion.div>
  );
}
