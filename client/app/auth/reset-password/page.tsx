'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Leaf, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { http } from '@/lib/http';

const resetPasswordSchema = z.object({
    new_password: z.string().min(8, 'Mat khau phai co it nhat 8 ky tu'),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Mat khau xac nhan khong khop',
    path: ['confirm_password'],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { new_password: '', confirm_password: '' },
    });

    const onSubmit = async (data: ResetPasswordValues) => {
        if (!token) {
            toast.error('Link dat lai mat khau khong hop le.');
            return;
        }

        setIsLoading(true);
        try {
            await http.post('/auth/reset-password/', {
                token,
                new_password: data.new_password,
            });
            setIsSuccess(true);
            toast.success('Dat lai mat khau thanh cong!');
        } catch (error: any) {
            const message = error.response?.data?.error || 'Co loi xay ra, vui long thu lai.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-4 p-8">
                <p className="text-red-500 font-medium">Link dat lai mat khau khong hop le.</p>
                <Button variant="outline" className="rounded-full" asChild>
                    <Link href="/auth/forgot-password">Yeu cau link moi</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="p-8">
            {isSuccess ? (
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Dat lai mat khau thanh cong!</h3>
                    <p className="text-gray-500 text-sm">
                        Ban co the dang nhap voi mat khau moi.
                    </p>
                    <Button
                        className="w-full rounded-full h-12 bg-green-700 hover:bg-green-800 text-white mt-4"
                        asChild
                    >
                        <Link href="/auth/login">Dang nhap ngay</Link>
                    </Button>
                </div>
            ) : (
                <>
                    <p className="text-gray-500 text-sm mb-6">
                        Nhap mat khau moi cho tai khoan cua ban.
                    </p>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="new_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative group">
                                                <input
                                                    {...field}
                                                    type="password"
                                                    placeholder=" "
                                                    className="peer block w-full px-6 h-14 rounded-full border border-gray-200 bg-green-50/30 text-base text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:bg-white transition-all outline-none"
                                                />
                                                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-focus:text-green-700 peer-focus:bg-white peer-focus:px-2 peer-focus:ml-[-8px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:translate-y-[-50%] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-green-700 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-2 peer-not-placeholder-shown:ml-[-8px]">
                                                    Mat khau moi
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="ml-4" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirm_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="relative group">
                                                <input
                                                    {...field}
                                                    type="password"
                                                    placeholder=" "
                                                    className="peer block w-full px-6 h-14 rounded-full border border-gray-200 bg-green-50/30 text-base text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:bg-white transition-all outline-none"
                                                />
                                                <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-focus:text-green-700 peer-focus:bg-white peer-focus:px-2 peer-focus:ml-[-8px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:translate-y-[-50%] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-green-700 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-2 peer-not-placeholder-shown:ml-[-8px]">
                                                    Xac nhan mat khau moi
                                                </label>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="ml-4" />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 rounded-full bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95 text-lg font-semibold"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Dang xu ly...
                                    </>
                                ) : (
                                    'Dat lai mat khau'
                                )}
                            </Button>

                            <div className="text-center">
                                <Link
                                    href="/auth/login"
                                    className="text-sm text-green-600 hover:text-green-700 hover:underline inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Quay lai dang nhap
                                </Link>
                            </div>
                        </form>
                    </Form>
                </>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex w-full items-center justify-center py-10 md:py-20">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-[500px] bg-white rounded-[30px] shadow-xl overflow-hidden ring-1 ring-black/5"
            >
                {/* Header */}
                <div className="bg-green-600 p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full border-[20px] border-white opacity-10" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Leaf className="w-8 h-8" />
                            </div>
                            <span className="text-2xl font-bold tracking-wide">BanThuoc</span>
                        </div>
                        <h2 className="text-xl font-bold">Dat lai mat khau</h2>
                    </div>
                </div>

                {/* Body */}
                <Suspense fallback={<div className="p-8 text-center">Dang tai...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </motion.div>
        </div>
    );
}
