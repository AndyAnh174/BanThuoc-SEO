'use client';

import { useState, useEffect } from 'react';
import { useFlashSaleStore } from '../../stores/flash-sale.store';
import { useProductsStore } from '../../stores/products.store';
import { FlashSaleSession, FlashSaleItem } from '../../types/flash-sale.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Save, Edit } from 'lucide-react';
import { toast } from 'sonner';

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
            fetchProducts(); // Load all products for selection
        }
    }, [session.id]);

    const items = currentSession?.items || [];

    const handleAddItem = async () => {
        if (!selectedProductId) return toast.error('Vui lòng chọn sản phẩm');
        if (newItemPrice <= 0) return toast.error('Giá phải lớn hơn 0');

        try {
            await addItems(session.id, [{
                product: selectedProductId,
                flash_sale_price: newItemPrice,
                total_quantity: newItemQuantity,
                max_per_user: newItemMaxPerUser
            }]);
            setIsAddOpen(false);
            resetAddForm();
        } catch (e) {}
    };

    const resetAddForm = () => {
        setSelectedProductId('');
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
    };

    // Filter out products already in session
    const availableProducts = products.filter(p => !items.find(i => i.product === p.id));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Danh sách sản phẩm ({items.length})</h3>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm sản phẩm vào Flash Sale</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Chọn sản phẩm</Label>
                                <Select onValueChange={(val) => {
                                    setSelectedProductId(val);
                                    const p = products.find(prod => prod.id === val);
                                    if(p) setNewItemPrice(Math.floor(Number(p.price) * 0.9)); // Default 10% off
                                }} value={selectedProductId}>
                                    <SelectTrigger><SelectValue placeholder="Tìm sản phẩm..." /></SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {availableProducts.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name} - Giá gốc: {formatCurrency(p.price)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Giá Sale (VNĐ)</Label>
                                    <Input type="number" value={newItemPrice} onChange={e => setNewItemPrice(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số lượng bán</Label>
                                    <Input type="number" value={newItemQuantity} onChange={e => setNewItemQuantity(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max / Khách</Label>
                                    <Input type="number" value={newItemMaxPerUser} onChange={e => setNewItemMaxPerUser(Number(e.target.value))} />
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleAddItem}>Thêm ngay</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>Giá gốc</TableHead>
                            <TableHead>Giá Sale</TableHead>
                            <TableHead>Số lượng</TableHead>
                            <TableHead>Max/User</TableHead>
                            <TableHead>Đã bán</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {/* @ts-ignore */}
                                    {item.product_details?.name || item.product || 'Unknown Product'}
                                </TableCell>
                                <TableCell>{formatCurrency(item.original_price)}</TableCell>
                                <TableCell>
                                    {editingItem === item.id ? (
                                        <Input 
                                            type="number" 
                                            className="w-24 h-8"
                                            value={editValues.flash_sale_price} 
                                            onChange={e => setEditValues({...editValues, flash_sale_price: Number(e.target.value)})} 
                                        />
                                    ) : (
                                        <span className="text-red-500 font-bold">{formatCurrency(item.flash_sale_price)}</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingItem === item.id ? (
                                        <Input 
                                            type="number" 
                                            className="w-20 h-8"
                                            value={editValues.total_quantity} 
                                            onChange={e => setEditValues({...editValues, total_quantity: Number(e.target.value)})} 
                                        />
                                    ) : (
                                        item.total_quantity
                                    )}
                                </TableCell>
                                <TableCell>
                                     {editingItem === item.id ? (
                                        <Input 
                                            type="number" 
                                            className="w-16 h-8"
                                            value={editValues.max_per_user} 
                                            onChange={e => setEditValues({...editValues, max_per_user: Number(e.target.value)})} 
                                        />
                                    ) : (
                                        item.max_per_user
                                    )}
                                </TableCell>
                                <TableCell>{item.sold_quantity}</TableCell>
                                <TableCell className="text-right">
                                    {editingItem === item.id ? (
                                        <Button size="sm" variant="ghost" className="text-green-500" onClick={() => saveEdit(item.id)}>
                                            <Save className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                         {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24">Chưa có sản phẩm nào trong đợt Sale này.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
