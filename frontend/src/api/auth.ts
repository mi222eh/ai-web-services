import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routerContext } from '@/lib/routerContext';
import { getAuthCheckQueryOptions } from './queries';

// Configure axios defaults
axios.defaults.withCredentials = true;  // This ensures cookies are sent with requests

interface LoginResponse {
  message: string;
}

interface AuthCheckResponse {
  authenticated: boolean;
}

// API functions
const checkAuth = async (): Promise<AuthCheckResponse> => {
  const response = await axios.get<AuthCheckResponse>('/api/auth/check');
  return response.data;
};

const login = async (password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>('/api/auth/login', { password });
  return response.data;
};

const logout = async (): Promise<void> => {
  await axios.post('/api/auth/logout');
};

// React Query Hooks
export const useAuthCheck = () => {
  return useQuery(getAuthCheckQueryOptions());
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: async () => {
      // Invalidate and refetch auth check
      await queryClient.invalidateQueries(getAuthCheckQueryOptions());
      await routerContext.auth.checkAuth();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      console.log("Logout successful")
      // Reset all queries to clear the cache
      await queryClient.resetQueries()
      // Update auth state
      routerContext.auth.isAuthenticated = false
    },
    onError: (error) => {
      console.error("Logout failed:", error)
      // Still try to reset queries and auth state
      queryClient.resetQueries()
      routerContext.auth.isAuthenticated = false
    }
  });
}; 