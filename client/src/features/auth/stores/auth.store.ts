import { create } from 'zustand';
import { AxiosError } from 'axios';
import { RegisterFormValues } from '../types/register.schema';
import { LoginFormValues } from '../types/login.schema';
import { toast } from 'sonner';
import { registerUser, loginUser } from '../api/auth.api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (data: RegisterFormValues) => Promise<boolean>;
  login: (data: LoginFormValues) => Promise<boolean>;
  resetError: () => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,
  register: async (data: RegisterFormValues) => {
    // ... existing register ...
    set({ isLoading: true, error: null });
    
    try {
      const response = await registerUser(data);

      if (response.status === 201) {
        toast.success("Đăng ký thành công!", {
            description: "Tài khoản đang chờ admin duyệt. Sau khi duyệt, bạn sẽ nhận email xác thực để kích hoạt."
        });
        set({ isLoading: false });
        return true;
      }
      return false;

    } catch (error: any) {
        let errorMessage = "Đã xảy ra lỗi không xác định.";
        
        if (error.response) { 
            const status = error.response.status;
            const data = error.response.data;

            if (status === 400) {
                if (data) {
                     const keys = Object.keys(data);
                     if (keys.length > 0) {
                         const firstKey = keys[0];
                         const firstVal = data[firstKey];
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
              
              if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', access);
                localStorage.setItem('refreshToken', refresh);
              }
              
              toast.success("Đăng nhập thành công!");
              set({ isLoading: false, isAuthenticated: true });
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
      set({ isAuthenticated: false });
      toast.info("Đã đăng xuất");
      window.location.href = '/auth/login';
  },

  checkAuth: () => {
     if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        set({ isAuthenticated: !!token });
     }
  },

  resetError: () => set({ error: null }),
}));
