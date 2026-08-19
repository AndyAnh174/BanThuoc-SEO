import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Facebook, Clock, ShieldCheck, Award, FileText, Scale, HelpCircle, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-900">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Company info (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-14 h-14 flex items-center justify-center overflow-hidden shrink-0">
                <Image 
                  src="/logo-rm-phong.png" 
                  alt="BanThuoc Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">CÔNG TY TNHH DƯỢC PHẨM NGỌC KIM NGÂN</h3>
                <p className="text-xs text-teal-400 font-medium">Nền tảng TMĐT Dược phẩm B2B: banthuocsi.vn (NKN Pharma)</p>
              </div>
            </div>

            {/* Legal Information Box (Decree 248/2026/NĐ-CP & Pharma Law) */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 text-xs space-y-2 leading-relaxed text-slate-300">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400">Giấy chứng nhận ĐKDN (MST):</span>{' '}
                  <strong className="text-white">0319116538</strong> do Sở Kế hoạch & Đầu tư TP.HCM cấp ngày 20/08/2025.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400">GCN đủ điều kiện kinh doanh dược:</span>{' '}
                  <strong className="text-teal-200">Số 17497/ĐKKDD-HCM</strong> do Sở Y tế TP.HCM cấp ngày 22/10/2025.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-400">Đại diện pháp luật:</span>{' '}
                  <strong className="text-white">Trần Vũ Bằng</strong> (Giám đốc)
                </div>
                <div>
                  <span className="text-slate-400">Dược sĩ chuyên môn:</span>{' '}
                  <strong className="text-white">DS. NGUYỄN THỊ KIM HOÀNG</strong>
                </div>
                <div className="sm:col-span-2 text-[11px] text-slate-400">
                  <span>Chứng chỉ hành nghề Dược:</span>{' '}
                  <strong className="text-slate-300">2355/CCHN-D-SYT-ĐT</strong> (Sở Y tế Đồng Tháp cấp 06/01/2023)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-slate-400">Theo dõi chúng tôi:</span>
              <div className="flex gap-2">
                <a
                  href="https://www.facebook.com/profile.php?id=61589330195385"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-teal-600 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@ngockimnganpharmacy?_r=1&_t=ZS-96BT93MtIiT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-pink-600 flex items-center justify-center transition-colors text-slate-300 hover:text-white"
                  aria-label="TikTok"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Policies according to Decree 248/2026/NĐ-CP (Col 6-8) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-400" />
              Chính sách & Quy định (NĐ 248)
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href="/chinh-sach#bao-mat" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  Chính sách bảo mật (Điều 5)
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach#quyen-nghia-vu" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  Quyền & Nghĩa vụ các bên (Điều 6)
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach#khieu-nai" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  Giải quyết khiếu nại (Điều 7)
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach#chinh-sach-gia" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  Chính sách về giá (Điều 8)
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach#dieu-kien-han-che" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  Hạn chế cung cấp dược (Điều 9)
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach#giao-hang" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  Chính sách giao & kiểm hàng (Điều 13)
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach#doi-tra" className="hover:text-teal-400 transition-colors flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                  Chính sách đổi trả & hoàn tiền
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Complaint Resolution (Col 9-12) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-400" />
              Thông tin liên hệ & Tiếp nhận khiếu nại
            </h4>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 shrink-0 text-teal-400 mt-0.5" />
                <span>
                  <strong>Địa chỉ:</strong> 118/127C/27 Phan Huy Ích, Khu phố 5, Phường Tân Sơn, Tp. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 shrink-0 text-teal-400" />
                <span>
                  <strong>Hotline khiếu nại (24/7):</strong> <a href="tel:0967705287" className="text-teal-300 hover:underline">096.770.5287</a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 shrink-0 text-teal-400" />
                <span className="break-all">
                  <strong>Email:</strong> <a href="mailto:ngockimnganpharm@gmail.com" className="text-teal-300 hover:underline">ngockimnganpharm@gmail.com</a>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 shrink-0 text-teal-400" />
                <span>
                  <strong>Thời gian làm việc:</strong> 8:00 - 18:00 (Thứ 2 - Thứ 7), tiếp nhận đơn trực tuyến 24/7.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-900" />

      {/* Bottom bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {currentYear} CÔNG TY TNHH DƯỢC PHẨM NGỌC KIM NGÂN (banthuocsi.vn). All rights reserved.</p>
          <p className="text-center md:text-right">
            Đã khai báo & thông báo Bộ Công Thương theo quy định TMĐT số 122/2025/QH15 & NĐ 248/2026/NĐ-CP
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
