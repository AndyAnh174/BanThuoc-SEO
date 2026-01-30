export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER'
}

export enum UserStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    REJECTED = 'REJECTED',
    LOCKED = 'LOCKED'
}

export interface BusinessProfile {
    id: number;
    business_name: string;
    license_number: string;
    license_file_url: string | null;
    address: string;
    tax_id: string;
}

export interface RewardPointLog {
    id: number;
    points: number;
    reason: string;
    reason_display: string;
    description: string;
    created_at: string;
    related_order: number | null;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface OrderItem {
    id: number;
    product: number;
    product_name: string;
    quantity: number;
    price: number;
    total_price: number;
}

export interface Order {
    id: number;
    user: number | null; // User ID or null for guest
    full_name: string;
    phone_number: string;
    email?: string;
    address: string;
    province?: string;
    district?: string;
    ward?: string;
    status: OrderStatus;
    payment_method: string;
    payment_status: string;
    total_amount: number;
    shipping_fee: number;
    discount_amount: number;
    final_amount: number;
    note?: string;
    created_at: string;
    items: OrderItem[];
}

export interface OrderListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Order[];
}

export interface User {
    id: number;
    username?: string;
    email: string;
    full_name: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    is_active?: boolean;
    date_joined: string;
    business_profile?: BusinessProfile;
    loyalty_points?: number;
    favorites?: any[]; // Keep flexible or define Product type
    orders?: Order[];
    point_logs?: RewardPointLog[];
}

export interface UserListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
}

export interface UserStatusUpdate {
    status: UserStatus;
    reason?: string;
}

export interface UserCreateData {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    full_name?: string;
    phone?: string;
    role: UserRole;
    status?: UserStatus;
}

export interface UserUpdateData {
    full_name?: string;
    phone?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    is_active?: boolean;
    password?: string;
}

