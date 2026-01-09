import { create } from 'zustand';
import { User, UserListResponse, UserStatus } from '../types/admin.types';
import { fetchUsers, updateUserStatus } from '../api/admin.api';
import { toast } from 'sonner';

interface AdminState {
    users: User[];
    totalCount: number;
    isLoading: boolean;
    error: string | null;
    
    // Filters
    page: number;
    filterStatus: string;
    searchQuery: string;

    // Actions
    setPage: (page: number) => void;
    setFilterStatus: (status: string) => void;
    setSearchQuery: (query: string) => void;
    loadUsers: () => Promise<void>;
    approveUser: (userId: number) => Promise<boolean>;
    rejectUser: (userId: number, reason: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
    users: [],
    totalCount: 0,
    isLoading: false,
    error: null,
    
    page: 1,
    filterStatus: '',
    searchQuery: '',

    setPage: (page) => {
        set({ page });
        get().loadUsers();
    },
    setFilterStatus: (status) => {
        set({ filterStatus: status, page: 1 });
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
            const { page, filterStatus, searchQuery } = get();
            const data = await fetchUsers(page, filterStatus, searchQuery);
            set({ 
                users: data.results, 
                totalCount: data.count, 
                isLoading: false 
            });
        } catch (error: any) {
            set({ 
                isLoading: false, 
                error: error.message || "Failed to load users" 
            });
            toast.error("Error loading users");
        }
    },

    approveUser: async (userId: number) => {
        try {
             // Optimistic Update can be done here, but safer to wait for API
            await updateUserStatus(userId, { status: UserStatus.ACTIVE });
            
            toast.success("User approved successfully");
            
            // Refresh list
            get().loadUsers();
            return true;
        } catch (error: any) {
            toast.error("Failed to approve user");
            return false;
        }
    },

    rejectUser: async (userId: number, reason: string) => {
        try {
            await updateUserStatus(userId, { 
                status: UserStatus.REJECTED,
                reason: reason 
            });
            
            toast.success("User rejected");
            get().loadUsers();
            return true;
        } catch (error: any) {
             toast.error("Failed to reject user");
             return false;
        }
    }
}));
