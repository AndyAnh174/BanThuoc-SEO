'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Package, Search, Smartphone } from 'lucide-react';
import { AdminHeader } from '@/src/features/admin/components/admin-header';
import { toast } from 'sonner';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

interface MiniAppProduct {
  id: string; sku: string; name: string; slug: string;
  price: string; sale_price: string | null; retail_price: string | null;
  current_price: string; stock_quantity: number;
  show_on_miniapp?: boolean;
  category: { name: string };
  manufacturer: { name: string };
  unit: string;
}

export default function MiniAppProductsPage() {
  const [products, setProducts] = useState<MiniAppProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async (searchQuery = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({ page_size: '50', ordering: '-created_at' });
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`${API}/products/?${params}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const data = await res.json();
      setProducts(data.results || []);
      setTotal(data.count || 0);
    } catch {
      toast.error('Không thể tải sản phẩm');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const toggleMiniapp = async (product: MiniAppProduct) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/admin/products/${product.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ show_on_miniapp: !product.show_on_miniapp }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, show_on_miniapp: !p.show_on_miniapp } : p));
        toast.success(`${product.name} ${!product.show_on_miniapp ? 'đã hiện' : 'đã ẩn'} trên Mini App`);
      }
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const updateRetailPrice = async (product: MiniAppProduct, retailPrice: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API}/admin/products/${product.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token || ''}` },
        body: JSON.stringify({ retail_price: retailPrice || null }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, retail_price: retailPrice || null } : p));
        toast.success('Đã cập nhật giá lẻ');
      }
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Sản phẩm Mini App"
        description={`${total} sản phẩm — Quản lý giá bán lẻ và hiển thị trên Mini App Zalo`}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tổng sản phẩm</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Đang hiện Mini App</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-teal-600">{products.filter(p => p.show_on_miniapp).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Có giá lẻ</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{products.filter(p => p.retail_price).length}</div></CardContent>
        </Card>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="Tìm theo tên, SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" variant="outline"><Search className="w-4 h-4 mr-2" />Tìm</Button>
      </form>

      {/* Product Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium">Sản phẩm</th>
                  <th className="text-left p-3 font-medium">Giá sỉ</th>
                  <th className="text-left p-3 font-medium">Giá lẻ (B2C)</th>
                  <th className="text-left p-3 font-medium">Danh mục</th>
                  <th className="text-left p-3 font-medium">Tồn kho</th>
                  <th className="text-center p-3 font-medium">Mini App</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Đang tải...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không có sản phẩm</td></tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-400">SKU: {p.sku}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">{Number(p.price).toLocaleString('vi')}đ</td>
                      <td className="p-3">
                        <input
                          type="number"
                          defaultValue={p.retail_price ? Number(p.retail_price) : ''}
                          placeholder="Nhập giá lẻ"
                          className="w-28 px-2 py-1 border rounded text-sm"
                          onBlur={e => updateRetailPrice(p, e.target.value)}
                        />
                      </td>
                      <td className="p-3 text-gray-500">{p.category?.name}</td>
                      <td className="p-3">
                        <Badge variant={p.stock_quantity > 10 ? 'default' : 'destructive'}>
                          {p.stock_quantity}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Switch
                          checked={p.show_on_miniapp || false}
                          onCheckedChange={() => toggleMiniapp(p)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
