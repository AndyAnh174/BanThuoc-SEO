import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-200">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">B</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">BanThuoc</h3>
                <p className="text-xs text-slate-400">Nhà thuốc uy tín</p>
              </div>
            </div>
            <p className="text-sm mb-4 text-slate-400 leading-relaxed">
              Chúng tôi cam kết mang đến cho khách hàng những sản phẩm dược phẩm 
              chất lượng cao với giá cả hợp lý và dịch vụ tận tâm.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-primary flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-slate-400 hover:text-primary transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/flash-sale" className="text-slate-400 hover:text-primary transition-colors">
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-primary transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-primary transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-slate-400 hover:text-primary transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-slate-400 hover:text-primary transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                <span>
                  123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0 text-primary" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0 text-primary" />
                <span>contact@banthuoc.vn</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0 text-primary" />
                <span>8:00 - 22:00, T2 - CN</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      {/* Bottom bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {currentYear} BanThuoc. All rights reserved.</p>
          <p>
            Giấy phép kinh doanh số: XXXXXXXXXX
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
