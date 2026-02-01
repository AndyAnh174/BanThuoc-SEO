import { http } from '@/lib/http';
import { 
  Voucher, 
  VoucherListResponse, 
  CreateVoucherParams,
  UpdateVoucherParams 
} from '../types/voucher.types';

export const getVouchers = async (params?: any) => {
  const response = await http.get<VoucherListResponse>('/vouchers/manage/', { params });
  return response.data;
};

export const getVoucher = async (id: string) => {
  const response = await http.get<Voucher>(`/vouchers/manage/${id}/`);
  return response.data;
};

export const createVoucher = async (data: CreateVoucherParams) => {
  const response = await http.post<Voucher>('/vouchers/manage/', data);
  return response.data;
};

export const updateVoucher = async (id: string, data: UpdateVoucherParams) => {
  const response = await http.patch<Voucher>(`/vouchers/manage/${id}/`, data);
  return response.data;
};

export const deleteVoucher = async (id: string) => {
  const response = await http.delete(`/vouchers/manage/${id}/`);
  return response.data;
};
