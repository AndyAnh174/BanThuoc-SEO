import { http } from '@/lib/http';

export interface ProductType {
    id: string;
    name: string;
    code: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export type CreateProductTypeInput = Pick<ProductType, 'name' | 'code' | 'description'>;
export type UpdateProductTypeInput = Partial<CreateProductTypeInput>;

export const productTypesApi = {
    list: () => http.get<ProductType[]>('/admin/product-types/'),
    get: (id: string) => http.get<ProductType>(`/admin/product-types/${id}/`),
    create: (data: CreateProductTypeInput) => http.post<ProductType>('/admin/product-types/', data),
    update: (id: string, data: UpdateProductTypeInput) => http.patch<ProductType>(`/admin/product-types/${id}/`, data),
    delete: (id: string) => http.delete(`/admin/product-types/${id}/`),
};
