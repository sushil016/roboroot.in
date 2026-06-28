import type { Request, Response } from "express";
import {
  signupWithEmail,
  loginWithEmail,
  refreshAccessToken,
  logout,
  getUserById,
  updateUserProfile,
} from "../services/auth.service.js";
import {
  requestPasswordReset,
  resetPassword,
} from "../services/password-reset.service.js";
import {
  verifyEmailToken,
  resendVerificationEmail,
} from "../services/email-verification.service.js";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
} from "../services/google-auth.service.js";
import {
  getGitHubAuthUrl,
  handleGitHubCallback,
} from "../services/github-auth.service.js";
import { validateSignupRequest, validateLoginRequest } from "../utils/validation.js";
import { AuthError, ValidationError } from "../utils/types.js";

const defaultFrontendUrl =
  process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://roboroot.in"
      : "http://localhost:3000";

function isLocalhostUrl(url?: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url || "");
}

function getFrontendUrl() {
  const configuredUrl = process.env.FRONTEND_URL?.trim();
  if (configuredUrl && !(process.env.NODE_ENV === "production" && isLocalhostUrl(configuredUrl))) {
    return configuredUrl;
  }

  return defaultFrontendUrl;
}

/**
 * Signup with email and password
 */
export async function signupController(req: Request, res: Response): Promise<void> {
  try {
    // Validate request
    const validatedData = validateSignupRequest(req.body);

    // Create user
    const result = await signupWithEmail(validatedData);

    // Set httpOnly cookies (tokens never exposed in JSON body)
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: result.user,
        expiresIn: result.expiresIn,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Build shared cookie options so set and clear always use identical flags.
 * COOKIE_DOMAIN env var enables cross-subdomain sharing in production
 * (e.g. ".roboroot.in" lets roboroot.in and api.roboroot.in share cookies).
 */
function getCookieOptions(overrides: Record<string, unknown> = {}) {
  const isProd = process.env.NODE_ENV === "production";
  const base: Record<string, unknown> = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  };
  // Only set domain in production when explicitly configured
  const cookieDomain = process.env.COOKIE_DOMAIN?.trim();
  if (isProd && cookieDomain) {
    base.domain = cookieDomain;
  }
  return { ...base, ...overrides };
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, getCookieOptions({
    maxAge: 15 * 60 * 1000, // 15 minutes
  }));
  res.cookie("refreshToken", refreshToken, getCookieOptions({
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }));
}

function clearAuthCookies(res: Response) {
  // Must pass identical options (minus maxAge) for the browser to delete the cookie
  res.clearCookie("accessToken", getCookieOptions());
  res.clearCookie("refreshToken", getCookieOptions({ path: "/api/auth/refresh" }));
}

/**
 * Login with email and password
 */
export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    // Validate request
    const validatedData = validateLoginRequest(req.body);

    // Authenticate user
    const result = await loginWithEmail(validatedData);

    // Set httpOnly cookies (XSS-safe — tokens never exposed in JSON body)
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        expiresIn: result.expiresIn,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Refresh access token
 */
export async function refreshTokenController(req: Request, res: Response): Promise<void> {
  try {
    // Accept refresh token from cookie (preferred) or request body (admin panel / mobile)
    const refreshToken =
      (req.cookies as Record<string, string>)?.refreshToken ||
      (req.body as { refreshToken?: string })?.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      throw new ValidationError("Refresh token is required");
    }

    const result = await refreshAccessToken(refreshToken);

    // Rotate cookies with fresh tokens
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: result.user,
        expiresIn: result.expiresIn,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Logout user
 */
export async function logoutController(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const sessionId = req.user?.sessionId;

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    await logout(userId, sessionId);

    // Clear auth cookies
    clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Get current user profile
 */
export async function getMeController(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Update current user profile
 */
export async function updateMeController(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    const user = await updateUserProfile(userId, {
      name: typeof req.body.name === "string" ? req.body.name : null,
      college: typeof req.body.college === "string" ? req.body.college : null,
      avatarUrl: typeof req.body.avatarUrl === "string" ? req.body.avatarUrl : null,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: user,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Initiate Google OAuth flow
 */
export async function googleAuthController(req: Request, res: Response): Promise<void> {
  try {
    const { redirect } = req.query;
    const authUrl = getGoogleAuthUrl(typeof redirect === "string" ? redirect : undefined);
    res.redirect(authUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Handle Google OAuth callback
 */
export async function googleCallbackController(req: Request, res: Response): Promise<void> {
  try {
    const { code, state } = req.query as { code?: string; state?: string };

    if (!code) {
      throw new ValidationError("Authorization code is required");
    }

    const result = await handleGoogleCallback(code);

    // Set httpOnly cookies instead of exposing tokens in URL
    setAuthCookies(res, result.accessToken, result.refreshToken);

    const frontendUrl = getFrontendUrl();
    const redirectQuery = state ? `&redirect=${encodeURIComponent(state)}` : "";
    res.redirect(`${frontendUrl}/callback?provider=google${redirectQuery}`);
  } catch (error) {
    if (error instanceof AuthError) {
      // Redirect to frontend with error
      const frontendUrl = getFrontendUrl();
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
      return;
    }

    console.error("Google callback error:", error);
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/login?error=authentication_failed`);
  }
}

/**
 * Initiate GitHub OAuth flow
 */
export async function githubAuthController(req: Request, res: Response): Promise<void> {
  try {
    const { redirect } = req.query;
    const authUrl = getGitHubAuthUrl(typeof redirect === "string" ? redirect : undefined);
    res.redirect(authUrl);
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
      });
      return;
    }

    console.error("GitHub auth error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

/**
 * Handle GitHub OAuth callback
 */
export async function githubCallbackController(req: Request, res: Response): Promise<void> {
  try {
    const { code, state } = req.query as { code?: string; state?: string };

    if (!code) {
      throw new ValidationError("Authorization code is required");
    }

    const result = await handleGitHubCallback(code);

    // Set httpOnly cookies instead of exposing tokens in URL
    setAuthCookies(res, result.accessToken, result.refreshToken);

    const frontendUrl = getFrontendUrl();
    const redirectQuery = state ? `&redirect=${encodeURIComponent(state)}` : "";
    res.redirect(`${frontendUrl}/callback?provider=github${redirectQuery}`);
  } catch (error) {
    if (error instanceof AuthError) {
      // Redirect to frontend with error
      const frontendUrl = getFrontendUrl();
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`);
      return;
    }

    console.error("GitHub callback error:", error);
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/login?error=authentication_failed`);
  }
}

/**
 * Request a password reset link
 */
export async function forgotPasswordController(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body as { email?: string };
    if (!email || typeof email !== "string") {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }
    // Always return 200 to prevent email enumeration
    await requestPasswordReset(email.trim().toLowerCase());
    res.status(200).json({
      success: true,
      message: "If this email exists, you will receive a reset link shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return 200 to prevent enumeration
    res.status(200).json({
      success: true,
      message: "If this email exists, you will receive a reset link shortly.",
    });
  }
}

/**
 * Reset password using a valid token
 */
export async function resetPasswordController(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword || typeof token !== "string" || typeof newPassword !== "string") {
      res.status(400).json({ success: false, error: "Token and new password are required" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
      return;
    }
    await resetPassword(token, newPassword);
    // Clear any auth cookies in case user was logged in
    clearAuthCookies(res);
    res.status(200).json({ success: true, message: "Password updated successfully. Please log in." });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset password",
    });
  }
}

export async function verifyEmailController(req: Request, res: Response): Promise<void> {
  const token = (req.query.token as string | undefined) ?? (req.body as { token?: string }).token;
  if (!token) {
    res.status(400).json({ success: false, error: "Token is required" });
    return;
  }
  try {
    await verifyEmailToken(token);
    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    const error = err as Error & { statusCode?: number };
    res.status(error.statusCode ?? 400).json({ success: false, error: error.message });
  }
}

export async function resendVerificationController(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };
  // Always return 200 to prevent enumeration
  if (email && typeof email === "string") {
    await resendVerificationEmail(email).catch(() => null);
  }
  res.json({ success: true, message: "If your email is registered and unverified, a link has been sent." });
}
