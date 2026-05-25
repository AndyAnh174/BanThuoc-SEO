import { http } from '@/lib/http';
import { RegisterFormValues } from '../types/register.schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const registerUser = async (data: RegisterFormValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirm_password', data.confirmPassword);
    formData.append('full_name', data.fullName);
    formData.append('phone', data.phone);
    // formData.append('role', 'pharmacy'); 

    // Enterprise/Pharmacy specific fields
    formData.append('business_name', data.businessName);
    formData.append('license_number', data.licenseNumber);
    formData.append('tax_id', data.taxId);
    formData.append('address', data.address);
    
    if (data.licenseFiles && data.licenseFiles.length > 0) {
        data.licenseFiles.forEach((file) => {
            formData.append('license_files', file);
        });
    }

    // Register usually doesn't need auth header, but using http is fine (no token). 
    // However, multipart/form-data needs specific header override or let axios handle it.
    // http instance has default json type. We override here.
    // Let axios set the correct Content-Type with boundary for multipart
    const response = await http.post('/auth/register', formData);

    return response;
};

export const loginUser = async (credentials: any) => {
  // Login doesn't need auth header
  const response = await http.post('/auth/token/', credentials);
  return response;
};
