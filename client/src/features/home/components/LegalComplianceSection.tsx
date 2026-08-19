import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Building2, Award, FileCheck2, Scale, FileText, HelpCircle, Truck, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

export function LegalComplianceSection() {
  return (
    <section className="bg-slate-900 text-slate-200 border-t border-slate-800 py-10">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wide flex items-center gap-2">
                Thông tin pháp lý & Đăng ký TMĐT Dược phẩm
              </h2>
              <p className="text-xs text-slate-400">
                Tuân thủ Luật Thương mại điện tử số 122/2025/QH15 & Nghị định số 248/2026/NĐ-CP của Chính phủ
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-900/60 border border-teal-500/40 text-teal-300 text-xs font-semibold self-start md:self-auto">
            <Award className="w-4 h-4" />
            <span>Đủ điều kiện kinh doanh dược B2B</span>
          </div>
        </div>

        {/* 2-Column Grid: Legal Information & Policy Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Col 1: Mandatory Legal Registration Details (Article 4 & Pharma License) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="text-xs font-medium text-slate-400">Đơn vị chủ quản nền tảng:</div>
                  <strong className="text-white text-base">CÔNG TY TNHH DƯỢC PHẨM NGỌC KIM NGÂN</strong>
                  <div className="text-xs text-teal-400 mt-0.5">Tên quốc tế: NGOC KIM NGAN PHARMACEUTICAL CO., LTD (NKN PHARMA)</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-1">
                  <span className="text-slate-400 block font-medium">Giấy chứng nhận ĐKDN (MST):</span>
                  <strong className="text-white font-bold text-sm block">0319116538</strong>
                  <p className="text-slate-400 text-[11px]">
                    Ngày cấp: <strong>20/08/2025</strong>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Nơi cấp: <strong>Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh</strong>
                  </p>
                </div>

                <div className="bg-teal-950/40 rounded-xl p-3.5 border border-teal-800/50 space-y-1">
                  <span className="text-teal-300 block font-medium">GCN Đủ điều kiện kinh doanh dược:</span>
                  <strong className="text-teal-200 font-bold text-sm block">Số 17497/ĐKKDD-HCM</strong>
                  <p className="text-slate-300 text-[11px]">
                    Ngày cấp: <strong>22/10/2025</strong>
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    Nơi cấp: <strong>Sở Y tế Thành phố Hồ Chí Minh</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
                <div>
                  <span className="text-slate-400">Người đại diện pháp luật:</span>{' '}
                  <strong className="text-white">Trần Vũ Bằng</strong> (Giám đốc)
                </div>
                <div>
                  <span className="text-slate-400">Dược sĩ phụ trách chuyên môn:</span>{' '}
                  <strong className="text-white">DS. NGUYỄN THỊ KIM HOÀNG</strong>
                </div>
                <div className="sm:col-span-2 text-[11px] text-slate-400">
                  <span>Chứng chỉ hành nghề Dược:</span>{' '}
                  <strong className="text-slate-200">2355/CCHN-D-SYT-ĐT</strong> (do Sở Y tế Tỉnh Đồng Tháp cấp ngày 06/01/2023)
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400">Địa chỉ trụ sở đăng ký:</span>{' '}
                  <span>118/127C/27 Phan Huy Ích, Khu phố 5, Phường Tân Sơn, TP. Hồ Chí Minh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Mandatory Policy Quick Access (Decree 248 Articles 5, 6, 7, 8, 9, 13) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              Chính sách & Quy định theo NĐ 248/2026/NĐ-CP
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <Link
                href="/chinh-sach#bao-mat"
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-xl p-3 transition flex items-center gap-2.5 text-slate-200 hover:text-teal-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white group-hover:text-teal-300">Chính sách bảo mật</div>
                  <div className="text-[11px] text-slate-400">Điều 5 NĐ 248</div>
                </div>
              </Link>

              <Link
                href="/chinh-sach#quyen-nghia-vu"
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-xl p-3 transition flex items-center gap-2.5 text-slate-200 hover:text-teal-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white group-hover:text-teal-300">Quyền & Nghĩa vụ các bên</div>
                  <div className="text-[11px] text-slate-400">Điều 6 NĐ 248</div>
                </div>
              </Link>

              <Link
                href="/chinh-sach#khieu-nai"
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-xl p-3 transition flex items-center gap-2.5 text-slate-200 hover:text-teal-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white group-hover:text-teal-300">Giải quyết khiếu nại</div>
                  <div className="text-[11px] text-slate-400">Điều 7 NĐ 248</div>
                </div>
              </Link>

              <Link
                href="/chinh-sach#chinh-sach-gia"
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-xl p-3 transition flex items-center gap-2.5 text-slate-200 hover:text-teal-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white group-hover:text-teal-300">Chính sách về giá</div>
                  <div className="text-[11px] text-slate-400">Điều 8 NĐ 248</div>
                </div>
              </Link>

              <Link
                href="/chinh-sach#dieu-kien-han-che"
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-xl p-3 transition flex items-center gap-2.5 text-slate-200 hover:text-teal-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white group-hover:text-teal-300">Hạn chế cung cấp dược</div>
                  <div className="text-[11px] text-slate-400">Điều 9 NĐ 248</div>
                </div>
              </Link>

              <Link
                href="/chinh-sach#giao-hang"
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 rounded-xl p-3 transition flex items-center gap-2.5 text-slate-200 hover:text-teal-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-white group-hover:text-teal-300">Giao nhận & Kiểm hàng</div>
                  <div className="text-[11px] text-slate-400">Điều 13 NĐ 248</div>
                </div>
              </Link>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
              <span>Hotline khiếu nại (24/7): <a href="tel:0967705287" className="text-white hover:text-teal-300 font-bold">096.770.5287</a></span>
              <span>Email: <a href="mailto:ngockimnganpharm@gmail.com" className="text-teal-300 hover:underline">ngockimnganpharm@gmail.com</a></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LegalComplianceSection;
