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

interface Manufacturer {
  id: string; name: string; slug: string; country: string; website?: string;
  description?: string; product_count?: number; _miniappCount?: number;
}

const empty = { name: '', slug: '', country: '', description: '' };

export default function MiniAppManufacturersPage() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Manufacturer>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Manufacturer | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mfrRes, prodRes] = await Promise.all([
        fetch(`${API}/admin/manufacturers/?page_size=500`, { headers }),
        fetch(`${API}/products/?page_size=500&show_on_miniapp=true&fields=id,manufacturer`, { headers }),
      ]);
      const mfrs = (await mfrRes.json()).results || [];
      const products = (await prodRes.json()).results || [];

      const counts: Record<string, number> = {};
      products.forEach((p: any) => {
        if (p.manufacturer?.id) counts[p.manufacturer.id] = (counts[p.manufacturer.id] || 0) + 1;
      });

      setManufacturers(mfrs.map((m: Manufacturer) => ({ ...m, _miniappCount: counts[m.id] || 0 })));
    } catch { toast.error('Không thể tải NSX'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => { setEditing({ ...empty }); setDialogOpen(true); };
  const openEdit = (m: Manufacturer) => { setEditing({ ...m }); setDialogOpen(true); };

  const genSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const save = async () => {
    if (!editing.name?.trim()) { toast.error('Vui lòng nhập tên NSX'); return; }
    setSaving(true);
    try {
      const isNew = !editing.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `${API}/admin/manufacturers/` : `${API}/admin/manufacturers/${editing.id}/`;
      const payload = { ...editing, slug: editing.slug || genSlug(editing.name) };
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
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
      await fetch(`${API}/admin/manufacturers/${deleteTarget.id}/`, { method: 'DELETE', headers });
      toast.success('Đã xoá');
      setManufacturers(prev => prev.filter(m => m.id !== deleteTarget.id));
    } catch { toast.error('Xoá thất bại'); }
    setDeleteTarget(null);
  };

  const withMiniApp = manufacturers.filter(m => (m._miniappCount || 0) > 0);
  const display = showAll ? manufacturers : withMiniApp;

  return (
    <div className="space-y-6">
      <AdminHeader title="Nhà sản xuất Mini App"
        description={`${withMiniApp.length}/${manufacturers.length} NSX có sản phẩm Mini App`}
        action={<div className="flex gap-2"><Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-1" /> Làm mới</Button><Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Thêm NSX mới</Button></div>}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng NSX</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{manufacturers.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Có SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{withMiniApp.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng SP Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{manufacturers.reduce((s, m) => s + (m._miniappCount || 0), 0)}</div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={showAll} onCheckedChange={setShowAll} />{showAll ? 'Đang hiện tất cả' : 'Chỉ hiện NSX có SP Mini App'}</label>
      </div>

      <Card><CardContent className="p-0"><div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr><th className="text-left p-3 font-medium">Tên NSX</th><th className="text-left p-3 font-medium">Quốc gia</th><th className="text-center p-3 font-medium">Tổng SP</th><th className="text-center p-3 font-medium">SP Mini App</th><th className="text-center p-3 font-medium w-[80px]">Sửa</th><th className="text-center p-3 font-medium w-[60px]">Xoá</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400"><RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin" /></td></tr>
            : display.map(m => (
              <tr key={m.id} className={`border-b hover:bg-gray-50 ${(m._miniappCount || 0) === 0 ? 'opacity-40' : ''}`}>
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3 text-xs text-gray-500">{m.country || '—'}</td>
                <td className="p-3 text-center"><Badge variant="outline">{m.product_count || 0}</Badge></td>
                <td className="p-3 text-center"><Badge className={(m._miniappCount || 0) > 0 ? 'bg-teal-100 text-teal-700' : ''}>{(m._miniappCount || 0)}</Badge></td>
                <td className="p-3 text-center"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(m)}><Pencil className="w-4 h-4" /></Button></td>
                <td className="p-3 text-center"><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteTarget(m)}><Trash2 className="w-4 h-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></CardContent></Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing.id ? 'Sửa NSX' : 'Thêm NSX mới'}</DialogTitle><DialogDescription>Nhà sản xuất dược phẩm.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Tên NSX <span className="text-red-500">*</span></Label><Input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="VD: Domesco, DHG..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Quốc gia</Label><Input value={editing.country || ''} onChange={e => setEditing({ ...editing, country: e.target.value })} placeholder="VD: Vietnam" /></div>
              <div className="space-y-1"><Label>Slug</Label><Input value={editing.slug || ''} onChange={e => setEditing({ ...editing, slug: e.target.value })} placeholder="Tự động nếu để trống" /></div>
            </div>
            <div className="space-y-1"><Label>Mô tả</Label><Input value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Mô tả ngắn về NSX" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Huỷ</Button><Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700">{saving ? 'Đang lưu...' : editing.id ? 'Cập nhật' : 'Tạo mới'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Xoá NSX?</AlertDialogTitle><AlertDialogDescription>"{deleteTarget?.name}" sẽ bị xoá vĩnh viễn.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Huỷ</AlertDialogCancel><AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">Xoá</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
