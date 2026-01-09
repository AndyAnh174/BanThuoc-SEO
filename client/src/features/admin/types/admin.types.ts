export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
    PHARMACY = 'PHARMACY',
    ENTERPRISE = 'ENTERPRISE'
}

export enum UserStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    REJECTED = 'REJECTED'
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
    email: string;
    full_name: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
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
