# 🧪 Web Application Testing Guide - BanThuoc SEO

Tài liệu này hướng dẫn quy trình kiểm thử (Testing) cho hệ thống website BanThuoc.

## 1. Thông Tin Môi Trường (Environment)

| Môi Trường | URL Base | Ghi Chú |
| :--- | :--- | :--- |
| **Production** | `https://banthuoc.andyanh.id.vn` | Server chạy qua Cloudflare Tunnel |
| **Localhost** | `http://localhost` | Server chạy Docker nội bộ |
| **API Endpoint** | `/api/` | Proxy qua Nginx (Port 80/443) |
| **Admin System** | `https://banthuoc.andyanh.id.vn/system-admin/` | Trang quản trị Django gốc |
| **Admin UI** | `https://banthuoc.andyanh.id.vn/admin/` | Trang quản trị Custom (Frontend) |
| **MinIO Console**| `https://banthuoc.andyanh.id.vn/minio/` | Quản lý File/Media (Login: `minioadmin`/`minioadmin`) |

### 🛠️ Tài Khoản Test (Chỉ dùng cho Testing)

| Vai Trò | Username | Password | Quyền Hạn |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `admin` | Toàn quyền hệ thống |
| **Customer** | *(Vui lòng đăng ký mới)* | `123456` | Mua hàng, xem lịch sử đơn |

---

## 2. Kịch Bản Kiểm Thử (Test Cases)

### 👤 Module 1: Xác Thực & Tài Khoản (Authentication)
| ID | Tên Test Case | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) |
| :--- | :--- | :--- | :--- |
| **AUTH-01** | **Đăng nhập (Login)** | 1. Vào `/auth/login`<br>2. Nhập user/pass admin<br>3. Bấm "Đăng nhập" | Chuyển hướng về trang chủ/admin, lưu Token vào Cookies/LocalStorage. Token không bị logout đột ngột. |
| **AUTH-02** | **Đăng ký B2B (Register)** | 1. Vào `/auth/register`<br>2. Nhập thông tin Doanh nghiệp/Nhà thuốc<br>3. Upload giấy phép KD<br>4. Submit | Tạo tài khoản thành công với trạng thái `PENDING`. Email xác thực được gửi (nếu có cấu hình SMTP). |
| **AUTH-03** | **Đăng xuất (Logout)** | 1. Bấm Avatar -> Đăng xuất | Xóa Session, Token. Chuyển về trang Login. API gọi sau đó phải trả về 401. |
| **AUTH-04** | **Cập nhật Profile** | 1. Vào `/profile`<br>2. Đổi tên, Avatar<br>3. Lưu | Thông tin thay đổi, Avatar mới hiển thị (kiểm tra load từ MinIO). |

### 🛒 Module 2: Sản Phẩm & Tìm Kiếm (Products)
| ID | Tên Test Case | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) |
| :--- | :--- | :--- | :--- |
| **PROD-01** | **Xem Danh Sách** | 1. Vào trang chủ hoặc danh mục | Danh sách sản phẩm hiển thị, ảnh không bị lỗi (404). Phân trang hoạt động. |
| **PROD-02** | **Tìm Kiếm (Search)** | 1. Nhập từ khóa vào thanh tìm kiếm<br>2. Enter | Kết quả trả về đúng từ khóa (Test tính năng Elasticsearch). |
| **PROD-03** | **Chi Tiết Sản Phẩm** | 1. Click vào một sản phẩm | Hiển thị đầy đủ: Giá, Mô tả, Tồn kho, Gallery ảnh. URL đổi theo slug sản phẩm. |

### 🛍️ Module 3: Giỏ Hàng & Đặt Hàng (Cart & Checkout)
| ID | Tên Test Case | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) |
| :--- | :--- | :--- | :--- |
| **CART-01** | **Thêm vào giỏ** | 1. Chọn số lượng -> "Thêm vào giỏ" | Thông báo thành công. Icon giỏ hàng cập nhật số lượng. |
| **CART-02** | **Cập nhật giỏ hàng** | 1. Vào Giỏ hàng -> Tăng/Giảm số lượng<br>2. Xóa sản phẩm | Tổng tiền (Subtotal) tính lại chính xác. Server cập nhật state. |
| **CHK-01** | **Đặt hàng (Checkout)** | 1. Bấm "Thanh toán"<br>2. Điền địa chỉ/SĐT<br>3. Chọn phương thức thanh toán<br>4. Xác nhận | Đơn hàng được tạo (Order Created). Giỏ hàng được làm trống. Chuyển hướng trang "Cảm ơn". |

### 🛡️ Module 4: Quản Trị (Admin Portal)
*Truy cập: `/admin` (Frontend UI)*

| ID | Tên Test Case | Các Bước Thực Hiện (Steps) | Kết Quả Mong Đợi (Expected) |
| :--- | :--- | :--- | :--- |
| **ADM-01** | **Quản lý Users** | 1. Vào menu "Người dùng"<br>2. Xem danh sách<br>3. Phê duyệt user `PENDING` -> `ACTIVE` | User chuyển trạng thái. Email thông báo được gửi. User đó có thể đăng nhập. |
| **ADM-02** | **Upload Banner** | 1. Vào menu "Banner"<br>2. Upload ảnh mới, đặt vị trí | Banner mới xuất hiện trên trang chủ. Ảnh lưu bucket `banthuoc-media`. |
| **ADM-03** | **System Admin** | 1. Truy cập `/system-admin` | Vào được Django Admin interface (Giao diện cũ) để debug dữ liệu thô. |

---

## 3. Báo Cáo Lỗi (Bug Reporting)

Khi gặp lỗi, vui lòng cung cấp thông tin theo mẫu:
- **Mô tả lỗi**: (Ví dụ: Không thể thêm sản phẩm vào giỏ)
- **Các bước tái hiện**: (Bước 1, 2, 3...)
- **Ảnh chụp màn hình/Video**: (Kèm theo console log F12 nếu có lỗi đỏ)
- **Môi trường**: (PC/Mobile, Chrome/Safari, Production/Local)

## 4. Các Vấn Đề Đã Biết (Known Issues) / Lưu Ý
- **CORS/Redirect**: Nếu gặp lỗi CORS, hãy thử Clear Cache hoặc mở Tab ẩn danh (Do lịch sử redirect 301 cũ).
- **Email**: Trên Localhost, email sẽ được log ra console backend (nếu không cấu hình SMTP thật). Trên Production đã cấu hình Gmail SMTP.
- **SSL**: Production dùng SSL của Cloudflare. Localhost chạy HTTP thường.
