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

