'use client';

import { useEffect, useState, useRef } from 'react';
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
import { Image, Plus, Pencil, Trash2, RefreshCw, Upload, Loader2 } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Banner {
  id: string; title: string; subtitle: string; image_url: string; link_url: string;
  link_text: string; background_color: string; text_color: string;
  display_position: string; sort_order: number;
  is_active: boolean; is_visible: boolean; show_on_miniapp: boolean;
  start_date: string; end_date: string;
}

const emptyBanner: Partial<Banner> = {
  title: '', subtitle: '', image_url: '', link_url: '', link_text: '',
  background_color: '#0d9488', text_color: '#ffffff',
  display_position: 'HERO', sort_order: 1,
  is_active: true, is_visible: true, show_on_miniapp: true,
  start_date: '', end_date: '',
};

export default function MiniAppBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/banners/?page_size=100`, { headers: authHeaders });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setBanners(list);
    } catch { toast.error('Không thể tải banner'); }
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => { setEditing({ ...emptyBanner }); setDialogOpen(true); };
  const openEdit = (b: Banner) => { setEditing({ ...b }); setDialogOpen(true); };

  // ── Upload ảnh lên MinIO ──
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh quá lớn (tối đa 5MB)'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');
      const res = await fetch(`${API}/files/upload/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'Upload failed'); }
      const data = await res.json();
      const imgUrl = data.file_url || data.url || '';
      if (!imgUrl) { toast.error('Không lấy được URL ảnh từ response'); return; }
      setEditing(prev => prev ? { ...prev, image_url: imgUrl } : null);
      toast.success('Tải ảnh lên thành công!');
    } catch (err: any) { toast.error(err.message || 'Tải ảnh lên thất bại'); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title?.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    if (!editing.image_url?.trim()) { toast.error('Vui lòng tải ảnh lên hoặc nhập URL ảnh'); return; }

    setSaving(true);
    try {
      const isNew = !editing.id;
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `${API}/banners/` : `${API}/banners/${editing.id}/`;
      // Clean: convert empty date strings to null
      const payload = { ...editing };
      if (!payload.start_date) payload.start_date = null as any;
      if (!payload.end_date) payload.end_date = null as any;
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
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

  const miniAppBanners = banners.filter(b => b.show_on_miniapp);
  const display = showAll ? banners : miniAppBanners;

  return (
    <div className="space-y-6">
      <AdminHeader title="Banner Mini App"
        description={`${miniAppBanners.length} banner Mini App (${banners.length} tổng). Quản lý banner cho Mini App Zalo — chỉ hiển thị banner có toggle 📱 Mini App được bật.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchBanners}><RefreshCw className="w-4 h-4 mr-1" /> Làm mới</Button>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Tạo banner mới</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">📱 Banner Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{miniAppBanners.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đang active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{miniAppBanners.filter(b => b.is_active).length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng tất cả banner</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-400">{banners.length}</div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={showAll} onCheckedChange={setShowAll} />
          {showAll ? 'Đang hiện tất cả banner (B2B + Mini App)' : 'Chỉ hiện banner Mini App'}
        </label>
      </div>

      {/* Banner Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-16 text-gray-400"><RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" /> Đang tải...</div>
        ) : display.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Image className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có banner Mini App nào</p>
            <p className="text-sm mt-1">Nhấn "Tạo banner mới" để thêm, hoặc bật "Hiện tất cả" để xem banner B2B</p>
          </div>
        ) : display.map(b => (
          <Card key={b.id} className={`overflow-hidden hover:shadow-md transition-shadow ${!b.is_active ? 'opacity-50' : ''} ${!b.show_on_miniapp ? 'border-gray-200' : 'border-teal-300 ring-1 ring-teal-100'}`}>
            <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden relative">
              {b.image_url ? <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" /> : <Image className="w-10 h-10 text-gray-300" />}
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={b.is_active ? 'default' : 'secondary'} className="text-xs">{b.is_active ? 'Active' : 'Inactive'}</Badge>
                {b.show_on_miniapp && <Badge className="text-xs bg-orange-500 text-white">📱 Mini App</Badge>}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="font-semibold text-sm mb-1 line-clamp-1">{b.title || 'Không tiêu đề'}</div>
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
            <DialogTitle>{editing?.id ? 'Sửa banner' : 'Tạo banner Mini App mới'}</DialogTitle>
            <DialogDescription>Upload ảnh banner để hiển thị trên Mini App Zalo (vị trí HERO carousel).</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-1"><Label>Tiêu đề <span className="text-red-500">*</span></Label><Input value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} placeholder="VD: Khuyến mãi hè 2026" /></div>
              <div className="space-y-1"><Label>Phụ đề</Label><Input value={editing.subtitle || ''} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} placeholder="Mô tả ngắn" /></div>

              {/* ── UPLOAD ẢNH ── */}
              <div className="space-y-2">
                <Label>Ảnh banner <span className="text-red-500">*</span></Label>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                {editing.image_url ? (
                  <div className="relative">
                    <img src={editing.image_url} alt="Preview" className="w-full h-40 rounded-lg border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <Button variant="secondary" size="sm" className="absolute bottom-2 right-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload className="w-3 h-3 mr-1" /> Đổi ảnh
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full h-40 border-dashed flex flex-col gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : <Upload className="w-8 h-8 text-gray-400" />}
                    <span className="text-sm text-gray-500">{uploading ? 'Đang tải lên...' : 'Nhấn để chọn ảnh (tối đa 5MB)'}</span>
                  </Button>
                )}
                {/* Fallback: manual URL input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 whitespace-nowrap">hoặc URL:</span>
                  <Input
                    className="flex-1 text-xs h-8"
                    value={editing.image_url || ''}
                    onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                    placeholder="https://minio.banthuocsi.vn/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><Label>Vị trí</Label>
                  <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={editing.display_position || 'HERO'} onChange={e => setEditing({ ...editing, display_position: e.target.value })}>
                    <option value="HERO">HERO (carousel)</option>
                  </select>
                </div>
                <div className="space-y-1"><Label>Thứ tự</Label><Input type="number" value={editing.sort_order || 1} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
                <div className="space-y-1"><Label>Màu nền</Label><div className="flex items-center gap-2"><input type="color" value={editing.background_color || '#0d9488'} onChange={e => setEditing({ ...editing, background_color: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" /><Input value={editing.background_color || '#0d9488'} onChange={e => setEditing({ ...editing, background_color: e.target.value })} className="flex-1 text-xs" /></div></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Ngày bắt đầu</Label><Input type="datetime-local" value={editing.start_date ? editing.start_date.slice(0, 16) : ''} onChange={e => setEditing({ ...editing, start_date: e.target.value ? new Date(e.target.value).toISOString() : '' })} /></div>
                <div className="space-y-1"><Label>Ngày kết thúc</Label><Input type="datetime-local" value={editing.end_date ? editing.end_date.slice(0, 16) : ''} onChange={e => setEditing({ ...editing, end_date: e.target.value ? new Date(e.target.value).toISOString() : '' })} /></div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2"><Switch checked={editing.is_active || false} onCheckedChange={v => setEditing({ ...editing, is_active: v })} /> Active</label>
                <label className="flex items-center gap-2"><Switch checked={editing.show_on_miniapp !== false} onCheckedChange={v => setEditing({ ...editing, show_on_miniapp: v })} /> 📱 Hiện trên Mini App</label>
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
