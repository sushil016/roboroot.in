const isProduction = process.env.NODE_ENV === "production";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
const isLocalhostUrl = (url?: string) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(url || "");

export const API_BASE_URL =
  configuredApiUrl && !(isProduction && isLocalhostUrl(configuredApiUrl))
    ? configuredApiUrl
    : isProduction
      ? 
      // "https://www.roboroot.in/_/backend"
      "https://api.robomaniac.in"
      : "http://localhost:4000";

export const STOREFRONT_URL =
  configuredAppUrl && !(isProduction && isLocalhostUrl(configuredAppUrl))
    ? configuredAppUrl
    : isProduction
      ? "https://shop.robomaniac.in"
      : "http://localhost:3000";
