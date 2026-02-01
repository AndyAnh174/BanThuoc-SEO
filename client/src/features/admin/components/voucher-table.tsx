import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search, 
  Plus,
  Loader2,
  TicketPercent
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/src/hooks/use-debounce';
import { toast } from 'sonner';
import { getVouchers, deleteVoucher } from '../api/vouchers.api';
import { Voucher } from '../types/voucher.types';

export function VoucherTable() {
  const router = useRouter();
  const [data, setData] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Determine existing query params or implement simple client-side search if API limited
      const res = await getVouchers({ search: debouncedSearch });
      setData(res.results || []);
    } catch (error) {
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    try {
      await deleteVoucher(id);
      toast.success('Xóa voucher thành công');
      fetchData();
    } catch (error) {
      toast.error('Xóa voucher thất bại');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm voucher..."
              className="pl-8 w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <Button onClick={() => router.push('/admin/vouchers/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Voucher
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Voucher</TableHead>
              <TableHead>Loại giảm giá</TableHead>
              <TableHead>Giá trị</TableHead>
              <TableHead>Lượt dùng</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Chưa có voucher nào
                </TableCell>
              </TableRow>
            ) : (
              data.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <TicketPercent className="h-4 w-4" />
                      </div>
                      <div>
                        <div>{voucher.code}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[150px]" title={voucher.name}>
                          {voucher.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {voucher.discount_type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
                  </TableCell>
                  <TableCell>
                     {voucher.discount_type === 'PERCENTAGE' ? (
                       <span className="text-green-600 font-semibold">{voucher.discount_value}%</span>
                     ) : (
                       <span className="text-green-600 font-semibold">
                         {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discount_value)}
                       </span>
                     )}
                     {voucher.min_spend > 0 && (
                       <div className="text-xs text-muted-foreground">
                         Đơn từ {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.min_spend)}
                       </div>
                     )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {voucher.usage_limit ? `${voucher.usage_count} / ${voucher.usage_limit}` : `${voucher.usage_count} (∞)`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{format(new Date(voucher.start_date), 'dd/MM/yyyy', { locale: vi })}</div>
                      <div className="text-muted-foreground">đến</div>
                      <div>{format(new Date(voucher.end_date), 'dd/MM/yyyy', { locale: vi })}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      voucher.status === 'ACTIVE' ? 'default' : 
                      voucher.status === 'EXPIRED' ? 'secondary' : 'outline'
                    } className={
                        voucher.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600' : ''
                    }>
                      {voucher.status === 'ACTIVE' ? 'Hoạt động' : 
                       voucher.status === 'INACTIVE' ? 'Tạm ngưng' :
                       voucher.status === 'EXPIRED' ? 'Hết hạn' : 'Đã hết lượt'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/admin/vouchers/${voucher.id}`)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(voucher.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
