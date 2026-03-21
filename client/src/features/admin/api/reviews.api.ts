import { http } from '@/lib/http';

export interface Review {
    id: string;
    user: number;
    user_name: string;
    product: string;
    product_name?: string;
    rating: number;
    title: string;
    content: string;
    is_verified_purchase: boolean;
    is_approved: boolean;
    created_at: string;
    updated_at: string;
}

export const fetchAdminReviews = async (page = 1, status = 'pending') => {
    const params: Record<string, string> = { page: page.toString() };
    if (status && status !== 'all') params.status = status;
    return http.get('/admin/reviews/', { params });
};

export const moderateReview = async (reviewId: string, action: 'approve' | 'reject') => {
    return http.post(`/admin/reviews/${reviewId}/moderate/`, { action });
};
