'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/src/features/layout';
import { 
  ChevronDown, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  RotateCcw, 
  Lock, 
  FileText, 
  Phone, 
  Ban, 
  RefreshCw, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  Award, 
  Scale, 
  HelpCircle,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  badge?: string;
  title: string;
  content: React.ReactNode;
}

export default function ChinhSachPage() {
  const sections: Section[] = [
    {
      id: 'chu-quan-phap-ly',
      icon: <Building2 className="w-5 h-5" />,
      badge: 'Điều 4 NĐ 248',
      title: '1. Thông tin về chủ quản nền tảng & Giấy phép Dược',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <p>
            Nền tảng thương mại điện tử <strong>banthuocsi.vn</strong> được sở hữu, vận hành và quản lý trực tiếp bởi <strong>CÔNG TY TNHH DƯỢC PHẨM NGỌC KIM NGÂN</strong>, tuân thủ nghiêm ngặt Luật Thương mại điện tử số 122/2025/QH15, Luật Dược và Nghị định số 248/2026/NĐ-CP.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-600" />
                Thông tin doanh nghiệp chủ quản
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li><strong>Tên tổ chức:</strong> CÔNG TY TNHH DƯỢC PHẨM NGỌC KIM NGÂN</li>
                <li><strong>Tên quốc tế:</strong> NGOC KIM NGAN PHARMACEUTICAL COMPANY LIMITED</li>
                <li><strong>Tên viết tắt:</strong> NKN PHARMA</li>
                <li><strong>Giấy chứng nhận ĐKDN (MST):</strong> 0319116538</li>
                <li><strong>Ngày cấp ĐKKD:</strong> 20/08/2025</li>
                <li><strong>Nơi cấp:</strong> Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh</li>
                <li><strong>Người đại diện theo pháp luật:</strong> Trần Vũ Bằng (Chức vụ: Giám đốc)</li>
                <li><strong>Địa chỉ trụ sở:</strong> 118/127C/27 Phan Huy Ích, Khu phố 5, Phường Tân Sơn, TP. Hồ Chí Minh</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-teal-600" />
                Giấy phép đủ điều kiện kinh doanh Dược
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li><strong>GCN Đủ điều kiện kinh doanh dược:</strong> Số 17497/ĐKKDD-HCM</li>
                <li><strong>Ngày cấp:</strong> 22/10/2025</li>
                <li><strong>Nơi cấp:</strong> Sở Y tế Thành phố Hồ Chí Minh</li>
                <li><strong>Dược sĩ phụ trách chuyên môn:</strong> DS. NGUYỄN THỊ KIM HOÀNG</li>
                <li><strong>Chứng chỉ hành nghề Dược số:</strong> 2355/CCHN-D-SYT-ĐT</li>
                <li><strong>Cơ quan cấp CCHN:</strong> Sở Y tế Tỉnh Đồng Tháp (Cấp ngày: 06/01/2023)</li>
                <li><strong>Hotline khiếu nại (24/7):</strong> 096.770.5287</li>
                <li><strong>Email tiếp nhận:</strong> ngockimnganpharm@gmail.com</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'bao-mat',
      icon: <Lock className="w-5 h-5" />,
      badge: 'Điều 5 NĐ 248',
      title: '2. Chính sách bảo mật thông tin & dữ liệu cá nhân',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <p>
            Chính sách bảo mật này mô tả chi tiết cách thức <strong>banthuocsi.vn</strong> thu thập, lưu trữ, sử dụng và bảo vệ dữ liệu cá nhân, dữ liệu kinh doanh của khách hàng theo quy định tại Điều 5 Nghị định số 248/2026/NĐ-CP và Nghị định 13/2023/NĐ-CP:
          </p>

          <div className="space-y-3">
            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">a) Mục đích và phạm vi thu thập thông tin:</strong>
              <p className="text-xs text-slate-600">
                Thu thập dữ liệu nhằm phục vụ: Xác minh tư cách pháp nhân đủ điều kiện mua sỉ dược phẩm (GCN ĐKKDD/Quầy thuốc/Phòng khám); xử lý và giao nhận đơn hàng; xuất hóa đơn GTGT điện tử; cung cấp dịch vụ chăm sóc khách hàng và thông báo trạng thái đơn hàng. Các thông tin thu thập gồm: Tên cơ sở kinh doanh, Họ tên người đại diện/người mua, Số điện thoại, Email, Địa chỉ giao hàng, Mã số thuế, Giấy phép kinh doanh dược.
              </p>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">b) Phạm vi sử dụng thông tin:</strong>
              <p className="text-xs text-slate-600">
                Chỉ sử dụng trong phạm vi nội bộ nhằm thực hiện giao dịch, quản lý đơn hàng, liên hệ hỗ trợ kỹ thuật, giải quyết khiếu nại và cung cấp các chính sách ưu đãi dành riêng cho cơ sở y tế/nhà thuốc.
              </p>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">c) Thời gian lưu trữ thông tin:</strong>
              <p className="text-xs text-slate-600">
                Dữ liệu cá nhân và tài khoản được lưu trữ trong suốt thời gian tài khoản hoạt động trên nền tảng. Sau khi khách hàng ngừng hoạt động hoặc yêu cầu đóng tài khoản, dữ liệu liên quan đến chứng từ kế toán, hóa đơn và giao dịch dược phẩm được lưu trữ tối thiểu 05 năm theo quy định của Luật Kế toán và Luật Dược.
              </p>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">d) Tổ chức, cá nhân có thể được tiếp cận thông tin:</strong>
              <p className="text-xs text-slate-600">
                Thông tin khách hàng chỉ được cung cấp cho: (1) Đơn vị vận chuyển liên kết (GHTK, Viettel Post, nhân viên giao hàng) để thực hiện giao nhận; (2) Cơ quan quản lý nhà nước có thẩm quyền (Bộ Y tế, Sở Y tế, Bộ Công Thương, Cơ quan Thuế, Công an) khi có yêu cầu bằng văn bản theo đúng trình tự pháp luật. <strong>Tuyệt đối không bán hoặc chia sẻ dữ liệu cho bất kỳ bên thứ ba nào khác.</strong>
              </p>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">đ) Biện pháp bảo mật thông tin, dữ liệu:</strong>
              <p className="text-xs text-slate-600">
                Áp dụng tiêu chuẩn mã hóa SSL/TLS 256-bit trong truyền tải dữ liệu; hệ thống tường lửa (WAF) chống xâm nhập trái phép; phân quyền truy cập nghiêm ngặt dựa trên vai trò nhân sự; sao lưu dữ liệu tự động hàng ngày trên máy chủ bảo mật.
              </p>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">e) Phương thức, quy trình xem và chỉnh sửa dữ liệu:</strong>
              <p className="text-xs text-slate-600">
                Khách hàng có quyền tự đăng nhập vào tài khoản trên website <strong>banthuocsi.vn</strong> để xem, kiểm tra và chỉnh sửa thông tin cá nhân/cơ sở kinh doanh tại mục &quot;Hồ sơ cá nhân&quot;. Khách hàng cũng có thể liên hệ Hotline 096.770.5287 để được nhân viên hỗ trợ cập nhật.
              </p>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">g) Phương thức tiếp nhận yêu cầu xóa, hủy hoặc hạn chế xử lý dữ liệu:</strong>
              <p className="text-xs text-slate-600">
                Chủ thể dữ liệu có quyền yêu cầu xóa, hủy hoặc hạn chế xử lý dữ liệu của mình bằng cách gửi email về <strong>ngockimnganpharm@gmail.com</strong> hoặc gọi Hotline <strong>096.770.5287</strong>. Chúng tôi sẽ tiếp nhận, xác minh danh tính và xử lý hoàn tất trong vòng <strong>48 giờ làm việc</strong>, gửi thông báo xác nhận qua email.
              </p>
            </div>

            <div className="bg-teal-50/60 p-3.5 rounded-xl border border-teal-100">
              <strong className="text-teal-900 block mb-1">h) Tiếp nhận và giải quyết khiếu nại về bảo mật thông tin:</strong>
              <p className="text-xs text-slate-600">
                Mọi phản ánh, khiếu nại về việc dữ liệu cá nhân bị sử dụng sai mục đích hoặc vi phạm cam kết bảo mật được gửi đến email: <strong>ngockimnganpharm@gmail.com</strong> hoặc Hotline <strong>096.770.5287</strong>. Ban quản trị sẽ phản hồi ban đầu trong <strong>24 giờ</strong> và giải quyết dứt điểm trong vòng <strong>03 ngày làm việc</strong>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'quyen-nghia-vu',
      icon: <Scale className="w-5 h-5" />,
      badge: 'Điều 6 NĐ 248',
      title: '3. Quyền và nghĩa vụ của các bên trong giao dịch',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <div className="border-l-4 border-teal-600 pl-4 py-1">
            <h4 className="font-bold text-slate-900 text-base mb-2">3.1. Quyền và nghĩa vụ của chủ quản nền tảng (banthuocsi.vn - Công ty TNHH Dược Phẩm Ngọc Kim Ngân)</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>a)</strong> Ban hành, công khai và tổ chức thực hiện đầy đủ điều kiện hoạt động, điều kiện giao dịch trên nền tảng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>b)</strong> Xây dựng, công khai tiêu chuẩn dịch vụ chất lượng, quy trình đăng ký tài khoản và mua sỉ dược phẩm.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>c)</strong> Thu phí dịch vụ theo đúng chính sách về giá đã được công bố công khai minh bạch.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>d)</strong> Cung cấp thông tin đầy đủ, rõ ràng và trung thực về sản phẩm, giá bán, hạn sử dụng, chương trình khuyến mãi trước khi khách hàng đặt hàng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>đ)</strong> Bảo đảm vận hành an toàn, liên tục, ổn định của nền tảng thương mại điện tử.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>e)</strong> Quy định rõ ràng và thực thi các trường hợp tạm ngừng, chấm dứt, hạn chế tài khoản vi phạm chính sách hoặc pháp luật.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>g)</strong> Áp dụng các biện pháp kỹ thuật và tổ chức cần thiết để bảo đảm an toàn thông tin bí mật kinh doanh và dữ liệu cá nhân khách hàng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>h)</strong> Tiếp nhận, giải quyết nhanh chóng, đúng thẩm quyền các yêu cầu, phản ánh, khiếu nại từ khách hàng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>i)</strong> Chủ động giám sát, ngăn chặn hành vi vi phạm pháp luật; phối hợp và cung cấp đầy đủ thông tin, dữ liệu khi có yêu cầu của cơ quan nhà nước có thẩm quyền.</span>
              </li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-500 pl-4 py-1 mt-4">
            <h4 className="font-bold text-slate-900 text-base mb-2">3.2. Quyền và nghĩa vụ của người mua (Nhà thuốc, Quầy thuốc, Cơ sở Y tế)</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>a)</strong> Được bảo đảm quyền lợi người tiêu dùng và quyền lợi đối tác B2B; được cung cấp thông tin chính xác về xuất xứ, số lô, hạn dùng, giá cả của dược phẩm.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>b)</strong> Được tự do lựa chọn hàng hóa, phương thức thanh toán, đơn vị giao nhận; được bảo vệ an toàn dữ liệu cá nhân và được giải quyết khiếu nại theo đúng quy định.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>c)</strong> Cung cấp thông tin pháp lý chính xác (GCN ĐKKD Dược/Chứng chỉ hành nghề), thanh toán đầy đủ, đúng hạn theo thỏa thuận.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>d)</strong> Tuân thủ đúng các quy định pháp luật ngành Dược, điều kiện hoạt động và điều kiện giao dịch của nền tảng; không lợi dụng nền tảng để thực hiện các hành vi gian lận, đầu cơ, tích trữ thuốc bất hợp pháp.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'khieu-nai',
      icon: <HelpCircle className="w-5 h-5" />,
      badge: 'Điều 7 NĐ 248',
      title: '4. Phương thức tiếp nhận và giải quyết phản ánh, khiếu nại',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <p>
            Quy trình tiếp nhận và xử lý phản ánh, khiếu nại tại <strong>banthuocsi.vn</strong> được xây dựng theo Điều 7 Nghị định 248/2026/NĐ-CP nhằm bảo vệ tối đa quyền lợi khách hàng:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">a) Kênh tiếp nhận trực tuyến 24/7</strong>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• <strong>Hotline:</strong> 096.770.5287</li>
                <li>• <strong>Email:</strong> ngockimnganpharm@gmail.com</li>
                <li>• <strong>Trụ sở:</strong> 118/127C/27 Phan Huy Ích, Khu phố 5, P. Tân Sơn, TP.HCM</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">b) Thời hạn giải quyết chuẩn</strong>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• <strong>Phản hồi ban đầu:</strong> Trong vòng 24 giờ làm việc.</li>
                <li>• <strong>Vấn đề kỹ thuật/tài khoản:</strong> 01 ngày làm việc.</li>
                <li>• <strong>Khiếu nại đơn hàng/sản phẩm:</strong> 01 - 03 ngày làm việc.</li>
              </ul>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">c) Công cụ hỗ trợ giải quyết</strong>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• Hệ thống lưu vết ticket CSKH.</li>
                <li>• Tra cứu vận đơn đối soát trực tuyến.</li>
                <li>• Biên bản đối soát kiểm hàng có chữ ký 2 bên.</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Trình tự 4 bước giải quyết khiếu nại:</strong>
            <ol className="list-decimal ml-4 mt-2 space-y-1">
              <li><strong>Bước 1: Tiếp nhận:</strong> Khách hàng gửi thông tin khiếu nại kèm mã đơn hàng, hình ảnh/video chứng minh qua Hotline hoặc Email.</li>
              <li><strong>Bước 2: Xác minh:</strong> Bộ phận Chăm sóc khách hàng & Dược sĩ chuyên môn kiểm tra hồ sơ, thông tin số lô, hạn dùng và đối soát đơn vị vận chuyển.</li>
              <li><strong>Bước 3: Đề xuất giải pháp:</strong> Đưa ra phương án xử lý (đổi hàng mới, thu hồi hoàn tiền, bổ sung hàng thiếu) trong vòng 24-48 giờ.</li>
              <li><strong>Bước 4: Hoàn tất & Đóng hồ sơ:</strong> Thực hiện hoàn tất phương án đã thống nhất và ghi nhận phản hồi để cải thiện chất lượng dịch vụ.</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'chinh-sach-gia',
      icon: <CreditCard className="w-5 h-5" />,
      badge: 'Điều 8 NĐ 248',
      title: '5. Chính sách về giá & Chi phí dịch vụ',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-2">
            <strong className="text-teal-950 block text-base">a) Giá hàng hóa và thuế GTGT:</strong>
            <p className="text-xs text-slate-700">
              • Toàn bộ giá sản phẩm niêm yết trên website <strong>banthuocsi.vn</strong> được thể hiện bằng đồng Việt Nam (VNĐ) và <strong>đã bao gồm thuế Giá trị gia tăng (GTGT/VAT)</strong> theo quy định hiện hành của pháp luật Việt Nam.
            </p>
            <p className="text-xs text-slate-700">
              • Chi phí vận chuyển và các chi phí phát sinh (nếu có) được tính toán riêng biệt và hiển thị rõ ràng, minh bạch tại bước xác nhận giỏ hàng trước khi khách hàng bấm đặt mua.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <strong className="text-slate-900 block text-base">b) Chi phí dịch vụ dành cho người sử dụng:</strong>
            <p className="text-xs text-slate-600">
              • <strong>Miễn phí 100%</strong> chi phí đăng ký, mở tài khoản và duy trì tài khoản trên nền tảng banthuocsi.vn dành cho các nhà thuốc, quầy thuốc, phòng khám và cơ sở y tế.
            </p>
            <p className="text-xs text-slate-600">
              • Trường hợp trong tương lai có áp dụng bất kỳ loại phí dịch vụ nào, banthuocsi.vn cam kết <strong>công khai minh bạch biểu giá chi tiết trên nền tảng ít nhất 20 ngày trước thời điểm áp dụng</strong> theo đúng quy định tại Điều 8 Nghị định 248/2026/NĐ-CP.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'dieu-kien-han-che',
      icon: <Award className="w-5 h-5" />,
      badge: 'Điều 9 NĐ 248',
      title: '6. Các điều kiện hoặc hạn chế trong cung cấp hàng hóa/dịch vụ',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <p>
            Căn cứ quy định tại Điều 9 Nghị định 248/2026/NĐ-CP và các quy định quản lý chuyên ngành Dược, việc cung cấp dược phẩm trên nền tảng tuân thủ các điều kiện và giới hạn sau:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">a) Giới hạn về thời gian cung cấp:</strong>
              <p className="text-slate-600">
                Hệ thống nhận đơn hàng trực tuyến hoạt động <strong>24/7</strong>. Thời gian xác nhận đơn hàng, tư vấn chuyên môn và xuất kho giao hàng: Từ <strong>8h00 - 18h00 từ Thứ 2 đến Thứ 7</strong> (trừ các ngày nghỉ Lễ, Tết theo luật định).
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">b) Giới hạn về phạm vi địa lý:</strong>
              <p className="text-slate-600">
                Phục vụ và giao hàng trên toàn bộ lãnh thổ <strong>63 tỉnh/thành phố</strong> tại Việt Nam thông qua mạng lưới logistics chuyên nghiệp.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">c) Hạn chế về đối tượng khách hàng:</strong>
              <p className="text-slate-600">
                Nền tảng hoạt động theo mô hình B2B bán buôn dược phẩm, <strong>chỉ cung cấp hàng hóa cho các tổ chức, cá nhân có đủ điều kiện kinh doanh hoặc hành nghề y dược</strong> (Nhà thuốc, quầy thuốc, phòng khám, bệnh viện, công ty dược) có giấy tờ pháp lý hợp lệ.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">d) Giới hạn về số lượng:</strong>
              <p className="text-slate-600">
                Quy định số lượng tối thiểu theo đơn vị đóng gói của nhà sản xuất (Hộp/Thùng/Lốc). Đồng thời có thể giới hạn số lượng tối đa cho mỗi khách hàng đối với một số nhóm hàng đặc biệt nhằm chống đầu cơ và bảo đảm nguồn cung đồng đều.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>đ) Điều kiện về tính khả dụng của dịch vụ:</strong> Dịch vụ có thể tạm dừng hoặc gián đoạn trong các trường hợp: (1) Bảo trì hệ thống kỹ thuật định kỳ (được thông báo trước ít nhất 24 giờ trên website); (2) Sự cố bất khả kháng như thiên tai, dịch bệnh, đứt cáp quang mạng quốc gia hoặc theo lệnh của cơ quan quản lý nhà nước có thẩm quyền.
          </div>
        </div>
      ),
    },
    {
      id: 'giao-hang',
      icon: <Truck className="w-5 h-5" />,
      badge: 'Điều 13 NĐ 248',
      title: '7. Chính sách giao hàng, vận chuyển & kiểm hàng (Logistics)',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <div className="space-y-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">a) Phương thức giao hàng & Đơn vị vận chuyển:</strong>
              <p className="text-xs text-slate-600">
                Sử dụng đội xe vận chuyển chuyên dụng chuẩn GDP nội bộ kết hợp cùng các đối tác logistics uy tín hàng đầu: <strong>Giao Hàng Tiết Kiệm (GHTK), Viettel Post, VNPost</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">b) Thời hạn ước tính giao hàng:</strong>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                <div className="bg-white p-2.5 rounded-lg border text-center">
                  <div className="text-xs text-slate-500">TP. Hồ Chí Minh</div>
                  <strong className="text-teal-700 text-sm">2 - 4 giờ</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border text-center">
                  <div className="text-xs text-slate-500">Miền Nam</div>
                  <strong className="text-teal-700 text-sm">1 - 2 ngày</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border text-center">
                  <div className="text-xs text-slate-500">Miền Trung</div>
                  <strong className="text-teal-700 text-sm">2 - 3 ngày</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border text-center">
                  <div className="text-xs text-slate-500">Miền Bắc</div>
                  <strong className="text-teal-700 text-sm">3 - 5 ngày</strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1 text-xs">c) Trách nhiệm của đơn vị logistics:</strong>
              <p className="text-xs text-slate-600">
                Cung cấp mã vận đơn (Tracking number) theo dõi trạng thái đơn hàng thời gian thực; bảo quản hàng hóa dược phẩm ở điều kiện tiêu chuẩn nhiệt độ mát (&lt; 30°C, tránh ánh nắng trực tiếp); chịu trách nhiệm bồi thường 100% giá trị hàng hóa nếu xảy ra hư hỏng, thất lạc do lỗi vận chuyển.
              </p>
            </div>

            <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
              <strong className="text-teal-950 block mb-1 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                d) Chính sách kiểm hàng (Đồng kiểm khi nhận hàng):
              </strong>
              <p className="text-xs text-slate-700 leading-relaxed">
                Khách hàng <strong>được quyền đồng kiểm mở kiện hàng trước mặt nhân viên giao hàng</strong>. Nội dung kiểm tra bao gồm: Số lượng sản phẩm, tình trạng nguyên vẹn của tem niêm phong bao bì, đối soát số lô và hạn sử dụng (cam kết hạn sử dụng &gt; 06 tháng). Trường hợp phát hiện hàng móp méo, giao sai hoặc cận date, khách hàng được quyền từ chối nhận hàng hoặc lập biên bản đồng kiểm gửi về hotline <strong>096.770.5287</strong> để được đổi hàng mới ngay lập tức.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'doi-tra',
      icon: <RefreshCw className="w-5 h-5" />,
      title: '8. Chính sách đổi trả & Hoàn tiền',
      content: (
        <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
          <p>
            Khách hàng được quyền yêu cầu đổi trả sản phẩm trong vòng <strong>07 ngày</strong> kể từ thời điểm nhận hàng thành công trong các trường hợp:
          </p>

          <ul className="space-y-1.5 text-xs text-slate-600 ml-4">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              Sản phẩm bị lỗi kỹ thuật, lỗi bao bì do nhà sản xuất.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              Giao sai chủng loại, thiếu số lượng so với đơn đặt hàng đã xác nhận.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              Sản phẩm có hạn dùng dưới 06 tháng mà không có thông báo thỏa thuận trước.
            </li>
          </ul>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <strong className="text-slate-900 block">Quy trình hoàn tiền:</strong>
            <p className="text-slate-600">
              Sau khi nhận và kiểm định hàng trả về kho tại: <em>118/127C/27 Phan Huy Ích, Khu phố 5, Phường Tân Sơn, TP. Hồ Chí Minh</em>, <strong>banthuocsi.vn</strong> sẽ hoàn tiền 100% qua chuyển khoản ngân hàng trong vòng <strong>03 - 05 ngày làm việc</strong>.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <MainLayout fullWidth>
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white">
          <div className="container mx-auto px-4 py-12 md:py-16 text-center">
            <div className="w-16 h-16 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <ShieldCheck className="w-8 h-8 text-teal-200" />
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight">
              Chính sách, Điều khoản & Thông tin Pháp lý TMĐT
            </h1>
            <p className="text-teal-100 text-sm md:text-base max-w-2xl mx-auto">
              Công khai, minh bạch theo Luật Thương mại điện tử số 122/2025/QH15 và Nghị định số 248/2026/NĐ-CP của Chính phủ.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Quick Legal Summary Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Đơn vị chủ quản nền tảng:</div>
              <div className="text-base font-bold text-slate-900">CÔNG TY TNHH DƯỢC PHẨM NGỌC KIM NGÂN (NKN PHARMA)</div>
              <div className="text-xs text-slate-500 mt-0.5">
                MST: <strong>0319116538</strong> | GCN ĐKKD Dược: <strong>Số 17497/ĐKKDD-HCM</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <a
                href="tel:0967705287"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition"
              >
                <Phone className="w-3.5 h-3.5" />
                Hotline: 096.770.5287
              </a>
            </div>
          </div>

          {/* Accordion Sections */}
          <div className="space-y-3.5">
            {sections.map((section) => (
              <AccordionItem key={section.id} section={section} defaultOpen={true} />
            ))}
          </div>

          <div className="text-center text-xs text-slate-400 mt-10 space-y-1">
            <p>Văn bản công khai tuân thủ Luật Thương mại điện tử số 122/2025/QH15 & Nghị định 248/2026/NĐ-CP.</p>
            <p>© {new Date().getFullYear()} CÔNG TY TNHH DƯỢC PHẨM NGỌC KIM NGÂN. All rights reserved.</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function AccordionItem({ section, defaultOpen }: { section: Section; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen !== undefined ? defaultOpen : true);

  return (
    <div id={section.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 scroll-mt-24">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${open ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>
            {section.icon}
          </div>
          <div className="min-w-0">
            <h3 className={`text-base font-bold transition-colors ${open ? 'text-teal-800' : 'text-slate-800'}`}>
              {section.title}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {section.badge && (
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 border border-teal-200 text-teal-700">
              {section.badge}
            </span>
          )}
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-0">
          <div className="pt-3 border-t border-slate-100">
            {section.content}
          </div>
        </div>
      </div>
    </div>
  );
}
