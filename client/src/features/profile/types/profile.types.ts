export interface BusinessProfile {
    business_name: string;
    license_number: string;
    license_file_url: string;
    address: string;
    tax_id: string;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone: string;
    avatar: string | null;
    role: 'ADMIN' | 'CUSTOMER';
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'LOCKED';
    date_joined: string;
    is_verified: boolean;
    business_profile: BusinessProfile | null;
}

export interface UserProfileUpdateData {
    full_name?: string;
    phone?: string;
}

