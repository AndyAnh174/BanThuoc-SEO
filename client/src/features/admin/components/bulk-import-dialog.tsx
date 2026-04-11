'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  FileWarning,
  Info,
} from 'lucide-react';
import { http } from '@/lib/http';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ImportResult {
  total_rows: number;
  success_count: number;
  error_count: number;
  dry_run: boolean;
  created: { row: number; sku: string; name: string; id: string | null }[];
  errors: { row: number; messages: string[] }[];
}

const COLUMN_DOCS: { key: string; label: string; required: boolean; note?: string }[] = [
  { key: 'name', label: 'Tên sản phẩm', required: true },
  { key: 'sku', label: 'Mã SKU', required: true, note: 'Phải là duy nhất' },
  { key: 'price', label: 'Giá gốc (VND)', required: true, note: 'Chỉ nhập số' },
  { key: 'sale_price', label: 'Giá khuyến mãi (VND)', required: false },
  { key: 'category', label: 'Danh mục', required: true, note: 'Nhập slug hoặc tên đầy đủ' },
  { key: 'manufacturer', label: 'Nhà sản xuất', required: true, note: 'Nhập slug hoặc tên đầy đủ' },
  { key: 'stock_quantity', label: 'Tồn kho', required: false },
  { key: 'unit', label: 'Đơn vị', required: false, note: 'Hộp / Vỉ / Chai / Lọ...' },
  { key: 'quantity_per_unit', label: 'Quy cách đóng gói', required: false, note: 'VD: 15 vỉ x 12 viên' },
  { key: 'short_description', label: 'Mô tả ngắn', required: false, note: 'Tối đa 500 ký tự' },
  { key: 'description', label: 'Mô tả chi tiết', required: false },
  { key: 'ingredients', label: 'Thành phần', required: false },
  { key: 'dosage', label: 'Liều dùng', required: false },
  { key: 'usage', label: 'Cách dùng', required: false },
  { key: 'contraindications', label: 'Chống chỉ định', required: false },
  { key: 'side_effects', label: 'Tác dụng phụ', required: false },
  { key: 'storage', label: 'Bảo quản', required: false },
  { key: 'requires_prescription', label: 'Cần đơn thuốc', required: false, note: 'true / false' },
  { key: 'is_featured', label: 'Nổi bật', required: false, note: 'true / false' },
  { key: 'status', label: 'Trạng thái', required: false, note: 'DRAFT / ACTIVE' },
  { key: 'image_urls', label: 'Link ảnh', required: false, note: 'Nhiều ảnh cách nhau bằng dấu |' },
  { key: 'meta_title', label: 'SEO title', required: false },
  { key: 'meta_description', label: 'SEO description', required: false },
];

export function BulkImportDialog({ open, onOpenChange, onSuccess }: BulkImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setFile(null);
    setDryRun(true);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = (value: boolean) => {
    if (!value) resetState();
    onOpenChange(value);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await http.get('/admin/products/bulk-import/template/', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'banthuoc-products-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã tải template Excel');
    } catch (error: any) {
      toast.error('Không tải được template', {
        description: error?.response?.data?.detail || error?.message,
      });
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error('Vui lòng chọn file');
      return;
    }
    setIsSubmitting(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dry_run', dryRun ? 'true' : 'false');

      const response = await http.post<ImportResult>(
        '/admin/products/bulk-import/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResult(response.data);

      if (response.data.error_count === 0) {
        toast.success(
          dryRun
            ? `Kiểm tra thành công ${response.data.success_count} sản phẩm`
            : `Đã nhập ${response.data.success_count} sản phẩm`
        );
        if (!dryRun && onSuccess) onSuccess();
      } else {
        toast.warning(
          `Có ${response.data.error_count} dòng lỗi / ${response.data.total_rows} dòng`
        );
      }
    } catch (error: any) {
      toast.error('Nhập thất bại', {
        description: error?.response?.data?.detail || error?.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Nhập sản phẩm từ Excel / CSV
          </DialogTitle>
          <DialogDescription>
            Tải file template, điền thông tin sản phẩm rồi upload lên. Hỗ trợ file .xlsx và .csv.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Download template */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Tải file template mẫu</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    File mẫu có sẵn header tiếng Việt và 1 dòng ví dụ (Paralmax Extra Boston).
                    Cột có dấu <span className="text-red-600 font-medium">*</span> là bắt buộc.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Tải template .xlsx
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Column reference */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Điền thông tin (23 cột)</h3>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-900">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium">Cột</th>
                          <th className="text-left px-3 py-2 font-medium">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {COLUMN_DOCS.map((col) => (
                          <tr key={col.key} className="border-t">
                            <td className="px-3 py-1.5">
                              <span className="font-medium">{col.label}</span>
                              {col.required && (
                                <span className="ml-1 text-red-600">*</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-muted-foreground">
                              {col.note || (col.required ? 'Bắt buộc' : 'Tuỳ chọn')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 rounded-md bg-blue-50 dark:bg-blue-950 p-3 text-sm text-blue-900 dark:text-blue-200 flex gap-2">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p>
                        <b>Danh mục / Nhà sản xuất:</b> nhập slug (vd: <code>thuoc-giam-dau</code>) hoặc tên
                        đầy đủ. Hệ thống sẽ tự tìm.
                      </p>
                      <p>
                        <b>Link ảnh:</b> nhiều URL cách nhau bằng dấu <code>|</code>. Ảnh đầu tiên = ảnh chính.
                      </p>
                      <p>
                        <b>Trạng thái:</b> <code>DRAFT</code> (bản nháp) hoặc <code>ACTIVE</code> (hiển thị).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Upload */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
                  3
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-medium">Upload file</h3>
                  <div>
                    <Label htmlFor="bulk-file">File .xlsx hoặc .csv</Label>
                    <Input
                      ref={fileInputRef}
                      id="bulk-file"
                      type="file"
                      accept=".xlsx,.xlsm,.csv"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dry-run"
                      checked={dryRun}
                      onCheckedChange={(c) => setDryRun(c === true)}
                    />
                    <Label htmlFor="dry-run" className="font-normal cursor-pointer">
                      Kiểm tra trước (dry-run) — validate không lưu DB
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result */}
          {result && (
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="text-sm">
                      Tổng: <b>{result.total_rows}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">
                      Thành công: <b>{result.success_count}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Lỗi: <b>{result.error_count}</b>
                    </span>
                  </div>
                  {result.dry_run && (
                    <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800">
                      DRY RUN — chưa lưu DB
                    </span>
                  )}
                </div>

                {result.errors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-red-600" />
                      Danh sách lỗi
                    </h4>
                    <div className="max-h-48 overflow-y-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2 w-16">Dòng</th>
                            <th className="text-left px-3 py-2">Lỗi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errors.map((err, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-1.5 font-mono">{err.row}</td>
                              <td className="px-3 py-1.5 text-red-700">
                                {err.messages.join('; ')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {result.success_count > 0 && !result.dry_run && (
                  <p className="text-sm text-green-700">
                    Đã nhập thành công {result.success_count} sản phẩm vào hệ thống.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {dryRun ? 'Kiểm tra' : 'Nhập vào DB'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
