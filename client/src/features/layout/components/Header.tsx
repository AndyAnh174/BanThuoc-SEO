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

interface HeaderProps {
  cartItemCount?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  children?: Category[];
}

export function Header({ cartItemCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  React.useEffect(() => {
    async function fetchCategories() {
        try {
            const res = await getCategories({ active_only: true });
             if (res.data?.results) {
               setCategories(res.data.results);
             } else if (Array.isArray(res.data)) {
               setCategories(res.data);
             }
        } catch (error) {
            console.error("Failed to fetch categories for header", error);
        }
    }
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Backdrop for Category Menu */}
      {isCategoryMenuOpen && (
        <div className="fixed inset-0 top-[180px] z-40 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200" aria-hidden="true" />
      )}

      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 text-sm hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Hotline: 1900 xxxx
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Hệ thống nhà thuốc toàn quốc
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:underline">
              Giới thiệu
            </Link>
            <Link href="/contact" className="hover:underline">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4 relative z-50 bg-white">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">BanThuoc</h1>
              <p className="text-xs text-muted-foreground">Nhà thuốc uy tín</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl"
          >
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Tìm kiếm thuốc, thực phẩm chức năng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 h-11 border-primary/30 focus:border-primary"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
              <Link href="/wishlist">
                <Heart className="w-5 h-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/auth/login">Đăng nhập</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/auth/register">Đăng ký</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden">
          <div className="relative">
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="bg-primary/5 border-t hidden md:block relative z-50">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {/* Categories dropdown */}
            <li>
              <DropdownMenu onOpenChange={setIsCategoryMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`h-12 px-4 font-medium text-foreground hover:bg-primary/10 rounded-t-lg rounded-b-none ${isCategoryMenuOpen ? 'bg-white text-primary shadow-sm border-x border-t border-b-0 relative z-[60] -mb-[1px]' : ''}`}
                  >
                    Danh mục sản phẩm
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[1200px] p-0 rounded-lg shadow-lg border-primary/20 flex min-h-[400px]" sideOffset={0}>
                  {/* Left Side: Category List */}
                  <div className="w-[300px] border-r bg-gray-50/50 py-2 shrink-0">
                    <DropdownMenuItem asChild onMouseEnter={() => setActiveCategory(null)}>
                       <Link href="/products" className="flex items-center gap-3 px-4 py-3 cursor-pointer font-medium hover:bg-primary/5 text-primary">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                               <Menu className="w-4 h-4 text-primary" />
                          </div>
                          Tất cả sản phẩm
                       </Link>
                    </DropdownMenuItem>
                    
                    {categories.slice(0, 10).map((cat) => (
                      <div 
                        key={cat.slug}
                        className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${activeCategory?.slug === cat.slug ? 'bg-white text-primary border-l-4 border-l-primary -ml-px shadow-sm' : 'hover:bg-white hover:text-primary text-gray-700 border-l-4 border-l-transparent'}`}
                        onMouseEnter={() => setActiveCategory(cat)}
                      >
                         <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 overflow-hidden ${activeCategory?.slug === cat.slug ? 'border-primary/50' : 'bg-gray-50'}`}>
                           {cat.image ? (
                             <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                           ) : (
                             <Pill className={`w-4 h-4 ${activeCategory?.slug === cat.slug ? 'text-primary' : 'text-gray-400'}`} />
                           )}
                         </div>
                         <span className="truncate flex-1 font-medium">{cat.name}</span>
                         {cat.children && cat.children.length > 0 && (
                           <ChevronDown className={`w-4 h-4 -rotate-90 transition-colors ${activeCategory?.slug === cat.slug ? 'text-primary' : 'text-gray-300'}`} />
                         )}
                      </div>
                    ))}
                    
                    <DropdownMenuItem asChild onMouseEnter={() => setActiveCategory(null)}>
                        <Link href="/categories" className="flex items-center gap-3 px-4 py-3 cursor-pointer text-primary font-medium hover:text-primary/80 justify-center border-t mt-1">
                            Xem tất cả danh mục
                        </Link>
                    </DropdownMenuItem>
                  </div>

                  {/* Right Side: Active Category Content */}
                  <div className="flex-1 bg-white p-6">
                    {activeCategory ? (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                             {activeCategory.image && (
                               <img src={activeCategory.image} alt={activeCategory.name} className="w-8 h-8 rounded-full object-cover" />
                             )}
                             {activeCategory.name}
                           </h3>
                           <Link href={`/products?category=${activeCategory.slug}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                             Xem tất cả <ChevronDown className="-rotate-90 w-3 h-3" />
                           </Link>
                        </div>
                        
                        {activeCategory.children && activeCategory.children.length > 0 ? (
                          <div className="grid grid-cols-4 gap-4">
                            {activeCategory.children.map((child) => (
                               <Link 
                                 key={child.slug}
                                 href={`/products?category=${child.slug}`} 
                                 className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:bg-white hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-[80px] group"
                               >
                                 <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                                   {child.image ? (
                                     <img src={child.image} alt={child.name} className="w-full h-full object-cover" />
                                   ) : (
                                     <Pill className="w-6 h-6 text-gray-300" />
                                   )}
                                 </div>
                                 <span className="font-semibold text-sm line-clamp-2 text-gray-700 group-hover:text-primary">{child.name}</span>
                               </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                             <Pill className="w-16 h-16 mb-4 opacity-20" />
                             <p>Không có danh mục con</p>
                          </div>
                        )}
                      </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                          <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                             <Menu className="w-10 h-10" />
                          </div>
                          <p className="text-lg font-medium">Chọn một danh mục để xem chi tiết</p>
                       </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>

            {/* Nav links */}
            <li>
              <Link
                href="/products"
                className="inline-flex items-center h-12 px-4 font-medium text-foreground hover:text-primary transition-colors"
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link
                href="/flash-sale"
                className="inline-flex items-center h-12 px-4 font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                ⚡ Flash Sale
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="inline-flex items-center h-12 px-4 font-medium text-foreground hover:text-primary transition-colors"
              >
                Giới thiệu
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="block py-2 text-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="border-t pt-2 mt-2">
                <Link
                  href="/products"
                  className="block py-2 font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link
                  href="/flash-sale"
                  className="block py-2 font-medium text-red-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⚡ Flash Sale
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2 font-medium text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
