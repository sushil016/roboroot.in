/**
 * Axios HTTP client for the external backend.
 *
 * Auth is cookie-based: the backend owns httpOnly tokens, the browser sends them
 * with `withCredentials`, and a single refresh attempt is made after a 401.
 *
 * CSRF: On first state-changing request, the client fetches a CSRF token from
 * GET /api/auth/csrf-token and attaches it as `x-csrf-token` header on every
 * subsequent POST/PUT/PATCH/DELETE request.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";
import { getAuthState } from "@/store/user.store";

const isServer = typeof window === "undefined";
const baseURL = isServer
  ? (process.env.NODE_ENV === "production" ? "https://roboroot.in/_/backend" : "http://localhost:4000")
  : env.apiUrl;

const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
  withCredentials: true,
});

/* ------------------------------------------------------------------ */
/*  CSRF Token Management                                             */
/* ------------------------------------------------------------------ */

let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

/**
 * Read the csrf_token cookie value (non-httpOnly cookie set by the backend).
 * Falls back to null if the cookie doesn't exist.
 */
function readCsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match?.[1] ?? null;
}

/**
 * Fetch a fresh CSRF token from the backend.
 * Deduplicates concurrent calls so only one request is in flight.
 */
async function fetchCsrfToken(): Promise<string> {
  if (csrfFetchPromise) return csrfFetchPromise;

  csrfFetchPromise = axios
    .get<{ data: { csrfToken: string } }>(`${env.apiUrl}/api/auth/csrf-token`, {
      withCredentials: true,
    })
    .then((res) => {
      const token = res.data.data.csrfToken;
      csrfToken = token;
      return token;
    })
    .finally(() => {
      csrfFetchPromise = null;
    });

  return csrfFetchPromise;
}

/**
 * Ensure we have a CSRF token.
 * Tries cookie first (cheap), then fetches from the server.
 */
async function ensureCsrfToken(): Promise<string> {
  // Prefer the in-memory token
  if (csrfToken) return csrfToken;

  // Try reading from the cookie (set by a previous GET /api/auth/csrf-token)
  const cookieVal = readCsrfCookie();
  if (cookieVal) {
    csrfToken = cookieVal;
    return cookieVal;
  }

  // Fetch a fresh token from the server
  return fetchCsrfToken();
}

const STATE_CHANGING_METHODS = new Set(["post", "put", "patch", "delete"]);

/**
 * Request interceptor — attaches CSRF token to state-changing requests.
 */
apiClient.interceptors.request.use(async (config) => {
  const method = (config.method ?? "get").toLowerCase();

  if (STATE_CHANGING_METHODS.has(method)) {
    const token = await ensureCsrfToken();
    config.headers["x-csrf-token"] = token;
  }

  return config;
});

/* ------------------------------------------------------------------ */
/*  401 Auto-Refresh Interceptor                                       */
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown = null) {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If CSRF token was rejected (403 + CSRF code), refresh the token and retry
    if (
      error.response?.status === 403 &&
      (error.response?.data as Record<string, string>)?.code?.startsWith("CSRF_") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      csrfToken = null; // Invalidate cached token
      const freshToken = await fetchCsrfToken();
      originalRequest.headers["x-csrf-token"] = freshToken;
      return apiClient(originalRequest);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/auth/refresh") ||
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/signup")
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${env.apiUrl}/api/auth/refresh`, {}, { withCredentials: true });
        processQueue();
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        getAuthState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
