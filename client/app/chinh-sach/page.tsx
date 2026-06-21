import { Metadata } from 'next';
import { MainLayout } from '@/src/features/layout';

export const metadata: Metadata = {
  title: 'Chính sách & Điều khoản | BanThuocSi - NKN Pharma',
  description: 'Điều kiện giao dịch chung, chính sách mua hàng, giao nhận, thanh toán, bảo mật thông tin tại BanThuocSi.vn.',
  alternates: { canonical: '/chinh-sach' },
  robots: { index: true, follow: true },
};

export default function ChinhSachPage() {
  return (
    <MainLayout fullWidth>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Chính sách & Điều khoản</h1>
            <p className="text-teal-100 max-w-2xl">Các quy định và điều kiện giao dịch tại BanThuocSi.vn</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
            <PolicyContent />
            <p className="text-sm text-gray-400 mt-12 pt-6 border-t border-gray-100">
              Cập nhật lần cuối: 21/06/2026
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function PolicyContent() {
  return (
    <div className="prose prose-teal max-w-none">
      <h2>ĐIỀU KIỆN GIAO DỊCH CHUNG</h2>

      <h3>1. Phạm vi áp dụng</h3>
      <p>Điều kiện giao dịch chung này được áp dụng đối với mọi giao dịch mua bán hàng hóa phát sinh giữa Công ty TNHH Ngọc Kim Ngân (sau đây gọi là &quot;banthuocsi.vn&quot;) và khách hàng thông qua website banthuocsi.vn.</p>
      <p>Việc khách hàng truy cập, đăng ký tài khoản hoặc đặt hàng trên website đồng nghĩa với việc khách hàng đã đọc, hiểu và đồng ý tuân thủ các điều kiện giao dịch được quy định dưới đây.</p>

      <h3>2. Đối tượng khách hàng</h3>
      <p>Website banthuocsi.vn hoạt động theo mô hình phân phối sỉ, phục vụ các đối tượng sau:</p>
      <ul>
        <li>Nhà thuốc đã được cấp Giấy chứng nhận đủ điều kiện kinh doanh dược;</li>
        <li>Quầy thuốc hợp pháp;</li>
        <li>Phòng khám, cơ sở khám chữa bệnh;</li>
        <li>Doanh nghiệp kinh doanh dược;</li>
        <li>Cá nhân, tổ chức có nhu cầu mua hàng với mục đích kinh doanh lại theo quy định pháp luật.</li>
      </ul>
      <p>Đối với các sản phẩm thuộc danh mục pháp luật quy định điều kiện kinh doanh, khách hàng có trách nhiệm cung cấp đầy đủ hồ sơ pháp lý theo yêu cầu trước khi giao dịch được thực hiện.</p>

      <h3>3. Đăng ký và sử dụng tài khoản</h3>
      <h4>3.1. Điều kiện đăng ký</h4>
      <p>Khách hàng có thể đăng ký tài khoản bằng cách cung cấp các thông tin bao gồm: Họ và tên người đại diện; Tên nhà thuốc/cơ sở kinh doanh; Số điện thoại; Email; Địa chỉ kinh doanh; Mã số thuế/Giấy phép kinh doanh (nếu có).</p>
      <p>Khách hàng cam kết thông tin cung cấp là chính xác, trung thực và tự chịu trách nhiệm về tính xác thực của thông tin đã cung cấp.</p>

      <h4>3.2. Bảo mật tài khoản</h4>
      <p>Khách hàng có trách nhiệm bảo mật thông tin đăng nhập và không chia sẻ tài khoản cho bên thứ ba. Mọi giao dịch phát sinh từ tài khoản của khách hàng đều được xem là do khách hàng thực hiện.</p>

      <h4>3.3. Đình chỉ và chấm dứt tài khoản</h4>
      <p>banthuocsi.vn có quyền tạm đình chỉ hoặc chấm dứt tài khoản của khách hàng trong các trường hợp: cung cấp thông tin không chính xác; vi phạm quy định mua hàng, thanh toán; có hành vi gian lận, lừa đảo; vi phạm pháp luật hoặc quy định của banthuocsi.vn.</p>

      <h3>4. Chính sách đặt hàng</h3>
      <p>Khách hàng có thể đặt hàng trực tuyến thông qua website banthuocsi.vn 24/7. Đơn hàng được xác nhận khi khách hàng hoàn tất quy trình đặt hàng và nhận được thông báo xác nhận qua email hoặc tin nhắn SMS.</p>
      <p>banthuocsi.vn có quyền từ chối hoặc hủy bỏ đơn hàng trong các trường hợp: sản phẩm hết hàng; thông tin khách hàng không chính xác hoặc không đầy đủ; có dấu hiệu gian lận; sản phẩm bị thu hồi hoặc cấm lưu hành theo quy định pháp luật.</p>

      <h3>5. Chính sách giá và thanh toán</h3>
      <p>Tất cả giá sản phẩm hiển thị trên website đã bao gồm thuế GTGT (nếu có) và được niêm yết bằng Đồng Việt Nam (VNĐ). Giá sản phẩm có thể thay đổi theo từng thời điểm mà không cần báo trước. Đối với đơn hàng đã được xác nhận, giá áp dụng là giá tại thời điểm đặt hàng.</p>

      <h4>5.1. Phương thức thanh toán</h4>
      <ul>
        <li>Thanh toán khi nhận hàng (COD) — áp dụng cho đơn hàng dưới 50 triệu đồng;</li>
        <li>Chuyển khoản ngân hàng — Ngân hàng Vietcombank, chủ TK: NGUYEN NGOC KIM NGAN, số TK: 0071000921655;</li>
        <li>Ví điện tử MoMo — SĐT: 096.770.5287, chủ TK: NGUYEN NGOC KIM NGAN.</li>
      </ul>
      <p>Đối với phương thức chuyển khoản, khách hàng vui lòng ghi rõ nội dung chuyển tiền là mã đơn hàng hoặc số điện thoại đặt hàng để được xử lý nhanh chóng.</p>

      <h3>6. Chính sách giao hàng và vận chuyển</h3>
      <p>banthuocsi.vn cung cấp dịch vụ giao hàng thông qua các đơn vị vận chuyển liên kết.</p>

      <h4>6.1. Phạm vi giao hàng</h4>
      <p>Giao hàng trên phạm vi toàn quốc. Thời gian giao hàng dự kiến: Nội thành TP.HCM 2-4 giờ; Miền Nam 1-2 ngày; Miền Trung 2-3 ngày; Miền Bắc 3-5 ngày.</p>

      <h4>6.2. Phí vận chuyển</h4>
      <p>Miễn phí vận chuyển cho đơn hàng từ 500.000 VNĐ. Đơn hàng dưới 500.000 VNĐ tính phí theo bảng giá đơn vị vận chuyển. Phí vận chuyển sẽ được hiển thị rõ ràng trước khi khách hàng xác nhận đặt hàng.</p>

      <h4>6.3. Kiểm tra hàng khi nhận</h4>
      <p>Khách hàng có quyền kiểm tra hàng hóa trước khi ký nhận. Nếu phát hiện sản phẩm bị hư hỏng, sai quy cách, hoặc không đúng chủng loại, khách hàng có quyền từ chối nhận hàng và yêu cầu đổi trả.</p>

      <h3>7. Chính sách hủy đơn hàng</h3>
      <p>Khách hàng có thể yêu cầu hủy đơn hàng trong các trường hợp sau: đơn hàng chưa được xác nhận (trạng thái PENDING) — hủy miễn phí; đơn hàng đã xác nhận nhưng chưa giao (CONFIRMED) — có thể yêu cầu hủy, phí xử lý 10.000 VNĐ/đơn (nếu có).</p>
      <p>Sau khi đơn hàng đã được bàn giao cho đơn vị vận chuyển (SHIPPING), không thể hủy đơn. Khách hàng vui lòng từ chối nhận hàng khi shipper giao đến.</p>

      <h3>8. Chính sách đổi trả và hoàn tiền</h3>
      <h4>8.1. Điều kiện đổi trả</h4>
      <p>Sản phẩm được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng với điều kiện: sản phẩm còn nguyên vẹn, chưa qua sử dụng, còn nguyên tem niêm phong; sản phẩm bị lỗi từ nhà sản xuất; sản phẩm giao sai so với đơn đặt hàng; sản phẩm hết hạn sử dụng hoặc cận date (dưới 6 tháng).</p>

      <h4>8.2. Quy trình đổi trả</h4>
      <p>Khách hàng liên hệ hotline 096.770.5287 hoặc email ngockimnganpharm@gmail.com để thông báo yêu cầu đổi trả. Cung cấp thông tin đơn hàng, hình ảnh sản phẩm và lý do đổi trả. Sau khi xác nhận, khách hàng gửi sản phẩm về địa chỉ: 118/127C/27 Phan Huy Ích, Phường Tân Sơn, TP. Hồ Chí Minh. Chi phí vận chuyển đổi trả do lỗi từ banthuocsi.vn sẽ được chúng tôi thanh toán lại.</p>

      <h4>8.3. Hoàn tiền</h4>
      <p>Hoàn tiền được thực hiện bằng chuyển khoản ngân hàng trong vòng 5-7 ngày làm việc sau khi nhận được sản phẩm trả về và xác nhận đủ điều kiện hoàn tiền.</p>

      <h3>9. Chính sách bảo mật thông tin</h3>
      <h4>9.1. Thu thập thông tin</h4>
      <p>banthuocsi.vn thu thập các thông tin cá nhân cần thiết phục vụ cho việc xử lý đơn hàng, giao hàng và hỗ trợ khách hàng. Thông tin thu thập bao gồm: họ tên, số điện thoại, email, địa chỉ giao hàng, thông tin doanh nghiệp (nếu có).</p>

      <h4>9.2. Mục đích sử dụng thông tin</h4>
      <p>Xử lý đơn hàng và giao hàng; liên lạc, hỗ trợ khách hàng; thông báo khuyến mãi, chương trình ưu đãi (nếu khách hàng đồng ý); tuân thủ các yêu cầu pháp luật.</p>

      <h4>9.3. Bảo vệ thông tin</h4>
      <p>Thông tin khách hàng được bảo vệ bằng các biện pháp kỹ thuật và tổ chức phù hợp. Chúng tôi không bán, chia sẻ hoặc trao đổi thông tin cá nhân của khách hàng cho bên thứ ba, trừ trường hợp: được khách hàng đồng ý; yêu cầu từ cơ quan nhà nước có thẩm quyền; đối tác vận chuyển (chỉ cung cấp thông tin cần thiết để giao hàng).</p>

      <h3>10. Chính sách xử lý khiếu nại</h3>
      <p>Mọi khiếu nại, thắc mắc của khách hàng sẽ được tiếp nhận và xử lý trong vòng 48 giờ làm việc. Khách hàng có thể gửi khiếu nại qua các kênh: Hotline 096.770.5287; Email ngockimnganpharm@gmail.com.</p>

      <h3>11. Sở hữu trí tuệ</h3>
      <p>Mọi nội dung trên website banthuocsi.vn bao gồm nhưng không giới hạn: hình ảnh, logo, văn bản, video, giao diện, mã nguồn... đều thuộc quyền sở hữu của Công ty TNHH Ngọc Kim Ngân hoặc các đối tác đã cấp phép. Nghiêm cấm sao chép, sử dụng hoặc phân phối dưới bất kỳ hình thức nào khi chưa có sự đồng ý bằng văn bản.</p>

      <h3>12. Giới hạn trách nhiệm</h3>
      <p>Công ty TNHH Ngọc Kim Ngân không chịu trách nhiệm đối với việc sử dụng sản phẩm không đúng hướng dẫn, chỉ định của nhà sản xuất hoặc không tuân thủ quy định về bảo quản. Chúng tôi không chịu trách nhiệm về tính liên tục của website trong các trường hợp bất khả kháng như thiên tai, hỏa hoạn, chiến tranh, sự cố kỹ thuật ngoài tầm kiểm soát.</p>

      <h3>13. Điều khoản chung</h3>
      <p>banthuocsi.vn có quyền sửa đổi, bổ sung các điều khoản này bất kỳ lúc nào. Phiên bản cập nhật sẽ được đăng tải trên website và có hiệu lực ngay khi đăng tải. Trong trường hợp có tranh chấp phát sinh, hai bên sẽ ưu tiên giải quyết thông qua thương lượng, hòa giải. Trường hợp không thể giải quyết, vụ việc sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại TP. Hồ Chí Minh.</p>

      <hr className="my-8" />

      <h2>CHÍNH SÁCH BẢO MẬT</h2>
      <p>Chính sách bảo mật này mô tả cách banthuocsi.vn thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của khách hàng khi truy cập và sử dụng website.</p>

      <h3>Các loại thông tin thu thập</h3>
      <ul>
        <li>Thông tin cá nhân: họ tên, số điện thoại, email, địa chỉ giao hàng;</li>
        <li>Thông tin doanh nghiệp: tên doanh nghiệp, mã số thuế, giấy phép kinh doanh;</li>
        <li>Thông tin giao dịch: lịch sử đặt hàng, sản phẩm đã mua, phương thức thanh toán;</li>
        <li>Thông tin kỹ thuật: địa chỉ IP, loại trình duyệt, thời gian truy cập.</li>
      </ul>

      <h3>Thời gian lưu trữ</h3>
      <p>Thông tin cá nhân của khách hàng được lưu trữ trong suốt thời gian tài khoản hoạt động và ít nhất 2 năm sau lần giao dịch cuối cùng, trừ khi có yêu cầu khác từ cơ quan nhà nước có thẩm quyền.</p>

      <h3>Quyền của khách hàng</h3>
      <p>Khách hàng có quyền: yêu cầu truy cập và chỉnh sửa thông tin cá nhân; yêu cầu xóa tài khoản và dữ liệu liên quan; từ chối nhận thông tin quảng cáo, khuyến mãi; khiếu nại về việc xử lý dữ liệu cá nhân.</p>

      <h3>Cookies và theo dõi</h3>
      <p>Website có thể sử dụng cookies để cải thiện trải nghiệm người dùng và phân tích lưu lượng truy cập. Khách hàng có thể tắt cookies trong cài đặt trình duyệt, tuy nhiên một số tính năng của website có thể không hoạt động đầy đủ.</p>

      <h3>Liên hệ</h3>
      <p>Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ: Hotline 096.770.5287; Email ngockimnganpharm@gmail.com; Địa chỉ 118/127C/27 Phan Huy Ích, Phường Tân Sơn, TP. Hồ Chí Minh.</p>
    </div>
  );
}
