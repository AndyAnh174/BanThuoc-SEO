import { http } from '@/lib/http';

export interface Manufacturer {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo?: string;
    website?: string;
    country?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ManufacturerListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Manufacturer[];
}

export type ManufacturerCreateInput = Pick<Manufacturer, 'name' | 'description' | 'logo' | 'website' | 'country' | 'is_active'>;
export type ManufacturerUpdateInput = Partial<ManufacturerCreateInput>;

export const manufacturersApi = {
    list: (params?: { page?: number; search?: string }) =>
        http.get<ManufacturerListResponse>('/admin/manufacturers/', { params }),
    get: (id: string) =>
        http.get<Manufacturer>(`/admin/manufacturers/${id}/`),
    create: (data: ManufacturerCreateInput) =>
        http.post<Manufacturer>('/admin/manufacturers/', data),
    update: (id: string, data: ManufacturerUpdateInput) =>
        http.patch<Manufacturer>(`/admin/manufacturers/${id}/`, data),
    delete: (id: string) =>
        http.delete(`/admin/manufacturers/${id}/`),
};
