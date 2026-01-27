'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getCategories } from '@/src/features/products';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Phone,
  MapPin,
  ChevronDown,
  Heart,
  Pill,
} from 'lucide-react';
import { useCartStore } from '@/src/features/cart/stores/cart.store';
import { useAuthStore } from '@/src/features/auth/stores/auth.store';
import { UserDropdownMenu } from './UserDropdownMenu';
import { CartHoverContent } from '@/src/features/cart/components/CartHoverContent';

interface HeaderProps {
  cartItemCount?: number; // Kept for backward compat but preferred store
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  children?: Category[];
}

export function Header({ cartItemCount: initialCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { cart, fetchCart } = useCartStore();
  const { checkAuth } = useAuthStore();
  const displayCount = cart ? cart.total_items : initialCount;

  React.useEffect(() => {
    async function initData() {
        try {
            checkAuth();
            await Promise.all([
                // Fetch categories
                (async () => {
                   // ... logic ...
                   const res = await getCategories({ active_only: true });
                    if (res.data?.results) {
                        setCategories(res.data.results);
                    } else if (Array.isArray(res.data)) {
                        setCategories(res.data);
                    }
                })(),
                // Fetch cart
                fetchCart() // fetchCart should handle auth check internally or fail gracefully
            ]);
        } catch (error) {
            console.error("Failed to fetch initial data for header", error);
        }
    }
    initData();
  }, [fetchCart, checkAuth]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col">
      {/* Backdrop for Category Menu */}
      {isCategoryMenuOpen && (
        <div className="fixed inset-0 top-[180px] z-40 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300" aria-hidden="true" />
      )}

      {/* Top bar - Darker/Premium */}
      <div className="bg-emerald-900 text-emerald-50 py-3 text-xs font-medium hidden md:block transition-colors">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6 opacity-90 hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1.5 cursor-help" title="Hotline hỗ trợ 24/7">
              <Phone className="w-3.5 h-3.5 text-yellow-400" />
              Hotline: <span className="text-white font-bold tracking-wide">1900 xxxx</span>
            </span>
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Hệ thống nhà thuốc toàn quốc
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/about" className="hover:text-white hover:underline decoration-emerald-400 underline-offset-4 transition-all">
              Giới thiệu
            </Link>
            <div className="w-px h-3 bg-emerald-700"></div>
            <Link href="/contact" className="hover:text-white hover:underline decoration-emerald-400 underline-offset-4 transition-all">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>

      {/* Main header - Glassmorphism */}
      <div className="relative z-50 bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 transition-all duration-300">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 md:w-11 md:h-11 bg-linear-to-br from-primary to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-2xl md:text-3xl font-black text-white tracking-tighter">B</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors">BanThuoc</h1>
                <p className="text-[10px] uppercase font-bold tracking-widest text-primary/80">Nhà thuốc uy tín</p>
              </div>
            </Link>

            {/* Search bar - Floating & Rounded */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-2xl mx-auto"
            >
              <div className="relative w-full group">
                <Input
                  type="search"
                  placeholder="Tìm tên thuốc, bệnh lý, thực phẩm chức năng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-14 pl-5 h-12 rounded-full border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 shadow-sm transition-transform hover:scale-105 active:scale-95"
                >
                  <Search className="w-4 h-4 text-white" />
                </Button>
              </div>
            </form>

            {/* Actions - Modern Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Wishlist */}
              <Button variant="ghost" size="icon" className="hidden md:flex rounded-full w-10 h-10 hover:bg-red-50 hover:text-red-500 transition-colors" asChild>
                <Link href="/wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>

              {/* Cart */}
              {/* Cart */}
              <div className="relative group z-50">
                  <Button variant="ghost" size="icon" className="relative rounded-full w-10 h-10 hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                    <Link href="/cart" className="relative">
                      <ShoppingCart className="w-5 h-5" />
                      {displayCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white shadow-xs animate-in zoom-in-50">
                          {displayCount}
                        </span>
                      )}
                    </Link>
                  </Button>

                  {/* Hover Content */}
                  <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover:translate-y-0">
                      <CartHoverContent />
                  </div>
              </div>

              {/* User menu */}
              <UserDropdownMenu />

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full hover:bg-gray-100"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile search */}
          <div className={`mt-3 md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isMenuOpen || searchQuery ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={handleSearch} className="relative">
                <Input
                type="search"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 rounded-full border-gray-200 bg-gray-50 focus:bg-white shadow-sm"
                />
                <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0"
                >
                <Search className="w-3.5 h-3.5" />
                </Button>
            </form>
          </div>
        </div>

        {/* Navigation Bar - Clean & Modern */}
        <div className="hidden md:block border-t border-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-1">
                    {/* Categories Mega Menu Trigger */}
                    <div className="relative py-2">
                         <DropdownMenu onOpenChange={setIsCategoryMenuOpen}>
                            <DropdownMenuTrigger asChild>
                            <Button
                                className={`h-10 px-5 font-semibold text-sm rounded-full transition-all duration-300 ${
                                    isCategoryMenuOpen 
                                    ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20 scale-105' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white hover:shadow-md'
                                }`}
                            >
                                <Menu className="w-4 h-4 mr-2" />
                                Danh mục sản phẩm
                                <ChevronDown className={`w-3.5 h-3.5 ml-2 transition-transform duration-300 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[1200px] p-0 rounded-2xl shadow-2xl border-gray-100 flex items-start min-h-[450px] overflow-hidden mt-3 animate-in fade-in-0 zoom-in-95" sideOffset={8}>
                             {/* Left Side: Category List */}
                             <div className="w-[300px] border-r border-gray-100 bg-gray-50/80 backdrop-blur-sm py-3 shrink-0 h-full flex flex-col gap-1">
                                <Link 
                                    href="/products" 
                                    className="group flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg cursor-pointer font-medium hover:bg-white hover:text-primary hover:shadow-sm transition-all text-gray-700 mb-2"
                                    onMouseEnter={() => setActiveCategory(null)}
                                >
                                    <div className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-xs flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:scale-105 transition-all">
                                        <Menu className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                    </div>
                                    <span className="flex-1">Tất cả sản phẩm</span>
                                </Link>
                                
                                {categories.slice(0, 10).map((cat) => (
                                <Link 
                                    key={cat.slug}
                                    href={`/products?category=${cat.slug}`}
                                    className={`group flex items-center gap-3 px-5 py-2.5 mx-2 rounded-lg cursor-pointer transition-all ${activeCategory?.slug === cat.slug ? 'bg-white text-primary shadow-sm ring-1 ring-primary/10' : 'text-gray-600 hover:bg-white hover:text-primary hover:shadow-xs'}`}
                                    onMouseEnter={() => setActiveCategory(cat)}
                                >
                                    <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 overflow-hidden transition-all bg-white relative ${activeCategory?.slug === cat.slug ? 'border-primary scale-105 shadow-sm' : 'border-gray-100 group-hover:border-primary/30'}`}>
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Pill className={`w-4 h-4 ${activeCategory?.slug === cat.slug ? 'text-primary' : 'text-gray-300 group-hover:text-primary/70'}`} />
                                        )}
                                    </div>
                                    <span className="truncate flex-1 font-medium">{cat.name}</span>
                                    {cat.children && cat.children.length > 0 && (
                                        <ChevronDown className={`w-3.5 h-3.5 -rotate-90 transition-all ${activeCategory?.slug === cat.slug ? 'text-primary translate-x-1' : 'text-gray-300'}`} />
                                    )}
                                </Link>
                                ))}
                                
                                <div className="mt-auto px-4 pt-4 pb-2">
                                     <Link href="/categories" className="flex items-center justify-center gap-2 p-3 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/10 transition-colors w-full">
                                         Xem tất cả danh mục
                                         <ChevronDown className="w-3 h-3 -rotate-90" />
                                     </Link>
                                </div>
                             </div>
            
                             {/* Right Side: Active Category Content */}
                             <div className="flex-1 bg-white p-8 h-full flex flex-col">
                                {activeCategory ? (
                                <div className="animate-in fade-in slide-in-from-left-2 duration-300 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                                        <div className="flex items-center gap-4">
                                            {activeCategory.image && (
                                                <div className="w-16 h-16 rounded-2xl border-4 border-gray-50 shadow-sm overflow-hidden p-1 bg-white">
                                                     <img src={activeCategory.image} alt={activeCategory.name} className="w-full h-full object-cover rounded-xl" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
                                                    {activeCategory.name}
                                                </h3>
                                                <Link href={`/products?category=${activeCategory.slug}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1.5 group">
                                                    Xem tất cả sản phẩm
                                                    <ChevronDown className="-rotate-90 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {activeCategory.children && activeCategory.children.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-4 pb-4">
                                        {activeCategory.children.map((child) => (
                                            <Link 
                                                key={child.slug}
                                                href={`/products?category=${child.slug}`} 
                                                className="group relative rounded-xl hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100 overflow-hidden"
                                            >
                                                <Card className="h-full border-0 shadow-none bg-gray-100 group-hover:bg-gray-200">
                                                    <CardContent className="p-2 flex items-center gap-3">
                                                         <div className="w-10 h-10 rounded-lg bg-white shadow-xs flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                                            {child.image ? (
                                                            <img src={child.image} alt={child.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                            <Pill className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                                                            )}
                                                         </div>
                                                         <span className="font-semibold text-sm text-gray-600 group-hover:text-primary line-clamp-2 leading-tight transition-colors">
                                                             {child.name}
                                                         </span>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                    ) : (
                                    <div className="flex flex-col items-center justify-center flex-1 text-gray-300">
                                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                            <Pill className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="font-medium">Chưa có danh mục con</p>
                                    </div>
                                    )}
                                </div>
                                ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                   <div className="w-24 h-24 mb-6 bg-linear-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center shadow-inner">
                                      <Menu className="w-10 h-10 opacity-50" />
                                   </div>
                                   <p className="text-xl font-semibold text-gray-400">Chọn danh mục để xem chi tiết</p>
                                   <p className="text-sm text-gray-300 mt-2">Khám phá hàng ngàn sản phẩm chất lượng</p>
                                </div>
                                )}
                             </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Desktop Links */}
                    <div className="flex items-center gap-1 ml-4">
                        <Link
                            href="/products"
                            className="h-10 px-5 inline-flex items-center font-medium text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-full transition-all"
                        >
                            Sản phẩm
                        </Link>
                        <Link
                            href="/flash-sale"
                            className="h-10 px-5 inline-flex items-center font-bold text-sm text-red-500 bg-red-50/50 hover:bg-red-50 hover:text-red-600 rounded-full transition-all"
                        >
                            <span className="mr-1.5 animate-pulse">⚡</span>
                            Flash Sale
                        </Link>
                         <Link
                            href="/about"
                            className="h-10 px-5 inline-flex items-center font-medium text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-full transition-all"
                        >
                            Về chúng tôi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white absolute top-full left-0 right-0 shadow-lg animate-in slide-in-from-top-5">
          <nav className="container mx-auto px-4 py-4 max-h-[80vh] overflow-y-auto">
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="flex items-center gap-3 py-3 px-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-primary active:bg-primary/5 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                     <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                         {cat.image ? (
                             <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                         ) : (
                             <Pill className="w-4 h-4 text-gray-400" />
                         )}
                     </div>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <div className="h-px bg-gray-100 my-2"></div>
              <li>
                <Link
                  href="/products"
                  className="block py-3 px-2 font-semibold text-gray-800 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/flash-sale"
                  className="block py-3 px-2 font-bold text-red-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⚡ Flash Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-3 px-2 font-medium text-gray-600 hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giới thiệu
                </Link>
              </li>
              <div className="h-px bg-gray-100 my-2"></div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                 <Link href="/auth/login" className="flex items-center justify-center h-10 rounded-lg border border-gray-200 font-medium text-sm text-gray-700">
                    Đăng nhập
                 </Link>
                 <Link href="/auth/register" className="flex items-center justify-center h-10 rounded-lg bg-primary font-medium text-sm text-white">
                    Đăng ký
                 </Link>
              </div>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}


export default Header;
