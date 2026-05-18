import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';
import {
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ChevronRight,
  PhoneCall,
  ScrollText,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính sách đổi trả & hoàn tiền | BanThuocSi - NKN Pharma',
  description: 'Chính sách đổi trả và hoàn tiền của BanThuocSi. Điều kiện đổi trả, thời gian xử lý, quy trình hoàn tiền và các quy định liên quan.',
  alternates: { canonical: '/returns' },
  robots: { index: true, follow: true },
};

const sections = [
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: '1. Điều kiện đổi trả hàng',
    items: [
      'Sản phẩm bị lỗi kỹ thuật, hư hỏng do nhà sản xuất.',
      'Sản phẩm giao không đúng với đơn đặt hàng (sai sản phẩm, sai số lượng, sai quy cách).',
      'Sản phẩm còn nguyên vẹn bao bì, chưa qua sử dụng, còn đầy đủ tem nhãn.',
      'Sản phẩm còn hạn sử dụng tối thiểu 6 tháng tính từ ngày trả hàng.',
      'Thời gian yêu cầu đổi trả: trong vòng 7 ngày kể từ ngày nhận hàng.',
    ],
  },
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    title: '2. Các trường hợp KHÔNG được đổi trả',
    items: [
      'Sản phẩm đã bị mở bao bì, rách tem niêm phong, hoặc có dấu hiệu đã qua sử dụng.',
      'Sản phẩm là thuốc kê đơn đã được giao đúng theo đơn.',
      'Sản phẩm đã hết hạn sử dụng hoặc còn dưới 6 tháng hạn sử dụng do khách hàng bảo quản không đúng cách.',
      'Sản phẩm khuyến mãi, hàng tặng kèm, hàng thanh lý.',
      'Sản phẩm đông lạnh, vắc-xin hoặc các sản phẩm yêu cầu bảo quản đặc biệt.',
    ],
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: '3. Thời gian và quy trình xử lý',
    items: [
      'Sau khi tiếp nhận yêu cầu đổi trả, BanThuocSi sẽ phản hồi trong vòng 24 giờ làm việc.',
      'Thời gian xử lý đổi trả: 3-5 ngày làm việc kể từ khi nhận được hàng trả về.',
      'Đối với trường hợp hoàn tiền: tiền sẽ được chuyển khoản trong vòng 5-7 ngày làm việc.',
      'Quý khách vui lòng giữ lại hóa đơn mua hàng và phiếu giao hàng để làm căn cứ đổi trả.',
    ],
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: '4. Quy trình đổi trả',
    items: [
      'Bước 1: Liên hệ với BanThuocSi qua hotline 096.770.5287 hoặc chat Zalo để thông báo yêu cầu đổi trả.',
      'Bước 2: Cung cấp thông tin đơn hàng, hình ảnh/video sản phẩm cần đổi trả (nếu có lỗi).',
      'Bước 3: BanThuocSi xác nhận và hướng dẫn quy trình gửi trả hàng.',
      'Bước 4: Sau khi nhận được hàng trả về và kiểm tra, BanThuocSi sẽ tiến hành đổi sản phẩm mới hoặc hoàn tiền.',
    ],
  },
  {
    icon: <ScrollText className="w-6 h-6" />,
    title: '5. Chính sách hoàn tiền',
    items: [
      'Hoàn tiền 100% giá trị sản phẩm đối với trường hợp lỗi từ nhà sản xuất hoặc giao sai sản phẩm.',
      'Phí vận chuyển trả hàng sẽ do BanThuocSi chi trả trong trường hợp lỗi từ phía BanThuocSi.',
      'Đối với trường hợp khách hàng đổi ý (không muốn mua nữa): phí vận chuyển trả hàng do khách hàng chi trả.',
      'Hoàn tiền được thực hiện qua chuyển khoản ngân hàng. Quý khách vui lòng cung cấp thông tin tài khoản chính xác.',
    ],
  },
];

export default function ReturnsPage() {
  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="px-4 py-3">
        <nav className="flex items-center text-sm text-gray-500 overflow-x-auto">
          <a href="/" className="hover:text-primary whitespace-nowrap">Trang chủ</a>
          <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
          <span className="text-gray-900 font-medium truncate">Chính sách đổi trả</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-br from-amber-50 via-amber-100 to-orange-50 py-12 md:py-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-amber-200/50 to-transparent rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="relative max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Chính sách đổi trả &amp; hoàn tiền
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            BanThuocSi luôn mong muốn mang đến trải nghiệm mua sắm tốt nhất cho Quý khách.
            Dưới đây là các quy định về đổi trả hàng và hoàn tiền.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-linear-to-r from-amber-50/80 to-transparent px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                    {section.icon}
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                </div>
              </div>
              <div className="px-6 py-5">
                <ul className="space-y-3">
                  {section.items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start gap-3 text-gray-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-2" />
                      <span className="text-sm md:text-base leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-linear-to-r from-amber-500 to-orange-500 rounded-2xl p-6 md:p-8 text-white text-center">
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Cần hỗ trợ đổi trả?
            </h3>
            <p className="text-white/90 mb-6 text-sm md:text-base">
              Liên hệ ngay với bộ phận chăm sóc khách hàng để được hướng dẫn chi tiết về quy trình đổi trả.
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
