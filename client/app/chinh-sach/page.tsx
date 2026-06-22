'use client';

import { useState } from 'react';
import { MainLayout } from '@/src/features/layout';
import { ChevronDown, ShieldCheck, Truck, CreditCard, RotateCcw, Lock, FileText, Phone, Ban, RefreshCw, AlertTriangle, UserCheck } from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

export default function ChinhSachPage() {
  const sections: Section[] = [
    {
      id: 'dieu-khoan',
      icon: <FileText className="w-5 h-5" />,
      title: 'Điều kiện giao dịch chung',
      content: (
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>Điều kiện giao dịch chung này được áp dụng đối với mọi giao dịch mua bán hàng hóa phát sinh giữa <strong>Công ty TNHH Ngọc Kim Ngân</strong> (banthuocsi.vn) và khách hàng thông qua website banthuocsi.vn. Việc khách hàng truy cập, đăng ký tài khoản hoặc đặt hàng trên website đồng nghĩa với việc khách hàng đã đọc, hiểu và đồng ý tuân thủ các điều kiện giao dịch được quy định.</p>
        </div>
      ),
    },
    {
      id: 'doi-tuong',
      icon: <UserCheck className="w-5 h-5" />,
      title: 'Đối tượng khách hàng',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Website hoạt động theo mô hình <strong>phân phối sỉ</strong>, phục vụ các đối tượng:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-4">
            {[
              'Nhà thuốc có Giấy chứng nhận đủ điều kiện kinh doanh dược',
              'Quầy thuốc hợp pháp',
              'Phòng khám, cơ sở khám chữa bệnh',
              'Doanh nghiệp kinh doanh dược',
              'Cá nhân, tổ chức có nhu cầu mua sỉ',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: 'tai-khoan',
      icon: <Lock className="w-5 h-5" />,
      title: 'Đăng ký & Bảo mật tài khoản',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Khách hàng đăng ký tài khoản bằng cách cung cấp: Họ tên người đại diện, Tên nhà thuốc/cơ sở kinh doanh, SĐT, Email, Địa chỉ kinh doanh, MST/GPKD (nếu có).</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
            <strong className="text-amber-800">Lưu ý:</strong> Khách hàng có trách nhiệm bảo mật thông tin đăng nhập. Mọi giao dịch phát sinh từ tài khoản đều được xem là do khách hàng thực hiện.
          </div>
          <p>banthuocsi.vn có quyền tạm đình chỉ hoặc chấm dứt tài khoản trong các trường hợp: cung cấp thông tin sai, vi phạm quy định thanh toán, gian lận, hoặc vi phạm pháp luật.</p>
        </div>
      ),
    },
    {
      id: 'dat-hang',
      icon: <ShieldCheck className="w-5 h-5" />,
      title: 'Chính sách đặt hàng',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Khách hàng có thể đặt hàng trực tuyến <strong>24/7</strong>. Đơn hàng được xác nhận khi hoàn tất quy trình và nhận thông báo qua email/SMS.</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
            <strong className="text-red-800">Từ chối/Hủy đơn:</strong> banthuocsi.vn có quyền từ chối đơn trong trường hợp sản phẩm hết hàng, thông tin không chính xác, có dấu hiệu gian lận, hoặc sản phẩm bị thu hồi/cấm lưu hành.
          </div>
        </div>
      ),
    },
    {
      id: 'thanh-toan',
      icon: <CreditCard className="w-5 h-5" />,
      title: 'Giá & Phương thức thanh toán',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Tất cả giá đã bao gồm thuế GTGT, niêm yết bằng <strong>VNĐ</strong>. Giá có thể thay đổi theo thời điểm, giá áp dụng cho đơn đã xác nhận là giá tại thời điểm đặt hàng.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: '💵', title: 'COD', desc: 'Trả tiền mặt khi nhận hàng' },
              { icon: '🏦', title: 'Chuyển khoản', desc: 'Vietcombank - NGUYEN NGOC KIM NGAN\nSTK: 0071000921655' },
              { icon: '📱', title: 'MoMo', desc: '096.770.5287\nNGUYEN NGOC KIM NGAN' },
            ].map((pm, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{pm.icon}</div>
                <div className="font-semibold text-gray-800 text-sm">{pm.title}</div>
                <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">{pm.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'van-chuyen',
      icon: <Truck className="w-5 h-5" />,
      title: 'Giao hàng & Vận chuyển',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Giao hàng <strong>toàn quốc</strong> qua các đơn vị vận chuyển liên kết.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'TP.HCM', time: '2-4 giờ' },
              { label: 'Miền Nam', time: '1-2 ngày' },
              { label: 'Miền Trung', time: '2-3 ngày' },
              { label: 'Miền Bắc', time: '3-5 ngày' },
              { label: 'Phí ship', time: 'Miễn phí đơn ≥500K' },
              { label: 'Kiểm hàng', time: 'Được kiểm trước khi nhận' },
            ].map((item, i) => (
              <div key={i} className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-xs text-blue-500 font-medium">{item.label}</div>
                <div className="font-bold text-blue-800 mt-1">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'huy-don',
      icon: <Ban className="w-5 h-5" />,
      title: 'Chính sách hủy đơn hàng',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Khách hàng có thể yêu cầu hủy đơn trong các trường hợp:</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
              <span><strong>Chưa xác nhận</strong> (PENDING) — Hủy miễn phí</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <span><strong>Đã xác nhận, chưa giao</strong> (CONFIRMED) — Phí xử lý 10.000đ/đơn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
              <span><strong>Đã giao cho vận chuyển</strong> (SHIPPING) — Không thể hủy, từ chối khi nhận</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'doi-tra',
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Đổi trả & Hoàn tiền',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p><strong>Điều kiện:</strong> Đổi trả trong 7 ngày — sản phẩm còn nguyên tem, chưa sử dụng, bị lỗi SX, giao sai, hoặc cận date (dưới 6 tháng).</p>
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
            <strong className="text-teal-800">Quy trình:</strong>
            <ol className="list-decimal ml-4 mt-1 space-y-1 text-sm">
              <li>Gọi 096.770.5287 hoặc email ngockimnganpharm@gmail.com</li>
              <li>Cung cấp mã đơn + hình ảnh + lý do</li>
              <li>Gửi hàng về: 118/127C/27 Phan Huy Ích, P.Tân Sơn, TP.HCM</li>
              <li>Hoàn tiền trong 5-7 ngày làm việc qua chuyển khoản</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'bao-mat',
      icon: <Lock className="w-5 h-5" />,
      title: 'Bảo mật thông tin',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Chúng tôi thu thập thông tin cần thiết để xử lý đơn hàng: họ tên, SĐT, email, địa chỉ. <strong>Không bán, chia sẻ</strong> thông tin cho bên thứ ba (trừ đối tác vận chuyển và cơ quan nhà nước có thẩm quyền).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Lưu trữ', text: 'Suốt thời gian TK hoạt động + 2 năm sau GD cuối' },
              { label: 'Cookies', text: 'Dùng để cải thiện trải nghiệm, có thể tắt trong trình duyệt' },
              { label: 'Quyền KH', text: 'Truy cập, chỉnh sửa, xóa dữ liệu, từ chối quảng cáo' },
              { label: 'Bảo vệ', text: 'Biện pháp kỹ thuật + tổ chức, SSL 256-bit' },
            ].map((item, i) => (
              <div key={i} className="bg-purple-50 rounded-xl p-4">
                <div className="text-xs text-purple-500 font-medium">{item.label}</div>
                <div className="text-sm text-purple-800 mt-1">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'khieu-nai',
      icon: <Phone className="w-5 h-5" />,
      title: 'Khiếu nại & Liên hệ',
      content: (
        <div className="space-y-3 text-gray-600 leading-relaxed">
          <p>Mọi khiếu nại được xử lý trong <strong>48 giờ</strong> làm việc qua:</p>
          <div className="flex flex-wrap gap-4">
            {[
              { icon: '📞', label: 'Hotline', value: '096.770.5287' },
              { icon: '📧', label: 'Email', value: 'ngockimnganpharm@gmail.com' },
              { icon: '📍', label: 'Địa chỉ', value: '118/127C/27 Phan Huy Ích, P.Tân Sơn, TP.HCM' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="text-xs text-gray-400">{item.label}</div>
                  <div className="font-semibold text-gray-800">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <MainLayout fullWidth>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white">
          <div className="container mx-auto px-4 py-14 md:py-20 text-center">
            <div className="w-16 h-16 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">Chính sách & Điều khoản</h1>
            <p className="text-teal-100 text-lg max-w-xl mx-auto">Minh bạch, rõ ràng — vì lợi ích của bạn</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <div className="space-y-4">
            {sections.map((section) => (
              <AccordionItem key={section.id} section={section} defaultOpen={section.id === 'dieu-khoan'} />
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            Cập nhật lần cuối: 21/06/2026
          </p>
        </div>
      </div>
    </MainLayout>
  );
}

function AccordionItem({ section, defaultOpen }: { section: Section; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen || false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
          {section.icon}
        </div>
        <h3 className={`text-lg font-bold flex-1 transition-colors ${open ? 'text-teal-700' : 'text-gray-800'}`}>
          {section.title}
        </h3>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-0">
          <div className="pt-4 border-t border-gray-100">
            {section.content}
          </div>
        </div>
      </div>
    </div>
  );
}
