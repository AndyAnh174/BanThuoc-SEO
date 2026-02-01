'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, GripVertical, ImagePlus, Eye, EyeOff } from 'lucide-react';
import { ImageUpload } from './image-upload';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  link_text: string;
  background_color: string;
  text_color: string;
  sort_order: number;
  is_active: boolean;
  is_visible: boolean;
  start_date: string | null;
  end_date: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchBanners(token: string): Promise<any> {
  const res = await fetch(`${API_URL}/banners/?t=${new Date().getTime()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch banners');
  return res.json();
}

// Helper to convert UTC string to "YYYY-MM-DDTHH:mm" local time for input
function toLocalDatetimeString(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function createBanner(token: string, data: Partial<Banner>): Promise<Banner> {
  const res = await fetch(`${API_URL}/banners/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create banner');
  return res.json();
}

async function updateBanner(token: string, id: string, data: Partial<Banner>): Promise<Banner> {
  const res = await fetch(`${API_URL}/banners/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update banner');
  return res.json();
}

async function deleteBanner(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/banners/${id}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete banner');
}

interface BannerManagerProps {
  token: string;
}

export function BannerManager({ token }: BannerManagerProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    link_text: 'Xem ngay',
    background_color: '#16a34a',
    text_color: '#ffffff',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setLoading(true);
      const data = await fetchBanners(token);
      // Handle standardized DRF pagination { count, next, previous, results: [] }
      if (data && Array.isArray(data.results)) {
        setBanners(data.results);
      } else if (Array.isArray(data)) {
        setBanners(data);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      link_text: 'Xem ngay',
      background_color: '#16a34a',
      text_color: '#ffffff',
      is_active: true,
      start_date: '',
      end_date: '',
    });
    setModalOpen(true);
  }

  function openEditModal(banner: Banner) {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
      link_text: banner.link_text || 'Xem ngay',
      background_color: banner.background_color || '#16a34a',
      text_color: banner.text_color || '#ffffff',
      is_active: banner.is_active,
      start_date: banner.start_date ? toLocalDatetimeString(banner.start_date) : '',
      end_date: banner.end_date ? toLocalDatetimeString(banner.end_date) : '',
    });
    setModalOpen(true);
  }

  async function handleSave() {
    try {
      setSaving(true);
      
      // Convert local datetime input back to UTC ISO string for API
      const payload = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (editingBanner) {
        await updateBanner(token, editingBanner.id, payload);
      } else {
        await createBanner(token, payload);
      }

      await loadBanners();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving banner:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBanner(token, id);
      await loadBanners();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  }

  async function toggleActive(banner: Banner) {
    try {
      await updateBanner(token, banner.id, { is_active: !banner.is_active });
      await loadBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Banner</h2>
          <p className="text-gray-500">Quản lý các banner hiển thị trên trang chủ</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Banner
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tên Banner (Admin)</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="w-24">Trạng thái</TableHead>
              <TableHead className="w-32">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Chưa có banner nào. Nhấn "Thêm Banner" để tạo mới.
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                  </TableCell>
                  <TableCell>
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded flex items-center justify-center"
                        style={{ backgroundColor: banner.background_color }}
                      >
                        <ImagePlus className="w-5 h-5 text-white/50" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{banner.title}</div>
                  </TableCell>
                  <TableCell>
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {banner.link_text}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => toggleActive(banner)}
                      />
                      {banner.is_visible ? (
                        <Badge variant="default" className="bg-green-100 text-green-700">
                          <Eye className="w-3 h-3 mr-1" />
                          Hiển thị
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Ẩn
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(banner)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteConfirm(banner.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin banner để hiển thị trên trang chủ
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Preview */}
            <div
              className="rounded-lg p-6 min-h-[120px] flex items-center justify-center border bg-gray-50"
            >
              <p className="text-sm text-gray-500">
                {formData.image_url ? 'Ảnh banner đã chọn' : 'Chưa có ảnh'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tên Banner (Quản lý nội bộ) *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tên banner để quản lý"
                />
              </div>

              {/* Explicitly hide unused fields but keep in state if needed or just ignore */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">Link đích</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="/products hoặc https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh banner</Label>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="banners"
              />
            </div>



            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Ngày bắt đầu (tùy chọn)</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Ngày kết thúc (tùy chọn)</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Kích hoạt banner</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving || !formData.title}>
              {saving ? 'Đang lưu...' : editingBanner ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa banner này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BannerManager;
