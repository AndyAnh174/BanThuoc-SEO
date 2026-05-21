import { Truck, Store, ShieldCheck, ReceiptText, Headset, TicketPercent } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Giao hàng toàn quốc',
    desc: 'Vận chuyển nhanh 63 tỉnh thành',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Store,
    title: 'Giá sỉ nhà thuốc',
    desc: 'Chiết khấu tốt cho khách sỉ',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: ShieldCheck,
    title: 'Hàng chính hãng',
    desc: 'Cam kết nguồn gốc rõ ràng',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: ReceiptText,
    title: 'Xuất hóa đơn đầy đủ',
    desc: 'Hóa đơn VAT, chứng từ rõ ràng',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Headset,
    title: 'Tư vấn nhanh',
    desc: 'Dược sĩ hỗ trợ chat trực tiếp',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: TicketPercent,
    title: 'Voucher khách mới',
    desc: 'Ưu đãi đặc biệt lần đầu mua',
    color: 'bg-rose-50 text-rose-600',
  },
];

export function TrustBadges() {
  return (
    <section className="py-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center text-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBadges;
