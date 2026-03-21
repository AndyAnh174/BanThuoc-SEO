import { http } from '@/lib/http';

export interface ReturnRequest {
    id: string;
    order_id: number;
    user: number;
    user_name?: string;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    refund_amount: number;
    admin_notes: string;
    created_at: string;
    processed_at: string | null;
}

export const fetchAdminReturns = async (page = 1, status = '') => {
    const params: Record<string, string> = { page: page.toString() };
    if (status && status !== 'all') params.status = status;
    return http.get('/admin/returns/', { params });
};

export const processReturnRequest = async (
    returnId: string,
    action: 'approve' | 'reject',
    adminNotes = '',
    refundAmount?: number
) => {
    const body: Record<string, unknown> = { action, admin_notes: adminNotes };
    if (action === 'approve' && refundAmount !== undefined) {
        body.refund_amount = refundAmount;
    }
    return http.post(`/admin/returns/${returnId}/action/`, body);
};
