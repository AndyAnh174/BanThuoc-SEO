'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Smartphone, Plus, Pencil, Trash2, RefreshCw, Package } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Product {
  id: string; sku: string; name: string; slug: string;
  short_description: string; description: string;
  price: string; sale_price: string | null; retail_price: string | null;
  stock_quantity: number; show_on_miniapp: boolean;
  category: { id: string; name: string; slug: string };
  manufacturer: { id: string; name: string } | null;
  unit: string;
}

const emptyEdit = { name: '', short_description: '', retail_price: '', unit: 'Hộp' };

export default function MiniAppProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMiniApp, setFilterMiniApp] = useState(true);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  // Remove confirm (only via trash icon)
  const [removeTarget, setRemoveTarget] = useState<Product | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page_size: '200', ordering: '-created_at' });
      if (search) params.set('search', search);
      if (filterMiniApp) params.set('show_on_miniapp', 'true');
      const res = await fetch(`${API}/products/?${params}`, { headers });
      const data = await res.json();
      setProducts(data.results || []);
    } catch { toast.error('Không thể tải sản phẩm'); }
    setLoading(false);
  }, [search, filterMiniApp]);

  const fetchAllProducts = useCallback(async (q = '') => {
    try {
      const params = new URLSearchParams({ page_size: '50', ordering: '-created_at' });
      if (q) params.set('search', q);
      const res = await fetch(`${API}/products/?${params}`, { headers });
      const data = await res.json();
      setAllProducts(data.results || []);
    } catch {}
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Add to Mini App ──
  const addToMiniApp = async (product: Product) => {
    setAdding(product.id);
    try {
      const res = await fetch(`${API}/admin/products/${product.id}/`, {
        method: 'PATCH', headers, body: JSON.stringify({ show_on_miniapp: true }),
      });
      if (res.ok) { toast.success(`Đã thêm "${product.name}"`); fetchProducts(); }
      else toast.error('Thất bại');
    } catch { toast.error('Thất bại'); }
    setAdding(null);
  };

  // ── Toggle show on Mini App (no confirm on OFF) ──
  const toggleMiniapp = async (p: Product) => {
    const newVal = !p.show_on_miniapp;
    try {
      await fetch(`${API}/admin/products/${p.id}/`, {
        method: 'PATCH', headers, body: JSON.stringify({ show_on_miniapp: newVal }),
      });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, show_on_miniapp: newVal } : x));
    } catch { toast.error('Cập nhật thất bại'); }
  };

  // ── Remove from Mini App (trash icon → confirm) ──
  const removeFromMiniApp = async () => {
    if (!removeTarget) return;
    try {
      await fetch(`${API}/admin/products/${removeTarget.id}/`, {
        method: 'PATCH', headers, body: JSON.stringify({ show_on_miniapp: false }),
      });
      toast.success(`Đã gỡ "${removeTarget.name}"`);
      setProducts(prev => prev.filter(p => p.id !== removeTarget.id));
      if (editProduct?.id === removeTarget.id) { setEditOpen(false); setEditProduct(null); }
    } catch { toast.error('Thất bại'); }
    setRemoveTarget(null);
  };

  // ── Open edit dialog ──
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditForm({
      name: p.name,
      short_description: p.short_description || '',
      retail_price: p.retail_price || '',
      unit: p.unit || 'Hộp',
    });
    setEditOpen(true);
  };

  // ── Save edited product ──
  const saveEdit = async () => {
    if (!editProduct) return;
    setSaving(true);
    try {
      const body: any = {
        name: editForm.name,
        short_description: editForm.short_description,
        retail_price: editForm.retail_price || null,
        unit: editForm.unit,
      };
      const res = await fetch(`${API}/admin/products/${editProduct.id}/`, {
        method: 'PATCH', headers, body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(`Đã cập nhật "${editForm.name}"`);
        setEditOpen(false);
        fetchProducts();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(Object.values(err).flat().join(', ') || 'Lưu thất bại');
      }
    } catch { toast.error('Lưu thất bại'); }
    setSaving(false);
  };

  const miniAppCount = products.filter(p => p.show_on_miniapp).length;
  const noRetailCount = products.filter(p => p.show_on_miniapp && !p.retail_price).length;

  return (
    <div className="space-y-6">
      <AdminHeader title="Sản phẩm Mini App"
        description={`${products.length} sản phẩm · ${miniAppCount} trên Mini App · ${noRetailCount} chưa có giá lẻ`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchProducts}><RefreshCw className="w-4 h-4 mr-1" /> Làm mới</Button>
            <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (v) fetchAllProducts(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700"><Plus className="w-4 h-4 mr-1" /> Thêm vào Mini App</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Thêm sản phẩm vào Mini App</DialogTitle>
                  <DialogDescription>Chọn sản phẩm từ danh mục B2B để hiển thị trên Mini App Zalo.</DialogDescription>
                </DialogHeader>
                <Input placeholder="Tìm sản phẩm..." value={addSearch} onChange={e => { setAddSearch(e.target.value); fetchAllProducts(e.target.value); }} className="mb-4" />
                <div className="space-y-1 max-h-[400px] overflow-y-auto border rounded-lg">
                  {allProducts.filter(p => !p.show_on_miniapp).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.sku} · {p.category?.name}</div>
                      </div>
                      <Button size="sm" variant="outline" disabled={adding === p.id} onClick={() => addToMiniApp(p)}>
                        {adding === p.id ? '...' : <><Plus className="w-3 h-3 mr-1" /> Thêm</>}
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Smartphone className="w-3 h-3" /> Đang hiện</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{miniAppCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đã có giá lẻ</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{products.filter(p => p.retail_price).length}</div></CardContent></Card>
        <Card className="border-red-200 bg-red-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">Chưa có giá lẻ</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-500">{noRetailCount}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <form onSubmit={e => { e.preventDefault(); fetchProducts(); }} className="flex gap-2">
          <Input placeholder="Tìm theo tên, SKU..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
          <Button type="submit" variant="outline" size="sm"><Search className="w-4 h-4 mr-1" /> Tìm</Button>
        </form>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={filterMiniApp} onCheckedChange={setFilterMiniApp} /> Chỉ hiện sản phẩm Mini App</label>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left p-3 font-medium">Sản phẩm</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Danh mục</th>
                  <th className="text-right p-3 font-medium">Giá sỉ</th>
                  <th className="text-right p-3 font-medium">Giá lẻ</th>
                  <th className="text-center p-3 font-medium">Mini App</th>
                  <th className="text-center p-3 font-medium w-[80px]">Sửa</th>
                  <th className="text-center p-3 font-medium w-[60px]">Gỡ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400"><RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" /></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Không có sản phẩm</p>
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className={`border-b hover:bg-gray-50 transition-colors ${!p.show_on_miniapp ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <div className="font-medium text-gray-900 line-clamp-1 max-w-[220px]">{p.name}</div>
                      <div className="text-xs text-gray-400">SKU: {p.sku}{p.manufacturer ? ` · ${p.manufacturer.name}` : ''}</div>
                    </td>
                    <td className="p-3 text-gray-500 text-xs hidden md:table-cell">{p.category?.name || '—'}</td>
                    <td className="p-3 text-right font-mono text-xs whitespace-nowrap">{Number(p.price).toLocaleString('vi')}đ</td>
                    <td className="p-3 text-right">
                      <span className={`font-mono text-sm ${p.retail_price ? 'text-orange-600 font-semibold' : 'text-gray-300'}`}>
                        {p.retail_price ? Number(p.retail_price).toLocaleString('vi') + 'đ' : '—'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Switch checked={p.show_on_miniapp} onCheckedChange={() => toggleMiniapp(p)} />
                    </td>
                    <td className="p-3 text-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500" onClick={() => openEdit(p)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </td>
                    <td className="p-3 text-center">
                      {p.show_on_miniapp && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => setRemoveTarget(p)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Product Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa sản phẩm</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin sản phẩm cho Mini App. SKU: {editProduct?.sku}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Tên sản phẩm</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Mô tả ngắn</Label>
              <Textarea rows={3} value={editForm.short_description} onChange={e => setEditForm({ ...editForm, short_description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Giá lẻ (B2C)</Label>
                <Input type="number" value={editForm.retail_price} onChange={e => setEditForm({ ...editForm, retail_price: e.target.value })} placeholder="VNĐ" />
              </div>
              <div className="space-y-1">
                <Label>Đơn vị</Label>
                <Input value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })} placeholder="Hộp, Chai, Tuýp..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Huỷ</Button>
            <Button onClick={saveEdit} disabled={saving} className="bg-teal-600 hover:bg-teal-700">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation (only for trash icon) */}
      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gỡ khỏi Mini App?</AlertDialogTitle>
            <AlertDialogDescription>
              <b>{removeTarget?.name}</b> sẽ không còn hiển thị trên Mini App. Sản phẩm vẫn tồn tại trong B2B.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={removeFromMiniApp} className="bg-red-600 hover:bg-red-700">Gỡ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
