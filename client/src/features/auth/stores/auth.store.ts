import { create } from 'zustand';
import { AxiosError } from 'axios';
import { RegisterFormValues } from '../types/register.schema';
import { LoginFormValues } from '../types/login.schema';
import { toast } from 'sonner';
import { registerUser, loginUser } from '../api/auth.api';

interface AuthState {
  isLoading: boolean;
  error: string | null;
  register: (data: RegisterFormValues) => Promise<boolean>;
  login: (data: LoginFormValues) => Promise<boolean>;
  resetError: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoading: false,
  error: null,
  register: async (data: RegisterFormValues) => {
    // ... (existing register code)
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

  login: async (data: LoginFormValues) => {
      set({ isLoading: true, error: null });
      try {
          const response = await loginUser(data);
          
          if (response.status === 200) {
              const { access, refresh } = response.data;
              
              // Store tokens
              if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
              }
              
              toast.success("Đăng nhập thành công!");
              set({ isLoading: false });
              return true;
          }
          return false;
      } catch (error: any) {
        let errorMessage = "Tên đăng nhập hoặc mật khẩu không đúng.";
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
             if (status === 401) {
                errorMessage = "Thông tin đăng nhập không chính xác.";
             } else if (data && data.detail) {
                 errorMessage = data.detail;
             }
        } else if (error.request) {
             errorMessage = "Lỗi kết nối mạng.";
        }
        
        toast.error("Đăng nhập thất bại", { description: errorMessage });
        set({ isLoading: false, error: errorMessage });
        return false;
      }
  },

  logout: () => {
      if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
      }
      toast.info("Đã đăng xuất");
      // Optional: Force reload or redirect using window.location if router isn't available
      window.location.href = '/auth/login';
  },

  resetError: () => set({ error: null }),
}));
