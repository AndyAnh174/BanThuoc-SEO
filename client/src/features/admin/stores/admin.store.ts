import { create } from 'zustand';
import { User, UserListResponse, UserStatus, UserCreateData, UserUpdateData } from '../types/admin.types';
import { fetchUsers, updateUserStatus, createUser, updateUser, deleteUser } from '../api/admin.api';
import { toast } from 'sonner';

interface AdminState {
    users: User[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
    
    // Filters
    page: number;
    filterStatus: string;
    filterRole: string;
    searchQuery: string;

    // Actions
    setPage: (page: number) => void;
    setFilterStatus: (status: string) => void;
    setFilterRole: (role: string) => void;
    setSearchQuery: (query: string) => void;
    loadUsers: () => Promise<void>;
    approveUser: (userId: number) => Promise<boolean>;
    rejectUser: (userId: number, reason: string) => Promise<boolean>;
    createUser: (data: UserCreateData) => Promise<User | null>;
    updateUser: (userId: number, data: UserUpdateData) => Promise<User | null>;
    deleteUser: (userId: number) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    users: [],
    totalCount: 0,
    isLoading: false,
    error: null,
    
    page: 1,
    filterStatus: '',
    filterRole: '',
    searchQuery: '',

    setPage: (page) => {
        set({ page });
        get().loadUsers();
    },
    setFilterStatus: (status) => {
        set({ filterStatus: status, page: 1 });
        get().loadUsers();
    },
    setFilterRole: (role) => {
        set({ filterRole: role, page: 1 });
        get().loadUsers();
    },
    setSearchQuery: (query) => {
        set({ searchQuery: query, page: 1 });
        get().loadUsers(); 
        // Note: Real-time search might need debounce outside of store or here
    },

    loadUsers: async () => {
        set({ isLoading: true, error: null });
        try {
            const { page, filterStatus, searchQuery, filterRole } = get();
            const data = await fetchUsers(page, filterStatus, searchQuery, filterRole);
            set({ 
                users: data.results, 
                totalCount: data.count, 
                isLoading: false 
            });
        } catch (error: any) {
            set({ 
                isLoading: false, 
                error: error.message || "Không thể tải danh sách người dùng" 
            });
            toast.error("Lỗi khi tải danh sách người dùng");
        }
    },

    approveUser: async (userId: number) => {
        try {
             // Optimistic Update can be done here, but safer to wait for API
            await updateUserStatus(userId, { status: UserStatus.ACTIVE });
            
            toast.success("Đã phê duyệt người dùng thành công");
            
            // Refresh list
            get().loadUsers();
            return true;
        } catch (error: any) {
            toast.error("Không thể phê duyệt người dùng");
            return false;
        }
    },

    rejectUser: async (userId: number, reason: string) => {
        try {
            await updateUserStatus(userId, { 
                status: UserStatus.REJECTED,
                reason: reason 
            });
            
            toast.success("Đã từ chối người dùng");
            get().loadUsers();
            return true;
        } catch (error: any) {
             toast.error("Không thể từ chối người dùng");
             return false;
        }
    },

    createUser: async (data: UserCreateData) => {
        try {
            const user = await createUser(data);
            toast.success("Tạo người dùng thành công");
            get().loadUsers();
            return user;
        } catch (error: any) {
            const message = error.response?.data?.detail || error.response?.data?.username?.[0] || error.response?.data?.email?.[0] || "Không thể tạo người dùng";
            toast.error(message);
            return null;
        }
    },

    updateUser: async (userId: number, data: UserUpdateData) => {
        try {
            const user = await updateUser(userId, data);
            toast.success("Cập nhật người dùng thành công");
            get().loadUsers();
            return user;
        } catch (error: any) {
            const message = error.response?.data?.detail || error.response?.data?.email?.[0] || "Không thể cập nhật người dùng";
            toast.error(message);
            return null;
        }
    },

    deleteUser: async (userId: number) => {
        try {
            await deleteUser(userId);
            toast.success("Xóa người dùng thành công");
            get().loadUsers();
            return true;
        } catch (error: any) {
            const message = error.response?.data?.detail || "Không thể xóa người dùng";
            toast.error(message);
            return false;
        }
    }
}));

