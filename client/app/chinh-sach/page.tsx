import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import {
  ScrollText,
  ShieldCheck,
  AlertTriangle,
  Ban,
  PhoneCall,
  RefreshCw,
  ChevronRight,
  FileText,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính sách & Quy định',
  description: 'Chính sách và quy định của BanThuocSi - NKN Pharma. Chính sách hủy đơn hàng, đổi trả, bảo mật và các quy định khác.',
  alternates: { canonical: '/chinh-sach' },
  robots: { index: true, follow: true },
};

const policies = [
  {
    id: 'huy-don-hang',
    icon: <ScrollText className="w-6 h-6" />,
    title: 'Chính sách hủy đơn hàng',
    date: '25.12.2023',
    sections: [
      {
        heading: '1. BanThuocSi có thể hủy đơn hàng trong các trường hợp sau:',
        items: [
          'Sản phẩm tạm hết hàng.',
          'Nếu chênh lệch hơn 5% giá trị sản phẩm.',
          'Địa chỉ giao nhận không chính xác hoặc không đầy đủ thông tin.',
        ],
      },
      {
        heading: '2. Cam kết khi hủy đơn hàng:',
        items: [
          'Trong trường hợp đơn hàng được hủy bởi BanThuocSi, BanThuocSi sẽ có trách nhiệm thông báo đến Quý khách trong thời gian sớm nhất. Quý khách sẽ không phải trả bất kỳ chi phí hủy đơn hàng nào trong trường hợp này.',
          'Trong trường hợp khách hàng yêu cầu hủy đơn, Quý khách vui lòng liên hệ với bộ phận chăm sóc khách hàng qua số điện thoại 096.770.5287, chat trực tuyến hoặc phản hồi qua website để được hỗ trợ thêm.',
          'Trong trường hợp Quý khách đã thanh toán chuyển khoản, BanThuocSi sẽ hoàn trả tiền mua hàng và phí vận chuyển thông qua tài khoản ngân hàng của Quý khách.',
        ],
      },
    ],
    note: 'Nếu Quý khách hàng yêu cầu hủy đơn 3 lần liên tiếp hoặc hủy đơn 4 lần trong 30 ngày sẽ bị khóa tài khoản. Trường hợp khách hàng muốn mở lại tài khoản, BanThuocSi sẽ thu cước phí để mở lại tài khoản là 200.000 VNĐ/1 lần.',
    footer: 'Quý khách hãy cân nhắc kiểm tra kỹ thông tin sản phẩm hoặc trao đổi thêm với nhân viên tư vấn hoặc nhân viên chăm sóc khách hàng để được hỗ trợ trước khi đặt hàng.',
  },
];

export default function ChinhSachPage() {
  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="px-4 py-3">
        <nav className="flex items-center text-sm text-gray-500 overflow-x-auto">
          <a href="/" className="hover:text-primary whitespace-nowrap">Trang chủ</a>
          <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
          <span className="text-gray-900 font-medium truncate">Chính sách</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-primary/10 to-emerald-50 py-12 md:py-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-primary/10 to-transparent rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-emerald-100/50 to-transparent rounded-full -translate-x-1/4 translate-y-1/4" />
        <div className="relative max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Chính sách &amp; Quy định
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            Các chính sách và quy định của BanThuocSi được xây dựng nhằm bảo vệ
            quyền lợi khách hàng và đảm bảo trải nghiệm mua sắm minh bạch, an toàn.
          </p>
        </div>
      </section>

      {/* Policy Cards */}
      <section className="py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-linear-to-r from-primary/5 to-transparent px-6 py-5 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                    {policy.icon}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {policy.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>Cập nhật: {policy.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-6 space-y-6">
                {policy.sections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-start gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{section.heading}</span>
                    </h3>
                    <ul className="space-y-3 pl-7">
                      {section.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-3 text-gray-700">
                          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full shrink-0 mt-2" />
                          <span className="text-sm md:text-base leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Warning Note */}
                {policy.note && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm md:text-base text-amber-800 leading-relaxed">
                      <span className="font-semibold">Lưu ý: </span>
                      {policy.note}
                    </p>
                  </div>
                )}

                {/* Footer */}
                {policy.footer && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <PhoneCall className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed italic">
                      {policy.footer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Banner */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-linear-to-r from-primary to-emerald-600 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Cần hỗ trợ thêm?
            </h3>
            <p className="text-white/90 mb-6 text-sm md:text-base">
              Liên hệ với bộ phận chăm sóc khách hàng của chúng tôi để được giải đáp
              mọi thắc mắc về chính sách.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a
                href="tel:0967705287"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-5 py-3 transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                096.770.5287
              </a>
              <span className="hidden sm:inline text-white/40">|</span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                8:00 - 17:00, T2 - CN
              </span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
