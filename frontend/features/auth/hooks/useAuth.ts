/**
 * useAuth Hook
 * 
 * Centralized auth logic with mutations
 * Uses React Query for server state management
 */

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/user.store';
import { useCartStore } from '@/store/cart.store';
import { authApi } from '@/features/auth/services/auth.service';
import type { AuthResponse, SignupRequest, LoginRequest } from '@/features/auth/types/auth.types';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

type ApiErrorPayload = {
  error?: string;
};

function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorPayload>;
  return axiosError.response?.data?.error || fallback;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth, setLoading, user, isAuthenticated } = useAuthStore();
  const syncCartToServer = useCartStore((s) => s.syncToServer);

  /**
   * Login Mutation
   */
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (response: AuthResponse) => {
      setAuth(response.user);
      syncCartToServer();
      toast.success('Login successful!');
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectTo);
      router.refresh();
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Login failed. Please try again.');
      toast.error(message);
      setLoading(false);
    },
  });

  /**
   * Signup Mutation
   */
  const signupMutation = useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (response: AuthResponse) => {
      setAuth(response.user);
      syncCartToServer();
      toast.success('Account created successfully!');
      const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/';
      router.push(redirectTo);
      router.refresh();
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, 'Signup failed. Please try again.');
      toast.error(message);
      setLoading(false);
    },
  });

  /**
   * Logout Mutation
   */
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Clear all cached data
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    },
    onError: (error: unknown) => {
      // Even if logout fails on server, clear local state
      clearAuth();
      queryClient.clear();
      router.push('/login');
      router.refresh();
      
      const message = getErrorMessage(error, 'Logout failed');
      toast.error(message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  /**
   * Get Current User Query
   * Only runs if authenticated
   */
  const { isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    // State
    user,
    isAuthenticated,
    isLoading: loginMutation.isPending || signupMutation.isPending || logoutMutation.isPending,
    isLoadingUser,
    
    // Actions
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    
    // Async actions
    loginAsync: loginMutation.mutateAsync,
    signupAsync: signupMutation.mutateAsync,
    logoutAsync: logoutMutation.mutateAsync,
  };
}
