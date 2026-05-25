const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const isProduction = process.env.NODE_ENV === "production";
const isLocalhostApiUrl =
  configuredApiUrl !== undefined && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(configuredApiUrl);

export const env = {
  apiUrl:
    configuredApiUrl && !(isProduction && isLocalhostApiUrl)
      ? configuredApiUrl
      : isProduction
        ? "/_/backend"
        : "http://localhost:4000",
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002",
  chatEnabled: process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false",
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  nodeEnv: process.env.NODE_ENV,
} as const;
