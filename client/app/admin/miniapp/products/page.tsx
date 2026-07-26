'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Smartphone } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface Product {
  id: string; sku: string; name: string; slug: string;
  price: string; sale_price: string | null; retail_price: string | null;
  stock_quantity: number; show_on_miniapp: boolean;
  category: { name: string }; manufacturer: { name: string }; unit: string;
}

export default function MiniAppProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMiniApp, setFilterMiniApp] = useState(true);

  const fetchProducts = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ page_size: '100' });
      if (searchQuery) params.set('search', searchQuery);
      if (filterMiniApp) params.set('show_on_miniapp', 'true');
      const res = await fetch(`${API}/products/?${params}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const data = await res.json();
      setProducts(data.results || []);
    } catch { toast.error('Không thể tải sản phẩm'); }
    setLoading(false);
  }, [filterMiniApp]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleMiniapp = async (p: Product) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API}/admin/products/${p.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify({ show_on_miniapp: !p.show_on_miniapp }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, show_on_miniapp: !x.show_on_miniapp } : x));
      toast.success(`${p.name}: ${!p.show_on_miniapp ? 'Hiện' : 'Ẩn'} trên Mini App`);
    } else toast.error('Cập nhật thất bại');
  };

  const updateRetailPrice = async (p: Product, val: string) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${API}/admin/products/${p.id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
      body: JSON.stringify({ retail_price: val || null }),
    });
    if (res.ok) {
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, retail_price: val || null } : x));
    }
  };

  const miniAppProducts = products.filter(p => p.show_on_miniapp);
  const withRetailPrice = products.filter(p => p.retail_price);

  return (
    <div className="space-y-6">
      <AdminHeader title="Sản phẩm Mini App" description="Quản lý giá bán LẺ và hiển thị sản phẩm trên Zalo Mini App. Giá lẻ (B2C) khác với giá sỉ (B2B) trên web." />

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Tổng sản phẩm</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{products.length}</div></CardContent></Card>
        <Card className="border-teal-200 bg-teal-50"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Smartphone className="w-3 h-3" /> Đang hiện Mini App</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-teal-600">{miniAppProducts.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Đã có giá lẻ</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{withRetailPrice.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Chưa có giá lẻ</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-500">{miniAppProducts.filter(p => !p.retail_price).length}</div></CardContent></Card>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={e => { e.preventDefault(); fetchProducts(search); }} className="flex gap-2 flex-1">
          <Input placeholder="Tìm theo tên, SKU..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
          <Button type="submit" variant="outline" size="sm"><Search className="w-4 h-4 mr-1" /> Tìm</Button>
        </form>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={filterMiniApp} onCheckedChange={setFilterMiniApp} />
          Chỉ hiện sản phẩm Mini App
        </label>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="text-left p-3 font-medium w-[30%]">Sản phẩm</th>
                  <th className="text-left p-3 font-medium">Danh mục</th>
                  <th className="text-right p-3 font-medium">Giá sỉ (B2B)</th>
                  <th className="text-right p-3 font-medium">Giá lẻ (B2C)</th>
                  <th className="text-center p-3 font-medium">Tồn</th>
                  <th className="text-center p-3 font-medium">Mini App</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có sản phẩm nào</td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-gray-900 line-clamp-1">{p.name}</div>
                      <div className="text-xs text-gray-400">SKU: {p.sku} — {p.manufacturer?.name || 'N/A'}</div>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">{p.category?.name || '—'}</td>
                    <td className="p-3 text-right font-mono text-xs whitespace-nowrap">{Number(p.price).toLocaleString('vi')}đ</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        defaultValue={p.retail_price ? Number(p.retail_price) : ''}
                        placeholder="Chưa có"
                        className="w-28 px-2 py-1.5 border rounded text-sm text-right font-mono focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                        onBlur={e => { if (e.target.value !== (p.retail_price || '')) updateRetailPrice(p, e.target.value); }}
                      />
                    </td>
                    <td className="p-3 text-center"><Badge variant={p.stock_quantity > 10 ? 'default' : 'destructive'}>{p.stock_quantity}</Badge></td>
                    <td className="p-3 text-center"><Switch checked={p.show_on_miniapp} onCheckedChange={() => toggleMiniapp(p)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
