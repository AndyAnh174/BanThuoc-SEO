'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  price: string; sale_price: string | null; retail_price: string | null;
  stock_quantity: number; show_on_miniapp: boolean;
  category: { name: string; slug: string };
  manufacturer: { name: string } | null;
  unit: string;
}

export default function MiniAppProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // For "add" dialog
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMiniApp, setFilterMiniApp] = useState(true);

  // Add product dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  // Edit retail price inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  // Remove confirm
  const [removeTarget, setRemoveTarget] = useState<Product | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ── Fetch Mini App products ──
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

  // ── Fetch all products for "Add to Mini App" dialog ──
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

  // ── Add product to Mini App ──
  const addToMiniApp = async (product: Product) => {
    setAdding(product.id);
    try {
      const res = await fetch(`${API}/admin/products/${product.id}/`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ show_on_miniapp: true }),
      });
      if (res.ok) {
        toast.success(`Đã thêm "${product.name}" vào Mini App`);
        fetchProducts();
      } else toast.error('Thất bại');
    } catch { toast.error('Thất bại'); }
    setAdding(null);
  };

  // ── Remove from Mini App ──
  const removeFromMiniApp = async () => {
    if (!removeTarget) return;
    try {
      const res = await fetch(`${API}/admin/products/${removeTarget.id}/`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ show_on_miniapp: false }),
      });
      if (res.ok) {
        toast.success(`Đã gỡ "${removeTarget.name}" khỏi Mini App`);
        setProducts(prev => prev.filter(p => p.id !== removeTarget.id));
      }
    } catch { toast.error('Thất bại'); }
    setRemoveTarget(null);
  };

  // ── Toggle Mini App ──
  const toggleMiniapp = async (p: Product) => {
    const newVal = !p.show_on_miniapp;
    if (!newVal) { setRemoveTarget(p); return; } // Confirm remove
    try {
      await fetch(`${API}/admin/products/${p.id}/`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ show_on_miniapp: newVal }),
      });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, show_on_miniapp: newVal } : x));
    } catch { toast.error('Cập nhật thất bại'); }
  };

  // ── Save retail price ──
  const saveRetailPrice = async (p: Product) => {
    try {
      await fetch(`${API}/admin/products/${p.id}/`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ retail_price: editPrice || null }),
      });
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, retail_price: editPrice || null } : x));
      toast.success(`Đã cập nhật giá lẻ: ${editPrice ? Number(editPrice).toLocaleString('vi') + 'đ' : 'Xoá'}`);
    } catch { toast.error('Cập nhật thất bại'); }
    setEditingId(null);
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
                  <DialogDescription>Chọn sản phẩm từ danh mục B2B để hiển thị trên Mini App Zalo và thiết lập giá bán lẻ.</DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Tìm sản phẩm..." value={addSearch} onChange={e => { setAddSearch(e.target.value); fetchAllProducts(e.target.value); }} />
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto border rounded-lg">
                  {allProducts.filter(p => !p.show_on_miniapp).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.sku} · {p.category?.name} · Giá sỉ: {Number(p.price).toLocaleString('vi')}đ</div>
                      </div>
                      <Button size="sm" variant="outline" disabled={adding === p.id} onClick={() => addToMiniApp(p)}>
                        {adding === p.id ? '...' : <><Plus className="w-3 h-3 mr-1" /> Thêm</>}
                      </Button>
                    </div>
                  ))}
                  {allProducts.filter(p => !p.show_on_miniapp).length === 0 && (
                    <div className="text-center py-8 text-gray-400">Tất cả sản phẩm đã có trên Mini App hoặc không tìm thấy</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Smartphone className="w-3 h-3" /> Đang hiện Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{miniAppCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đã có giá lẻ</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{products.filter(p => p.retail_price).length}</div></CardContent></Card>
        <Card className="border-red-200 bg-red-50/50"><CardHeader className="pb-2"><CardTitle className="text-sm">⚠️ Chưa có giá lẻ</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-500">{noRetailCount}</div></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <form onSubmit={e => { e.preventDefault(); fetchProducts(); }} className="flex gap-2">
          <Input placeholder="Tìm theo tên, SKU..." value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
          <Button type="submit" variant="outline" size="sm"><Search className="w-4 h-4 mr-1" /> Tìm</Button>
        </form>
        <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={filterMiniApp} onCheckedChange={setFilterMiniApp} /> Chỉ hiện sản phẩm Mini App</label>
      </div>

      {/* Product Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left p-3 font-medium">Sản phẩm</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Danh mục</th>
                  <th className="text-right p-3 font-medium">Giá sỉ</th>
                  <th className="text-right p-3 font-medium">Giá lẻ (B2C)</th>
                  <th className="text-center p-3 font-medium">Tồn</th>
                  <th className="text-center p-3 font-medium">Mini App</th>
                  <th className="text-center p-3 font-medium w-[60px]">Gỡ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400"><RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" /> Đang tải sản phẩm...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Không có sản phẩm nào</p>
                    <p className="text-xs mt-1">Bấm "Thêm vào Mini App" để chọn sản phẩm từ danh mục B2B</p>
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className={`border-b hover:bg-gray-50 transition-colors ${!p.show_on_miniapp ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <div className="font-medium text-gray-900 line-clamp-1 max-w-[250px]">{p.name}</div>
                      <div className="text-xs text-gray-400">SKU: {p.sku}</div>
                      {p.manufacturer && <div className="text-xs text-gray-400">{p.manufacturer.name}</div>}
                    </td>
                    <td className="p-3 text-gray-500 text-xs hidden md:table-cell">{p.category?.name || '—'}</td>
                    <td className="p-3 text-right font-mono text-xs whitespace-nowrap">{Number(p.price).toLocaleString('vi')}đ</td>
                    <td className="p-3 text-right">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="w-28 h-8 text-sm text-right"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') saveRetailPrice(p); if (e.key === 'Escape') setEditingId(null); }}
                          />
                          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => saveRetailPrice(p)}>✓</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 justify-end group cursor-pointer" onClick={() => { setEditingId(p.id); setEditPrice(p.retail_price || ''); }}>
                          <span className={`font-mono text-sm ${p.retail_price ? 'text-orange-600 font-semibold' : 'text-gray-300'}`}>
                            {p.retail_price ? Number(p.retail_price).toLocaleString('vi') + 'đ' : 'Chưa có'}
                          </span>
                          <Pencil className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center"><Badge variant={p.stock_quantity > 10 ? 'default' : 'destructive'}>{p.stock_quantity}</Badge></td>
                    <td className="p-3 text-center">
                      <Switch checked={p.show_on_miniapp} onCheckedChange={() => toggleMiniapp(p)} />
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

      {/* Remove confirmation */}
      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gỡ khỏi Mini App?</AlertDialogTitle>
            <AlertDialogDescription>
              Sản phẩm <b>"{removeTarget?.name}"</b> sẽ không còn hiển thị trên Mini App Zalo nữa. Sản phẩm vẫn tồn tại trong hệ thống B2B.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={removeFromMiniApp} className="bg-red-600 hover:bg-red-700">Gỡ khỏi Mini App</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
