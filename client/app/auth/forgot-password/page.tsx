'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Leaf, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
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

const forgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = async (data: ForgotPasswordValues) => {
        setIsLoading(true);
        try {
            await http.post('/auth/forgot-password/', { email: data.email });
            setIsSubmitted(true);
            toast.success('Yeu cau da duoc gui!');
        } catch {
            toast.error('Co loi xay ra, vui long thu lai.');
        } finally {
            setIsLoading(false);
        }
    };

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
                        <h2 className="text-xl font-bold">Quen mat khau</h2>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {isSubmitted ? (
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <Mail className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Kiem tra email cua ban</h3>
                            <p className="text-gray-500 text-sm">
                                Neu email ton tai trong he thong, chung toi da gui link dat lai mat khau.
                                Vui long kiem tra hop thu (bao gom ca thu muc spam).
                            </p>
                            <p className="text-gray-400 text-xs">Link se het han sau 1 gio.</p>
                            <Button
                                variant="outline"
                                className="w-full rounded-full h-12 mt-4"
                                asChild
                            >
                                <Link href="/auth/login">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Quay lai dang nhap
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-500 text-sm mb-6">
                                Nhap email da dang ky tai khoan. Chung toi se gui link dat lai mat khau cho ban.
                            </p>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative group">
                                                        <input
                                                            {...field}
                                                            type="email"
                                                            placeholder=" "
                                                            className="peer block w-full px-6 h-14 rounded-full border border-gray-200 bg-green-50/30 text-base text-gray-900 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:bg-white transition-all outline-none"
                                                        />
                                                        <label className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-base transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:translate-y-[-50%] peer-focus:text-xs peer-focus:text-green-700 peer-focus:bg-white peer-focus:px-2 peer-focus:ml-[-8px] peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:translate-y-[-50%] peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-green-700 peer-not-placeholder-shown:bg-white peer-not-placeholder-shown:px-2 peer-not-placeholder-shown:ml-[-8px]">
                                                            Email
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
                                                Dang gui...
                                            </>
                                        ) : (
                                            'Gui link dat lai mat khau'
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
            </motion.div>
        </div>
    );
}
