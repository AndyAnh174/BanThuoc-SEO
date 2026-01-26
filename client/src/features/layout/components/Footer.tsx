import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Clock } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">BanThuoc</h3>
                <p className="text-xs text-gray-400">Nhà thuốc uy tín</p>
              </div>
            </div>
            <p className="text-sm mb-4 text-gray-400">
              Chúng tôi cam kết mang đến cho khách hàng những sản phẩm dược phẩm 
              chất lượng cao với giá cả hợp lý và dịch vụ tận tâm.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/flash-sale" className="hover:text-primary transition-colors">
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                <span className="text-sm">
                  123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">1900 xxxx</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">contact@banthuoc.vn</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">8:00 - 22:00, T2 - CN</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-gray-500">
            <p>© {currentYear} BanThuoc. All rights reserved.</p>
            <p>
              Giấy phép kinh doanh số: XXXXXXXXXX
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
