'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { RefreshCw, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface ProductType {
  id: string; name: string; code: string; description?: string;
  product_count?: number; _miniappCount?: number;
}

const empty = { name: '', code: '' };

export default function MiniAppProductTypesPage() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ProductType>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductType | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typeRes, prodRes] = await Promise.all([
        fetch(`${API}/admin/product-types/?page_size=200`, { headers }),
        fetch(`${API}/products/?page_size=500&show_on_miniapp=true&fields=id,product_type`, { headers }),
      ]);
      const typeList = (await typeRes.json()).results || [];
      const products = (await prodRes.json()).results || [];

      const counts: Record<string, number> = {};
      products.forEach((p: any) => {
        if (p.product_type) {
          const tid = typeof p.product_type === 'string' ? p.product_type : p.product_type.id || p.product_type;
          counts[tid] = (counts[tid] || 0) + 1;
        }
      });

      setTypes(typeList.map((t: ProductType) => ({ ...t, _miniappCount: counts[t.id] || 0 })));
    } catch { toast.error('Không thể tải loại sản phẩm'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing({ ...empty }); setDialogOpen(true); };
  const openEdit = (t: ProductType) => { setEditing({ ...t }); setDialogOpen(true); };

  const save = async () => {
    if (!editing.name?.trim()) { toast.error('Vui lòng nhập tên loại'); return; }
    setSaving(true);
    try {
      const isNew = !editing.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `${API}/admin/product-types/` : `${API}/admin/product-types/${editing.id}/`;
      const res = await fetch(url, { method, headers, body: JSON.stringify(editing) });
      if (res.ok) {
        toast.success(isNew ? 'Đã tạo' : 'Đã cập nhật');
        setDialogOpen(false);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(Object.values(err).flat().join(', ') || 'Lưu thất bại');
      }
    } catch { toast.error('Lưu thất bại'); }
    setSaving(false);
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`${API}/admin/product-types/${deleteTarget.id}/`, { method: 'DELETE', headers });
      toast.success('Đã xoá');
      setTypes(prev => prev.filter(t => t.id !== deleteTarget.id));
    } catch { toast.error('Xoá thất bại'); }
    setDeleteTarget(null);
  };

  const withMiniApp = types.filter(t => (t._miniappCount || 0) > 0);
  const display = showAll ? types : withMiniApp;

  return (
    <div className="space-y-6">
      <AdminHeader title="Loại sản phẩm Mini App"
        description={`${withMiniApp.length}/${types.length} loại có sản phẩm Mini App`}
        action={<div className="flex gap-2"><Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-1" /> Làm mới</Button><Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Thêm loại mới</Button></div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng loại</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{types.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Có SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{withMiniApp.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{types.reduce((s, t) => s + (t._miniappCount || 0), 0)}</div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={showAll} onCheckedChange={setShowAll} />{showAll ? 'Đang hiện tất cả' : 'Chỉ hiện loại có SP Mini App'}</label>
      </div>

      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr><th className="text-left p-3 font-medium">Tên loại</th><th className="text-left p-3 font-medium">Mã</th><th className="text-center p-3 font-medium">Tổng SP</th><th className="text-center p-3 font-medium">SP Mini App</th><th className="text-center p-3 font-medium w-[80px]">Sửa</th><th className="text-center p-3 font-medium w-[60px]">Xoá</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400"><RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin" /></td></tr>
            : display.map(t => (
              <tr key={t.id} className={`border-b hover:bg-gray-50 ${(t._miniappCount || 0) === 0 ? 'opacity-40' : ''}`}>
                <td className="p-3 font-medium">{t.name}</td>
                <td className="p-3 text-xs text-gray-500">{t.code || '—'}</td>
                <td className="p-3 text-center"><Badge variant="outline">{t.product_count || 0}</Badge></td>
                <td className="p-3 text-center"><Badge className={(t._miniappCount || 0) > 0 ? 'bg-teal-100 text-teal-700' : ''}>{(t._miniappCount || 0)}</Badge></td>
                <td className="p-3 text-center"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></Button></td>
                <td className="p-3 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteTarget(t)}><Trash2 className="w-4 h-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent></Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing.id ? 'Sửa loại sản phẩm' : 'Thêm loại sản phẩm mới'}</DialogTitle><DialogDescription>Phân loại: Thuốc, TPCN, Thiết bị y tế, Mỹ phẩm...</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Tên loại <span className="text-red-500">*</span></Label><Input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="VD: Thuốc, Thực phẩm chức năng..." /></div>
            <div className="space-y-1"><Label>Mã code</Label><Input value={editing.code || ''} onChange={e => setEditing({ ...editing, code: e.target.value })} placeholder="VD: MEDICINE, SUPPLEMENT..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Huỷ</Button><Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700">{saving ? 'Đang lưu...' : editing.id ? 'Cập nhật' : 'Tạo mới'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xoá loại sản phẩm?</AlertDialogTitle><AlertDialogDescription>"{deleteTarget?.name}" sẽ bị xoá vĩnh viễn.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Huỷ</AlertDialogCancel><AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">Xoá</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
