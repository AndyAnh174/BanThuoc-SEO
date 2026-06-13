'use client';

import Link from 'next/link';
import { Truck, ShieldCheck, Gift, BadgePercent, Pill, Zap } from 'lucide-react';

const messages = [
  { icon: Truck, text: 'Giao hàng nhanh toàn quốc - Miễn phí vận chuyển đơn từ 500K' },
  { icon: ShieldCheck, text: '100% chính hãng - Cam kết nguồn gốc rõ ràng từ nhà sản xuất' },
  { icon: Zap, text: 'Flash Sale mỗi ngày - Giảm đến 50% hàng ngàn sản phẩm' },
  { icon: Gift, text: 'Voucher 50K cho khách hàng mới - Nhập mã NEW50 khi thanh toán' },
  { icon: BadgePercent, text: 'Chiết khấu cao cho nhà thuốc & phòng khám - Liên hệ ngay' },
  { icon: Pill, text: '10.000+ sản phẩm dược phẩm chính hãng - Giá sỉ tốt nhất' },
];

export function PromoMarquee() {
  return (
    <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-teal-700 text-white overflow-hidden border-b border-teal-500">
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center py-2.5">
          {messages.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm font-medium whitespace-nowrap">
              <m.icon className="w-4 h-4 text-teal-200" />
              {m.text}
              <span className="mx-4 text-teal-400">|</span>
            </span>
          ))}
        </div>
        {/* Duplicate for seamless loop */}
        <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center py-2.5">
          {messages.map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-sm font-medium whitespace-nowrap">
              <m.icon className="w-4 h-4 text-teal-200" />
              {m.text}
              <span className="mx-4 text-teal-400">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
