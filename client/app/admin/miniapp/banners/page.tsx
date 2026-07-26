'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Image, Plus, Pencil, Trash2, RefreshCw, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Banner {
  id: string; title: string; subtitle: string; image_url: string; link_url: string;
  link_text: string; background_color: string; text_color: string;
  display_position: string; sort_order: number;
  is_active: boolean; is_visible: boolean;
  start_date: string; end_date: string;
}

const emptyBanner: Partial<Banner> = {
  title: '', subtitle: '', image_url: '', link_url: '', link_text: '',
  background_color: '#0d9488', text_color: '#ffffff',
  display_position: 'HERO', sort_order: 1,
  is_active: true, is_visible: true,
  start_date: '', end_date: '',
};

const POSITIONS = ['HERO', 'ROW', 'PROMO', 'POPUP'];

export default function MiniAppBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/banners/?page_size=100`, { headers: authHeaders });
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : data.results || []);
    } catch { toast.error('Không thể tải banner'); }
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => { setEditing({ ...emptyBanner }); setDialogOpen(true); };
  const openEdit = (b: Banner) => { setEditing({ ...b }); setDialogOpen(true); };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `${API}/banners/` : `${API}/banners/${editing.id}/`;
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(editing) });
      if (res.ok) {
        toast.success(isNew ? 'Đã tạo banner' : 'Đã cập nhật banner');
        setDialogOpen(false);
        fetchBanners();
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
      await fetch(`${API}/banners/${deleteTarget.id}/`, { method: 'DELETE', headers: authHeaders });
      toast.success('Đã xoá banner');
      setBanners(prev => prev.filter(b => b.id !== deleteTarget.id));
    } catch { toast.error('Xoá thất bại'); }
    setDeleteTarget(null);
  };

  const toggleActive = async (b: Banner) => {
    try {
      await fetch(`${API}/banners/${b.id}/`, {
        method: 'PUT', headers: authHeaders,
        body: JSON.stringify({ ...b, is_active: !b.is_active }),
      });
      setBanners(prev => prev.map(x => x.id === b.id ? { ...x, is_active: !x.is_active } : x));
    } catch { toast.error('Cập nhật thất bại'); }
  };

  return (
    <div className="space-y-6">
      <AdminHeader title="Banner Mini App"
        description={`${banners.length} banner — Quản lý banner hiển thị trên Mini App Zalo. Các vị trí: HERO (carousel chính), ROW (banner dọc), PROMO (khuyến mãi), POPUP.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchBanners}><RefreshCw className="w-4 h-4 mr-1" /> Làm mới</Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Tạo banner mới</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{banners.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đang active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{banners.filter(b => b.is_active).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">HERO (carousel)</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{banners.filter(b => b.display_position === 'HERO').length}</div></CardContent></Card>
      </div>

      {/* Banner Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-16 text-gray-400"><RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" /> Đang tải...</div>
        ) : banners.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400"><Image className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Chưa có banner nào</p></div>
        ) : banners.map(b => (
          <Card key={b.id} className={`overflow-hidden hover:shadow-md transition-shadow ${!b.is_active ? 'opacity-50' : ''}`}>
            <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden relative">
              {b.image_url ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /> : <Image className="w-10 h-10 text-gray-300" />}
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={b.is_active ? 'default' : 'secondary'} className="text-xs">{b.is_active ? 'Active' : 'Inactive'}</Badge>
                <Badge variant="outline" className="text-xs bg-white">{b.display_position}</Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="font-semibold text-sm mb-1">{b.title || 'Không tiêu đề'}</div>
              <div className="text-xs text-gray-400 mb-3 line-clamp-2">{b.subtitle || '—'}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} />
                  <span className="text-xs text-gray-500">{b.is_active ? 'Hiện' : 'Ẩn'}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteTarget(b)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Sửa banner' : 'Tạo banner mới'}</DialogTitle>
            <DialogDescription>Tạo banner hiển thị trên Mini App Zalo.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1"><Label>Tiêu đề</Label><Input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="space-y-1"><Label>Phụ đề</Label><Input value={editing.subtitle || ''} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div className="space-y-1"><Label>URL ảnh</Label><Input value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://minio.banthuocsi.vn/..." />
                {editing.image_url && <img src={editing.image_url} alt="Preview" className="h-20 rounded border object-cover mt-1" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Link URL</Label><Input value={editing.link_url || ''} onChange={e => setEditing({ ...editing, link_url: e.target.value })} placeholder="/flash-sale" /></div>
                <div className="space-y-1"><Label>Text link</Label><Input value={editing.link_text || ''} onChange={e => setEditing({ ...editing, link_text: e.target.value })} placeholder="Mua ngay" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Vị trí</Label><select className="w-full border rounded-md px-3 py-2 text-sm" value={editing.display_position || 'HERO'} onChange={e => setEditing({ ...editing, display_position: e.target.value })}>{POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div className="space-y-1"><Label>Thứ tự</Label><Input type="number" value={editing.sort_order || 1} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>Màu nền</Label><Input value={editing.background_color || '#0d9488'} onChange={e => setEditing({ ...editing, background_color: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><Switch checked={editing.is_active || false} onCheckedChange={v => setEditing({ ...editing, is_active: v })} /> Active</label>
                <label className="flex items-center gap-2"><Switch checked={editing.is_visible || false} onCheckedChange={v => setEditing({ ...editing, is_visible: v })} /> Visible</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Huỷ</Button>
            <Button onClick={save} disabled={saving} className="bg-teal-600 hover:bg-teal-700">{saving ? 'Đang lưu...' : editing?.id ? 'Cập nhật' : 'Tạo mới'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá banner?</AlertDialogTitle>
            <AlertDialogDescription>Banner "{deleteTarget?.title}" sẽ bị xoá vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
