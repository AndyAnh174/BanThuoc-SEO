import { create } from 'zustand';
import { AxiosError } from 'axios';
import { RegisterFormValues } from '../types/register.schema';
import { toast } from 'sonner';
import { registerUser } from '../api/auth.api';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  register: (data: RegisterFormValues) => Promise<boolean>;
  resetError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  error: null,
  register: async (data: RegisterFormValues) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await registerUser(data);

      if (response.status === 201) {
        toast.success("Đăng ký thành công!", {
            description: "Vui lòng kiểm tra email để xác thực tài khoản."
        });
        set({ isLoading: false });
        // Optional: Redirect logic can be handled by the component listening to this specific successful action return
        return true;
      }
      return false;

    } catch (error: any) {
        let errorMessage = "Đã xảy ra lỗi không xác định.";
        
        if (error.response) { // Check for Axios error response
            const status = error.response.status;
            const data = error.response.data;

            if (status === 400) {
                // Handle Validation Errors
                if (data) {
                     // Try to extract the first error message from DRF response
                     // DRF usually returns { field: ["error message"], ... }
                     const keys = Object.keys(data);
                     if (keys.length > 0) {
                         const firstKey = keys[0];
                         const firstVal = data[firstKey];
                         // Format: "email: nội dung lỗi"
                         errorMessage = `${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`;
                     } else {
                         errorMessage = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
                     }
                } else {
                    errorMessage = "Dữ liệu không hợp lệ.";
                }
            } else if (status === 500) {
                errorMessage = "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.";
            } else if (data && data.detail) {
                errorMessage = data.detail;
            }
        } else if (error.request) {
            errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
        }
        
        toast.error("Đăng ký thất bại", {
            description: errorMessage
        });
        
        set({ isLoading: false, error: errorMessage });
        return false;
    }
  },
  resetError: () => set({ error: null }),
}));
