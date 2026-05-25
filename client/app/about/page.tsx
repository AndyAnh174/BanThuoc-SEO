import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/src/features/layout';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Users, 
  Heart, 
  Award,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giới thiệu | Bán Thuốc Sỉ - NKN Pharma',
  description: 'Bán Thuốc Sỉ - Hệ thống nhà thuốc online uy tín. Thông tin doanh nghiệp, vận chuyển, thanh toán và các điều kiện kinh doanh dược phẩm.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  const stats = [
    { value: '5K+', label: 'Sản phẩm' },
    { value: '10K+', label: 'Khách hàng' },
    { value: '1+', label: 'Chi nhánh' },
    { value: '10+', label: 'Dược sĩ' },
  ];

  const values = [
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: 'Chất lượng',
      description: '100% sản phẩm chính hãng, nguồn gốc rõ ràng, được kiểm định nghiêm ngặt.',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Tận tâm',
      description: 'Đội ngũ dược sĩ giàu kinh nghiệm, tư vấn tận tình, hỗ trợ trong giờ làm việc.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Khách hàng là trọng tâm',
      description: 'Luôn đặt lợi ích và sức khỏe của khách hàng lên hàng đầu.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Uy tín',
      description: 'Giấy phép kinh doanh số: 0319116538, được khách hàng tin tưởng.',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Về <span className="text-primary">Bán Thuốc Sỉ</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Chúng tôi là hệ thống nhà thuốc online uy tín hàng đầu Việt Nam, 
              với sứ mệnh mang đến sản phẩm chất lượng và dịch vụ tận tâm 
              cho mọi gia đình Việt.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-gray-600 mb-4">
                BanThuoc được thành lập với mong muốn mang đến cho mọi người 
                khả năng tiếp cận các sản phẩm dược phẩm chất lượng cao một cách 
                thuận tiện và nhanh chóng nhất.
              </p>
              <p className="text-gray-600 mb-4">
                Chúng tôi tin rằng sức khỏe là tài sản quý giá nhất. Vì vậy, 
                mỗi sản phẩm được bán tại BanThuoc đều được kiểm định nghiêm ngặt, 
                đảm bảo 100% chính hãng và có nguồn gốc rõ ràng.
              </p>
              <p className="text-gray-600">
                Với đội ngũ dược sĩ giàu kinh nghiệm, chúng tôi cam kết
                tư vấn tận tình, giúp bạn và gia đình
                luôn khỏe mạnh.
              </p>
            </div>
            <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Giá trị cốt lõi
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Liên hệ với chúng tôi
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                  <p className="text-gray-600">
                    118/127C/27 Phan Huy Ích, Phường Tân Sơn, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Hotline</h3>
                  <p className="text-gray-600">096.770.5287</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">ngockimnganpharm@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                  <p className="text-gray-600">8:00 - 17:00, T2 - CN</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping & Payment */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Shipping */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-600"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-1"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Vận chuyển &amp; Giao nhận
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Phạm vi giao hàng</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Giao hàng toàn quốc 63 tỉnh thành. Nội thành TP.HCM giao trong ngày với đơn đặt trước 12:00 trưa.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Thời gian giao hàng</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    TP.HCM: 2-4 giờ. Miền Nam: 1-2 ngày. Miền Trung: 2-3 ngày. Miền Bắc: 3-5 ngày.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-600"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    <h3 className="font-semibold text-gray-900">Phí vận chuyển</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Miễn phí vận chuyển cho đơn hàng từ 500.000 VNĐ. Đơn dưới 500K tính phí theo đơn vị vận chuyển.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Kiểm tra hàng</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Quý khách có quyền kiểm tra hàng trước khi ký nhận. Nếu sản phẩm bị hư hỏng, Quý khách có thể từ chối nhận hàng.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-green-600"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-600"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Thanh toán khi nhận hàng (COD)</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Thanh toán bằng tiền mặt khi nhận hàng. Áp dụng cho tất cả đơn hàng trên toàn quốc.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-600"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Chuyển khoản ngân hàng</h3>
                  </div>
                  <div className="text-gray-600 text-sm leading-relaxed space-y-1">
                    <p><span className="text-gray-500">Ngân hàng:</span> <span className="font-medium">Vietcombank - CN Tân Bình</span></p>
                    <p><span className="text-gray-500">Chủ TK:</span> <span className="font-medium">NGUYEN NGOC KIM NGAN</span></p>
                    <p><span className="text-gray-500">Số TK:</span> <span className="font-medium">0071000921655</span></p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-600"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Ví điện tử MoMo</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Thanh toán qua ví MoMo, quét mã QR. SĐT: <span className="font-medium">096.770.5287</span> - Chủ TK: NGUYEN NGOC KIM NGAN.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Bảo mật thanh toán</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Mọi giao dịch được mã hóa SSL 256-bit. Chúng tôi không lưu trữ thông tin thẻ hay tài khoản ngân hàng của Quý khách.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business License */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-600"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Thông tin pháp lý
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Giấy phép kinh doanh</h3>
                </div>
                <div className="text-gray-700 text-sm space-y-2 leading-relaxed">
                  <p><span className="text-gray-500">Số GPKD:</span> <span className="font-semibold">0319116538</span></p>
                  <p><span className="text-gray-500">Ngày cấp:</span> 25/12/2023</p>
                  <p><span className="text-gray-500">Nơi cấp:</span> Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh</p>
                  <p><span className="text-gray-500">Loại hình:</span> Công ty TNHH</p>
                </div>
              </div>
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-gray-900">Lĩnh vực kinh doanh có điều kiện</h3>
                </div>
                <div className="text-gray-700 text-sm space-y-2 leading-relaxed">
                  <p>Kinh doanh dược phẩm là ngành nghề kinh doanh có điều kiện theo quy định của Luật Dược số 105/2016/QH13.</p>
                  <p className="font-medium">Điều kiện kinh doanh:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Giấy chứng nhận đủ điều kiện kinh doanh dược</li>
                    <li>Người quản lý chuyên môn có bằng dược sĩ</li>
                    <li>Cơ sở vật chất đạt chuẩn GSP (Good Storage Practice)</li>
                    <li>Tuân thủ quy định về bảo quản và phân phối thuốc</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bắt đầu mua sắm ngay hôm nay
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Khám phá hơn 5.000+ sản phẩm dược phẩm chính hãng với giá tốt nhất
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/products">
              Xem sản phẩm
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
