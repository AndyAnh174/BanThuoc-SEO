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
  title: 'Giới thiệu | BanThuoc - Nhà thuốc online uy tín',
  description: 'BanThuoc - Hệ thống nhà thuốc online uy tín hàng đầu Việt Nam. Cam kết 100% sản phẩm chính hãng, giao hàng nhanh, tư vấn 24/7.',
};

export default function AboutPage() {
  const stats = [
    { value: '10K+', label: 'Sản phẩm' },
    { value: '500K+', label: 'Khách hàng' },
    { value: '50+', label: 'Chi nhánh' },
    { value: '100+', label: 'Dược sĩ' },
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
      description: 'Đội ngũ dược sĩ giàu kinh nghiệm, tư vấn tận tình, hỗ trợ 24/7.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Khách hàng là trọng tâm',
      description: 'Luôn đặt lợi ích và sức khỏe của khách hàng lên hàng đầu.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Uy tín',
      description: 'Hơn 10 năm kinh nghiệm, được hàng triệu khách hàng tin tưởng.',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Về <span className="text-primary">BanThuoc</span>
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
                Với đội ngũ hơn 100 dược sĩ giàu kinh nghiệm, chúng tôi cam kết 
                tư vấn tận tình, hỗ trợ khách hàng 24/7, giúp bạn và gia đình 
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
                    123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Hotline</h3>
                  <p className="text-gray-600">1900 xxxx</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">contact@banthuoc.vn</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-xl">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Giờ làm việc</h3>
                  <p className="text-gray-600">8:00 - 22:00, Thứ 2 - Chủ Nhật</p>
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
            Khám phá hơn 10.000+ sản phẩm dược phẩm chính hãng với giá tốt nhất
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
