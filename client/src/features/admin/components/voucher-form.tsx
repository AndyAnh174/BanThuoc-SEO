import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { createVoucher, updateVoucher, getVoucher } from '../api/vouchers.api';
import { voucherSchema, Voucher, CreateVoucherParams } from '../types/voucher.types';
import { z } from 'zod';

// Schema for form (slightly different from API types for better UX)
const formSchema = voucherSchema.omit({ 
  id: true, 
  usage_count: true, 
  is_valid: true 
}).extend({
  code: z.string().min(3, "Mã phải có ít nhất 3 ký tự").regex(/^[A-Z0-9_-]+$/, "Mã chỉ chứa chữ hoa, số, gạch ngang/dưới"),
  start_date: z.date(),
  end_date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface VoucherFormProps {
  id?: string;
}

export function VoucherForm({ id }: VoucherFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      discount_type: 'PERCENTAGE',
      discount_value: 0,
      max_discount: null,
      min_spend: 0,
      usage_limit: null,
      usage_limit_per_user: 1,
      status: 'ACTIVE',
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 days
    },
  });

  useEffect(() => {
    if (id) {
      const fetchVoucher = async () => {
        try {
          const voucher = await getVoucher(id);
          form.reset({
            item: voucher,
            // Date handling
            start_date: new Date(voucher.start_date),
            end_date: new Date(voucher.end_date),
            // Convert numbers/nulls correctly
            max_discount: voucher.max_discount || null,
            usage_limit: voucher.usage_limit || null,
          } as any);
        } catch (error) {
          toast.error("Không thể tải thông tin voucher");
          router.push('/admin/vouchers');
        } finally {
          setFetching(false);
        }
      };
      fetchVoucher();
    }
  }, [id, form, router]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const payload: CreateVoucherParams = {
        ...values,
        start_date: values.start_date.toISOString(),
        end_date: values.end_date.toISOString(),
      };

      if (id) {
        await updateVoucher(id, payload);
        toast.success("Cập nhật voucher thành công");
      } else {
        await createVoucher(payload);
        toast.success("Tạo voucher thành công");
      }
      router.push('/admin/vouchers');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.details 
        ? JSON.stringify(error.response.data.details) 
        : "Có lỗi xảy ra";
      toast.error(`Lỗi: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Thông tin chung</h3>
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Voucher</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: SALE50, TET2025" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                  </FormControl>
                  <FormDescription>Mã viết liền không dấu, dùng để nhập khi thanh toán.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chương trình</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Giảm giá ngày tết" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Chi tiết về điều kiện áp dụng..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Discount Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Thiết lập giảm giá</h3>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discount_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại giảm giá</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại voucher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Theo phần trăm (%)</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Số tiền cố định (đ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá trị giảm</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="min_spend"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn tối thiểu (đ)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Giá trị đơn hàng tối thiểu để áp dụng mã.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="max_discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giảm tối đa (đ)</FormLabel>
                  <FormControl>
                    <Input 
                        type="number" 
                        placeholder="Không giới hạn"
                        {...field} 
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)} 
                    />
                  </FormControl>
                  <FormDescription>Chỉ áp dụng cho loại giảm theo %.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Validity */}
          <div className="space-y-4">
             <h3 className="font-semibold text-lg border-b pb-2">Thời gian áp dụng</h3>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày kết thúc</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="INACTIVE">Tạm ngưng</SelectItem>
                      <SelectItem value="EXPIRED" disabled>Hết hạn</SelectItem>
                      <SelectItem value="USED_UP" disabled>Hết lượt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
             <h3 className="font-semibold text-lg border-b pb-2">Giới hạn sử dụng</h3>
             <FormField
                control={form.control}
                name="usage_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tổng lượt sử dụng (Toàn hệ thống)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        placeholder="Không giới hạn" 
                        {...field} 
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>Để trống nếu không giới hạn.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usage_limit_per_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giới hạn mỗi người dùng</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormDescription>Số lần tối đa một người được dùng mã này.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>Hủy bỏ</Button>
          <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {id ? 'Cập nhật' : 'Tạo Voucher'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
