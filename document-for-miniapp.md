# FUNCTIONAL REQUIREMENT DOCUMENT (FRD)

## Mini App Zalo: Ngọc Kim Ngân Pharmacy

**Đối tượng**: Khách hàng lẻ (B2C)  
**Nền tảng**: Zalo Mini App (React + ZaUI + Tailwind)  
**Backend**: Django DRF `/api/miniapp/` — dùng chung DB PostgreSQL với banthuocsi.vn  
**Auth**: Zalo OAuth — `getUserInfo` + `getPhoneNumber`

**Danh mục kinh doanh**: Thuốc không kê đơn (OTC), Thực phẩm bảo vệ sức khỏe, Vitamin, Thiết bị y tế, Chăm sóc cá nhân, Dược mỹ phẩm, Mẹ và bé

---

## 1. Menu Chính (Bottom Navigation)

| Trang chủ | Danh mục | Tìm kiếm | Giỏ hàng | Cá nhân |
|-----------|----------|----------|----------|---------|

---

## 2. Trang Chủ

### 2.1. Header
- Logo: Ngọc Kim Ngân Pharmacy
- Thanh Search
- Icon Thông báo (badge số lượng)
- Icon Giỏ hàng (badge số lượng)

### 2.2. Banner
- Hiển thị chương trình nổi bật (slider)
- Sản phẩm, combo, khuyến mãi

### 2.3. Shortcut (8 danh mục)
Hiển thị bằng icon trực quan:
1. Thuốc OTC
2. Thực phẩm chức năng
3. Vitamin
4. Dược mỹ phẩm
5. Thiết bị y tế
6. Mẹ và bé
7. Combo
8. Khác

### 2.4. Block
- **Flash sale**: Có countdown thời gian thực
- **Sản phẩm bán chạy**: Top sản phẩm theo lượt bán
- **Combo**: Gói sản phẩm giá ưu đãi
- **Gợi ý cho bạn**: Theo lịch sử tìm kiếm + sản phẩm đã xem

---

## 3. Danh Mục

Yêu cầu chung: Filter + Sort + Search cho từng danh mục.

### 3.1. Thuốc OTC
- Giảm đau kháng viêm
- Chống dị ứng
- Cơ xương khớp
- Tim mạch
- Tiêu hóa
- Hô hấp
- Thần kinh
- Nội tiết
- Da liễu
- Tiết niệu
- Chống ký sinh trùng

### 3.2. Thực phẩm chức năng
### 3.3. Dược mỹ phẩm
- Chăm sóc da mặt
- Chăm sóc cơ thể
- Chăm sóc tóc
- Khác

### 3.4. Thiết bị y tế
### 3.5. Mẹ và bé
### 3.6. Combo
### 3.7. Khác

---

## 4. Tìm Kiếm

- Search realtime (Elasticsearch)
- Autocomplete / gợi ý
- Lịch sử tìm kiếm (theo user)
- Hot keyword (top từ khóa được search nhiều)
- Filter: Giá, danh mục, thương hiệu

---

## 5. Chi Tiết Sản Phẩm

### 5.1. Hiển Thị
- Ảnh sản phẩm (có zoom)
- Tên sản phẩm
- Giá bán lẻ
- Giá khuyến mãi (nếu có, hiển thị % giảm)
- Đơn vị tính (Hộp / Chai / Tuýp / Vỉ / Viên)
- Tình trạng: Còn hàng / Sắp hết / Hết hàng
- Đã bán: số lượng
- Đánh giá: sao + số lượt đánh giá

### 5.2. Thông Tin Chi Tiết
- Mô tả ngắn
- Thành phần
- Đối tượng sử dụng
- Hướng dẫn sử dụng
- Bảo quản
- Sản phẩm liên quan (cùng danh mục / keyword)

### 5.3. Button Hành Động
- **Thêm vào giỏ hàng** (primary)
- **Mua ngay** (secondary)
- **Chat với dược sĩ** (mở OA chat)
- **Yêu thích** (tim)

---

## 6. Giỏ Hàng

| Thành phần | Mô tả |
|------------|-------|
| Danh sách SP | Tên, ảnh, đơn giá, số lượng (tăng/giảm), thành tiền |
| Voucher | Chọn hoặc nhập mã |
| Điểm tích lũy | Nhập số điểm muốn dùng |
| Tạm tính | Tổng tiền hàng |
| Phí ship | Tính theo GHN API |
| Tổng | Tạm tính + Phí ship - Voucher - Điểm |
| Nút Thanh toán | Chuyển sang bước checkout |

---

## 7. Thanh Toán

### 7.1. Thông Tin Nhận Hàng
- Họ tên người nhận
- Số điện thoại
- Địa chỉ (Tỉnh/TP → Quận/Huyện → Phường/Xã → Số nhà)
- Ghi chú (tuỳ chọn)

### 7.2. Phương Thức Thanh Toán
- COD (Tiền mặt khi nhận hàng)
- Chuyển khoản ngân hàng
- ZaloPay (tích hợp ZaloPay SDK)
- VNPay
- Điểm tích lũy (dùng 1 phần hoặc toàn bộ)

---

## 8. Đơn Hàng

### Luồng trạng thái:

```
PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED
  │                                             │
  └──────────── CANCELLED ←──────────────────────┘ (trong 7 ngày)
                                                  RETURNED
```

| Trạng thái | Backend | Mô tả |
|-----------|---------|-------|
| Chờ xác nhận | `PENDING` | Đơn mới tạo, chờ admin duyệt |
| Đã xác nhận | `CONFIRMED` | Admin đã xác nhận đơn |
| Đang chuẩn bị | `PROCESSING` | Đang đóng gói |
| Đang giao hàng | `SHIPPING` | Đã tạo đơn GHN, có tracking |
| Hoàn thành | `DELIVERED` | Khách đã nhận hàng |
| Đã hủy | `CANCELLED` | Đơn bị hủy (bởi user hoặc admin) |
| Trả hàng | `RETURNED` | Khách yêu cầu trả hàng, đã duyệt |

### Thông báo:
- Mỗi lần trạng thái thay đổi → gửi ZNS (Zalo Notification Service) qua OA
- Badge thông báo trên icon header Mini App

---

## 9. Trang Cá Nhân

### 9.1. Thông Tin Cá Nhân
- Avatar (từ Zalo)
- Họ tên
- Số điện thoại
- Điểm tích lũy hiện có
- Hạng thành viên (Silver / Gold / Platinum / Diamond)

### 9.2. Danh Mục Menu
- Đơn hàng của bạn
- Voucher của bạn
- Điểm thưởng (lịch sử tích/tiêu điểm)
- Sổ địa chỉ
- Yêu thích
- Lịch sử mua hàng → Mua lại
- Liên hệ
- Điều khoản sử dụng
- Chính sách bảo mật

---

## 10. Hội Viên & Tích Điểm

### 10.1. Cấp Bậc Hội Viên

| Hạng | Điều kiện | Tỷ lệ tích điểm |
|------|-----------|:---:|
| **Silver** | Đăng ký tài khoản (mặc định) | 1.0% |
| **Gold** | Tổng chi tiêu > 2.000.000đ | 1.2% |
| **Platinum** | Tổng chi tiêu > 5.000.000đ | 1.5% |
| **Diamond** | Tổng chi tiêu > 10.000.000đ | 2.0% |

- Hạng được tính dựa trên tổng chi tiêu tích lũy (`total_spent`)
- Mỗi lần đơn hàng hoàn thành (DELIVERED) → cập nhật `total_spent` → kiểm tra nâng hạng
- Hạng mới có hiệu lực từ đơn hàng tiếp theo

### 10.2. Cơ Chế Tích Điểm

```
Công thức: Điểm = FLOOR(Số tiền thanh toán × Tỷ lệ tích điểm / 100)

Trong đó:
  - 1 điểm = 1 VND
  - Số tiền thanh toán = final_amount (sau khi trừ voucher, điểm, + phí ship)
  - Tỷ lệ tích điểm = theo hạng hiện tại
```

| Hạng | Đơn 500.000đ | Đơn 1.000.000đ | Đơn 1.200.000đ |
|------|-------------|---------------|---------------|
| Silver (1.0%) | 5.000 điểm | 10.000 điểm | 12.000 điểm |
| Gold (1.2%) | 6.000 điểm | 12.000 điểm | 14.400 điểm |
| Platinum (1.5%) | 7.500 điểm | 15.000 điểm | 18.000 điểm |
| Diamond (2.0%) | 10.000 điểm | 20.000 điểm | 24.000 điểm |

### 10.3. Phân Biệt: Tổng Chi Tiêu vs Điểm Tích Lũy

**Quan trọng — đây là 2 thứ KHÁC NHAU:**

| | Tổng chi tiêu (`total_spent`) | Điểm tích lũy (`loyalty_points`) |
|---|---|---|
| **Là gì?** | Tổng tiền đã mua hàng (cộng dồn vĩnh viễn) | Điểm thưởng kiếm được từ mỗi đơn |
| **Dùng để?** | **Thăng hạng** (Silver→Gold→Platinum→Diamond) | **Tiêu xài** (thanh toán, đổi voucher, đổi quà) |
| **Có bị trừ không?** | ❌ Không bao giờ bị trừ, chỉ tăng | ✅ Bị trừ khi dùng để thanh toán / đổi quà |
| **Công thức** | `total_spent += final_amount` (mỗi đơn DELIVERED) | `points += FLOOR(final_amount × cashback_percent / 100)` |
| **Reset không?** | ❌ Tích lũy vĩnh viễn | ❌ Chỉ giảm khi tiêu, không reset |

> **Tóm lại**: Bạn chi tiền → `total_spent` tăng → đủ ngưỡng thì lên hạng. Mỗi lần chi tiền bạn còn được tặng điểm → điểm để tiêu. Lên hạng cao hơn → tỷ lệ được tặng điểm cao hơn.

### 10.4. Ví Dụ Hành Trình Khách Hàng

Chị A đăng ký tài khoản, bắt đầu ở hạng **Silver** (1.0%):

| Lần | Đơn hàng | Cộng dồn total_spent | Hạng hiện tại | Điểm kiếm được | Tổng điểm |
|-----|----------|---------------------|---------------|---------------|-----------|
| 1 | 500.000đ | 500.000đ | Silver (1.0%) | 5.000 | 5.000 |
| 2 | 800.000đ | 1.300.000đ | Silver (1.0%) | 8.000 | 13.000 |
| 3 | 1.000.000đ | **2.300.000đ** ✅ | **→ Gold** (1.2%) | 12.000 | 25.000 |
| 4 | 1.500.000đ | 3.800.000đ | Gold (1.2%) | 18.000 | 43.000 |
| 5 | 2.000.000đ | **5.800.000đ** ✅ | **→ Platinum** (1.5%) | 30.000 | 73.000 |
| 6 | 500.000đ | 6.300.000đ | Platinum (1.5%) | 7.500 | 80.500 |
| 7 | 4.000.000đ | **10.300.000đ** ✅ | **→ Diamond** (2.0%) | 80.000 | 160.500 |

> 🔑 **Lưu ý**: Hạng được nâng **sau khi đơn hàng hoàn thành** (DELIVERED). Hạng mới có hiệu lực từ **đơn hàng tiếp theo** (không truy thu đơn đang xét). Điểm không reset khi lên hạng — tích lũy mãi mãi.

### 10.5. Sử Dụng Điểm
- **Thanh toán đơn hàng**: 1 điểm = 1 VND, dùng 1 phần hoặc toàn bộ
- **Đổi voucher**: VD 50.000 điểm = voucher giảm 50.000đ
- **Đổi quà**: Sản phẩm / quà tặng trong cửa hàng

---

## 11. Voucher

| Loại | Mô tả |
|------|-------|
| Voucher toàn shop | Áp dụng cho mọi sản phẩm |
| Voucher ngành hàng | Chỉ áp dụng cho danh mục cụ thể |
| Voucher thành viên | Theo hạng (Silver/Gold/Platinum/Diamond) |
| Voucher flash sale | Chỉ dùng trong thời gian flash sale |

**Cơ chế**: Chung bảng `vouchers_voucher` với B2B, phân biệt bằng field `applicable_user_type` (B2B / B2C / ALL).

---

## 12. Chat Với Dược Sĩ

Tích hợp Zalo OA Chat — user chat trực tiếp với dược sĩ qua OA.

### 4 Categories:
1. **Tư vấn sản phẩm** — Hỏi về công dụng, cách dùng, tác dụng phụ
2. **Tư vấn đơn thuốc** — Gửi đơn thuốc, dược sĩ kiểm tra
3. **Khiếu nại** — Phản ánh về đơn hàng, sản phẩm
4. **Hỗ trợ đơn hàng** — Kiểm tra trạng thái, đổi trả, hủy

### Tính năng chat:
- Gửi tin nhắn văn bản
- Gửi hình ảnh
- Gửi file (đơn thuốc PDF, ảnh toa)
- Lưu lịch sử chat theo user

---

## 13. Liên Hệ

- **Hotline**: 096.770.5287
- **Google Maps**: [Nhà thuốc Ngọc Kim Ngân](https://maps.google.com)
- **Facebook**: [fb.com/ngockimnganpharmacy](https://facebook.com)
- **TikTok**: [tiktok.com/@ngockimngan](https://tiktok.com)
- **Shopee**: [shopee.vn/ngockimngan](https://shopee.vn)

---

## User Flow

```
Khách mở Mini App
  │
  ▼
Đăng nhập bằng Zalo (tự động)
  │
  ▼
Trang chủ
  ├── Tìm sản phẩm (Search / Danh mục / Flash sale)
  ├── Xem chi tiết sản phẩm
  │     ├── Thêm vào giỏ hàng
  │     ├── Mua ngay → Checkout
  │     ├── Chat với dược sĩ (OA)
  │     └── Yêu thích
  ├── Giỏ hàng
  │     ├── Chọn voucher / nhập điểm
  │     └── Thanh toán
  │           ├── Nhập thông tin nhận hàng
  │           ├── Chọn phương thức thanh toán
  │           └── Đặt hàng
  ├── Theo dõi đơn hàng → Nhận thông báo ZNS
  └── Trang cá nhân
        ├── Đơn hàng / Voucher / Điểm / Địa chỉ / Yêu thích
        └── Membership tier + lịch sử tích điểm
```
