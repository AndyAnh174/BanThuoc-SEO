import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

// 1. OTC - Thuốc OTC (2 Pills / Capsule & Tablet)
export function IconOTC({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.5 13.5L4.5 19.5C3.12 18.12 3.12 15.88 4.5 14.5L10.5 8.5L15.5 13.5L10.5 13.5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.5 10.5L19.5 4.5C20.88 5.88 20.88 8.12 19.5 9.5L13.5 15.5L8.5 10.5L13.5 10.5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 10.5L13.5 15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="17.5" cy="17.5" r="3.5" stroke={color} strokeWidth="1.8"/>
      <path d="M15.5 17.5H19.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// 2. TPCN - Thực phẩm chức năng (Herbal bowl with leaf)
export function IconTPCN({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 11C4 15.4183 7.58172 19 12 19C16.4183 19 20 15.4183 20 11H4Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11V5C12 5 15 4 17 6C19 8 17 11 17 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8C12 8 9.5 6.5 8 8C6.5 9.5 8.5 11 8.5 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 20H22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// 3. Vitamin - Khiên y tế (Shield with Plus)
export function IconVitamin({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 3L4 6V12C4 17.5228 7.41828 21.0822 12 22C16.5817 21.0822 20 17.5228 20 12V6L12 3Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8 12H16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// 4. D.MỹPhẩm - Dược mỹ phẩm (Cosmetic medicine bottle)
export function IconDuocMyPham({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="7" y="9" width="10" height="12" rx="2.5" stroke={color} strokeWidth="1.8"/>
      <path d="M9 9V5C9 4.44772 9.44772 4 10 4H14C14.5523 4 15 4.44772 15 5V9" stroke={color} strokeWidth="1.8"/>
      <path d="M10 2H14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M10 15H14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 13V17" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// 5. TB Y Tế - Thiết bị y tế (Stethoscope)
export function IconTBYTe({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 3V8C6 11.3137 8.68629 14 12 14C15.3137 14 18 11.3137 18 8V3" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 14V17C12 19.2091 13.7909 21 16 21H18" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="19" cy="19" r="2" stroke={color} strokeWidth="1.8"/>
      <circle cx="6" cy="3" r="1.5" fill={color}/>
      <circle cx="18" cy="3" r="1.5" fill={color}/>
    </svg>
  );
}

// 6. Mẹ & Bé - Mẹ bế bé (Mother & Child)
export function IconMeBe({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="5" r="2.5" stroke={color} strokeWidth="1.8"/>
      <path d="M7 21C7 16 9 12 12 12C15 12 17 16 17 21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 15C9 13.5 10.5 12 12 12C13.5 12 15 13.5 15 15" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1.5" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

// 7. Combo - Combo ưu đãi (Gift box)
export function IconCombo({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="10" width="18" height="11" rx="2" stroke={color} strokeWidth="1.8"/>
      <path d="M2 7H22V10H2V7Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 7V21" stroke={color} strokeWidth="1.8"/>
      <path d="M7.5 7C5.5 7 4 5.5 5 4C6 2.5 9 4.5 12 7C15 4.5 18 2.5 19 4C20 5.5 18.5 7 16.5 7" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// 8. Khác - 4 Chấm tròn danh mục (4 Grid Circles)
export function IconKhac({ size = 28, color = "#0d9488", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="7" cy="7" r="3" stroke={color} strokeWidth="1.8"/>
      <circle cx="17" cy="7" r="3" stroke={color} strokeWidth="1.8"/>
      <circle cx="7" cy="17" r="3" stroke={color} strokeWidth="1.8"/>
      <circle cx="17" cy="17" r="3" stroke={color} strokeWidth="1.8"/>
    </svg>
  );
}

// ── QUICK ACTIONS ICONS ──

// Đơn hàng (Package Box)
export function IconDonHang({ size = 26, color = "#16a34a", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 8L12 3L3 8V16L12 21L21 16V8Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 8L12 13L21 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 13V21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7.5 5.5L16.5 10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// Voucher (Coupon Ticket %)
export function IconVoucher({ size = 26, color = "#0284c7", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V9C18.8954 9 18 9.89543 18 11C18 12.1046 18.8954 13 20 13V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V13C5.10457 13 6 12.1046 6 11C6 9.89543 5.10457 9 4 9V6Z" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 15L15 9" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="10" cy="10" r="1" fill={color}/>
      <circle cx="14" cy="14" r="1" fill={color}/>
    </svg>
  );
}

// Điểm thưởng (Star)
export function IconDiemThuong({ size = 26, color = "#eab308", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Chat Dược sĩ (Bubble with Plus)
export function IconChatDuocSi({ size = 26, color = "#16a34a", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5 20 9.07 19.64 7.8 19L3 20L4.2 16.4C3.44 15 3 13.3 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V15" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M8.5 11.5H15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
