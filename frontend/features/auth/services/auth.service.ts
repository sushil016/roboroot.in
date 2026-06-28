/**
 * Authentication API Client
 * All auth-related API calls
 */

import api from '@/lib/api-client';
import { API_BASE_URL } from '@/lib/api/config';
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  User,
  UpdateProfileRequest,
} from '@/features/auth/types/auth.types';

export const authApi = {
  /**
   * Register a new user
   * POST /api/auth/signup
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/signup', data);
    return response.data.data;
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data.data;
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/refresh');
    return response.data.data;
  },

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data.data;
  },

  /**
   * Update current authenticated user
   * PATCH /api/auth/me
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.patch('/api/auth/me', data);
    return response.data.data;
  },

  /**
   * Get Google OAuth URL
   * This will redirect user to Google login
   */
  getGoogleAuthUrl: (): string => {
    return `${API_BASE_URL}/api/auth/google`;
  },

  /**
   * Get GitHub OAuth URL
   * This will redirect user to GitHub login
   */
  getGitHubAuthUrl: (): string => {
    return `${API_BASE_URL}/api/auth/github`;
  },

  /**
   * Handle OAuth callback (Google/GitHub)
   * This is typically called by backend redirect
   * GET /api/auth/google/callback?code=xxx
   */
  handleOAuthCallback: async (provider: 'google' | 'github', code: string): Promise<AuthResponse> => {
    const response = await api.get(`/api/auth/${provider}/callback?code=${code}`);
    return response.data.data;
  },
};

export async function requestPasswordReset(email: string): Promise<void> {
  await api.post('/api/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/api/auth/reset-password', { token, newPassword });
}

export async function verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
  const response = await api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  return response.data;
}

export async function resendVerification(email: string): Promise<void> {
  await api.post('/api/auth/resend-verification', { email });
}
