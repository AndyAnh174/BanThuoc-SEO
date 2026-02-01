"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/src/features/cart/stores/cart.store";
import { formatCurrency } from "@/lib/utils";
import MainLayout from "@/src/features/layout/components/MainLayout";

import { ProductCard, getProducts, type Product } from '@/src/features/products';

export default function CartPage() {
    const { cart, isLoading, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
    const router = useRouter();
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                // Fetch random or popular products. Using default sort for now.
                const res = await getProducts({ page_size: 4 });
                if (res.data?.results) {
                    setRelatedProducts(res.data.results);
                }
            } catch (error) {
                console.error("Failed to fetch related products", error);
            }
        };
        fetchRelated();
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleQuantityChange = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        await updateItem(itemId, newQuantity);
    };

    if (isLoading && !cart) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </MainLayout>
        );
    }

    const isEmpty = !cart || cart.items.length === 0;

    return (
        <MainLayout>
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 mb-6">
                        <Link href="/" className="text-gray-500 hover:text-primary transition-colors">
                            Trang chủ
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="font-semibold text-gray-900">Giỏ hàng</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-primary" />
                        Giỏ hàng của bạn
                        {cart?.total_items ? (
                            <span className="text-lg font-normal text-gray-500">
                                ({cart.total_items} sản phẩm)
                            </span>
                        ) : null}
                    </h1>

                    {isEmpty ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Giỏ hàng trống
                            </h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. 
                                Hãy dạo qua cửa hàng để tìm những sản phẩm ưng ý nhé.
                            </p>
                            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                                <Link href="/products">
                                    Tiếp tục mua sắm
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Sản phẩm</th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Đơn giá</th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Số lượng</th>
                                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Thành tiền</th>
                                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {cart!.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-16 h-16 shrink-0 rounded-lg border border-gray-100 bg-white p-1">
                                                                    {item.product.primary_image?.image_url ? (
                                                                         <Image 
                                                                            src={item.product.primary_image.image_url} 
                                                                            alt={item.product.name}
                                                                            width={64}
                                                                            height={64}
                                                                            className="w-full h-full object-contain rounded-md"
                                                                         />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-md text-gray-300">
                                                                            <ShoppingBag className="w-6 h-6" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <Link 
                                                                        href={`/products/${item.product.slug}`}
                                                                        className="font-medium text-gray-900 hover:text-primary line-clamp-2 block max-w-[200px]"
                                                                    >
                                                                        {item.product.name}
                                                                    </Link>
                                                                    {item.product.manufacturer && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {item.product.manufacturer.name}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center text-sm font-medium text-gray-900 whitespace-nowrap">
                                                            {formatCurrency(Number(item.product.price))}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </Button>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.quantity}
                                                                    onChange={(e) => {
                                                                        const val = parseInt(e.target.value);
                                                                        if (val > 0) handleQuantityChange(item.id, val);
                                                                    }}
                                                                    className="w-12 h-8 text-center px-1 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="icon"
                                                                    className="h-8 w-8 rounded-full"
                                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-sm font-bold text-primary whitespace-nowrap">
                                                            {formatCurrency(Number(item.total_price))}
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                                                                onClick={() => removeItem(item.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <Button 
                                            variant="outline" 
                                            className="text-gray-600 hover:text-primary"
                                            asChild
                                        >
                                            <Link href="/products">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Tiếp tục mua sắm
                                            </Link>
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
                                                    clearCart();
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Xóa tất cả
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Summary */}
                            <div className="lg:col-span-1">
                                <Card className="shadow-sm sticky top-24 border-0 ring-1 ring-gray-100">
                                    <CardHeader className="pb-4 border-b border-gray-50">
                                        <CardTitle className="text-lg">Tổng đơn hàng</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tạm tính:</span>
                                            <span className="font-medium">{formatCurrency(cart!.items.reduce((total, item) => total + (item.product.price * item.quantity), 0))}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Giảm giá:</span>
                                            <span className="font-medium text-green-600">
                                                -{formatCurrency(cart!.items.reduce((total, item) => total + (item.product.price * item.quantity), 0) - Number(cart!.total_price))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Thuế (VAT):</span>
                                            <span className="font-medium">Đã bao gồm</span>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="flex justify-between items-end">
                                            <span className="font-semibold text-gray-900">Tổng cộng:</span>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-primary">
                                                    {formatCurrency(Number(cart!.total_price))}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">(Đã bao gồm VAT nếu có)</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex-col gap-3 pt-2">
                                        <Button className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl" asChild>
                                            <Link href="/checkout">
                                                Tiến hành đặt hàng
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2">
                                            <ShoppingBag className="w-3 h-3" />
                                            Đảm bảo 100% thuốc chính hãng
                                        </div>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    )}
                    
                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16 border-t border-gray-200 pt-16">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="bg-primary/10 p-2 rounded-lg">
                                    <ShoppingBag className="w-5 h-5 text-primary" />
                                </span>
                                Có thể bạn cũng thích
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {relatedProducts.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        id={product.id}
                                        name={product.name}
                                        slug={product.slug}
                                        price={product.price}
                                        salePrice={product.salePrice}
                                        imageUrl={product.imageUrl || undefined}
                                        category={product.category}
                                        manufacturer={product.manufacturer}
                                        unit={product.unit}
                                        stockQuantity={product.stockQuantity}
                                        requiresPrescription={product.requiresPrescription}
                                        isFeatured={product.isFeatured}
                                        rating={product.rating}
                                        reviewCount={product.reviewCount}
                                        short_description={product.shortDescription}
                                        quantity_per_unit={product.quantityPerUnit}
                                        isLiked={product.isLiked}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
