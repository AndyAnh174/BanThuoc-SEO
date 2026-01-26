'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFlashSaleStore } from '../../stores/flash-sale.store';
import { useProductsStore } from '../../stores/products.store';
import { FlashSaleSession, FlashSaleItem } from '../../types/flash-sale.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save, Edit, Search, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

interface FlashSaleProductsProps {
    session: FlashSaleSession;
}

export const FlashSaleProducts = ({ session }: FlashSaleProductsProps) => {
    const { currentSession, fetchSessionDetail, addItems, updateItem, deleteItem } = useFlashSaleStore();
    const { products, fetchProducts } = useProductsStore();
    
    // Add Item State
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [newItemPrice, setNewItemPrice] = useState<number>(0);
    const [newItemQuantity, setNewItemQuantity] = useState<number>(10);
    const [newItemMaxPerUser, setNewItemMaxPerUser] = useState<number>(1);
    
    // Editing Item State (Inline)
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    useEffect(() => {
        if (session.id) {
            fetchSessionDetail(session.id);
            fetchProducts();
        }
    }, [session.id]);

    const items = currentSession?.items || [];

    // Filter products: Exclude added ones AND match search term
    const availableProducts = useMemo(() => {
        return products.filter(p => !items.find(i => i.product === p.id)).filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, items, searchTerm]);

    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

    const handleSelectProduct = (product: any) => {
        setSelectedProductId(product.id);
        const suggestedPrice = Math.floor(Number(product.price) * 0.9); // Default 10% off
        setNewItemPrice(suggestedPrice);
    };

    const handleAddItem = async () => {
        if (!selectedProductId) return toast.error('Vui lòng chọn sản phẩm');
        if (newItemPrice <= 0) return toast.error('Giá phải lớn hơn 0');
        
        // Validation check vs original
        if (selectedProduct && newItemPrice >= selectedProduct.price) {
           if (!confirm('Cảnh báo: Giá Sale đang cao hơn hoặc bằng giá gốc. Bạn có chắc chắn muốn thêm?')) return;
        }

        try {
            await addItems(session.id, [{
                product: selectedProductId,
                flash_sale_price: newItemPrice,
                total_quantity: newItemQuantity,
                max_per_user: newItemMaxPerUser
            }]);
            
            toast.success('Đã thêm sản phẩm vào Flash Sale');
            // Don't close immediately if user wants to add more? 
            // Better UX: Reset form but keep modal open or close it? 
            // Let's close for now to see result.
            setIsAddOpen(false);
            resetAddForm();
        } catch (e) {}
    };

    const resetAddForm = () => {
        setSelectedProductId('');
        setSearchTerm('');
        setNewItemPrice(0);
        setNewItemQuantity(10);
        setNewItemMaxPerUser(1);
    };

    const startEdit = (item: FlashSaleItem) => {
        setEditingItem(item.id);
        setEditValues({
            flash_sale_price: item.flash_sale_price,
            total_quantity: item.total_quantity,
            max_per_user: item.max_per_user
        });
    };

    const saveEdit = async (itemId: string) => {
        await updateItem(itemId, editValues);
        setEditingItem(null);
        toast.success('Đã cập nhật sản phẩm');
    };

    // Calculate discount percent helper
    const getDiscountPercent = (original: number, sale: number) => {
        if (!original) return 0;
        return Math.round(((original - sale) / original) * 100);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Danh sách sản phẩm</h3>
                    <p className="text-sm text-gray-500">Quản lý các sản phẩm trong đợt Sale này</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) resetAddForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Thêm sản phẩm vào Flash Sale</DialogTitle>
                            <DialogDescription>
                                Chọn sản phẩm từ danh sách và thiết lập giá giảm
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex gap-6 py-4 flex-1 overflow-hidden">
                            {/* Left: Product Selection */}
                            <div className="w-1/2 flex flex-col gap-2 border-r pr-4">
                                <Label>Tìm sản phẩm</Label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Tên hoặc SKU..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto border rounded-md mt-2">
                                    {availableProducts.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            Không tìm thấy sản phẩm nào
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {availableProducts.map(p => (
                                                <div 
                                                    key={p.id}
                                                    onClick={() => handleSelectProduct(p)}
                                                    className={cn(
                                                        "p-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between",
                                                        selectedProductId === p.id && "bg-blue-50 border-l-4 border-blue-500"
                                                    )}
                                                >
                                                    <div className="truncate">
                                                        <div className="font-medium truncate text-sm" title={p.name}>{p.name}</div>
                                                        <div className="text-xs text-gray-500">{p.sku} | Giá gốc: {formatCurrency(p.price)}</div>
                                                    </div>
                                                    {selectedProductId === p.id && <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Settings */}
                            <div className="w-1/2 flex flex-col gap-4 pl-2 font-medium">
                                {selectedProduct ? (
                                    <>
                                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-2">
                                            <div className="text-xs text-blue-600 mb-1">Đang chọn:</div>
                                            <div className="font-bold text-sm line-clamp-2">{selectedProduct.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">Giá gốc: {formatCurrency(selectedProduct.price)}</div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <Label>Giá Flash Sale (VNĐ)</Label>
                                                <div className="relative">
                                                     <Input 
                                                        type="number" 
                                                        value={newItemPrice} 
                                                        onChange={e => setNewItemPrice(Number(e.target.value))}
                                                        className="font-bold text-red-600"
                                                    />
                                                    <div className="absolute right-2 top-2 text-xs font-bold text-red-500 bg-red-100 px-1 rounded">
                                                        -{getDiscountPercent(selectedProduct.price, newItemPrice)}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label>Số lượng bán</Label>
                                                    <Input type="number" value={newItemQuantity} onChange={e => setNewItemQuantity(Number(e.target.value))} />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>Max / Khách</Label>
                                                    <Input type="number" value={newItemMaxPerUser} onChange={e => setNewItemMaxPerUser(Number(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed rounded-md bg-gray-50">
                                        <Search className="h-8 w-8 mb-2 opacity-20" />
                                        <p className="text-sm">Vui lòng chọn sản phẩm bên trái</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                            <Button onClick={handleAddItem} disabled={!selectedProductId} className="bg-green-600 hover:bg-green-700">
                                Xác nhận thêm
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[300px] whitespace-normal">Sản phẩm</TableHead>
                            <TableHead className="text-right">Giá gốc</TableHead>
                            <TableHead className="text-right">Giá Flash Sale</TableHead>
                            <TableHead className="text-right">Giới hạn</TableHead>
                            <TableHead className="text-center">Tiến độ</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id} className="hover:bg-gray-50/50">
                                <TableCell className="whitespace-normal">
                                    <div className="flex flex-col">
                                        {/* @ts-ignore */}
                                        <span className="font-medium text-gray-900 line-clamp-1" title={item.product_details?.name}>
                                            {/* @ts-ignore */}
                                            {item.product_details?.name || item.product}
                                        </span>
                                        {/* @ts-ignore */}
                                        <span className="text-xs text-gray-500">SKU: {item.product_details?.sku}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-gray-500 font-medium">
                                    {formatCurrency(item.original_price)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingItem === item.id ? (
                                        <div className="flex justify-end">
                                            <Input 
                                                type="number" 
                                                className="w-28 h-8 text-right font-bold text-red-600"
                                                value={editValues.flash_sale_price} 
                                                onChange={e => setEditValues({...editValues, flash_sale_price: Number(e.target.value)})} 
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <span className="text-red-600 font-bold">{formatCurrency(item.flash_sale_price)}</span>
                                            <span className="text-xs bg-red-100 text-red-600 px-1 rounded">
                                                -{getDiscountPercent(item.original_price, item.flash_sale_price)}%
                                            </span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingItem === item.id ? (
                                        <div className="flex flex-col gap-1 items-end">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-gray-500">Qty:</span>
                                                <Input 
                                                    type="number" className="w-16 h-7 text-right"
                                                    value={editValues.total_quantity} 
                                                    onChange={e => setEditValues({...editValues, total_quantity: Number(e.target.value)})} 
                                                />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-gray-500">Max:</span>
                                                <Input 
                                                    type="number" className="w-16 h-7 text-right"
                                                    value={editValues.max_per_user} 
                                                    onChange={e => setEditValues({...editValues, max_per_user: Number(e.target.value)})} 
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end text-sm">
                                            <span>Tổng: {item.total_quantity}</span>
                                            <span className="text-xs text-gray-500">Max/khách: {item.max_per_user}</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="w-full max-w-[100px] mx-auto">
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-green-500" 
                                                style={{ width: `${Math.min((item.sold_quantity / item.total_quantity) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            Đã bán: {item.sold_quantity}/{item.total_quantity}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingItem === item.id ? (
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-50" onClick={() => saveEdit(item.id)}>
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:bg-gray-100" onClick={() => setEditingItem(null)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-50 text-blue-500" onClick={() => startEdit(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 text-red-500" onClick={() => deleteItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                         {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-32 flex flex-col items-center justify-center text-gray-400">
                                    <span>Chưa có sản phẩm nào</span>
                                    <Button variant="link" onClick={() => setIsAddOpen(true)}>Thêm ngay</Button>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
