/**
 * Authentication Type Definitions
 * Matches backend /src/utils/types.ts
 */

export type UserRole = 'ADMIN' | 'STUDENT' | 'MENTOR';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatarUrl: string | null;
  college: string | null;
}

export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
  college?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string | null;
  college?: string | null;
  avatarUrl?: string | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  expiresIn: number; // in seconds
}

export interface OAuthCallbackRequest {
  code: string;
  state?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId?: string;
  iat: number;
  exp: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  setAuth: (user: User) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;
