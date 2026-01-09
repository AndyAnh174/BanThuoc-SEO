import axios from 'axios';
import { RegisterFormValues } from '../types/register.schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const registerUser = async (data: RegisterFormValues) => {
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('full_name', data.fullName);
    formData.append('phone_number', data.phone);
    formData.append('role', 'pharmacy'); // Default role for this form

    // Enterprise/Pharmacy specific fields
    formData.append('pharmacy_name', data.businessName);
    formData.append('license_number', data.licenseNumber);
    formData.append('tax_id', data.taxId);
    formData.append('address', data.address);
    
    if (data.licenseFile) {
        formData.append('license_file', data.licenseFile);
    }

    const response = await axios.post(`${API_URL}/api/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
    });

    return response;
};
