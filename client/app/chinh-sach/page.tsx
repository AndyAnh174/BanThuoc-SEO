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
  Lock,
  Eye,
  UserCheck,
  Cookie,
  Database,
  Truck,
  Package,
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
  {
    id: 'doi-tra-hang',
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Chính sách đổi trả & hoàn tiền',
    date: '25.12.2023',
    sections: [
      {
        heading: '1. Điều kiện đổi trả hàng:',
        items: [
          'Sản phẩm bị lỗi kỹ thuật, hư hỏng do nhà sản xuất.',
          'Sản phẩm giao không đúng với đơn đặt hàng (sai sản phẩm, sai số lượng, sai quy cách).',
          'Sản phẩm còn nguyên vẹn bao bì, chưa qua sử dụng, còn đầy đủ tem nhãn.',
          'Sản phẩm còn hạn sử dụng tối thiểu 6 tháng tính từ ngày trả hàng.',
          'Thời gian yêu cầu đổi trả: trong vòng 7 ngày kể từ ngày nhận hàng.',
        ],
      },
      {
        heading: '2. Các trường hợp KHÔNG được đổi trả:',
        items: [
          'Sản phẩm đã bị mở bao bì, rách tem niêm phong, hoặc có dấu hiệu đã qua sử dụng.',
          'Sản phẩm là thuốc kê đơn đã được giao đúng theo đơn.',
          'Sản phẩm khuyến mãi, hàng tặng kèm, hàng thanh lý.',
          'Sản phẩm đông lạnh, vắc-xin hoặc các sản phẩm yêu cầu bảo quản đặc biệt.',
        ],
      },
      {
        heading: '3. Quy trình đổi trả:',
        items: [
          'Bước 1: Liên hệ với BanThuocSi qua hotline 096.770.5287 hoặc chat Zalo để thông báo yêu cầu đổi trả.',
          'Bước 2: Cung cấp thông tin đơn hàng, hình ảnh/video sản phẩm cần đổi trả.',
          'Bước 3: BanThuocSi xác nhận và hướng dẫn quy trình gửi trả hàng.',
          'Bước 4: Sau khi nhận được hàng trả về và kiểm tra, BanThuocSi sẽ tiến hành đổi sản phẩm mới hoặc hoàn tiền trong vòng 5-7 ngày làm việc.',
        ],
      },
    ],
    note: 'Phí vận chuyển trả hàng sẽ do BanThuocSi chi trả nếu lỗi từ phía BanThuocSi. Trường hợp khách hàng đổi ý, phí vận chuyển trả hàng do khách hàng chi trả.',
  },
  {
    id: 'bao-mat',
    icon: <Lock className="w-6 h-6" />,
    title: 'Chính sách bảo mật thông tin',
    date: '25.12.2023',
    sections: [
      {
        heading: '1. Thu thập thông tin:',
        items: [
          'Thông tin cá nhân: họ tên, số điện thoại, email, địa chỉ giao hàng.',
          'Thông tin giao dịch: lịch sử mua hàng, sản phẩm đã xem, đơn hàng đã đặt.',
          'Thông tin tài khoản: tên đăng nhập, mật khẩu (được mã hóa), vai trò người dùng.',
          'Thông tin doanh nghiệp (đối với khách hàng B2B): giấy phép kinh doanh, mã số thuế.',
        ],
      },
      {
        heading: '2. Mục đích sử dụng thông tin:',
        items: [
          'Xử lý đơn hàng: xác nhận, giao hàng, và liên hệ khi cần thiết.',
          'Chăm sóc khách hàng: tư vấn sản phẩm, hỗ trợ sau bán hàng, giải đáp thắc mắc.',
          'Cải thiện dịch vụ: phân tích xu hướng mua sắm để nâng cao trải nghiệm người dùng.',
          'Thông báo khuyến mãi, sản phẩm mới (chỉ khi có sự đồng ý của Quý khách).',
        ],
      },
      {
        heading: '3. Bảo vệ thông tin:',
        items: [
          'Mọi thông tin cá nhân được lưu trữ trên hệ thống máy chủ bảo mật, có tường lửa và mã hóa dữ liệu.',
          'Giao dịch trên website được bảo vệ bằng chứng chỉ SSL (Secure Socket Layer) 256-bit.',
          'Thông tin thanh toán được xử lý qua cổng thanh toán an toàn, BanThuocSi không lưu trữ thông tin thẻ ngân hàng.',
          'Hệ thống được giám sát 24/7 để phát hiện và ngăn chặn các truy cập trái phép.',
        ],
      },
      {
        heading: '4. Chia sẻ thông tin:',
        items: [
          'BanThuocSi cam kết KHÔNG bán, trao đổi hoặc cho thuê thông tin cá nhân của Quý khách cho bên thứ ba.',
          'Thông tin chỉ được chia sẻ với đối tác vận chuyển để giao hàng (họ tên, địa chỉ, số điện thoại).',
          'Trong trường hợp có yêu cầu từ cơ quan pháp luật có thẩm quyền, chúng tôi có nghĩa vụ cung cấp thông tin theo quy định.',
        ],
      },
      {
        heading: '5. Quyền của khách hàng:',
        items: [
          'Quyền truy cập và chỉnh sửa thông tin cá nhân trong tài khoản.',
          'Quyền yêu cầu xóa tài khoản và dữ liệu cá nhân.',
          'Quyền từ chối nhận email quảng cáo bất cứ lúc nào.',
        ],
      },
    ],
    note: 'Cookie được sử dụng để lưu trữ thông tin đăng nhập, giỏ hàng và tùy chọn ngôn ngữ. Quý khách có thể tắt cookie trong trình duyệt, tuy nhiên một số tính năng có thể không hoạt động.',
  },
  {
    id: 'giao-dich-chung',
    icon: <FileText className="w-6 h-6" />,
    title: 'Điều kiện giao dịch chung',
    date: '25.12.2023',
    sections: [
      {
        heading: '1. Quy định chung:',
        items: [
          'Website banthuocsi.vn là nền tảng thương mại điện tử B2B cung cấp sản phẩm dược phẩm cho các nhà thuốc, phòng khám và cơ sở y tế.',
          'Để mua hàng, Quý khách cần đăng ký tài khoản và cung cấp đầy đủ, chính xác thông tin cá nhân và/hoặc thông tin doanh nghiệp.',
          'BanThuocSi có quyền từ chối phục vụ hoặc khóa tài khoản nếu phát hiện thông tin không chính xác hoặc hành vi gian lận.',
          'Giá sản phẩm, khuyến mãi và chính sách có thể thay đổi mà không cần báo trước.',
        ],
      },
      {
        heading: '2. Quy trình đặt hàng:',
        items: [
          'Bước 1: Chọn sản phẩm và thêm vào giỏ hàng.',
          'Bước 2: Kiểm tra giỏ hàng và tiến hành đặt hàng.',
          'Bước 3: Điền thông tin giao hàng và chọn phương thức thanh toán.',
          'Bước 4: Xác nhận đơn hàng. BanThuocSi sẽ gửi email/xác nhận qua Zalo về tình trạng đơn hàng.',
        ],
      },
      {
        heading: '3. Xác nhận đơn hàng:',
        items: [
          'Sau khi Quý khách đặt hàng thành công, hệ thống sẽ gửi email xác nhận đơn hàng.',
          'BanThuocSi có quyền từ chối hoặc hủy đơn hàng trong các trường hợp quy định tại Chính sách hủy đơn hàng.',
          'Đơn hàng chỉ được coi là hợp lệ sau khi BanThuocSi xác nhận qua điện thoại hoặc tin nhắn.',
        ],
      },
      {
        heading: '4. Giải quyết tranh chấp:',
        items: [
          'Mọi tranh chấp phát sinh trong quá trình giao dịch sẽ được giải quyết trên tinh thần thương lượng, hòa giải.',
          'Trường hợp không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án Nhân dân có thẩm quyền theo quy định của pháp luật Việt Nam.',
          'Quý khách có thể gửi khiếu nại qua email ngockimnganpharm@gmail.com hoặc hotline 096.770.5287.',
        ],
      },
    ],
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
